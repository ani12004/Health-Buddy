import os
import json
import joblib  # type: ignore
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
import torch  # type: ignore
import torch.nn as nn  # type: ignore
from scipy.special import expit # type: ignore
from typing import Any, Dict, List

# ── Neural Network class (must match training architecture exactly) ─────────
class DiseaseNN(nn.Module):
    def __init__(self, input_dim: int):
        super().__init__()
        self.b1   = nn.Sequential(nn.Linear(input_dim,256), nn.BatchNorm1d(256), nn.LeakyReLU(0.1), nn.Dropout(0.35))
        self.b2   = nn.Sequential(nn.Linear(256,128),       nn.BatchNorm1d(128), nn.LeakyReLU(0.1), nn.Dropout(0.25))
        self.b3   = nn.Sequential(nn.Linear(128,64),        nn.BatchNorm1d(64),  nn.LeakyReLU(0.1), nn.Dropout(0.15))
        self.b4   = nn.Sequential(nn.Linear(64,32),         nn.BatchNorm1d(32),  nn.LeakyReLU(0.1))
        self.skip = nn.Linear(input_dim, 32, bias=False)
        self.out  = nn.Sequential(nn.Linear(32,1), nn.Sigmoid())
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.out(self.b4(self.b3(self.b2(self.b1(x)))) + self.skip(x)).squeeze(1)

class SoftVotingEnsemble:
    def __init__(self, lr: Any, xgb: Any, hgb: Any, nn_model: Any, weights: List[float]):
        self.lr=lr; self.xgb=xgb; self.hgb=hgb; self.nn=nn_model
        self.w = np.array(weights) / np.sum(weights)
    def predict_proba(self, X: Any) -> Any:
        p = (self.w[0]*self.lr.predict_proba(X)[:,1] +
             self.w[1]*self.xgb.predict_proba(X)[:,1] +
             self.w[2]*self.hgb.predict_proba(X)[:,1] +
             self.w[3]*self.nn_predict(X))
        return np.column_stack([1-p, p])
    def nn_predict(self, X: Any) -> Any:
        self.nn.eval()
        with torch.no_grad():
            t = torch.FloatTensor(np.array(X))
            return self.nn(t).cpu().numpy()
    def individual_probs(self, X: Any) -> Dict[str, float]:
        return {
            "lr":  float(self.lr.predict_proba(X)[:,1][0]),
            "xgb": float(self.xgb.predict_proba(X)[:,1][0]),
            "hgb": float(self.hgb.predict_proba(X)[:,1][0]),
            "nn":  float(self.nn_predict(X)[0])
        }

# ── Global state for models ───────────────────────────────────────────────────
MODEL_DIR = os.path.dirname(__file__)
DISEASES  = ["heart_disease", "hypertension", "diabetes"]
DISEASE_LABELS = {
    "heart_disease": "Heart Disease",
    "hypertension":  "Hypertension",
    "diabetes":      "Diabetes"
}

BUNDLES: Dict[str, SoftVotingEnsemble] = {}
SCALERS: Dict[str, Any] = {}
FEAT_LISTS: Dict[str, List[str]] = {}
SHAP_EXP: Dict[str, Any] = {}
CAL_CFG: Dict[str, Any] = {}

# ── Input encoding maps ───────────────────────
SEX_MAP      = {"Male":1, "Female":0}
SMOKING_MAP  = {"Non-Smoker":0, "Former Smoker":1, "Regular Smoker":2, "Heavy Smoker":3}
ACTIVITY_MAP = {"Sedentary":0, "Light":1, "Moderate":2, "Active":3, "Very Active":4}
STRESS_MAP   = {"Low":0, "Moderate":1, "High":2}
SALT_MAP     = {"Low":0, "Medium":1, "High":2}
HISTORY_MAP  = {"None":0, "Yes":1}

def load_v9_models() -> None:
    global CAL_CFG
    cal_path = os.path.join(MODEL_DIR, "calibration_config.json")
    if os.path.exists(cal_path):
        with open(cal_path) as f:
            CAL_CFG = json.load(f)

    for d in DISEASES:
        feat_path = os.path.join(MODEL_DIR, f"{d}_features.json")
        if not os.path.exists(feat_path): continue
        
        feats = json.load(open(feat_path))
        FEAT_LISTS[d] = feats
        SCALERS[d]    = joblib.load(os.path.join(MODEL_DIR, f"{d}_scaler.pkl"))
        lr  = joblib.load(os.path.join(MODEL_DIR, f"{d}_lr.pkl"))
        xgb = joblib.load(os.path.join(MODEL_DIR, f"{d}_xgb.pkl"))
        hgb = joblib.load(os.path.join(MODEL_DIR, f"{d}_hgb.pkl"))
        w   = json.load(open(os.path.join(MODEL_DIR, f"{d}_weights.json")))
        
        nn_model = DiseaseNN(len(feats))
        nn_model.load_state_dict(torch.load(os.path.join(MODEL_DIR, f"{d}_nn.pt"), map_location="cpu", weights_only=True))
        nn_model.eval()
        
        BUNDLES[d] = SoftVotingEnsemble(lr, xgb, hgb, nn_model,
                                         [float(w["lr"]), float(w["xgb"]), float(w["hgb"]), float(w["nn"])])
        try:
            SHAP_EXP[d] = joblib.load(os.path.join(MODEL_DIR, f"{d}_shap.pkl"))
        except: pass

