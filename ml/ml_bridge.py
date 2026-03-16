import os
import json
import joblib  # type: ignore
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
import torch  # type: ignore
import torch.nn as nn  # type: ignore
import sys
from sklearn.base import BaseEstimator, ClassifierMixin  # type: ignore

# ──────────────────────────────────────────────
# 1. Model Definitions
# ──────────────────────────────────────────────

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
        self.classes_ = np.array([0, 1])

    def predict_proba(self, X):
        if self.model_ is None:
            raise ValueError("Model not loaded.")
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
        
        # Agreement for confidence
        variance = np.var([p_lr, p_xgb, p_nn, p_hgb], axis=0)
        agreement = 1.0 - (variance * 4) # Rough scaling
        return p_ens, np.clip(agreement, 0, 1), {"lr": p_lr[0], "xgb": p_xgb[0], "nn": p_nn[0], "hgb": p_hgb[0]}

# ──────────────────────────────────────────────
# 2. Narrative Generator
# ──────────────────────────────────────────────

class NarrativeGenerator:
    def __init__(self, config_path):
        self.config = json.load(open(config_path))
        self.thresholds = self.config['clinical_thresholds']
        self.labels = self.config['feature_labels']

    def generate(self, disease, prob, input_data, shap_values):
        risk_percent = prob * 100
        risk_level = "HIGH" if risk_percent >= 65 else "MODERATE" if risk_percent >= 35 else "LOW"
        
        flags = self._generate_flags(input_data)
        drivers = self._get_shap_drivers(shap_values)
        
        summary = self._build_summary(disease, risk_level, input_data, flags)
        card_text = self._build_card_text(disease, input_data, flags)
        recommendations = self._build_recommendations(input_data, flags, disease)

        return {
            "disease": disease,
            "risk_percent": round(risk_percent, 1),
            "risk_level": risk_level,
            "clinical_flags": flags,
            "top_risk_drivers": drivers["top"],
            "protective_factors": drivers["protective"],
            "summary_paragraph": summary,
            "card_text": card_text,
            "recommendations": recommendations,
            "plain_english": summary
        }

    def _generate_flags(self, data):
        flags = []
        for metric, t in self.thresholds.items():
            if metric not in data: continue
            val = data[metric]
            status = "normal"
            
            if t['direction'] == "high_bad":
                if val >= t['very_high']: status = "danger"
                elif val >= t['high']: status = "warning"
            else: # low_bad
                if val <= t['very_low']: status = "danger"
                elif val <= t['low']: status = "warning"
            
            if status != "normal" or (metric == 'hdl' and val >= 60): # protective check
                if metric == 'hdl' and val >= 60:
                     flags.append({
                        "status": "protective",
                        "label": self.labels[metric],
                        "value": val,
                        "unit": t['unit'],
                        "message": f"HDL is protective at {val} {t['unit']}"
                    })
                else:
                    flags.append({
                        "status": status,
                        "label": self.labels[metric],
                        "value": val,
                        "unit": t['unit'],
                        "message": f"{self.labels[metric]} {'elevated' if t['direction']=='high_bad' else 'low'} at {val} {t['unit']}"
                    })
        return flags

    def _get_shap_drivers(self, shap):
        # Sort features by impact
        items = sorted(list(shap.items()), key=lambda x: abs(x[1]), reverse=True)
        top = []
        prot = []
        for k, v in items:
            label = str(self.labels.get(k, k))
            val = float(v)
            if val > 0 and len(top) < 3:
                top.append({"feature": label, "shap": float(int(float(val) * 1000 + 0.5) / 1000.0)})
            elif val < 0 and len(prot) < 2:
                prot.append({"feature": label, "shap": float(abs(int(float(val) * 1000 + 0.5) / 1000.0))})
        return {"top": top, "protective": prot}

    def _build_summary(self, disease, level, data, flags):
        age, sex = data['age'], data['sex']
        summary = f"The patient, a {age}-year-old {sex.lower()}, presents with a health profile assessed for {disease.lower()} risk. "
        summary += f"Current data indicates a {level.lower()} risk level. "
        
        if flags:
            danger_flags = [f['message'] for f in flags if f['status'] == 'danger']
            if danger_flags:
                summary += f"Critical observations include: {', '.join(danger_flags)}. "
        
        if disease == "Heart Disease":
            summary += f"The clinical picture suggests {'significant' if level=='HIGH' else 'a degree of'} cardiovascular strain. "
        elif disease == "Diabetes":
            summary += "HbA1c and glucose levels suggest monitoring of insulin sensitivity is required. "
            
        summary += "Immediate clinical review and lifestyle modifications are recommended based on these findings."
        return summary

    def _build_card_text(self, disease, data, flags):
        if disease == "Heart Disease":
            count = len([f for f in flags if any(x in f['label'] for x in ['BP', 'Cholesterol', 'LDL'])])
            return f"Patient shows {count} critical cardiovascular indicators. Risk is driven by arterial pressure and lipid profile."
        elif disease == "Hypertension":
            return "Metabolic indicators and lifestyle factors contribute to elevated vascular resistance."
        return "Glycemic control and body mass index are the primary risk determinants observed."

    def _build_recommendations(self, data, flags, disease):
        recs = []
        if data.get('smoking') != 'Non-Smoker':
            recs.append("Smoking cessation: Quitting significantly reduces long-term disease risk.")
        
        danger_flags = [f for f in flags if f['status'] == 'danger']
        for f in danger_flags:
            recs.append(f"Manage {f['label']}: Your {f['label']} is critically high/low. Consult a physician.")
            
        if data.get('activity') == 'Sedentary':
            recs.append("Physical activity: Aim for 150 minutes of moderate aerobic activity weekly.")
            
        recs.append("Schedule a follow-up with your GP to discuss these AI-detected risk factors.")
        res_recs = []
        for i in range(min(5, len(recs))):
            res_recs.append(recs[i])
        return res_recs

