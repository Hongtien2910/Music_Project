from flask import Flask, request, jsonify
import os
import tempfile
import subprocess
import numpy as np
from itertools import zip_longest
from src import analyzer
from src.db import SQLiteDatabase

app = Flask(__name__)

# Hàm chia nhỏ dữ liệu thành từng nhóm n phần tử
def grouper(iterable, n, fillvalue=None):
    args = [iter(iterable)] * n
    return (filter(None, values) for values in zip_longest(fillvalue=fillvalue, *args))

# Truy vấn database để tìm bài hát khớp fingerprint
def return_matches(hashes, db):
    mapper = {}
    for hash, offset in hashes:
        mapper[hash.upper()] = offset
    values = mapper.keys()

    for split_values in grouper(values, 300):
        query = """
            SELECT upper(hash), song_fk, offset
            FROM fingerprints
            WHERE upper(hash) IN (%s)
        """
        vals = list(split_values).copy()
        length = len(vals)
        query = query % ', '.join('?' * length)
        results = db.executeAll(query, values=vals)

        for hash, sid, offset in results:
            yield (sid, mapper[hash])

# Tạo fingerprint từ dữ liệu và tìm các khớp
def find_matches(samples, db, Fs=analyzer.DEFAULT_FS):
    hashes = analyzer.fingerprint(samples, Fs=Fs)
    return return_matches(hashes, db)

# Tìm bài hát có nhiều fingerprint khớp nhất
def align_matches(matches, db):
    diff_counter = {}
    largest = 0
    largest_count = 0
    song_id = -1

    for sid, diff in matches:
        try:
            diff = float(diff)  # đảm bảo diff là float
        except ValueError:
            continue

        if diff not in diff_counter:
            diff_counter[diff] = {}
        if sid not in diff_counter[diff]:
            diff_counter[diff][sid] = 0
        diff_counter[diff][sid] += 1

        if diff_counter[diff][sid] > largest_count:
            largest = diff
            largest_count = diff_counter[diff][sid]
            song_id = sid

    song = db.get_song_by_id(song_id)
    step_size = analyzer.DEFAULT_WINDOW_SIZE * (1 - analyzer.DEFAULT_OVERLAP_RATIO)
    nseconds = round(float(largest) * step_size / analyzer.DEFAULT_FS, 5)


    return {
        "SONG_ID": song_id,
        "SONG_NAME": song[1],
        "CONFIDENCE": largest_count,
        # "OFFSET": int(float(largest)),  # sửa ở đây
        # "OFFSET_SECS": nseconds
    }

# API nhận diện bài hát
@app.route('/recognize', methods=['POST'])
def identify_song():
    if 'file' not in request.files:
        return jsonify({'error': 'Không tìm thấy file'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Tên file không hợp lệ'}), 400

    try:
        tmp_dir = tempfile.gettempdir()
        file_path = os.path.join(tmp_dir, file.filename)
        file.save(file_path)

        # Kết nối đến database trong từng request
        db = SQLiteDatabase()

        # Dùng ffmpeg để chuyển đổi mp3 thành PCM 16-bit mono phù hợp
        pcm_data = subprocess.check_output([
            "ffmpeg", "-i", file_path,
            "-f", "s16le",
            "-acodec", "pcm_s16le",
            "-ac", "1",
            "-ar", str(analyzer.DEFAULT_FS),
            "-loglevel", "quiet",
            "pipe:1"
        ])

        # Chuyển bytes thành numpy array
        samples = np.frombuffer(pcm_data, dtype=np.int16)

        matches = list(find_matches(samples, db))

        if not matches:
            return jsonify({'message': 'Không tìm thấy bài hát phù hợp'}), 404

        song = align_matches(matches, db)
        return jsonify(song), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port = 5001)