def calibrate(disease: str, raw_prob: float) -> float:
    cfg: Dict[str, Any] = CAL_CFG.get(disease, {})
    method = cfg.get("calibration_method", "platt")
    if method == "platt":
        a = float(cfg.get("platt_a", 1.0))
        b = float(cfg.get("platt_b", 0.0))
        return float(expit(a * raw_prob + b))
    return raw_prob

def get_risk_level(disease: str, cal_prob: float) -> str:
    cfg: Dict[str, Any] = CAL_CFG.get(disease, {})
    t_low  = float(cfg.get("threshold_low_to_moderate",  0.35))
    t_high = float(cfg.get("threshold_moderate_to_high", 0.65))
    if cal_prob >= t_high: return "HIGH"
    if cal_prob >= t_low:  return "MODERATE"
    return "LOW"

def get_clinical_flags(p: Dict[str, Any]) -> List[Dict[str, Any]]:
    flags = []
    checks = [
        ('Systolic Blood Pressure', p['systolic_bp'], 130, 140, 'mmHg'),
        ('Diastolic Blood Pressure', p['diastolic_bp'], 80, 90, 'mmHg'),
        ('Fasting Glucose', p['fasting_glucose'], 100, 126, 'mg/dL'),
        ('HbA1c', p['hba1c'], 5.7, 6.5, '%'),
        ('Total Cholesterol', p['total_cholesterol'], 200, 240, 'mg/dL'),
        ('LDL Cholesterol', p['ldl'], 130, 160, 'mg/dL'),
        ('Triglycerides', p['triglycerides'], 150, 200, 'mg/dL'),
        ('BMI', p['bmi'], 25, 30, 'kg/m²'),
        ('Heart Rate', p['heart_rate'], 90, 100, 'bpm'),
    ]
    for label, val, warn, danger, unit in checks:
        if val >= danger:
            flags.append({'label': label, 'status': 'danger', 'value': val, 'unit': unit, 'message': f'{label} critically elevated at {val} {unit}'})
        elif val >= warn:
            flags.append({'label': label, 'status': 'warning', 'value': val, 'unit': unit, 'message': f'{label} above normal at {val} {unit}'})

    hdl = p['hdl']
    if hdl < 40: flags.append({'label': 'HDL Cholesterol', 'status': 'danger', 'value': hdl, 'unit': 'mg/dL', 'message': f'HDL critically low at {hdl} mg/dL'})
    elif hdl < 60: flags.append({'label': 'HDL Cholesterol', 'status': 'warning', 'value': hdl, 'unit': 'mg/dL', 'message': f'HDL below optimal at {hdl} mg/dL'})
    else: flags.append({'label': 'HDL Cholesterol', 'status': 'protective', 'value': hdl, 'unit': 'mg/dL', 'message': f'HDL is protective at {hdl} mg/dL'})

    return flags

def generate_risk_text(disease: str, risk_level: str, age: int, sex_val: int) -> Dict[str, Any]:
    sex_str = "male" if sex_val == 1 else "female"
    
    if risk_level == "HIGH":
        summary = f"The patient, a {age}-year-old {sex_str}, presents with a health profile assessed for {disease.lower()} risk. Current data indicates a high risk level. Immediate clinical review and aggressive lifestyle modifications are strongly recommended."
        card = f"Critical indicators detected for {disease.lower()}. High focus on immediate intervention needed."
    elif risk_level == "MODERATE":
        summary = f"The patient, a {age}-year-old {sex_str}, presents with a health profile assessed for {disease.lower()} risk. Current data indicates a moderate risk level. Clinical review and lifestyle modifications are recommended."
        card = f"Moderate risk for {disease.lower()} observed. Review and preventive measures suggested."
    else:
        summary = f"The patient, a {age}-year-old {sex_str}, presents with a health profile assessed for {disease.lower()} risk. Current data indicates a low risk level. Basic preventive measures are sufficient for now."
        card = f"Risk for {disease.lower()} is currently low. Continue healthy habits."

    return {
        "summary_paragraph": summary,
        "card_text": card,
        "recommendations": ["Schedule a follow-up with your GP to discuss these AI-detected risk factors."]
    }

