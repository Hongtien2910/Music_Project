import os
import sys
import src
import src.analyzer as analyzer
import argparse
from argparse import RawTextHelpFormatter
from itertools import zip_longest
from termcolor import colored
from src.db import SQLiteDatabase
from pydub import AudioSegment
import numpy as np

if __name__ == '__main__':
    # Khởi tạo kết nối đến cơ sở dữ liệu SQLite
    db = SQLiteDatabase()

    # Thiết lập parser để nhận đường dẫn file MP3 từ tham số dòng lệnh
    parser = argparse.ArgumentParser(formatter_class=RawTextHelpFormatter)
    parser.add_argument('-f', '--file', required=True, help="Path to the MP3 file")
    args = parser.parse_args()

    file_path = args.file  # Lấy đường dẫn file từ tham số dòng lệnh

    # Kiểm tra xem file có tồn tại không, nếu không thì thoát chương trình
    if not os.path.exists(file_path):
        print(colored("Error: File does not exist!", "red"))
        sys.exit(1)

    # Tải file MP3 và chuyển đổi thành dữ liệu âm thanh thô (raw audio)
    audio = AudioSegment.from_file(file_path, format="mp3")
    audio = audio.set_channels(1).set_frame_rate(analyzer.DEFAULT_FS)  # Chuyển về mono và thiết lập tần số lấy mẫu
    samples = np.array(audio.get_array_of_samples(), dtype=np.int16)  # Chuyển đổi thành mảng numpy

    # Hàm chia dữ liệu thành từng nhóm có kích thước n phần tử
    def grouper(iterable, n, fillvalue=None):
        args = [iter(iterable)] * n
        return (filter(None, values) for values in zip_longest(fillvalue=fillvalue, *args))

    # Hàm tìm kiếm dấu vân tay (fingerprint) của bài hát trong cơ sở dữ liệu
    def find_matches(samples, Fs=analyzer.DEFAULT_FS):
        hashes = analyzer.fingerprint(samples, Fs=Fs)  # Tạo fingerprint từ dữ liệu âm thanh
        return return_matches(hashes)  # Trả về kết quả khớp từ database

    # Hàm truy vấn database để tìm bài hát tương ứng với fingerprint
    def return_matches(hashes):
        mapper = {}
        for hash, offset in hashes:
            mapper[hash.upper()] = offset  # Lưu hash dưới dạng chữ in hoa để tránh lỗi phân biệt chữ hoa/thường
        values = mapper.keys()

        # Chia nhỏ danh sách hash thành từng nhóm 1000 phần tử để tối ưu truy vấn database
        for split_values in grouper(values, 1000):
            query = """
                SELECT upper(hash), song_fk, offset
                FROM fingerprints
                WHERE upper(hash) IN (%s)
            """
            vals = list(split_values).copy()
            length = len(vals)
            query = query % ', '.join('?' * length)  # Chèn các dấu '?' vào câu truy vấn SQL
            x = db.executeAll(query, values=vals)  # Thực thi truy vấn SQL

            matches_found = len(x)
            if matches_found > 0:
                msg = 'I found %d hash in db'
                print(colored(msg, 'green') % matches_found)  # In số lượng hash tìm thấy trong DB

            # Duyệt qua các kết quả tìm được và trả về cặp (song_id, offset)
            for hash, sid, offset in x:
                yield (sid, mapper[hash])

    # Danh sách các kết quả khớp từ database
    matches = list(find_matches(samples))

    # Hàm xác định bài hát nào có số lượng khớp cao nhất để nhận diện bài hát
    def align_matches(matches):
        diff_counter = {}
        largest = 0
        largest_count = 0
        song_id = -1

        # Duyệt qua các kết quả khớp và đếm số lần xuất hiện của từng song_id
        for sid, diff in matches:
            if diff not in diff_counter:
                diff_counter[diff] = {}

            if sid not in diff_counter[diff]:
                diff_counter[diff][sid] = 0

            diff_counter[diff][sid] += 1

            # Cập nhật giá trị lớn nhất
            if diff_counter[diff][sid] > largest_count:
                largest = diff
                largest_count = diff_counter[diff][sid]
                song_id = sid

        # Lấy thông tin bài hát từ database dựa vào song_id
        songM = db.get_song_by_id(song_id)

        # Chuyển đổi offset thành số giây tương ứng trong bài hát
        nseconds = round(float(largest) / analyzer.DEFAULT_FS * analyzer.DEFAULT_WINDOW_SIZE * analyzer.DEFAULT_OVERLAP_RATIO, 5)

        return {
            "SONG_ID": song_id,
            "SONG_NAME": songM[1],  # Tên bài hát
            "CONFIDENCE": largest_count,  # Mức độ khớp (số lượng hash khớp)
            "OFFSET": int(largest),  # Vị trí khớp trong bài hát (theo mẫu)
            "OFFSET_SECS": nseconds  # Vị trí khớp tính theo giây
        }

    total_matches_found = len(matches)  # Tổng số hash tìm thấy trong database

    if total_matches_found > 0:
        print(colored(f'Totally found {total_matches_found} hash', 'green'))  # Thông báo số hash tìm được
        song = align_matches(matches)  # Xác định bài hát dựa vào hash khớp nhiều nhất

        # Hiển thị kết quả nhận diện bài hát
        print(colored(f' => song: {song["SONG_NAME"]} (id={song["SONG_ID"]})\n' 
                      f'    offset: {song["OFFSET"]} ({song["OFFSET_SECS"]} secs)\n', 'green'))
    else:
        print(colored('Not anything matching', 'red'))  # Không tìm thấy bài hát nào phù hợp
