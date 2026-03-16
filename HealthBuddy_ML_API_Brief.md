# HealthBuddy 2.0 — ML Backend API Brief
## Complete Reference for Testing the AI Prediction Engine

---

## 1. What the ML Backend Does

The backend is a **4-model soft-voting ensemble** (Logistic Regression + XGBoost + Neural Network + HistGradientBoosting) trained on ~650K patient records.

For every patient submission it returns **3 disease risk assessments** simultaneously:
- ❤️ Heart Disease
- 💊 Hypertension
- 🩸 Diabetes

Each assessment includes a **risk percentage**, **risk level badge**, **SHAP-based explanations**, **clinical flags**, and **rich narrative text** (no Gemini needed — the ML generates all text itself).

---

## 2. API Endpoint

```
POST /predict
Content-Type: application/json
```

---

## 3. Request Body — All 18 Inputs

Send exactly these 18 fields. All string enums are **case-sensitive**.

```json
{
  "age":               58,
  "sex":               "Male",
  "bmi":               31.5,
  "waist":             104.0,
  "systolic_bp":       155,
  "diastolic_bp":      95,
  "heart_rate":        82,
  "history":           "Yes",
  "total_cholesterol": 240,
  "ldl":               158,
  "hdl":               38,
  "triglycerides":     210,
  "fasting_glucose":   110,
  "hba1c":             6.2,
  "smoking":           "Regular Smoker",
  "activity":          "Sedentary",
  "stress":            "High",
  "salt_intake":       "High"
}
```

### Field Reference

| Field | Type | Allowed Values / Range | Notes |
|---|---|---|---|
| `age` | integer | 18 – 90 | Years |
| `sex` | string | `"Male"` \| `"Female"` | Exact case |
| `bmi` | float | 13 – 60 | kg/m² |
| `waist` | float | 55 – 145 | cm |
| `systolic_bp` | integer | 80 – 250 | mmHg |
| `diastolic_bp` | integer | 40 – 150 | mmHg |
| `heart_rate` | integer | 40 – 200 | bpm |
| `history` | string | `"None"` \| `"Yes"` | Prior cardiovascular events |
| `total_cholesterol` | integer | 100 – 400 | mg/dL |
| `ldl` | integer | 50 – 300 | mg/dL |
| `hdl` | integer | 20 – 150 | mg/dL |
| `triglycerides` | integer | 50 – 600 | mg/dL |
| `fasting_glucose` | integer | 50 – 400 | mg/dL |
| `hba1c` | float | 4.0 – 14.0 | % |
| `smoking` | string | `"Non-Smoker"` \| `"Former Smoker"` \| `"Regular Smoker"` \| `"Heavy Smoker"` | |
| `activity` | string | `"Sedentary"` \| `"Light"` \| `"Moderate"` \| `"Active"` \| `"Very Active"` | |
| `stress` | string | `"Low"` \| `"Moderate"` \| `"High"` | |
| `salt_intake` | string | `"Low"` \| `"Medium"` \| `"High"` | |

### Backend Auto-Computes (Never Send These)
The backend derives 3 additional features internally — the UI never sends them:

| Derived Feature | Formula |
|---|---|
| `pulse_pressure` | `systolic_bp - diastolic_bp` |
| `chol_hdl_ratio` | `total_cholesterol / hdl` |
| `glucose_bmi_index` | `(fasting_glucose / 100) * (bmi / 25)` |

---

## 4. Response Structure

Returns a JSON object with **3 keys** — one per disease. Each disease object has **12 fields**.

```json
{
  "Heart Disease": { ...disease object... },
  "Hypertension":  { ...disease object... },
  "Diabetes":      { ...disease object... }
}
```

### Full Disease Object Schema

