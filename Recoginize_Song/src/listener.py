import pyaudio
import numpy
import wave

class Listener():
    # Định nghĩa các thông số mặc định cho quá trình thu âm
    default_chunksize = 8192  # Kích thước mỗi khối dữ liệu được đọc
    default_format = pyaudio.paInt16  # Định dạng âm thanh 16-bit
    default_channels = 2  # Số lượng kênh âm thanh (2 kênh - stereo)
    default_rate = 44100  # Tần số lấy mẫu (Hz)
    default_seconds = 0  # Thời gian mặc định thu âm (0 nghĩa là không giới hạn)

    def __init__(self):
        """Khởi tạo đối tượng Listener để thu âm."""
        self.audio = pyaudio.PyAudio()  # Tạo một đối tượng PyAudio để quản lý âm thanh
        self.stream = None  # Biến lưu trữ luồng thu âm
        self.data = []  # Danh sách lưu trữ dữ liệu âm thanh
        self.channels = Listener.default_channels  # Số lượng kênh
        self.chunksize = Listener.default_chunksize  # Kích thước khối dữ liệu
        self.rate = Listener.default_rate  # Tần số lấy mẫu
        self.recorded = False  # Trạng thái đã ghi âm hay chưa

    def start_recording(self, channels=default_channels,
                        rate=default_rate,
                        chunksize=default_chunksize,
                        seconds=default_seconds):
        """Bắt đầu quá trình thu âm."""
        self.chunksize = chunksize
        self.channels = channels
        self.recorded = False
        self.rate = rate

        # Nếu có luồng thu âm trước đó, dừng và đóng nó
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()

        # Mở một luồng thu âm mới với các thông số được chỉ định
        self.stream = self.audio.open(
            format=self.default_format,
            channels=channels,
            rate=rate,
            input=True,
            frames_per_buffer=chunksize,
        )
        # Khởi tạo danh sách lưu dữ liệu cho từng kênh
        self.data = [[] for _ in range(channels)]

    def process_recording(self):
        """Đọc dữ liệu từ luồng thu âm và xử lý."""
        data = self.stream.read(self.chunksize)  # Đọc dữ liệu từ buffer
        nums = numpy.fromstring(data, numpy.int16)  # Chuyển đổi dữ liệu sang dạng số nguyên 16-bit

        # Lưu dữ liệu vào danh sách cho từng kênh
        for c in range(self.channels):
            self.data[c].extend(nums[c::self.channels])
        
        return nums  # Trả về dữ liệu đã đọc

    def stop_recording(self):
        """Dừng quá trình thu âm."""
        self.stream.stop_stream()  # Dừng luồng thu âm
        self.stream.close()  # Đóng luồng thu âm
        self.stream = None  # Đặt luồng về None
        self.recorded = True  # Đánh dấu là đã ghi âm xong

    def get_recorded_data(self):
        """Trả về dữ liệu đã thu âm."""
        return self.data

    def save_recorded(self, output_filename):
        """Lưu dữ liệu âm thanh đã thu vào tệp WAV."""
        wf = wave.open(output_filename, 'wb')  # Mở tệp WAV để ghi
        wf.setnchannels(self.channels)  # Thiết lập số kênh âm thanh
        wf.setsampwidth(self.audio.get_sample_size(self.default_format))  # Đặt độ rộng mẫu
        wf.setframerate(self.rate)  # Đặt tần số lấy mẫu

        # Chia dữ liệu thành từng đoạn tương ứng với số kênh
        chunk_length = len(self.data[0]) // self.channels
        result = numpy.reshape(self.data[0], (chunk_length, self.channels))  # Định dạng lại dữ liệu
        wf.writeframes(result)  # Ghi dữ liệu vào tệp
        wf.close()  # Đóng tệp

    def play(self):
        """Chức năng phát lại âm thanh (chưa được triển khai)."""
        pass

    def get_recorded_time(self):
        """Tính thời gian đã thu âm dựa trên số mẫu thu được."""
        return len(self.data[0]) / self.rate
