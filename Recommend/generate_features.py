from recommend_CNN import load_data, build_model, save_feature_vectors
import torch
# Load model
model = build_model()
model.load_state_dict(torch.load("model_CNN.pt", map_location=torch.device("cpu")))
model.eval()

# Load dữ liệu ảnh và lưu các vector đặc trưng
images_by_label = load_data()
save_feature_vectors(images_by_label, model, "features.pkl")
