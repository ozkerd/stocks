#!/usr/bin/env python3
"""
TimesFM-3 Stock Forecasting CLI Tool.

Usage:
    python forecast.py --ticker NVDA --horizon 3m
    python forecast.py --ticker AAPL --horizon 1m --save aapl_forecast.png
"""

import argparse
import json
import sys
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
from data_fetcher import fetch_stock_and_covariates
from forecaster import TimesFM3Forecaster, HORIZON_MAP


def plot_and_save_forecast(result: dict, output_path: str):
    """Plot historical prices and forecasted trajectory with TimesFM uncertainty bands."""
    fig, ax = plt.subplots(figsize=(12, 6), dpi=150)

    # 1. Historical data
    hist = result["historical_chart_data"]
    hist_dates = [pd.to_datetime(x["date"]) for x in hist]
    hist_prices = [x["close"] for x in hist]
    ax.plot(hist_dates, hist_prices, label="Historical Close", color="#1a73e8", linewidth=2.0)

    # 2. Forecast trajectory & intervals
    fc = result["forecast_points"]
    fc_dates = [pd.to_datetime(x["date"]) for x in fc]
    # Connect last historical point to first forecast point
    combined_dates = [hist_dates[-1]] + fc_dates
    p10 = [hist_prices[-1]] + [x["p10"] for x in fc]
    p25 = [hist_prices[-1]] + [x["p25"] for x in fc]
    p50 = [hist_prices[-1]] + [x["p50"] for x in fc]
    p75 = [hist_prices[-1]] + [x["p75"] for x in fc]
    p90 = [hist_prices[-1]] + [x["p90"] for x in fc]

    # Shaded uncertainty cones
    ax.fill_between(
        combined_dates, p10, p90,
        color="#4285f4", alpha=0.15, label="TimesFM-3 90% Interval (P10 - P90)"
    )
    ax.fill_between(
        combined_dates, p25, p75,
        color="#4285f4", alpha=0.25, label="TimesFM-3 50% Interval (P25 - P75)"
    )
    # Median line
    ax.plot(
        combined_dates, p50,
        color="#0d47a1", linestyle="--", linewidth=2.5,
        label=f"TimesFM-3 Target Median (P50: ${result['target_price_p50']:.2f})"
    )

    # Styling
    symbol = result["symbol"]
    horizon_label = result["horizon_label"]
    ax.set_title(
        f"TimesFM-3 Forecast: {symbol} ({horizon_label})\n"
        f"Target: ${result['target_price_p50']:.2f} ({result['expected_return_pct']:+.2f}%) | "
        f"P10: ${result['p10_bear_case']:.2f} | P90: ${result['p90_bull_case']:.2f}",
        fontsize=13, fontweight="bold", pad=15
    )
    ax.set_ylabel("Price (USD)", fontsize=11)
    ax.grid(True, linestyle=":", alpha=0.6)
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d, %Y"))
    fig.autofmt_xdate()
    ax.legend(loc="upper left", frameon=True, facecolor="white", edgecolor="#dadce0")

    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"\n[✓] Forecast chart saved successfully to: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="TimesFM-3 Stock Forecasting CLI with Multivariate Covariates & Uncertainty Intervals"
    )
    parser.add_argument(
        "--ticker", "-t", type=str, required=True,
        help="Stock ticker symbol (e.g. AAPL, NVDA, MSFT, TSLA)"
    )
    parser.add_argument(
        "--horizon", "-H", type=str, default="1m",
        choices=["1d", "1m", "3m", "6m", "1y"],
        help="Forecast horizon: 1d (1 day), 1m (1 month), 3m (3 months), 6m (6 months), 1y (1 year)"
    )
    parser.add_argument(
        "--save", "-s", type=str, default=None,
        help="Path to save forecast chart plot (e.g. output.png)"
    )
    parser.add_argument(
        "--json", action="store_true",
        help="Output raw JSON results"
    )

    args = parser.parse_args()
    symbol = args.ticker.strip().upper()

    print(f"\n=======================================================")
    print(f"   Google TimesFM-3 Stock Intelligence Engine")
    print(f"=======================================================")
    print(f"[*] Ingesting data & stochastic indicators for {symbol}...")

    try:
        stock_data = fetch_stock_and_covariates(symbol)
    except Exception as e:
        print(f"[!] Error fetching data for {symbol}: {e}", file=sys.stderr)
        sys.exit(1)

    forecaster = TimesFM3Forecaster()
    print(f"[*] Running TimesFM-3 multivariate patch inference (Horizon: {args.horizon})...")
    result = forecaster.forecast(stock_data, horizon_key=args.horizon)

    if args.json:
        # Exclude historical raw series for brevity
        print(json.dumps({k: v for k, v in result.items() if k != "historical_chart_data"}, indent=2))
        return

    curr_p = result["current_price"]
    target_p = result["target_price_p50"]
    ret_pct = result["expected_return_pct"]
    p10 = result["p10_bear_case"]
    p90 = result["p90_bull_case"]
    snp = stock_data["indicators_snapshot"]

    print("\n" + "-" * 55)
    print(f"  TICKER: {symbol} | Current Price: ${curr_p:.2f}")
    print(f"  HORIZON: {result['horizon_label']}")
    print("-" * 55)
    print(f"  ▶ Target Median (P50)   : ${target_p:.2f} ({ret_pct:+.2f}%)")
    print(f"  ▶ Pessimistic Bound (P10): ${p10:.2f} ({((p10 - curr_p) / curr_p)*100:+.2f}%)")
    print(f"  ▶ Optimistic Bound (P90) : ${p90:.2f} ({((p90 - curr_p) / curr_p)*100:+.2f}%)")
    print(f"  ▶ Uncertainty Spread     : {result['confidence_band_spread_pct']:.1f}%")
    print(f"  ▶ Annualized Volatility  : {result['annualized_volatility_pct']:.1f}%")

    print("\n" + "=" * 55)
    print("  TIMESFM-3 COVARIATE WEIGHT MATRIX")
    print("=" * 55)
    print(f"  {'Covariate Name':<32} {'Weight':<10} {'Direction'}")
    print("  " + "-" * 51)
    for w in result["covariate_weights"][:10]:
        print(f"  {w['name']:<32} {w['weight_pct']:>5.1f}%     {w['direction']}")

    print("\n" + "=" * 55)
    print("  TECHNICAL & STOCHASTIC SNAPSHOT")
    print("=" * 55)
    print(f"  RSI (14)           : {snp['rsi_14']} ({snp['rsi_status']})")
    print(f"  MACD Histogram     : {snp['macd_hist']} ({snp['macd_status']})")
    print(f"  Stochastic %K / %D : {snp['stoch_k']} / {snp['stoch_d']}")
    print(f"  SMA 50 / 200       : ${snp['sma_50']:.2f} / ${snp['sma_200']:.2f} ({snp['trend_ma']})")
    print(f"  Fibonacci Levels   : Support ${snp['fibonacci']['support']:.2f} | Resistance ${snp['fibonacci']['resistance']:.2f}")

    print("\n" + "=" * 55)
    print("  MACROECONOMIC & GEOPOLITICAL RADAR")
    print("=" * 55)
    m = snp["macro"]
    print(f"  10-Year US Yield   : {m['us_10y_yield']}%")
    print(f"  Yield Curve Spread : {m['yield_curve_spread']}% ({m['yield_curve_signal']})")
    print(f"  CBOE VIX           : {m['vix']} ({m['vix_status']})")
    print(f"  Crude Oil WTI      : ${m['crude_oil']}")
    print(f"  COMEX Gold         : ${m['gold']}")
    print(f"  US Dollar Index    : {m['usd_index']}")
    print("=" * 55 + "\n")

    if args.save:
        plot_and_save_forecast(result, args.save)


if __name__ == "__main__":
    main()
