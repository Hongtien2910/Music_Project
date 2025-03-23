import os
from pydub import AudioSegment
from pydub.utils import audioop
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

    # Lấy tên file và phần mở rộng ("song.mp3" → songname="song", extension=".mp3")
    songname, extension = os.path.splitext(os.path.basename(self.filename))

    try:
      # Đọc file âm thanh bằng pydub
      audiofile = AudioSegment.from_file(self.filename)

      # Giới hạn độ dài nếu limit được đặt (mili giây)
      if limit:
        audiofile = audiofile[:limit * 1000]

      # Chuyển đổi dữ liệu âm thanh thành mảng numpy kiểu int16
      data = np.fromstring(audiofile._data, np.int16)

      # Phân chia dữ liệu âm thanh theo từng kênh
      channels = []
      for chn in range(audiofile.channels):
        channels.append(data[chn::audiofile.channels])  # Lấy dữ liệu cách nhau theo số kênh

      fs = audiofile.frame_rate  # Lấy sample rate
    except audioop.error:
      print('audioop.error')
      pass

    # Trả về thông tin file dưới dạng dictionary
    return {
      "songname": songname,
      "extension": extension,
      "channels": channels,  # Dữ liệu của các kênh
      "Fs": audiofile.frame_rate,  # Sample rate
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
