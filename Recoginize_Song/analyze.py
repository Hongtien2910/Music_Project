import os
import sys
import src
import src.analyzer as analyzer
from src.filereader import FileReader
from termcolor import colored
from src.db import SQLiteDatabase

MUSICS_FOLDER_PATH = "mp3/"

if __name__ == '__main__':
    db = SQLiteDatabase()

    # Duyệt qua tất cả các tệp trong thư mục chứa nhạc
    for filename in os.listdir(MUSICS_FOLDER_PATH):
        if filename.endswith(".mp3"):  # Chỉ xử lý các tệp có đuôi .mp3
            # Đọc tệp âm thanh và phân tích dữ liệu
            reader = FileReader(MUSICS_FOLDER_PATH + filename)
            audio = reader.parse_audio()  # Trả về thông tin về âm thanh

            # Kiểm tra xem bài hát đã có trong cơ sở dữ liệu chưa (dựa trên hash)
            song = db.get_song_by_filehash(audio['file_hash'])
            song_id = db.add_song(filename, audio['file_hash'])  # Thêm bài hát vào DB nếu chưa có

            # Hiển thị thông báo đang phân tích bài hát
            print(colored("Analyzing music: %s", "green") % filename)
            
            if song:  # Nếu bài hát đã tồn tại trong DB
                hash_count = db.get_song_hashes_count(song_id)

                if hash_count > 0:  # Nếu bài hát đã có dữ liệu hash trước đó
                    msg = 'Warning: This song already exists (%d hashes), skipping...' % hash_count
                    print(colored(msg, 'yellow'))  # Hiển thị cảnh báo
                    continue  # Bỏ qua bài hát này, không phân tích lại

            # Tập hợp lưu trữ các hash của bài hát
            hashes = set()
            channel_amount = len(audio['channels'])  # Số lượng kênh âm thanh (mono hoặc stereo)

            # Duyệt qua từng kênh trong bài hát
            for channeln, channel in enumerate(audio['channels']):
                # Phân tích dấu vân tay (fingerprint) cho từng kênh
                channel_hashes = analyzer.fingerprint(channel, Fs=audio['Fs'])
                channel_hashes = set(channel_hashes)  # Loại bỏ trùng lặp

                # Hiển thị thông tin về số hash đã lưu từ kênh hiện tại
                msg = 'Channel %d saved %d hashes'
                print(colored(msg, attrs=['dark']) % (
                    channeln, len(channel_hashes)
                ))

                # Hợp tất cả các hash từ các kênh vào tập hợp chung
                hashes |= channel_hashes

            # Chuẩn bị dữ liệu để lưu vào database
            values = []
            for hash, offset in hashes:
                values.append((song_id, hash, offset))

            # Lưu trữ các hash vào cơ sở dữ liệu
            db.store_fingerprints(values)

    # Thông báo hoàn thành phân tích
    print(colored('Done', "green"))
