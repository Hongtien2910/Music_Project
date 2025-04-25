import os
import ffmpeg
import numpy as np
from hashlib import sha1

class FileReader():
  def __init__(self, filename):
    """Khởi tạo FileReader với đường dẫn file âm thanh."""
    self.filename = filename

  def parse_audio(self):
    """Phân tích file âm thanh và trích xuất thông tin bao gồm:
    - Tên bài hát
    - Phần mở rộng file
    - Dữ liệu của từng kênh âm thanh
    - Tần số lấy mẫu (sample rate)
    - Hash của file
    """
    limit = None  # Biến giới hạn độ dài âm thanh
    channels_data = []  # Khởi tạo channels_data với giá trị mặc định là một danh sách rỗng

    # Lấy tên file và phần mở rộng ("song.mp3" → songname="song", extension=".mp3")
    songname, extension = os.path.splitext(os.path.basename(self.filename))

    try:
      # Đọc file âm thanh với ffmpeg
      probe = ffmpeg.probe(self.filename)
      fs = int(probe['streams'][0]['sample_rate'])  # Sample rate từ ffmpeg
      channels = int(probe['streams'][0]['channels'])  # Số kênh âm thanh

      # Giới hạn độ dài nếu limit được đặt (mili giây)
      if limit:
        duration = min(float(probe['streams'][0]['duration']) * 1000, limit)  # Chuyển đổi thành float
      else:
        duration = float(probe['streams'][0]['duration']) * 1000  # Thời gian đầy đủ, chuyển thành float

      # Lấy dữ liệu âm thanh bằng ffmpeg và chuyển đổi thành numpy array
      out, _ = ffmpeg.input(self.filename, ss=0, t=duration / 1000).output('pipe:1', format='wav').run(capture_stdout=True)
      audio_data = np.frombuffer(out, np.int16)  # Chuyển đổi từ byte buffer sang numpy array

      # Phân chia dữ liệu âm thanh theo từng kênh
      if channels == 1:
        channels_data = [audio_data]  # Mono audio, chỉ 1 kênh
      else:
        # Nếu là stereo, chia thành 2 kênh (bạn có thể xử lý thêm cho nhiều kênh nếu cần)
        channels_data = [audio_data[::2], audio_data[1::2]]  # Giả sử stereo (2 kênh)

    except Exception as e:
      print(f"Error: {str(e)}")
    
    # Trả về thông tin file dưới dạng dictionary
    return {
      "songname": songname,
      "extension": extension,
      "channels": channels_data,  # Dữ liệu của các kênh (dễ dàng mở rộng cho stereo)
      "Fs": fs,  # Sample rate
      "file_hash": self.parse_file_hash()  # Hash SHA-1 của file
    }

  def parse_file_hash(self, blocksize=2**20):
    """Tạo hash SHA-1 cho file bằng cách đọc dữ liệu theo khối."""
    s = sha1()

    with open(self.filename, "rb") as f:
      while True:
        buf = f.read(blocksize)  # Đọc một khối dữ liệu
        if not buf: 
          break  # Nếu không còn dữ liệu, thoát vòng lặp
        s.update(buf)  # Cập nhật hash

    return s.hexdigest().upper()  # Trả về giá trị hash dưới dạng chữ hoa
