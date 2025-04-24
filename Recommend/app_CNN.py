from flask import Flask, request, jsonify
from recommend_CNN import recommend_songs, load_feature_vectors, build_model
import torch

app = Flask(__name__)

# Load model (nếu cần cho các tác vụ khác), nhưng ở đây chỉ cần features là đủ
model = build_model()
model.load_state_dict(torch.load("model_CNN.pt", map_location=torch.device("cpu")))
model.eval()

# Load các vector đặc trưng đã lưu
features_dict = load_feature_vectors("features.pkl")

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

if __name__ == '__main__':
    app.run(debug=True)