# ──────────────────────────────────────────────
# 3. Main Logic
# ──────────────────────────────────────────────

def run_bridge():
    models_path = os.path.dirname(os.path.abspath(__file__))
    
    try:
        input_data = json.load(sys.stdin)
    except Exception as e:
        print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
        return

    # Categorical Maps
    MAPS = {
        'sex': {'Female':0, 'Male':1},
        'smoking': {'Non-Smoker':0, 'Former Smoker':1, 'Regular Smoker':2, 'Heavy Smoker':3},
        'activity': {'Sedentary':0, 'Light':1, 'Moderate':2, 'Active':3, 'Very Active':4},
        'stress': {'Low':0, 'Moderate':1, 'High':2},
        'salt_intake': {'Low':0, 'Medium':1, 'High':2},
        'history': {'None':0, 'Yes':1}
    }

    try:
        mapped = input_data.copy()
        for k, mapping in MAPS.items():
            if k in input_data:
                mapped[k] = mapping.get(input_data[k], 0)
        
        # Engineered features
        mapped['pulse_pressure'] = mapped['systolic_bp'] - mapped['diastolic_bp']
        mapped['chol_hdl_ratio'] = mapped['total_cholesterol'] / max(1, mapped['hdl'])
        mapped['glucose_bmi_index'] = (mapped['fasting_glucose'] / 100) * (mapped['bmi'] / 25)
    except Exception as e:
        print(json.dumps({"error": f"Feature engineering failed: {str(e)}"}))
        return

    diseases = {
        "Heart Disease": "heart_disease",
        "Hypertension": "hypertension",
        "Diabetes": "diabetes"
    }

    from typing import Any
    results: dict[str, Any] = {}
    narrator = NarrativeGenerator(os.path.join(models_path, 'explain_config.json'))
    total_risk = 0

    for display_name, file_prefix in diseases.items():
        try:
            p = os.path.join(models_path, file_prefix)
            
            # Use specific features or app-wide ones
            features_file = f'{p}_features.json'
            if not os.path.exists(features_file):
                features_file = os.path.join(models_path, 'app_features.json')
            
            features = json.load(open(features_file))
            weights = json.load(open(f'{p}_weights.json'))
            
            lr = joblib.load(f'{p}_lr.pkl')
            xgb = joblib.load(f'{p}_xgb.pkl')
            hgb = joblib.load(f'{p}_hgb.pkl')
            nn_m = TorchNNClassifier(input_dim=len(features))
            nn_m.load(f'{p}_nn.pt')
            scaler = joblib.load(f'{p}_scaler.pkl')
            
            ensemble = SoftVotingEnsemble(lr, xgb, nn_m, hgb, (weights['lr'], weights['xgb'], weights['nn'], weights['hgb']))
            
            df = pd.DataFrame([mapped])[features]
            X_sc = scaler.transform(df)
            prob, conf, indv = ensemble.predict_proba(X_sc)
            
            prob_val = float(prob[0]) if hasattr(prob, "__len__") else float(prob)
            conf_val = float(conf[0]) if hasattr(conf, "__len__") else float(conf)
            
            # SHAP
            shap_path = f'{p}_shap.pkl'
            shap_values = {}
            if os.path.exists(shap_path):
                shap_obj = joblib.load(shap_path)
                if isinstance(shap_obj, np.ndarray):
                    shap_values = dict(zip(features, [float(x) for x in shap_obj[0]]))
                elif isinstance(shap_obj, dict):
                    shap_values = {str(k): float(v) for k,v in shap_obj.items() if k in features}
                elif hasattr(shap_obj, "shap_values"):
                    # Handle TreeExplainer or similar
                    try:
                        sv = shap_obj.shap_values(X_sc)
                        if isinstance(sv, list) and len(sv) > 1:
                            # Class 1 values for binary classification
                            vals = sv[1][0]
                        else:
                            vals = sv[0] if hasattr(sv, "__len__") and len(sv.shape) > 1 else sv
                        shap_values = dict(zip(features, [float(x) for x in vals]))
                    except:
                        pass
                else:
                    # Generic fallback
                    try:
                        shap_values = dict(zip(features, [float(x) for x in shap_obj[0]]))
                    except:
                        pass

            obj = narrator.generate(display_name, prob_val, input_data, shap_values)
            obj.update({
                "confidence": float(int(conf_val * 1000 + 0.5) / 10.0),
                "model_agreement": float(int(conf_val * 1000 + 0.5) / 10.0),
                "individual_models": {str(k): float(int(float(v) * 1000 + 0.5) / 10.0) for k,v in indv.items()}
            })
            
            results[str(display_name)] = obj
            total_risk += prob_val
            
        except Exception as e:
            # print(f"DEBUG: Failed for {display_name}: {str(e)}", file=sys.stderr)
            continue

    # Unified Health Score
    if diseases:
        avg_risk = float(total_risk) / len(diseases)
        results["health_score"] = int(max(0, 100 - int(avg_risk * 100)))

    print(json.dumps(results))

if __name__ == "__main__":
    run_bridge()
