from __future__ import division
import hashlib
import numpy as np
import matplotlib.mlab as mlab
from termcolor import colored
from scipy.ndimage.filters import maximum_filter
from scipy.ndimage.morphology import (generate_binary_structure, iterate_structure, binary_erosion)
from operator import itemgetter

IDX_FREQ_I = 0  # Chỉ số của tần số trong danh sách peak
IDX_TIME_J = 1  # Chỉ số của thời gian trong danh sách peak
DEFAULT_FS = 44100  # Tần số lấy mẫu mặc định (Hz)
DEFAULT_WINDOW_SIZE = 8192  # Kích thước cửa sổ FFT
DEFAULT_OVERLAP_RATIO = 0.3  # Tỉ lệ chồng lấn của cửa sổ FFT
DEFAULT_FAN_VALUE = 5  # Giá trị fan-out (số lượng peak để tạo hash)
DEFAULT_AMP_MIN = 20  # Ngưỡng biên độ tối thiểu để coi là peak
PEAK_NEIGHBORHOOD_SIZE = 15  # Kích thước vùng lân cận để phát hiện peak
MIN_HASH_TIME_DELTA = 0  # Khoảng thời gian tối thiểu giữa hai peak khi tạo hash
MAX_HASH_TIME_DELTA = 200  # Khoảng thời gian tối đa giữa hai peak khi tạo hash
PEAK_SORT = True  # Xác định có sắp xếp peak theo thời gian hay không
FINGERPRINT_REDUCTION = 20  # Độ dài của fingerprint hash (giới hạn số ký tự trong hash)


"""
  Hàm tạo fingerprint từ dữ liệu âm thanh.
    - Tạo phổ tần số (spectrogram) từ dữ liệu âm thanh.
    - Tìm các điểm cực đại (peaks) trong phổ.
    - Sinh hash từ các peaks để nhận diện bài hát.
"""
def fingerprint(channel_samples, Fs=DEFAULT_FS,
                wsize=DEFAULT_WINDOW_SIZE,
                wratio=DEFAULT_OVERLAP_RATIO,
                fan_value=DEFAULT_FAN_VALUE,
                amp_min=DEFAULT_AMP_MIN):

    # Tạo phổ tần số (spectrogram)
    arr2D = mlab.specgram(
        channel_samples,
        NFFT=wsize,   # Kích thước cửa sổ FFT
        Fs=Fs,         # Tần số lấy mẫu
        window=mlab.window_hanning,   # Cửa sổ Hanning để giảm hiệu ứng rò rỉ phổ
        noverlap=int(wsize * wratio))[0] # Số mẫu chồng lấn giữa các cửa sổ

    # Chuyển đổi sang thang đo dB và thay thế giá trị 0 để tránh lỗi log(0)
    arr2D = 10 * np.log10(replaceZeroes(arr2D))
    arr2D[arr2D == -np.inf] = 0 

    # Tìm các đỉnh (peaks) trong phổ tần số
    local_maxima = get_2D_peaks(arr2D, amp_min=amp_min)

    # Sinh hash từ các peaks
    return generate_hashes(local_maxima, fan_value=fan_value)

def get_2D_peaks(arr2D, amp_min=DEFAULT_AMP_MIN):
    """
    Tìm các điểm cực đại cục bộ (peaks) trong phổ tần số.
    Chỉ giữ lại các peaks có biên độ lớn hơn amp_min.
    """

    # Tạo cấu trúc nhị phân để quét ảnh 2D
    struct = generate_binary_structure(2, 1)
    neighborhood = iterate_structure(struct, PEAK_NEIGHBORHOOD_SIZE)

    # Xác định điểm cực đại 
    local_max = maximum_filter(arr2D, footprint=neighborhood) == arr2D
    background = (arr2D == 0)   # Xác định nền (các điểm có giá trị 0)

    # Xóa nền bằng phép co (erosion) để giữ lại các peaks thực sự
    eroded_background = binary_erosion(background, structure=neighborhood,
                                       border_value=1)

    # Lấy danh sách các peaks
    detected_peaks = local_max ^ eroded_background # XOR để loại bỏ các điểm nền
    amps = arr2D[detected_peaks]  # Lấy giá trị biên độ của peaks
    j, i = np.where(detected_peaks)  # Lấy tọa độ peaks (tần số và thời gian)
    amps = amps.flatten() # Chuyển về mảng 1D
    
    # Lọc các peaks có biên độ lớn hơn amp_min
    peaks = zip(i, j, amps)
    peaks_filtered = [x for x in peaks if x[2] > amp_min] 

    # Tách danh sách peaks thành chỉ số tần số và chỉ số thời gian
    frequency_idx = [x[1] for x in peaks_filtered]
    time_idx = [x[0] for x in peaks_filtered]
    
    return zip(frequency_idx, time_idx)

def generate_hashes(peaks, fan_value=DEFAULT_FAN_VALUE):
    """
    Tạo hash từ danh sách peaks. Hash được tạo bằng cách kết hợp các peaks lân cận.
    """
    
    peaks = list(peaks)
    if PEAK_SORT:
        peaks.sort(key=itemgetter(1))  # Sắp xếp peaks theo thời gian

    for i in range(len(peaks)):
        for j in range(1, fan_value):
            if (i + j) < len(peaks):
                freq1 = peaks[i][IDX_FREQ_I]  # Tần số của peak đầu tiên
                freq2 = peaks[i + j][IDX_FREQ_I]  # Tần số của peak thứ hai
                
                t1 = peaks[i][IDX_TIME_J]  # Thời gian của peak đầu tiên
                t2 = peaks[i + j][IDX_TIME_J]  # Thời gian của peak thứ hai
                t_delta = t2 - t1  # Khoảng thời gian giữa hai peaks

                # Kiểm tra điều kiện khoảng thời gian hợp lệ
                if t_delta >= MIN_HASH_TIME_DELTA and t_delta <= MAX_HASH_TIME_DELTA:
                    # Tạo chuỗi hash từ tần số và khoảng thời gian
                    result = "{freq1}|{freq2}|{delta}".format(freq1=freq1, freq2=freq2, delta=t_delta)
                    result = result.encode('utf-8')  # Chuyển đổi sang bytes

                    # Sinh giá trị hash SHA-1
                    h = hashlib.sha1(result)

                    # Trả về hash (chỉ lấy FINGERPRINT_REDUCTION ký tự đầu) và thời gian của peak đầu tiên
                    yield (h.hexdigest()[0:FINGERPRINT_REDUCTION], t1)

def replaceZeroes(data):
    """
    Thay thế tất cả giá trị 0 trong dữ liệu bằng giá trị nhỏ nhất khác 0.
    Điều này tránh lỗi log(0) khi chuyển đổi sang thang đo dB.
    """
    
    min_nonzero = np.min(data[np.nonzero(data)])  # Lấy giá trị nhỏ nhất khác 0
    data[data == 0] = min_nonzero  # Thay thế các giá trị 0
    return data