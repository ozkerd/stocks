"""
Unit & Integration Tests for TimesFM-3 Stock Forecasting Pipeline.
"""

import unittest
import numpy as np
import pandas as pd
from data_fetcher import (
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    calculate_stochastic,
    calculate_atr,
    calculate_fibonacci_levels
)
from forecaster import TimesFM3Forecaster, HORIZON_MAP


class TestIndicators(unittest.TestCase):

    def setUp(self):
        np.random.seed(42)
        n = 150
        prices = 100 + np.cumsum(np.random.randn(n) * 1.5)
        self.series = pd.Series(prices)
        self.high = self.series + np.abs(np.random.randn(n) * 0.8)
        self.low = self.series - np.abs(np.random.randn(n) * 0.8)
        self.close = self.series

    def test_rsi(self):
        rsi = calculate_rsi(self.close, 14)
        self.assertEqual(len(rsi), len(self.close))
        self.assertTrue((rsi >= 0).all() and (rsi <= 100).all())

    def test_macd(self):
        macd, signal, hist = calculate_macd(self.close, 12, 26, 9)
        self.assertEqual(len(macd), len(self.close))
        self.assertEqual(len(signal), len(self.close))
        self.assertEqual(len(hist), len(self.close))
        # Hist should equal macd - signal
        np.testing.assert_allclose(hist.values, (macd - signal).values, atol=1e-6)

    def test_bollinger_bands(self):
        upper, mid, lower, width, pct_b = calculate_bollinger_bands(self.close, 20, 2.0)
        valid_idx = 25
        self.assertGreater(upper.iloc[valid_idx], mid.iloc[valid_idx])
        self.assertGreater(mid.iloc[valid_idx], lower.iloc[valid_idx])

    def test_stochastic(self):
        k, d = calculate_stochastic(self.high, self.low, self.close, 14, 3)
        self.assertEqual(len(k), len(self.close))
        self.assertTrue((k >= -1e-5).all() and (k <= 100.0001).all())

    def test_fibonacci(self):
        curr_p = float(self.close.iloc[-1])
        fib = calculate_fibonacci_levels(self.high, self.low, curr_p)
        self.assertIn("swing_high", fib)
        self.assertIn("swing_low", fib)
        self.assertGreaterEqual(fib["swing_high"], fib["swing_low"])
        self.assertIn("nearest_support", fib)
        self.assertIn("nearest_resistance", fib)


class TestForecaster(unittest.TestCase):

    def setUp(self):
        self.forecaster = TimesFM3Forecaster()

    def test_quantile_monotonicity(self):
        """Verify that P10 <= P25 <= P50 <= P75 <= P90 across all steps."""
        dates = pd.date_range(end="2026-09-01", periods=200, freq="B")
        df = pd.DataFrame({
            "Close": 150 + np.cumsum(np.random.randn(200)),
            "High": 155 + np.cumsum(np.random.randn(200)),
            "Low": 145 + np.cumsum(np.random.randn(200)),
            "Volume": np.random.randint(1000000, 5000000, size=200),
            "sma_50": 150.0,
            "sma_200": 148.0,
            "rsi_14": 52.0,
            "vix": 16.0,
            "yield_curve_spread": 0.5,
        }, index=dates)

        stock_data = {
            "symbol": "TEST",
            "df": df,
            "indicators_snapshot": {"current_price": float(df["Close"].iloc[-1])}
        }

        for h in ["1d", "1m", "3m", "6m", "1y"]:
            res = self.forecaster.forecast(stock_data, horizon_key=h)
            self.assertEqual(res["horizon_days"], HORIZON_MAP[h]["days"])
            for pt in res["forecast_points"]:
                self.assertLessEqual(pt["p10"], pt["p25"])
                self.assertLessEqual(pt["p25"], pt["p50"])
                self.assertLessEqual(pt["p50"], pt["p75"])
                self.assertLessEqual(pt["p75"], pt["p90"])


if __name__ == "__main__":
    unittest.main()
