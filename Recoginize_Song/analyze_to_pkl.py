import os
import pickle
import numpy as np
from pydub import AudioSegment
import src.analyzer as analyzer
from termcolor import colored

def save_fingerprints_to_pkl(fingerprints, pkl_file_path):
    """Lưu fingerprints vào file .pkl."""
    with open(pkl_file_path, 'wb') as f:
        pickle.dump(fingerprints, f)
    print(colored(f'Successfully saved fingerprints to {pkl_file_path}', 'green'))

def analyze_mp3_files(mp3_folder, pkl_file_path):
    """Phân tích tất cả bài hát MP3 trong thư mục và lưu fingerprints vào file .pkl."""
    fingerprints_data = {}

    # Duyệt qua tất cả các file MP3 trong thư mục
    for root, _, files in os.walk(mp3_folder):
        for file in files:
            if file.endswith('.mp3'):
                file_path = os.path.join(root, file)
                print(colored(f'Processing file: {file_path}', 'yellow'))

                # Tải file MP3 và chuyển đổi thành dữ liệu âm thanh thô (raw audio)
                audio = AudioSegment.from_file(file_path, format="mp3")
                audio = audio.set_channels(1).set_frame_rate(analyzer.DEFAULT_FS)
                samples = np.array(audio.get_array_of_samples(), dtype=np.int16)

                # Tạo fingerprint cho bài hát
                hashes = analyzer.fingerprint(samples, Fs=analyzer.DEFAULT_FS)

                # Lưu fingerprint vào dictionary với tên file làm key
                fingerprints_data[file] = list(hashes)

    # Lưu fingerprints vào file .pkl
    save_fingerprints_to_pkl(fingerprints_data, pkl_file_path)

if __name__ == '__main__':
    mp3_folder = './mp3'  # Thư mục chứa các bài hát MP3
    pkl_file_path = 'fingerprints.pkl'  # Đường dẫn lưu file .pkl
    analyze_mp3_files(mp3_folder, pkl_file_path)
