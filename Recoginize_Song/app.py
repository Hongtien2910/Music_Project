from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from recognizer import recognize

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

if __name__ == "__main__":
    app.run(port=5001, debug=False)
