import io
import sys
import json
import os
import pathlib
import importlib
import importlib.util
from contextlib import redirect_stdout
from fastapi import FastAPI, HTTPException  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from pydantic import BaseModel  # type: ignore
from typing import Any

_HERE = pathlib.Path(__file__).parent

def _load_module(name: str, filepath: pathlib.Path) -> Any:
    """Load a Python module from a file path."""
    spec = importlib.util.spec_from_file_location(name, str(filepath))
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load module {name} from {filepath}")
    mod = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    return mod

_ml = _load_module("ml_bridge", _HERE / "ml_bridge.py")

# ──────────────────────────────────────────────
# PDF Generator
# ──────────────────────────────────────────────
def generate_pdf_bytes(data: dict) -> bytes:
    """Run generate_pdf.py's build_report() and return the PDF as bytes."""
    import tempfile
    mod = _load_module("generate_pdf", _HERE / "generate_pdf.py")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = tmp.name

    mod.build_report(data, tmp_path)

    with open(tmp_path, "rb") as f:
        pdf_bytes = f.read()
    os.unlink(tmp_path)
    return pdf_bytes



# ──────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────
app = FastAPI(
    title="Health Buddy AI",
    description="ML prediction and PDF generation microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your Vercel URL in production
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
    return {"status": "ok", "service": "Health Buddy AI"}


@app.post("/predict")
def predict(input: MLInput):
    """Run the ML ensemble and return risk probabilities + SHAP values."""
    try:
        # Redirect stdout since ml_bridge.py prints to stdout
        buf = io.StringIO()
        import sys
        old_stdin = sys.stdin
        sys.stdin = io.StringIO(json.dumps(input.model_dump()))
        
        output_buf = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = output_buf
        
        _ml.run_bridge()
        
        sys.stdout = old_stdout
        sys.stdin = old_stdin
        
        result = json.loads(output_buf.getvalue())
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        sys.stdout = old_stdout if 'old_stdout' in dir() else sys.stdout
        sys.stdin = old_stdin if 'old_stdin' in dir() else sys.stdin
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/pdf")
def generate_pdf(data: dict[str, Any]):
    """Generate a PDF report and return it as a binary stream."""
    try:
        pdf_bytes = generate_pdf_bytes(data)
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
