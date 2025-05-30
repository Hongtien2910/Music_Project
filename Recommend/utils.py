import os
import re
import librosa
import librosa.display
import matplotlib.pyplot as plt
from PIL import Image

def create_spectrogram_from_file(file_obj, filename, output_folder="Music_Spectogram_Images"):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    song_id = re.sub(r'\.mp3$', '', filename)
    y, sr = librosa.load(file_obj, sr=None)  # file_obj là file-like object (BytesIO)
    melspectrogram_array = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
    mel = librosa.power_to_db(melspectrogram_array)

    fig_size = plt.rcParams["figure.figsize"]
    fig_size[0] = float(mel.shape[1]) / float(100)
    fig_size[1] = float(mel.shape[0]) / float(100)
    plt.rcParams["figure.figsize"] = fig_size

    plt.axis('off')
    plt.axes([0., 0., 1., 1.0], frameon=False, xticks=[], yticks=[])
    librosa.display.specshow(mel, cmap='gray_r')

    save_path = os.path.join(output_folder, f"{song_id}.jpg")
    plt.savefig(save_path, dpi=100)
    plt.close()
    return save_path

def slice_spectrogram(image_path, output_folder="Music_Sliced_Images"):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    song_id = re.search(r'([^/\\]+)\.jpg$', image_path).group(1)
    img = Image.open(image_path)
    subsample_size = 128
    width, height = img.size
    number_of_samples = 26

    saved_paths = []
    for i in range(6, number_of_samples):
        start = i * subsample_size
        img_slice = img.crop((start, 0., start + subsample_size, subsample_size))
        save_path = os.path.join(output_folder, f"{i}_{song_id}.jpg")
        img_slice.save(save_path)
        saved_paths.append(save_path)
    return saved_paths
