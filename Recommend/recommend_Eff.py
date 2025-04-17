import os
import re
import torch
import torch.nn as nn
import numpy as np
import cv2
from collections import defaultdict
from efficientnet_pytorch import EfficientNet

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Chuyển ảnh grayscale thành 3 kênh cho EfficientNet (nếu muốn nâng cấp sau)
class CustomEfficientNet(nn.Module):
    def __init__(self, model):
        super(CustomEfficientNet, self).__init__()
        self.model = model

    def forward(self, x):
        x = x.repeat(1, 3, 1, 1)  # Convert 1-channel grayscale → 3-channel
        return self.model(x)

# Khởi tạo model
def build_model():
    base_model = EfficientNet.from_pretrained('efficientnet-b0', num_classes=8)
    return CustomEfficientNet(base_model).to(device)

# Load dữ liệu spectrogram
def load_data():
    folder = "process_data/Music_Sliced_Images"
    filenames = [os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".jpg")]
    images_by_label = defaultdict(list)

    for f in filenames:
        song_variable = re.search(rf'{re.escape(folder)}[\\/].*_(.+?).jpg', f).group(1)
        img = cv2.imread(f, cv2.IMREAD_UNCHANGED)
        if img is None:
            continue
        gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) / 255.
        gray_img = cv2.resize(gray_img, (128, 128))
        images_by_label[song_variable].append(gray_img)

    return images_by_label

# Hàm gợi ý bài hát
def recommend_songs(song_name, images_by_label, model):
    matrix_size = 8  # Số class output
    prediction_anchor = torch.zeros((1, matrix_size)).to(device)

    predictions_song = []
    predictions_label = []
    distance_array = []

    with torch.no_grad():
        if song_name not in images_by_label:
            print(f"Bài hát '{song_name}' không tồn tại trong dữ liệu.")
            return []

        anchor_imgs = np.stack(images_by_label[song_name])
        anchor_imgs = torch.from_numpy(anchor_imgs[:, None, :, :].astype(np.float32)).to(device)
        anchor_preds = model(anchor_imgs)
        prediction_anchor = anchor_preds.mean(dim=0, keepdim=True)

        for label, img_list in images_by_label.items():
            if label == song_name:
                continue
            imgs = np.stack(img_list)
            imgs_tensor = torch.from_numpy(imgs[:, None, :, :].astype(np.float32)).to(device)
            pred = model(imgs_tensor).mean(dim=0, keepdim=True)
            predictions_song.append(pred)
            predictions_label.append(label)

        # Cosine similarity
        prediction_anchor_norm = prediction_anchor / prediction_anchor.norm(dim=1, keepdim=True)
        preds_tensor = torch.cat(predictions_song, dim=0)
        preds_norm = preds_tensor / preds_tensor.norm(dim=1, keepdim=True)
        similarity = torch.mm(preds_norm, prediction_anchor_norm.T).squeeze()

        topk = torch.topk(similarity, k=3)
        top_indices = topk.indices.cpu().numpy()
        top_values = topk.values.cpu().numpy()

        list_song = []
        list_song.append({'id': 1, 'name': song_name, 'link': f'templates/music/{song_name}.mp3', 'genre': 'Original Song'})

        for i, idx in enumerate(top_indices):
            name = predictions_label[idx]
            value = f'{top_values[i]:.4f}'
            list_song.append({
                'id': i + 2,
                'name': name,
                'link': f'templates/music/{name}.mp3',
                'genre': 'Recommend Song',
                'metrics': 'Similar:',
                'value': value
            })

        return list_song
