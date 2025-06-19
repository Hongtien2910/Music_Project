from recommend_CNN import load_data, build_model, save_feature_vectors, get_feature_extractor
import torch

# Load full model
model = build_model()
model.load_state_dict(torch.load("model_CNN.pt", map_location=torch.device("cpu")))
model.eval()

# Cắt lớp cuối để trích đặc trưng (bỏ Linear(40→8))
feature_model = get_feature_extractor(model)

# Load dữ liệu ảnh và lưu vector đặc trưng
images_by_label = load_data()
save_feature_vectors(images_by_label, feature_model, "features.pkl")
