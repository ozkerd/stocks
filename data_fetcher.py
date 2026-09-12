"""
Data Ingestion & Feature Engineering Engine for TimesFM-3 Forecasting.

Fetches historical stock prices, computes rich technical and stochastic indicators
(RSI, MACD, Fibonacci, Bollinger Bands, ATR, Moving Averages), and pulls macroeconomic,
geopolitical, and market risk covariates via free public APIs.
"""

import datetime
from typing import Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
import yfinance as yf


MACRO_TICKERS = {
    "us_10y_yield": "^TNX",      # 10-Year US Treasury Yield (Interest rate anchor)
    "us_3m_yield": "^IRX",       # 13-Week Treasury Bill (Short-term rate / Fed proxy)
    "vix": "^VIX",               # CBOE Volatility Index (Market fear & geopolitical risk)
    "crude_oil": "CL=F",         # WTI Crude Oil (Geopolitical energy shocks)
    "gold": "GC=F",              # COMEX Gold (Safe haven / monetary hedge)
    "sp500": "^GSPC",            # S&P 500 Index (Broad equity market sentiment)
    "usd_index": "DX-Y.NYB"      # US Dollar Index (Global liquidity & FX strength)
}


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Calculate Relative Strength Index (RSI)."""
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()

    # Wilder's smoothing
    for i in range(period, len(series)):
        if pd.notna(gain.iloc[i]) and pd.notna(avg_gain.iloc[i - 1]):
            avg_gain.iloc[i] = (avg_gain.iloc[i - 1] * (period - 1) + gain.iloc[i]) / period
            avg_loss.iloc[i] = (avg_loss.iloc[i - 1] * (period - 1) + loss.iloc[i]) / period

    rs = avg_gain / (avg_loss.replace(0, np.nan))
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50.0)


def calculate_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """Calculate MACD Line, Signal Line, and MACD Histogram."""
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def calculate_bollinger_bands(series: pd.Series, window: int = 20, num_std: float = 2.0) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series, pd.Series]:
    """Calculate Bollinger Bands: Upper, Middle, Lower, Bandwidth, and %B."""
    middle = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)
    bandwidth = (upper - lower) / middle.replace(0, np.nan)
    pct_b = (series - lower) / (upper - lower).replace(0, np.nan)
    return upper, middle, lower, bandwidth.fillna(0), pct_b.fillna(0.5)


def calculate_stochastic(high: pd.Series, low: pd.Series, close: pd.Series, k_period: int = 14, d_period: int = 3) -> Tuple[pd.Series, pd.Series]:
    """Calculate Stochastic Oscillator (%K and %D)."""
    lowest_low = low.rolling(window=k_period).min()
    highest_high = high.rolling(window=k_period).max()
    denom = highest_high - lowest_low
    denom = denom.replace(0, np.nan)
    k_percent = 100 * ((close - lowest_low) / denom)
    d_percent = k_percent.rolling(window=d_period).mean()
    return k_percent.fillna(50.0), d_percent.fillna(50.0)


def calculate_atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    """Calculate Average True Range (ATR)."""
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr.bfill()


def calculate_fibonacci_levels(high: pd.Series, low: pd.Series, current_price: float, window: int = 120) -> Dict[str, float]:
    """Calculate dynamic Fibonacci retracement levels from recent swing high and low."""
    swing_high = float(high.tail(window).max())
    swing_low = float(low.tail(window).min())
    diff = swing_high - swing_low

    levels = {
        "swing_high": swing_high,
        "swing_low": swing_low,
        "fib_0_0": swing_high,
        "fib_23_6": swing_high - 0.236 * diff,
        "fib_38_2": swing_high - 0.382 * diff,
        "fib_50_0": swing_high - 0.500 * diff,
        "fib_61_8": swing_high - 0.618 * diff,
        "fib_78_6": swing_high - 0.786 * diff,
        "fib_100_0": swing_low,
    }
    # Determine nearest support & resistance
    sorted_levels = sorted([v for k, v in levels.items() if k.startswith("fib_")])
    supports = [lvl for lvl in sorted_levels if lvl < current_price]
    resistances = [lvl for lvl in sorted_levels if lvl > current_price]
    levels["nearest_support"] = supports[-1] if supports else swing_low
    levels["nearest_resistance"] = resistances[0] if resistances else swing_high
    return levels


def fetch_macro_data(start_date: str) -> pd.DataFrame:
    """Fetch macroeconomic, country, and geopolitical proxies via Yahoo Finance."""
    macro_dfs = []
    for col_name, ticker in MACRO_TICKERS.items():
        try:
            t = yf.Ticker(ticker)
            hist = t.history(start=start_date, auto_adjust=True)
            if not hist.empty and "Close" in hist.columns:
                s = hist["Close"].rename(col_name)
                # Remove timezone if present
                if s.index.tz is not None:
                    s.index = s.index.tz_localize(None)
                s.index = pd.to_datetime(s.index).normalize()
                macro_dfs.append(s)
        except Exception:
            continue

    if not macro_dfs:
        return pd.DataFrame()

    macro_df = pd.concat(macro_dfs, axis=1, sort=True)
    macro_df = macro_df.sort_index().ffill().bfill()

    # Derived Macro Indicators
    if "us_10y_yield" in macro_df.columns and "us_3m_yield" in macro_df.columns:
        # Yield Curve Spread (10Y minus 3M) - fundamental recession & credit indicator
        macro_df["yield_curve_spread"] = macro_df["us_10y_yield"] - macro_df["us_3m_yield"]

    if "vix" in macro_df.columns:
        # VIX 10-day trend / momentum
        macro_df["vix_sma10"] = macro_df["vix"].rolling(10).mean().bfill()
        macro_df["vix_stress_index"] = (macro_df["vix"] / macro_df["vix_sma10"]).fillna(1.0)

    return macro_df


def fetch_stock_and_covariates(ticker: str, lookback_years: int = 3) -> Dict[str, Any]:
    """
    Fetch historical stock data, compute all stochastic & technical indicators,
    and combine with macroeconomic and geopolitical covariates into an aligned matrix.
    """
    symbol = ticker.strip().upper()
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=lookback_years * 365 + 100)

    t = yf.Ticker(symbol)
    df = t.history(start=start_date.strftime("%Y-%m-%d"), auto_adjust=True)

    if df.empty or len(df) < 50:
        raise ValueError(f"Insufficient or invalid historical data found for symbol '{symbol}'.")

    # Clean index timezone
    if df.index.tz is not None:
        df.index = df.index.tz_localize(None)
    df.index = pd.to_datetime(df.index).normalize()

    # Extract company info
    info = {}
    try:
        fast_info = t.fast_info
        info = {
            "shortName": getattr(fast_info, "short_name", symbol),
            "currency": getattr(fast_info, "currency", "USD"),
            "exchange": getattr(fast_info, "exchange", "US"),
            "lastPrice": float(df["Close"].iloc[-1]),
            "marketCap": getattr(fast_info, "market_cap", None),
            "fiftyTwoWeekHigh": getattr(fast_info, "year_high", float(df["High"].max())),
            "fiftyTwoWeekLow": getattr(fast_info, "year_low", float(df["Low"].min())),
        }
    except Exception:
        info = {
            "shortName": symbol,
            "currency": "USD",
            "exchange": "US",
            "lastPrice": float(df["Close"].iloc[-1]),
            "marketCap": None,
            "fiftyTwoWeekHigh": float(df["High"].max()),
            "fiftyTwoWeekLow": float(df["Low"].min()),
        }

    close = df["Close"]
    high = df["High"]
    low = df["Low"]
    volume = df["Volume"]

    # 1. Moving Averages
    df["sma_20"] = close.rolling(20).mean()
    df["sma_50"] = close.rolling(50).mean()
    df["sma_200"] = close.rolling(200).mean()
    df["ema_12"] = close.ewm(span=12, adjust=False).mean()
    df["ema_26"] = close.ewm(span=26, adjust=False).mean()
    df["ema_50"] = close.ewm(span=50, adjust=False).mean()

    # 2. RSI
    df["rsi_14"] = calculate_rsi(close, 14)

    # 3. MACD
    macd, signal, hist = calculate_macd(close, 12, 26, 9)
    df["macd_line"] = macd
    df["macd_signal"] = signal
    df["macd_hist"] = hist

    # 4. Bollinger Bands
    bb_upper, bb_mid, bb_lower, bb_width, bb_pctb = calculate_bollinger_bands(close, 20, 2.0)
    df["bb_upper"] = bb_upper
    df["bb_middle"] = bb_mid
    df["bb_lower"] = bb_lower
    df["bb_width"] = bb_width
    df["bb_pctb"] = bb_pctb

    # 5. Stochastic Oscillator
    stoch_k, stoch_d = calculate_stochastic(high, low, close, 14, 3)
    df["stoch_k"] = stoch_k
    df["stoch_d"] = stoch_d

    # 6. Average True Range (ATR) & Volatility
    df["atr_14"] = calculate_atr(high, low, close, 14)
    returns = close.pct_change()
    df["volatility_30d"] = returns.rolling(30).std() * np.sqrt(252)
    df["volatility_90d"] = returns.rolling(90).std() * np.sqrt(252)

    # 7. Volume Indicators
    df["volume_sma20"] = volume.rolling(20).mean().replace(0, np.nan)
    df["volume_ratio"] = (volume / df["volume_sma20"]).fillna(1.0)
    # On Balance Volume (OBV)
    obv = (np.sign(close.diff()) * volume).fillna(0).cumsum()
    df["obv"] = obv

    # 8. Fibonacci Levels (Computed on recent swing high/low)
    current_price = float(close.iloc[-1])
    fib_data = calculate_fibonacci_levels(high, low, current_price, window=120)
    for fib_name, fib_val in fib_data.items():
        if fib_name.startswith("fib_"):
            df[fib_name] = fib_val

    # 9. Macroeconomic & Geopolitical Indicators
    macro_df = fetch_macro_data(start_date=start_date.strftime("%Y-%m-%d"))
    if not macro_df.empty:
        # Align on dates
        df = df.join(macro_df, how="left")
        df = df.ffill().bfill()
    else:
        # Defaults if macro feed is temporarily unreachable
        df["us_10y_yield"] = 4.25
        df["us_3m_yield"] = 4.75
        df["yield_curve_spread"] = -0.50
        df["vix"] = 15.0
        df["crude_oil"] = 75.0
        df["gold"] = 2400.0
        df["sp500"] = 5500.0
        df["usd_index"] = 104.0

    # Clean any residual NaN values created by rolling windows
    df = df.bfill().ffill()

    # Create indicator summary snapshot for frontend display
    latest_row = df.iloc[-1]
    prev_close = float(df["Close"].iloc[-2]) if len(df) > 1 else current_price
    price_change = current_price - prev_close
    price_change_pct = (price_change / prev_close) * 100 if prev_close != 0 else 0.0

    indicators_snapshot = {
        "current_price": round(current_price, 2),
        "price_change": round(price_change, 2),
        "price_change_pct": round(price_change_pct, 2),
        "rsi_14": round(float(latest_row.get("rsi_14", 50.0)), 2),
        "rsi_status": "Overbought (>70)" if latest_row.get("rsi_14", 50) > 70 else ("Oversold (<30)" if latest_row.get("rsi_14", 50) < 30 else "Neutral (30-70)"),
        "macd_hist": round(float(latest_row.get("macd_hist", 0.0)), 3),
        "macd_status": "Bullish Momentum" if latest_row.get("macd_hist", 0) > 0 else "Bearish Momentum",
        "stoch_k": round(float(latest_row.get("stoch_k", 50.0)), 2),
        "stoch_d": round(float(latest_row.get("stoch_d", 50.0)), 2),
        "atr_14": round(float(latest_row.get("atr_14", 0.0)), 2),
        "volatility_30d_pct": round(float(latest_row.get("volatility_30d", 0.2)) * 100, 1),
        "sma_20": round(float(latest_row.get("sma_20", current_price)), 2),
        "sma_50": round(float(latest_row.get("sma_50", current_price)), 2),
        "sma_200": round(float(latest_row.get("sma_200", current_price)), 2),
        "trend_ma": "Strong Bullish" if current_price > latest_row.get("sma_50", 0) > latest_row.get("sma_200", 0) else ("Bearish" if current_price < latest_row.get("sma_50", 0) else "Neutral / Consolidating"),
        "bollinger_upper": round(float(latest_row.get("bb_upper", current_price)), 2),
        "bollinger_lower": round(float(latest_row.get("bb_lower", current_price)), 2),
        "fibonacci": {
            "swing_high": round(fib_data["swing_high"], 2),
            "swing_low": round(fib_data["swing_low"], 2),
            "support": round(fib_data["nearest_support"], 2),
            "resistance": round(fib_data["nearest_resistance"], 2),
            "fib_38_2": round(fib_data["fib_38_2"], 2),
            "fib_50_0": round(fib_data["fib_50_0"], 2),
            "fib_61_8": round(fib_data["fib_61_8"], 2),
        },
        "macro": {
            "us_10y_yield": round(float(latest_row.get("us_10y_yield", 0.0)), 2),
            "us_3m_yield": round(float(latest_row.get("us_3m_yield", 0.0)), 2),
            "yield_curve_spread": round(float(latest_row.get("yield_curve_spread", 0.0)), 2),
            "yield_curve_signal": "Inverted (Recessionary Risk)" if latest_row.get("yield_curve_spread", 0) < 0 else "Normal (Expansionary)",
            "vix": round(float(latest_row.get("vix", 0.0)), 2),
            "vix_status": "Elevated Fear" if latest_row.get("vix", 15) > 20 else ("Extreme Greed / Calm" if latest_row.get("vix", 15) < 13 else "Normal Volatility"),
            "crude_oil": round(float(latest_row.get("crude_oil", 0.0)), 2),
            "gold": round(float(latest_row.get("gold", 0.0)), 2),
            "usd_index": round(float(latest_row.get("usd_index", 0.0)), 2),
        }
    }

    return {
        "symbol": symbol,
        "info": info,
        "df": df,
        "indicators_snapshot": indicators_snapshot,
        "fib_data": fib_data,
    }


if __name__ == "__main__":
    data = fetch_stock_and_covariates("AAPL")
    print("AAPL fetched successfully. Columns:", len(data["df"].columns))
    print("Indicators snapshot:", data["indicators_snapshot"])
