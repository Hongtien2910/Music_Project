import os
import sys
import src
import src.analyzer as analyzer
import argparse

from argparse import RawTextHelpFormatter
from itertools import zip_longest
from termcolor import colored
from src.listener import Listener
from src.db import SQLiteDatabase

if __name__ == '__main__':
    db = SQLiteDatabase()

    # Thiết lập parser để nhận tham số dòng lệnh
    parser = argparse.ArgumentParser(formatter_class=RawTextHelpFormatter)
    parser.add_argument('-s', '--seconds', nargs='?')  # Nhận tham số thời gian ghi âm
    args = parser.parse_args()

    # Kiểm tra nếu không có giá trị thời gian, mặc định là 10 giây
    if not args.seconds:
        print(colored("Warning: You don't set any second. It's 10 by default", "yellow"))
        args.seconds = "10"

    seconds = int(args.seconds)  # Chuyển đổi thời gian từ chuỗi sang số nguyên

    # Thiết lập các thông số cho quá trình ghi âm
    chunksize = 2**12  # Kích thước mỗi khối dữ liệu
    channels = 1  # Ghi âm chỉ 1 kênh (mono)

    record_forever = False  # Chỉ ghi âm một lần, không lặp lại

    # Khởi tạo đối tượng Listener để ghi âm
    listener = Listener()

    # Bắt đầu ghi âm với các thông số đã thiết lập
    listener.start_recording(
        seconds=seconds,
        chunksize=chunksize,
        channels=channels
    )

    # Ghi âm và xử lý dữ liệu âm thanh
    while True:
        bufferSize = int(listener.rate / listener.chunksize * seconds)
        print(colored("Listening....", "green"))

        # Xử lý từng khối dữ liệu âm thanh
        for i in range(0, bufferSize):
            nums = listener.process_recording()

        if not record_forever:
            break

    # Dừng ghi âm
    listener.stop_recording()

    print(colored('Okey, enough', attrs=['dark']))

    # Hàm nhóm các phần tử trong danh sách theo từng nhóm có kích thước n
    def grouper(iterable, n, fillvalue=None):
        args = [iter(iterable)] * n
        return (filter(None, values) for values in zip_longest(fillvalue=fillvalue, *args))

    # Lấy dữ liệu âm thanh đã ghi
    data = listener.get_recorded_data()

    print(colored(f"Took {len(data[0])} samples", attrs=['dark']))

    # Cấu hình thông số tần số lấy mẫu
    Fs = analyzer.DEFAULT_FS
    channel_amount = len(data)  # Số lượng kênh âm thanh

    result = set()
    matches = []

    # Hàm tìm kiếm các mẫu âm thanh phù hợp từ dữ liệu đã ghi
    def find_matches(samples, Fs=analyzer.DEFAULT_FS):
        hashes = analyzer.fingerprint(samples, Fs=Fs)  # Chuyển âm thanh thành các dấu vân tay
        return return_matches(hashes)  # Tìm kiếm các mẫu khớp trong CSDL

    # Hàm tìm kiếm các dấu vân tay đã có trong cơ sở dữ liệu
    def return_matches(hashes):
        mapper = {}
        for hash, offset in hashes:
            mapper[hash.upper()] = offset  # Chuyển dấu vân tay thành chữ hoa và lưu trữ

        values = mapper.keys()

        # Chia các giá trị thành từng nhóm 1000 để truy vấn hiệu quả hơn
        for split_values in grouper(values, 1000):
            query = """
                SELECT upper(hash), song_fk, offset
                FROM fingerprints
                WHERE upper(hash) IN (%s)
            """
            vals = list(split_values).copy()
            length = len(vals)
            query = query % ', '.join('?' * length)
            x = db.executeAll(query, values=vals)

            matches_found = len(x)
            if matches_found > 0:
                print(colored(f'I found {matches_found} hash in db', 'green'))

            # Trả về các kết quả tìm thấy
            for hash, sid, offset in x:
                yield (sid, mapper[hash])

    # Tìm kiếm dấu vân tay trong từng kênh âm thanh
    for channeln, channel in enumerate(data):
        matches.extend(find_matches(channel))

    # Hàm căn chỉnh các kết quả khớp và tìm ra bài hát phù hợp nhất
    def align_matches(matches):
        diff_counter = {}
        largest = 0
        largest_count = 0
        song_id = -1

        # Xử lý từng cặp (song_id, offset)
        for sid, diff in matches:
            if diff not in diff_counter:
                diff_counter[diff] = {}

            if sid not in diff_counter[diff]:
                diff_counter[diff][sid] = 0

            diff_counter[diff][sid] += 1

            # Xác định bài hát có số lần trùng khớp cao nhất
            if diff_counter[diff][sid] > largest_count:
                largest = diff
                largest_count = diff_counter[diff][sid]
                song_id = sid

        # Lấy thông tin bài hát từ cơ sở dữ liệu
        songM = db.get_song_by_id(song_id)

        # Tính toán thời gian xuất hiện của mẫu âm thanh
        nseconds = round(
            float(largest) / analyzer.DEFAULT_FS * analyzer.DEFAULT_WINDOW_SIZE * analyzer.DEFAULT_OVERLAP_RATIO, 5
        )

        return {
            "SONG_ID": song_id,
            "SONG_NAME": songM[1],  # Tên bài hát
            "CONFIDENCE": largest_count,  # Độ tin cậy của kết quả
            "OFFSET": int(largest),  # Vị trí mẫu trong bài hát
            "OFFSET_SECS": nseconds  # Thời gian xuất hiện của mẫu (giây)
        }

    total_matches_found = len(matches)

    # Kiểm tra nếu có mẫu trùng khớp với dữ liệu trong CSDL
    if total_matches_found > 0:
        print(colored(f'Totally found {total_matches_found} hash', 'green'))

        # Căn chỉnh và xác định bài hát
        song = align_matches(matches)

        print(colored(f' => song: {song["SONG_NAME"]} (id={song["SONG_ID"]})\n' 
                      f'    offset: {song["OFFSET"]} ({song["OFFSET_SECS"]} secs)\n', 'green'))
    else:
        print(colored('Not anything matching', 'red'))
