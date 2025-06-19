import os
import re
import torch
import torch.nn as nn
import numpy as np
import cv2
import pickle
from collections import defaultdict

# ========== Định nghĩa kiến trúc model ==========

def conv(ni, nf, ks=3, stride=1, bias=False):
    return nn.Conv2d(ni, nf, kernel_size=ks, stride=stride, padding=ks//2, bias=bias)

def conv_layer(ni, nf, ks=3, stride=1, act=True):
    bn = nn.BatchNorm2d(nf)
    layers = [conv(ni, nf, ks, stride=stride), bn]
    if act: layers.append(nn.ReLU(inplace=True))
    return nn.Sequential(*layers)

class ResBlock(nn.Module):
    def __init__(self, nf):
        super().__init__()
        self.conv1 = conv_layer(nf, nf)
        self.conv2 = conv_layer(nf, nf)
    def forward(self, x):
        return x + self.conv2(self.conv1(x))

def conv_layer_averpl(ni, nf):
    return nn.Sequential(
        conv_layer(ni, nf),
        nn.AvgPool2d(kernel_size=2, stride=2)
    )

def build_model():
    return nn.Sequential(
        conv_layer_averpl(1, 64),
        ResBlock(64),
        conv_layer_averpl(64, 64),
        ResBlock(64),
        conv_layer_averpl(64, 128),
        ResBlock(128),
        conv_layer_averpl(128, 256),
        ResBlock(256),
        conv_layer_averpl(256, 512),
        ResBlock(512),
        nn.AdaptiveAvgPool2d((2, 2)),
        nn.Flatten(),
        nn.Linear(2048, 40),
        nn.Linear(40, 8)
    )

# ========== Cắt model để lấy đặc trưng ==========

def get_feature_extractor(full_model):
    # Bỏ lớp cuối cùng Linear(40 → 8), chỉ giữ đến Linear(2048 → 40)
    return nn.Sequential(*list(full_model.children())[:-1])

# ========== Load dữ liệu ảnh ==========

def load_data():
    folder = "process_data/Music_Sliced_Images"
    filenames = [os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".jpg")]
    images_by_label = defaultdict(list)

    for f in filenames:
        try:
            song_variable = re.search(rf'{re.escape(folder)}[\\/].*_(.+?).jpg', f).group(1)
            img = cv2.imread(f, cv2.IMREAD_UNCHANGED)
            if img is None:
                continue
            gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) / 255.
            gray_img = cv2.resize(gray_img, (128, 128))
            images_by_label[song_variable].append(gray_img)
        except Exception as e:
            print(f"Lỗi đọc ảnh {f}: {e}")
    return images_by_label

# ========== Trích xuất & lưu vector đặc trưng ==========

def save_feature_vectors(images_by_label, feature_model, output_file="features.pkl"):
    device = next(feature_model.parameters()).device
    feature_model.eval()
    features = {}

    with torch.no_grad():
        for label, img_list in images_by_label.items():
            imgs = np.stack(img_list)
            imgs_tensor = torch.from_numpy(imgs[:, None, :, :].astype(np.float32)).to(device)
            preds = feature_model(imgs_tensor)
            mean_vector = preds.mean(dim=0).cpu().numpy()
            features[label] = mean_vector

    with open(output_file, "wb") as f:
        pickle.dump(features, f)
    print(f"✅ Đã lưu {len(features)} vector đặc trưng vào {output_file}")

# ========== Load vector đặc trưng đã lưu ==========

def load_feature_vectors(feature_file="features.pkl"):
    with open(feature_file, "rb") as f:
        features = pickle.load(f)
    return features

# ========== Gợi ý bài hát từ vector đã lưu ==========

def recommend_songs(song_name, features_dict):
    if song_name not in features_dict:
        return []

    anchor = torch.tensor(features_dict[song_name])
    anchor = anchor / anchor.norm()

    predictions_label = []
    predictions_vec = []

    for label, vec in features_dict.items():
        if label == song_name:
            continue
        v = torch.tensor(vec)
        v = v / v.norm()
        predictions_label.append(label)
        predictions_vec.append(v)

    preds_tensor = torch.stack(predictions_vec)
    similarity = torch.matmul(preds_tensor, anchor)

    topk = torch.topk(similarity, k=3)
    top_indices = topk.indices.numpy()
    top_values = topk.values.numpy()

    list_song = []
    list_song.append({
        'id': 1,
        'name': song_name,
        'link': f'templates/music/{song_name}.mp3',
        'genre': 'Original Song'
    })

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
