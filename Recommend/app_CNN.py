from flask import Flask, request, jsonify
from recommend_CNN import load_data, recommend_songs, build_model
import torch

app = Flask(__name__)

# Load model & dữ liệu khi khởi động server
model = build_model()
model.load_state_dict(torch.load("model_CNN.pt", map_location=torch.device("cpu")))
model.eval()
images_by_label = load_data()

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        song_name = data.get('song_name')
        if not song_name:
            return jsonify({'error': 'Thiếu tên bài hát'}), 400

        results = recommend_songs(song_name, images_by_label, model)
        if not results:
            return jsonify({'error': 'Không tìm thấy bài hát hoặc không có dữ liệu gợi ý.'}), 404

        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
