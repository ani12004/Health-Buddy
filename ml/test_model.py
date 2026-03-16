import os
import json
import joblib  # type: ignore
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
import torch  # type: ignore
import torch.nn as nn  # type: ignore
from sklearn.base import BaseEstimator, ClassifierMixin  # type: ignore

MODELS_PATH = os.path.dirname(os.path.abspath(__file__))
DISEASES    = ['heart_disease', 'hypertension', 'diabetes']

class DiseaseNN(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.b1 = nn.Sequential(nn.Linear(input_dim, 256), nn.BatchNorm1d(256), nn.ReLU())
        self.b2 = nn.Sequential(nn.Linear(256, 128), nn.BatchNorm1d(128), nn.ReLU())
        self.b3 = nn.Sequential(nn.Linear(128, 64),  nn.BatchNorm1d(64),  nn.ReLU())
        self.b4 = nn.Sequential(nn.Linear(64, 32),  nn.BatchNorm1d(32),  nn.ReLU())
        self.skip = nn.Linear(input_dim, 32, bias=False)
        self.out = nn.Sequential(nn.Linear(32, 1), nn.Sigmoid())

    def forward(self, x):
        s = self.skip(x)
        x = self.b1(x)
        x = self.b2(x)
        x = self.b3(x)
        x = self.b4(x)
        return self.out(x + s).squeeze(1)

class TorchNNClassifier(BaseEstimator, ClassifierMixin):
    def __init__(self, input_dim=18, device=None):
        self.input_dim = input_dim
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_ = None

    def predict_proba(self, X):
        if self.model_ is None:
            raise ValueError("NN Model not loaded")
        self.model_.eval()
        with torch.no_grad():
            p = self.model_(torch.FloatTensor(np.array(X)).to(self.device)).cpu().numpy()
        return np.column_stack([1-p, p])

    def load(self, path):
        model = DiseaseNN(self.input_dim).to(self.device)
        model.load_state_dict(torch.load(path, map_location=self.device, weights_only=True))
        self.model_ = model

class SoftVotingEnsemble:
    def __init__(self, lr, xgb, nn_model, hgb, weights):
        self.lr = lr
        self.xgb = xgb
        self.nn = nn_model
        self.hgb = hgb
        self.w = np.array(weights) / np.sum(weights)

    def predict_proba(self, X):
        p_lr = self.lr.predict_proba(X)[:, 1]
        p_xgb = self.xgb.predict_proba(X)[:, 1]
        p_nn = self.nn.predict_proba(X)[:, 1]
        p_hgb = self.hgb.predict_proba(X)[:, 1]
        p_ens = (self.w[0] * p_lr + self.w[1] * p_xgb + self.w[2] * p_nn + self.w[3] * p_hgb)
        return np.column_stack([1-p_ens, p_ens])

print('Loading 3-Disease V7 Models...')
bundles = {}
scalers = {}
for d in DISEASES:
    p = os.path.join(MODELS_PATH, d)
    features = json.load(open(os.path.join(MODELS_PATH, f'{d}_features.json')))
    w = json.load(open(f'{p}_weights.json'))
    lr = joblib.load(f'{p}_lr.pkl')
    xgb = joblib.load(f'{p}_xgb.pkl')
    hgb = joblib.load(f'{p}_hgb.pkl')
    nn_m = TorchNNClassifier(input_dim=len(features))
    nn_m.load(f'{p}_nn.pt')
    bundles[d] = SoftVotingEnsemble(lr, xgb, nn_m, hgb, (w['lr'], w['xgb'], w['nn'], w['hgb']))
    scalers[d] = joblib.load(f'{p}_scaler.pkl')
    print(f'  OK: {d} loaded (4-model ensemble)')

def run_test(name, data):
    print(f'\nRunning Test: {name}')
    data_copy = data.copy()
    # Engineered features
    data_copy['pulse_pressure'] = data_copy['systolic_bp'] - data_copy['diastolic_bp']
    data_copy['chol_hdl_ratio'] = data_copy['total_cholesterol'] / max(1, data_copy['hdl'])
    data_copy['glucose_bmi_index'] = (data_copy['fasting_glucose'] / 100) * (data_copy['bmi'] / 25)
    
    MAPS = {
        'sex': {'Female':0, 'Male':1},
        'smoking': {'Non-Smoker':0, 'Former Smoker':1, 'Regular Smoker':2, 'Heavy Smoker':3},
        'activity': {'Sedentary':0, 'Light':1, 'Moderate':2, 'Active':3, 'Very Active':4},
        'stress': {'Low':0, 'Moderate':1, 'High':2},
        'salt_intake': {'Low':0, 'Medium':1, 'High':2},
        'history': {'None':0, 'Yes':1}
    }
    mapped = data_copy.copy()
    for k, mapping in MAPS.items():
        if k in data_copy: mapped[k] = mapping.get(data_copy[k], 0)

    for d, ensemble in bundles.items():
        features = json.load(open(os.path.join(MODELS_PATH, f'{d}_features.json')))
        df = pd.DataFrame([mapped])[features]
        X_sc = scalers[d].transform(df)
        prob = ensemble.predict_proba(X_sc)[0][1]
        badge = 'HIGH' if prob > 0.65 else 'MODERATE' if prob > 0.35 else 'LOW'
        print(f'  {d:<15}: {prob*100:>5.1f}% [{badge}]')

case_healthy = {
    "age": 25, "sex": "Male", "bmi": 22.0, "waist": 78,
    "systolic_bp": 115, "diastolic_bp": 75, "heart_rate": 60, "history": "None",
    "total_cholesterol": 170, "ldl": 90, "hdl": 65, "triglycerides": 80,
    "fasting_glucose": 85, "hba1c": 5.0,
    "smoking": "Non-Smoker", "activity": "Very Active", "stress": "Low", "salt_intake": "Low"
}

case_high = {
    "age": 62, "sex": "Male", "bmi": 35.0, "waist": 112,
    "systolic_bp": 158, "diastolic_bp": 98, "heart_rate": 88, "history": "Yes",
    "total_cholesterol": 275, "ldl": 185, "hdl": 32, "triglycerides": 280,
    "fasting_glucose": 185, "hba1c": 8.2,
    "smoking": "Heavy Smoker", "activity": "Sedentary", "stress": "High", "salt_intake": "High"
}

run_test("Healthy Patient", case_healthy)
run_test("High Risk Patient", case_high)