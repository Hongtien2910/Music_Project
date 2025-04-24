import os
import pickle
import numpy as np
from pydub import AudioSegment
from flask import Flask, request, jsonify
import src.analyzer as analyzer
import redis
from termcolor import colored

app = Flask(__name__)

# Đường dẫn tới file fingerprints
PKL_FILE_PATH = 'fingerprints.pkl'

# Global variable chứa fingerprints (chỉ load 1 lần)
fingerprint_db = {}

# Kết nối Redis để lưu fingerprints
r = redis.Redis(host='localhost', port=6379, db=0)

# Load fingerprint database khi khởi động server
def load_fingerprints():
    global fingerprint_db
    if not fingerprint_db:
        # Kiểm tra Redis xem có fingerprints chưa
        if r.exists("fingerprints"):
            fingerprint_db = pickle.loads(r.get("fingerprints"))
        else:
            with open(PKL_FILE_PATH, 'rb') as f:
                fingerprint_db = pickle.load(f)
            # Lưu vào Redis
            r.set("fingerprints", pickle.dumps(fingerprint_db))
        print(colored('✅ Fingerprints loaded successfully!', 'green'))
    return fingerprint_db

# Tìm bài hát từ đoạn audio input
def find_song_in_fingerprints(samples):
    hashes = set(analyzer.fingerprint(samples, Fs=analyzer.DEFAULT_FS))  # Sử dụng set để tối ưu
    fingerprints = load_fingerprints()

    best_match = None
    best_score = 0

    for song_name, stored_hashes in fingerprints.items():
        stored_hashes_set = set(stored_hashes)  # Chuyển stored_hashes thành set một lần
        matches = len(hashes & stored_hashes_set)  # Tính giao giữa hashes và stored_hashes
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

        # Đọc file, chỉ lấy 5 giây đầu
        audio = AudioSegment.from_file(file_path, format="mp3")
        audio = audio.set_channels(1).set_frame_rate(analyzer.DEFAULT_FS)
        audio = audio[:5000]  # Chỉ lấy 5 giây đầu để tối ưu tốc độ
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