```json
{
  "disease":           "Heart Disease",
  "risk_percent":      72.4,
  "risk_level":        "HIGH",
  "confidence":        91.2,
  "model_agreement":   88.5,

  "individual_models": {
    "lr":  68.1,
    "xgb": 74.5,
    "nn":  71.8,
    "hgb": 73.2
  },

  "top_risk_drivers": [
    { "feature": "Cholesterol/HDL Ratio", "shap": 0.341 },
    { "feature": "Pulse Pressure",        "shap": 0.228 },
    { "feature": "Age",                   "shap": 0.189 }
  ],

  "protective_factors": [
    { "feature": "Physical Activity", "shap": 0.122 }
  ],

  "clinical_flags": [
    {
      "status":  "danger",
      "label":   "LDL Cholesterol",
      "value":   158,
      "unit":    "mg/dL",
      "message": "LDL critically elevated at 158 mg/dL"
    },
    {
      "status":  "warning",
      "label":   "BMI",
      "value":   31.5,
      "unit":    "kg/m²",
      "message": "BMI above normal at 31.5 kg/m²"
    }
  ],

  "summary_paragraph": "The patient, a 58-year-old male, presents with a health profile assessed for cardiovascular risk. They are classified as obese with a BMI of 31.5 kg/m² and significant abdominal obesity (Waist Circumference 104 cm, above the 102 cm threshold for males). Blood pressure measurement of 155/95 mmHg places the patient in the Stage 2 Hypertension category, which requires immediate medical attention. Fasting glucose at 110 mg/dL and HbA1c at 6.2% place the patient in the pre-diabetic range, indicating significant insulin resistance. Collectively, these parameters indicate a very high probability of cardiovascular disease, including heart attack and stroke. Immediate and comprehensive clinical intervention is strongly recommended.",

  "card_text": "The patient meets multiple high-risk criteria for cardiovascular disease. Blood pressure of 155/95 mmHg, Stage 2 Hypertension, combined with LDL at 158 mg/dL and triglycerides at 210 mg/dL creates a significantly atherogenic environment. Fasting glucose of 110 mg/dL and HbA1c 6.2% further amplify cardiovascular risk. BMI of 31.5 kg/m² with waist circumference 104 cm indicates visceral adiposity, a strong independent predictor of cardiac events.",

  "recommendations": [
    "Smoking cessation: Quitting regular smoking reduces cardiovascular risk by up to 50% within 1 year.",
    "Urgent BP management: Stage 2 Hypertension (155/95 mmHg) requires immediate medical review. Antihypertensive medication and strict sodium restriction (<1,500 mg/day) are indicated.",
    "Urgent cholesterol treatment: LDL 158 mg/dL is very high. Statin therapy discussion with a physician is strongly recommended.",
    "Prevent diabetes progression: Fasting glucose 110 mg/dL places you in pre-diabetes. A structured diet low in refined carbohydrates and 150 min/week of exercise can reverse this in 58% of cases (DPP trial).",
    "Weight management: BMI 31.5 kg/m² (obese). A 5–10% reduction in body weight reduces cardiovascular risk meaningfully.",
    "Schedule a comprehensive medical review with your GP within the next 4–8 weeks."
  ],

  "plain_english": "Same text as summary_paragraph — kept for backward compatibility."
}
```

### Field Meanings for UI Mapping

| Field | Type | How the UI Uses It |
|---|---|---|
| `risk_percent` | float 0–100 | Big % number on the risk card |
| `risk_level` | string | Badge colour: `LOW` = green, `MODERATE` = amber, `HIGH` = red |
| `confidence` | float 0–100 | Subtitle: "91% confidence" |
| `model_agreement` | float 0–100 | Optional trust indicator |
| `individual_models` | object | 4-model breakdown panel (lr/xgb/nn/hgb) |
| `top_risk_drivers` | array | "Why this score?" SHAP bar chart — features pushing risk UP |
| `protective_factors` | array | Same chart — features pushing risk DOWN (green bars) |
| `clinical_flags` | array | Inline warning badges next to each vital in the results panel |
| `summary_paragraph` | string | Large narrative paragraph (top-right in the UI) |
| `card_text` | string | Quoted text inside each disease risk card |
| `recommendations` | array | Numbered action list at the bottom |
| `plain_english` | string | Same as `summary_paragraph` — backward compat |

### Risk Level Thresholds
```
risk_percent < 35  → risk_level = "LOW"
risk_percent 35–65 → risk_level = "MODERATE"
risk_percent > 65  → risk_level = "HIGH"
```

### Clinical Flag Status Values
```
"danger"     → red badge   (value >= danger threshold)
"warning"    → amber badge (value >= warning threshold)
"normal"     → no badge
"protective" → green badge (HDL high, activity high)
```

---

## 5. Clinical Thresholds Used for Flags

| Metric | Warning | Danger | Unit |
|---|---|---|---|
| Systolic BP | ≥ 130 | ≥ 140 | mmHg |
| Diastolic BP | ≥ 80 | ≥ 90 | mmHg |
| Fasting Glucose | ≥ 100 | ≥ 126 | mg/dL |
| HbA1c | ≥ 5.7% | ≥ 6.5% | % |
| Total Cholesterol | ≥ 200 | ≥ 240 | mg/dL |
| LDL | ≥ 130 | ≥ 160 | mg/dL |
| HDL | < 60 (warning) | < 40 (danger) | mg/dL |
| Triglycerides | ≥ 150 | ≥ 200 | mg/dL |
| BMI | ≥ 25 | ≥ 30 | kg/m² |
| Heart Rate | ≥ 90 | ≥ 100 | bpm |

