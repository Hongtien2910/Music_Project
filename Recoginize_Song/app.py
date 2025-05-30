from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from recognizer import recognize
from src.filereader import FileReader
import src.analyzer as analyzer
from src.db import SQLiteDatabase

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/recognize", methods=["POST"])
def recognize_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        result = recognize(file_path)
        if result:
            return jsonify(result)
        else:
            return jsonify({"message": "No match found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(file_path)

@app.route("/songs", methods=["POST"])
def create_song():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        reader = FileReader(file_path)
        audio = reader.parse_audio()
        db = SQLiteDatabase()

        song = db.get_song_by_filehash(audio["file_hash"])
        song_id = db.add_song(filename, audio["file_hash"])

        if song:
            hash_count = db.get_song_hashes_count(song_id)
            if hash_count > 0:
                return jsonify({"message": "Song already exists", "hashes": hash_count}), 200

        hashes = set()
        for channeln, channel in enumerate(audio["channels"]):
            channel_hashes = analyzer.fingerprint(channel, Fs=audio["Fs"])
            hashes |= set(channel_hashes)

        values = [(song_id, h, offset) for h, offset in hashes]
        db.store_fingerprints(values)

        return jsonify({
            "message": "Song added and fingerprinted successfully",
            "song_id": song_id,
            "hash_count": len(values)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(file_path)

@app.route("/delete", methods=["DELETE"])
def delete_song():
    song_name = request.args.get("song_name")
    if not song_name:
        return jsonify({"error": "Missing song_name parameter"}), 400

    try:
        db = SQLiteDatabase()
        song = db.get_song_by_name(song_name)

        if not song:
            return jsonify({"error": "Song not found"}), 404

        song_id = song[0]
        db.delete_fingerprints_by_song_id(song_id)
        db.delete_song_by_id(song_id)

        return jsonify({"message": f"Deleted song '{song_name}' and its fingerprints"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=False)