def predict_v9(data: Dict[str, Any]) -> Dict[str, Any]:
    # Encode inputs
    patient = {
        "age":               int(data['age']),
        "sex":               SEX_MAP[data['sex']],
        "bmi":               float(data['bmi']),
        "waist":             float(data['waist']),
        "systolic_bp":       int(data['systolic_bp']),
        "diastolic_bp":      int(data['diastolic_bp']),
        "heart_rate":        int(data['heart_rate']),
        "history":           HISTORY_MAP[data['history']],
        "total_cholesterol": int(data['total_cholesterol']),
        "ldl":               int(data['ldl']),
        "hdl":               int(data['hdl']),
        "triglycerides":     int(data['triglycerides']),
        "fasting_glucose":   int(data['fasting_glucose']),
        "hba1c":             float(data['hba1c']),
        "smoking":           SMOKING_MAP[data['smoking']],
        "activity":          ACTIVITY_MAP[data['activity']],
        "stress":            STRESS_MAP[data['stress']],
        "salt_intake":       SALT_MAP[data['salt_intake']],
    }
    # Derived features
    patient["pulse_pressure"]    = int(patient["systolic_bp"]) - int(patient["diastolic_bp"])
    patient["chol_hdl_ratio"]    = float(patient["total_cholesterol"]) / max(1, int(patient["hdl"]))
    patient["glucose_bmi_index"] = (float(patient["fasting_glucose"]) / 100.0) * (float(patient["bmi"]) / 25.0)

    result: Dict[str, Any] = {}
    clinical_flags = get_clinical_flags(patient)
    
    total_risk = 0.0
    for d, label in DISEASE_LABELS.items():
        if d not in BUNDLES: continue
        feats = FEAT_LISTS[d]
        X = pd.DataFrame([patient])[feats].fillna(0).values
        X_sc = SCALERS[d].transform(X)

        raw_prob_arr = BUNDLES[d].predict_proba(X_sc)
        raw_prob     = float(raw_prob_arr[0][1])
        cal_prob     = calibrate(d, raw_prob)
        risk_pct     = float(f"{cal_prob * 100:.1f}")
        risk_level   = get_risk_level(d, cal_prob)
        total_risk  += cal_prob

        ind_probs    = {k: float(f"{v*100:.1f}") for k,v in BUNDLES[d].individual_probs(X_sc).items()}
        probs_arr    = list(ind_probs.values())
        confidence   = float(f"{(1 - np.std(probs_arr)/max(0.01, float(np.mean(probs_arr)))) * 100:.1f}")

        # Risk text generation (Summary, Card, Recs)
        text_data = generate_risk_text(label, risk_level, int(patient["age"]), data["sex"] == "Male")

        # SHAP drivers
        drivers: List[Dict[str, Any]] = []
        protective: List[Dict[str, Any]] = []
        if d in SHAP_EXP:
            try:
                import shap # type: ignore
                explainer = SHAP_EXP[d]
                if hasattr(explainer, 'shap_values'):
                    sv = explainer.shap_values(X_sc)
                    if isinstance(sv, list) and len(sv) > 1:
                        sv = sv[1]
                    row = sv[0] if hasattr(sv, 'ndim') and sv.ndim==2 else sv
                else:
                    row = explainer
                
                pairs = [(str(feats[i]), float(row[i])) for i in range(len(feats))]
                pairs.sort(key=lambda x: x[1], reverse=True)
                
                # Use a loop to avoid slice indexing issues with some linters
                count = 0
                for f, v in pairs:
                    if count >= 5: break
                    if v > 0.001:
                        drivers.append({"feature": f, "shap": float(f"{v:.4f}")})
                        count += 1
                
                count = 0
                for f, v in reversed(pairs):
                    if count >= 5: break
                    if v < -0.001:
                        protective.append({"feature": f, "shap": float(f"{abs(v):.4f}")})
                        count += 1
            except: pass

        result[label] = {
            "disease":           label,
            "risk_percent":      risk_pct,
            "risk_level":        risk_level,
            "confidence":        confidence,
            "model_agreement":   confidence,
            "individual_models": ind_probs,
            "top_risk_drivers":  drivers,
            "protective_factors":protective,
            "clinical_flags":    clinical_flags,
            "summary_paragraph": text_data["summary_paragraph"],
            "card_text":         text_data["card_text"],
            "recommendations":   text_data["recommendations"],
            "plain_english":     text_data["summary_paragraph"]
        }

    # Calculate overall health score (100 - avg_risk*100)
    avg_risk = total_risk / len(BUNDLES) if BUNDLES else 0
    result["health_score"] = int(100 - (avg_risk * 100))

    return result
