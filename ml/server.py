import io
import sys
import json
import os
import pathlib
from fastapi import FastAPI, HTTPException  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from pydantic import BaseModel  # type: ignore
from typing import Any

# Try relative import first, fallback to sys.path manipulation for static analysis tools
try:
    from ml_bridge import load_v9_models, predict_v9 # type: ignore
except ImportError:
    sys.path.append(os.path.dirname(__file__))
    from ml_bridge import load_v9_models, predict_v9 # type: ignore

# ──────────────────────────────────────────────
# Startup
# ──────────────────────────────────────────────
load_v9_models()

# ──────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────
app = FastAPI(
    title="Health Buddy AI v9",
    description="ML prediction and PDF generation microservice",
    version="9.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MLInput(BaseModel):
    age: int
    sex: str
    bmi: float
    waist: float
    systolic_bp: int
    diastolic_bp: int
    heart_rate: int
    history: str
    total_cholesterol: int
    ldl: int
    hdl: int
    triglycerides: int
    fasting_glucose: int
    hba1c: float
    smoking: str
    activity: str
    stress: str
    salt_intake: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Health Buddy AI v9"}

@app.post("/predict")
def predict(input: MLInput):
    """Run the v9 ML ensemble and return risk probabilities + SHAP values."""
    try:
        result = predict_v9(input.model_dump())
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# PDF generation relies on a legacy script, keeping it for backward compatibility
# though v9 frontend uses server actions for most text now.
def _load_module(name: str, filepath: pathlib.Path) -> Any:
    import importlib.util
    from importlib.machinery import ModuleSpec
    import typing
    spec = importlib.util.spec_from_file_location(name, str(filepath))
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load module {name} from {filepath}")
    valid_spec = typing.cast(ModuleSpec, spec)
    mod = importlib.util.module_from_spec(valid_spec)
    if mod is None:
         raise ImportError(f"Cannot load module {name} from {filepath}")
    valid_spec.loader.exec_module(mod)  # type: ignore
    return mod

@app.post("/pdf")
def generate_pdf(data: dict[str, Any]):
    """Generate a PDF report and return it as a binary stream."""
    try:
        import tempfile
        _HERE = pathlib.Path(__file__).parent
        mod = _load_module("generate_pdf", _HERE / "generate_pdf.py")

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp_path = tmp.name

        mod.build_report(data, tmp_path)

        with open(tmp_path, "rb") as f:
            pdf_bytes = f.read()
        os.unlink(tmp_path)
        
        report_id = data.get("report_id", "report")
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="HealthBuddy_Report_{report_id}.pdf"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn  # type: ignore
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