---

## 6. Test Cases

### Case 1 — Healthy (expect all LOW)
```json
{
  "age": 25, "sex": "Male", "bmi": 22.0, "waist": 78,
  "systolic_bp": 115, "diastolic_bp": 75, "heart_rate": 60, "history": "None",
  "total_cholesterol": 170, "ldl": 90, "hdl": 65, "triglycerides": 80,
  "fasting_glucose": 85, "hba1c": 5.0,
  "smoking": "Non-Smoker", "activity": "Very Active", "stress": "Low", "salt_intake": "Low"
}
```
Expected: `risk_level = "LOW"` for all 3 diseases, `risk_percent < 25` for all.

---

### Case 2 — High Risk (expect all HIGH)
```json
{
  "age": 62, "sex": "Male", "bmi": 35.0, "waist": 112,
  "systolic_bp": 158, "diastolic_bp": 98, "heart_rate": 88, "history": "Yes",
  "total_cholesterol": 275, "ldl": 185, "hdl": 32, "triglycerides": 280,
  "fasting_glucose": 185, "hba1c": 8.2,
  "smoking": "Heavy Smoker", "activity": "Sedentary", "stress": "High", "salt_intake": "High"
}
```
Expected: `risk_level = "HIGH"` for all 3, `risk_percent > 65` for all.  
`clinical_flags` should include danger flags for: Systolic BP, LDL, Triglycerides, Fasting Glucose, HbA1c, HDL, BMI.

---

### Case 3 — Borderline Pre-Diabetic (expect MODERATE)
```json
{
  "age": 48, "sex": "Female", "bmi": 29.5, "waist": 92,
  "systolic_bp": 128, "diastolic_bp": 82, "heart_rate": 74, "history": "None",
  "total_cholesterol": 218, "ldl": 138, "hdl": 48, "triglycerides": 165,
  "fasting_glucose": 108, "hba1c": 5.9,
  "smoking": "Former Smoker", "activity": "Light", "stress": "Moderate", "salt_intake": "Medium"
}
```
Expected: Diabetes `"MODERATE"`, Heart Disease `"MODERATE"`, Hypertension `"MODERATE"`.  
`summary_paragraph` should mention "pre-diabetic range", "Stage 1 Hypertension".

---

### Case 4 — Young Female, No Risk Factors
```json
{
  "age": 22, "sex": "Female", "bmi": 21.0, "waist": 68,
  "systolic_bp": 110, "diastolic_bp": 70, "heart_rate": 65, "history": "None",
  "total_cholesterol": 165, "ldl": 85, "hdl": 72, "triglycerides": 75,
  "fasting_glucose": 82, "hba1c": 4.8,
  "smoking": "Non-Smoker", "activity": "Active", "stress": "Low", "salt_intake": "Low"
}
```
Expected: All `"LOW"`. `protective_factors` should include Physical Activity and HDL Cholesterol.  
`recommendations` list should be short (1–2 items max).

---

### Case 5 — Hypertension-Specific Risk
```json
{
  "age": 52, "sex": "Male", "bmi": 28.0, "waist": 98,
  "systolic_bp": 145, "diastolic_bp": 92, "heart_rate": 78, "history": "None",
  "total_cholesterol": 210, "ldl": 135, "hdl": 45, "triglycerides": 155,
  "fasting_glucose": 95, "hba1c": 5.4,
  "smoking": "Former Smoker", "activity": "Light", "stress": "High", "salt_intake": "High"
}
```
Expected: Hypertension `"HIGH"`, Heart Disease `"MODERATE"`, Diabetes `"LOW"`.

---

## 7. What to Validate in Each Response

When testing, check these things for every case:

### Structural checks
- [ ] Response has exactly 3 keys: `"Heart Disease"`, `"Hypertension"`, `"Diabetes"`
- [ ] Each disease object has all 12 fields
- [ ] `risk_percent` is a float between 0 and 100
- [ ] `risk_level` is exactly one of `"LOW"`, `"MODERATE"`, `"HIGH"`
- [ ] `individual_models` has keys `lr`, `xgb`, `nn`, `hgb` — all floats 0–100
- [ ] `top_risk_drivers` and `protective_factors` are arrays (can be empty)
- [ ] `clinical_flags` array items each have `status`, `label`, `value`, `unit`, `message`
- [ ] `summary_paragraph`, `card_text`, `plain_english` are non-empty strings
- [ ] `recommendations` is an array of 1–6 strings

