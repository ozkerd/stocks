"""
FastAPI Web Application for TimesFM-3 Stock Forecaster.
Serves the Google-style UI and REST API for stocks.primerllm.com.
"""

import os
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

from data_fetcher import fetch_stock_and_covariates
from forecaster import TimesFM3Forecaster, HORIZON_MAP

app = FastAPI(
    title="TimesFM-3 Stock Forecaster",
    description="Zero-Shot Multivariate Stock Forecasting with Calibrated Quantile Intervals",
    version="3.0.0"
)

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

# Mount static files & templates
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

forecaster = TimesFM3Forecaster()


@app.get("/", response_class=HTMLResponse)
async def home(request: Request, ticker: Optional[str] = "NVDA"):
    """Render Google-style minimal homepage."""
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "default_ticker": ticker.upper()}
    )


@app.get("/api/forecast")
async def api_forecast(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. AAPL, NVDA, MSFT)"),
    horizon: str = Query("1m", description="Forecast horizon: 1d, 1m, 3m, 6m, 1y")
):
    """
    Generate TimesFM-3 multivariate forecast with uncertainty bounds and covariate weights.
    """
    clean_ticker = ticker.strip().upper()
    if not clean_ticker:
        raise HTTPException(status_code=400, detail="Ticker symbol is required.")

    if horizon not in HORIZON_MAP:
        horizon = "1m"

    try:
        stock_data = fetch_stock_and_covariates(clean_ticker)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stock data: {str(e)}")

    try:
        result = forecaster.forecast(stock_data, horizon_key=horizon)
        # Combine indicator snapshot and info into payload
        result["info"] = stock_data["info"]
        result["indicators"] = stock_data["indicators_snapshot"]
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")


@app.get("/api/popular")
async def popular_markets():
    """Return top tracked market tickers."""
    return {
        "popular": [
            {"symbol": "NVDA", "name": "NVIDIA Corp"},
            {"symbol": "AAPL", "name": "Apple Inc."},
            {"symbol": "MSFT", "name": "Microsoft Corp"},
            {"symbol": "GOOGL", "name": "Alphabet Inc."},
            {"symbol": "AMZN", "name": "Amazon.com Inc."},
            {"symbol": "TSLA", "name": "Tesla Inc."},
            {"symbol": "META", "name": "Meta Platforms Inc."}
        ]
    }


@app.get("/health")
async def health_check():
    """Healthcheck endpoint for Cloudflare Tunnel / load balancer."""
    return {
        "status": "healthy",
        "domain": "stocks.primerllm.com",
        "model": "TimesFM-3",
        "service": "stock-forecaster"
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"[*] Starting TimesFM-3 Server on http://{host}:{port} (Configured for stocks.primerllm.com)")
    uvicorn.run("app:app", host=host, port=port, reload=True)
