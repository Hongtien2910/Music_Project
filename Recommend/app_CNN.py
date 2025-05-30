from flask import Flask, request, jsonify
from recommend_CNN import recommend_songs, load_feature_vectors, build_model, save_feature_vectors
from utils import create_spectrogram_from_file, slice_spectrogram
import torch
import os
import numpy as np
import cv2
import re
from collections import defaultdict

app = Flask(__name__)

# Load model và feature vector
model = build_model()
model.load_state_dict(torch.load("model_CNN.pt", map_location=torch.device("cpu")))
model.eval()
features_dict = load_feature_vectors("features.pkl")

FEATURE_FILE = "features.pkl"
features_dict = load_feature_vectors(FEATURE_FILE)

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        song_name = data.get('song_name')
        if not song_name:
            return jsonify({'error': 'Thiếu tên bài hát'}), 400
        results = recommend_songs(song_name, features_dict)
        if not results:
            return jsonify({'error': 'Không tìm thấy bài hát hoặc không có dữ liệu gợi ý.'}), 404
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/create', methods=['POST'])
def create():
    try:
        if 'file' not in request.files or 'song_name' not in request.form:
            return jsonify({'error': 'Thiếu file hoặc tên bài hát'}), 400

        file = request.files['file']
        song_name = request.form['song_name'].strip()

        print(f"Generating spectrogram for {song_name}")
        spectrogram_path = create_spectrogram_from_file(file, song_name + ".mp3")

        print(f"Slicing spectrogram {spectrogram_path}")
        sliced_paths = slice_spectrogram(spectrogram_path)

        # Load sliced images and trích xuất đặc trưng cho bài hát
        images = []
        for path in sliced_paths:
            img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if img is None:
                continue
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) / 255.
            gray = cv2.resize(gray, (128, 128))
            images.append(gray)

        if not images:
            return jsonify({'error': 'Không thể xử lý ảnh để trích đặc trưng'}), 500

        imgs_tensor = torch.from_numpy(np.stack(images)[:, None, :, :].astype(np.float32))
        with torch.no_grad():
            preds = model(imgs_tensor)
            mean_vector = preds.mean(dim=0).cpu().numpy()

        # Cập nhật feature vector
        features_dict[song_name] = mean_vector
        with open(FEATURE_FILE, "wb") as f:
            import pickle
            pickle.dump(features_dict, f)

        return jsonify({
            'message': 'Tạo spectrogram, slicing và lưu vector đặc trưng thành công',
            'sliced_images': sliced_paths
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