### Clinical accuracy checks
- [ ] `risk_level` matches `risk_percent` threshold (< 35 = LOW, 35–65 = MODERATE, > 65 = HIGH)
- [ ] For Case 1 (healthy): no "danger" flags in `clinical_flags`
- [ ] For Case 2 (high risk): `clinical_flags` contains at least 4 "danger" entries
- [ ] `summary_paragraph` mentions specific patient values (e.g. "155/95 mmHg", "Stage 2 Hypertension")
- [ ] `card_text` is disease-specific (Diabetes card mentions glucose, Heart card mentions cholesterol)
- [ ] `recommendations` are ordered by priority (smoking cessation first if smoker, BP first if hypertensive crisis)

### Text quality checks
- [ ] `summary_paragraph` is 3–6 sentences, reads like a doctor wrote it
- [ ] `card_text` is 2–4 sentences, cites specific lab values
- [ ] Each recommendation is actionable with a specific target (not vague like "eat healthy")

---

## 8. Error Cases to Test

### Missing field
```json
{ "age": 45, "sex": "Male" }
```
Expected: HTTP 422 or 400 with field validation error.

### Out of range value
```json
{ ...all fields..., "systolic_bp": 999 }
```
Expected: Either clipped to max (250) or validation error — not a crash.

### Wrong enum value
```json
{ ...all fields..., "smoking": "Chain Smoker" }
```
Expected: HTTP 422 — `"Chain Smoker"` is not a valid enum value.

---

## 9. Per-Disease Feature Differences (Important for Debugging)

The three models use **different feature sets** — this is intentional to prevent data leakage:

| Disease | Features Used | Why Different |
|---|---|---|
| Heart Disease | All 18 + `pulse_pressure` + `chol_hdl_ratio` + `glucose_bmi_index` = **21 features** | Needs BP + engineered cardiac risk features |
| Hypertension | 18 minus `systolic_bp` and `diastolic_bp`, plus `chol_hdl_ratio` + `glucose_bmi_index` = **18 features** | Raw BP excluded — would be direct leakage into label |
| Diabetes | All 18 standard features = **18 features** | No change needed |

**Why Hypertension excludes BP:** The training label `hyper_target` was defined as `(systolic_bp ≥ 130) OR (diastolic_bp ≥ 80)`. If the model sees `systolic_bp` and `diastolic_bp` as input features, it trivially learns this formula and gets AUC = 1.000 in 3 iterations — pure data leakage. The Hypertension model instead learns from metabolic/lifestyle risk factors: BMI, cholesterol, glucose, smoking, activity level, stress — the same factors a GP uses for hypertension risk screening before taking a blood pressure reading.

---

## 10. Full Example — Complete Request & Response

### Request
```http
POST /predict HTTP/1.1
Content-Type: application/json

{
  "age": 58, "sex": "Male", "bmi": 31.5, "waist": 104,
  "systolic_bp": 155, "diastolic_bp": 95, "heart_rate": 82, "history": "Yes",
  "total_cholesterol": 240, "ldl": 158, "hdl": 38, "triglycerides": 210,
  "fasting_glucose": 110, "hba1c": 6.2,
  "smoking": "Regular Smoker", "activity": "Sedentary", "stress": "High", "salt_intake": "High"
}
```

