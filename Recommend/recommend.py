import os
import re
import torch
import torch.nn as nn
import numpy as np 
import cv2 
from collections import defaultdict

# ========== Định nghĩa kiến trúc model ==========

def conv(ni, nf, ks=3, stride=1, bias=False):
    return nn.Conv2d(ni, nf, kernel_size=ks, stride=stride, padding=ks//2, bias=bias)

def conv_layer(ni, nf, ks=3, stride=1, act=True):
    bn = nn.BatchNorm2d(nf)
    layers = [conv(ni, nf, ks, stride=stride), bn]
    act_fn = nn.ReLU(inplace=True)
    if act: layers.append(act_fn)
    return nn.Sequential(*layers)

class ResBlock(nn.Module):
    def __init__(self, nf):
        super().__init__()
        self.conv1 = conv_layer(nf, nf)
        self.conv2 = conv_layer(nf, nf)
    def forward(self, x):
        return x + self.conv2(self.conv1(x))

def conv_layer_averpl(ni, nf):
    aver_pl = nn.AvgPool2d(kernel_size=2, stride=2)
    return nn.Sequential(conv_layer(ni, nf), aver_pl)

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

# ========== Hàm gợi ý bài hát ==========

def recommend_songs(song_name, images_by_label, feature_model):
    device = next(feature_model.parameters()).device
    matrix_size = 40
    prediction_anchor = torch.zeros((1, matrix_size)).to(device)

    predictions_song = []
    predictions_label = []
    distance_array = []

    with torch.no_grad():
        if song_name not in images_by_label:
            return []

        anchor_imgs = np.stack(images_by_label[song_name])
        anchor_imgs = torch.from_numpy(anchor_imgs[:, None, :, :].astype(np.float32)).to(device)
        anchor_preds = feature_model(anchor_imgs)
        prediction_anchor = anchor_preds.mean(dim=0, keepdim=True)

        for label, img_list in images_by_label.items():
            if label == song_name:
                continue
            imgs = np.stack(img_list)
            imgs_tensor = torch.from_numpy(imgs[:, None, :, :].astype(np.float32)).to(device)
            pred = feature_model(imgs_tensor).mean(dim=0, keepdim=True)
            predictions_song.append(pred)
            predictions_label.append(label)

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
