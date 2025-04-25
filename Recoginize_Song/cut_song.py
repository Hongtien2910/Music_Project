from pydub import AudioSegment

def cut_mp3(input_file, output_file, start_time=72, duration=10):
    """
    Cắt một đoạn MP3 có độ dài `duration` giây từ `start_time` giây.
    
    :param input_file: Đường dẫn file MP3 gốc
    :param output_file: Đường dẫn lưu file MP3 đầu ra
    :param start_time: Thời gian bắt đầu cắt (tính bằng giây)
    :param duration: Độ dài đoạn MP3 cắt (mặc định 10 giây)
    """
    try:
        # Đọc file MP3
        audio = AudioSegment.from_file(input_file, format="mp3")
        
        # Xác định thời gian bắt đầu và kết thúc (đơn vị: milliseconds)
        start_ms = start_time * 1000
        end_ms = start_ms + (duration * 1000)

        # Cắt đoạn âm thanh
        segment = audio[start_ms:end_ms]

        # Xuất file MP3 mới
        segment.export(output_file, format="mp3")
        print(f"Đã cắt thành công {duration} giây từ {start_time}s → {start_time + duration}s.")
        print(f"File MP3 mới: {output_file}")

    except Exception as e:
        print(f"Lỗi: {e}")

# Gọi hàm để cắt file
input_mp3 = "mp3/Ariana Grande - Last Christmas.mp3" 
output_mp3 = "Test.mp3"  # File đầu ra
cut_mp3(input_mp3, output_mp3, start_time=30, duration=10)