### Response (Heart Disease section only — Hypertension & Diabetes follow same structure)
```json
{
  "Heart Disease": {
    "disease": "Heart Disease",
    "risk_percent": 72.4,
    "risk_level": "HIGH",
    "confidence": 91.2,
    "model_agreement": 88.5,
    "individual_models": { "lr": 68.1, "xgb": 74.5, "nn": 71.8, "hgb": 73.2 },
    "top_risk_drivers": [
      { "feature": "Cholesterol/HDL Ratio", "shap": 0.341 },
      { "feature": "Pulse Pressure",        "shap": 0.228 },
      { "feature": "Age",                   "shap": 0.189 }
    ],
    "protective_factors": [],
    "clinical_flags": [
      { "status": "danger",  "label": "Systolic BP",      "value": 155, "unit": "mmHg",  "message": "Systolic BP critically elevated at 155 mmHg" },
      { "status": "danger",  "label": "LDL Cholesterol",  "value": 158, "unit": "mg/dL", "message": "LDL critically elevated at 158 mg/dL" },
      { "status": "danger",  "label": "Triglycerides",    "value": 210, "unit": "mg/dL", "message": "Triglycerides critically elevated at 210 mg/dL" },
      { "status": "danger",  "label": "HDL Cholesterol",  "value": 38,  "unit": "mg/dL", "message": "HDL critically low at 38 mg/dL" },
      { "status": "warning", "label": "BMI",              "value": 31.5,"unit": "kg/m²", "message": "BMI above normal at 31.5 kg/m²" },
      { "status": "danger",  "label": "Smoking",          "value": 2,   "unit": "",      "message": "Regular smoking significantly increases risk" },
      { "status": "danger",  "label": "Activity",         "value": 0,   "unit": "",      "message": "Sedentary lifestyle is a major independent risk factor" }
    ],
    "summary_paragraph": "The patient, a 58-year-old male, presents with a health profile assessed for cardiovascular risk. They are classified as obese with a BMI of 31.5 kg/m² and significant abdominal obesity (Waist Circumference 104 cm, above the 102 cm threshold for males). Blood pressure measurement of 155/95 mmHg places the patient in the Stage 2 Hypertension category, which requires immediate medical attention. The lipid panel reveals an unfavourable lipid profile (high LDL, critically low HDL, high triglycerides) (Total Cholesterol 240 mg/dL, LDL 158 mg/dL, HDL 38 mg/dL, Triglycerides 210 mg/dL). Fasting glucose at 110 mg/dL and HbA1c at 6.2% place the patient in the pre-diabetic range, indicating significant insulin resistance. Lifestyle factors including regular smoking, sedentary lifestyle, high chronic stress, high salt intake further compound the overall risk profile. Collectively, these parameters indicate a very high probability of cardiovascular disease, including heart attack and stroke. Immediate and comprehensive clinical intervention is strongly recommended.",
    "card_text": "The patient meets multiple high-risk criteria for cardiovascular disease. Blood pressure of 155/95 mmHg, Stage 2 Hypertension, combined with LDL at 158 mg/dL and triglycerides at 210 mg/dL creates a significantly atherogenic environment. Fasting glucose of 110 mg/dL and HbA1c 6.2% further amplify cardiovascular risk. BMI of 31.5 kg/m² with waist circumference 104 cm indicates visceral adiposity, a strong independent predictor of cardiac events. The combination of these factors places this patient at substantially elevated risk of myocardial infarction and stroke.",
    "recommendations": [
      "Smoking cessation: Quitting regular smoking reduces cardiovascular risk by up to 50% within 1 year.",
      "Urgent BP management: Stage 2 Hypertension (155/95 mmHg) requires immediate medical review. Antihypertensive medication and strict sodium restriction (<1,500 mg/day) are indicated.",
      "Urgent cholesterol treatment: LDL 158 mg/dL is very high. Statin therapy discussion with a physician is strongly recommended alongside a diet low in saturated fat.",
      "Raise HDL: At 38 mg/dL, HDL is critically low. Aerobic exercise (150+ min/week) and replacing saturated fats with monounsaturated fats (olive oil, nuts) can raise HDL by 5–10%.",
      "Weight management: BMI 31.5 kg/m² (obese). A 5–10% reduction in body weight reduces cardiovascular risk, improves insulin sensitivity, and lowers blood pressure meaningfully.",
      "Schedule a comprehensive medical review with your GP within the next 4–8 weeks to discuss these findings and create a personalised intervention plan."
    ],
    "plain_english": "The patient, a 58-year-old male, presents with a health profile assessed for cardiovascular risk..."
  },
  "Hypertension": { "...same structure..." },
  "Diabetes":     { "...same structure..." }
}
```

---

## 11. Prompt for Gemini in Google AI Studio

Paste this prompt directly into Gemini to set context before testing:

---

> I am testing a FastAPI ML backend called HealthBuddy that predicts disease risk for 3 conditions: Heart Disease, Hypertension, and Type 2 Diabetes.
>
> The endpoint is `POST /predict` and accepts 18 patient input fields (age, sex, bmi, waist, systolic_bp, diastolic_bp, heart_rate, history, total_cholesterol, ldl, hdl, triglycerides, fasting_glucose, hba1c, smoking, activity, stress, salt_intake).
>
> It returns a JSON object with 3 keys — "Heart Disease", "Hypertension", "Diabetes" — each containing: risk_percent (float), risk_level ("LOW"/"MODERATE"/"HIGH"), confidence, model_agreement, individual_models (lr/xgb/nn/hgb probabilities), top_risk_drivers (SHAP), protective_factors (SHAP), clinical_flags (status/label/value/unit/message), summary_paragraph (long narrative), card_text (short card justification), recommendations (array), plain_english (same as summary_paragraph).
>
> Help me test this API by: (1) sending the test cases I give you, (2) validating the response structure, (3) checking that clinical values in the narrative text match the input I sent, and (4) flagging anything that looks wrong clinically or structurally.

---

*Generated from HealthBuddy v8 ML Backend — March 2026*
