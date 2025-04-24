import os
import pickle
import numpy as np
from pydub import AudioSegment
from flask import Flask, request, jsonify
import src.analyzer as analyzer
from termcolor import colored

app = Flask(__name__)

# Đường dẫn tới file fingerprints
PKL_FILE_PATH = 'fingerprints.pkl'

# Global variable chứa fingerprints (chỉ load 1 lần)
fingerprint_db = {}

# Load fingerprint database khi khởi động server
def load_fingerprints():
    global fingerprint_db
    if not fingerprint_db:
        with open(PKL_FILE_PATH, 'rb') as f:
            fingerprint_db = pickle.load(f)
        print(colored('✅ Fingerprints loaded successfully!', 'green'))
    return fingerprint_db

# Tìm bài hát từ đoạn audio input
def find_song_in_fingerprints(samples):
    # Sửa lại chỗ này để đảm bảo hashes là list
    hashes = list(analyzer.fingerprint(samples, Fs=analyzer.DEFAULT_FS))
    fingerprints = load_fingerprints()

    best_match = None
    best_score = 0

    for song_name, stored_hashes in fingerprints.items():
        matches = sum(1 for h in hashes if h in set(stored_hashes))
        if matches > best_score:
            best_score = matches
            best_match = song_name

    return best_match, best_score

# API nhận diện bài hát
@app.route('/recognize_song', methods=['POST'])
def recognize_song():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.mp3'):
        # Lưu tạm file
        if not os.path.exists('temp'):
            os.makedirs('temp')
        file_path = os.path.join('temp', file.filename)
        file.save(file_path)

        # Đọc file, chỉ lấy 15 giây đầu
        audio = AudioSegment.from_file(file_path, format="mp3")
        audio = audio.set_channels(1).set_frame_rate(analyzer.DEFAULT_FS)
        audio = audio[:15000]  # Chỉ lấy 15 giây đầu
        samples = np.array(audio.get_array_of_samples(), dtype=np.int16)

        # Xóa file tạm
        os.remove(file_path)

        # Tìm bài hát
        song_name, matches = find_song_in_fingerprints(samples)

        if song_name:
            return jsonify({
                "SONG_ID": song_name,
                "SONG_NAME": song_name,
                "CONFIDENCE": matches,
                "OFFSET": 0,
                "OFFSET_SECS": 0  # Bạn có thể cập nhật nếu dùng thêm thông tin offset
            })
        else:
            return jsonify({"error": "Song not found"}), 404

    return jsonify({"error": "Invalid file type, only MP3 allowed"}), 400

if __name__ == '__main__':
    load_fingerprints()  # Load fingerprints khi khởi động server
    app.run(debug=True)
