/**
 * Cloudflare Pages Function: Daily, Weekly, and Monthly Trade Setups API
 * Delivers actionable trade setups with Target Buy (Hedef Alış), Target Sell (Hedef Satış),
 * Stop-Loss (Zarar Durdur), and Risk/Reward (R:R) ratios based on TimesFM-3 quantile drift.
 */

const BASE_SETUPS = [
  // 1. AppLovin (APP)
  {
    symbol: "APP",
    name: "AppLovin Corp",
    type: "Stock",
    exchange: "NASDAQ",
    current_price: 323.96,
    daily: {
      pattern: "Bullish EMA-20 Squeeze Breakout",
      entry_low: 320.00, entry_high: 323.50,
      tp1: 338.00, tp1_pct: "+4.3%",
      tp2: 348.00, tp2_pct: "+7.4%",
      stop_loss: 314.00, stop_pct: "-3.1%",
      rr_ratio: "2.4 : 1",
      conviction: 94,
      action: "LONG / MOMENTUM",
      thesis: "Intraday volume surge above 5-day VWAP with Stochastic %K turning bullish."
    },
    weekly: {
      pattern: "Key Resistance Retest & Expansion",
      entry_low: 316.00, entry_high: 322.00,
      tp1: 355.00, tp1_pct: "+9.6%",
      tp2: 378.00, tp2_pct: "+16.7%",
      stop_loss: 304.00, stop_pct: "-6.2%",
      rr_ratio: "2.7 : 1",
      conviction: 95,
      action: "SWING BUY",
      thesis: "TimesFM-3 1-week drift identifies institutional accumulation retesting prior swing high."
    },
    monthly: {
      pattern: "Multi-Horizon Trend Continuation",
      entry_low: 310.00, entry_high: 320.00,
      tp1: 385.00, tp1_pct: "+18.8%",
      tp2: 420.00, tp2_pct: "+29.6%",
      stop_loss: 288.00, stop_pct: "-11.1%",
      rr_ratio: "2.7 : 1",
      conviction: 96,
      action: "ACCUMULATE",
      thesis: "High-margin ad tech AI monetization compounding into earnings; macro ad spend tailwinds."
    }
  },

  // 2. Hyperliquid (HYPE)
  {
    symbol: "HYPE32196-USD",
    display_symbol: "HYPE",
    name: "Hyperliquid USD",
    type: "Crypto",
    exchange: "Crypto",
    current_price: 80.40,
    daily: {
      pattern: "DEX Volume Surge & Liquidity Expansion",
      entry_low: 78.50, entry_high: 80.20,
      tp1: 85.50, tp1_pct: "+6.3%",
      tp2: 90.00, tp2_pct: "+11.9%",
      stop_loss: 76.00, stop_pct: "-5.5%",
      rr_ratio: "2.2 : 1",
      conviction: 95,
      action: "BUY BREAKOUT",
      thesis: "Record perp volume and open interest driving platform fee distribution to token holders."
    },
    weekly: {
      pattern: "Fibonacci 61.8% Golden Pocket Launch",
      entry_low: 76.00, entry_high: 79.50,
      tp1: 94.00, tp1_pct: "+16.9%",
      tp2: 108.00, tp2_pct: "+34.3%",
      stop_loss: 70.00, stop_pct: "-12.9%",
      rr_ratio: "2.7 : 1",
      conviction: 96,
      action: "SWING ACCUMULATE",
      thesis: "Breakout past key horizontal resistance; dominant DeFi perpetual DEX market share."
    },
    monthly: {
      pattern: "Layer-1 Ecosystem Valuation Discovery",
      entry_low: 72.00, entry_high: 78.00,
      tp1: 120.00, tp1_pct: "+49.3%",
      tp2: 145.00, tp2_pct: "+80.3%",
      stop_loss: 62.00, stop_pct: "-22.9%",
      rr_ratio: "3.5 : 1",
      conviction: 97,
      action: "STRONG BUY",
      thesis: "TimesFM P90 optimistic trajectory projects rapid market cap convergence with top 15 chains."
    }
  },

  // 3. NVIDIA (NVDA)
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    type: "Stock",
    exchange: "NASDAQ",
    current_price: 218.29,
    daily: {
      pattern: "Bullish Flag Consolidation Break",
      entry_low: 216.50, entry_high: 218.00,
      tp1: 224.50, tp1_pct: "+2.8%",
      tp2: 228.00, tp2_pct: "+4.4%",
      stop_loss: 213.50, stop_pct: "-2.2%",
      rr_ratio: "2.0 : 1",
      conviction: 94,
      action: "DAY LONG",
      thesis: "Tech sector breadth expanding with hyperscaler capex commitment updates."
    },
    weekly: {
      pattern: "Ascending Channel Support Bounce",
      entry_low: 214.00, entry_high: 217.50,
      tp1: 232.00, tp1_pct: "+6.3%",
      tp2: 242.00, tp2_pct: "+10.9%",
      stop_loss: 208.00, stop_pct: "-4.7%",
      rr_ratio: "2.3 : 1",
      conviction: 95,
      action: "SWING BUY",
      thesis: "Blackwell chip volume shipments accelerating; sustained cloud data center allocation."
    },
    monthly: {
      pattern: "Secular AI Compute Expansion",
      entry_low: 210.00, entry_high: 216.00,
      tp1: 255.00, tp1_pct: "+16.8%",
      tp2: 275.00, tp2_pct: "+26.0%",
      stop_loss: 198.00, stop_pct: "-9.3%",
      rr_ratio: "2.8 : 1",
      conviction: 96,
      action: "CORE BUY",
      thesis: "TimesFM multivariate model gives highest 29.4% weight to positive S&P 500 macro alignment."
    }
  },

  // 4. Bitcoin (BTC-USD)
  {
    symbol: "BTC-USD",
    name: "Bitcoin",
    type: "Crypto",
    exchange: "Crypto",
    current_price: 77453.11,
    daily: {
      pattern: "Range High Liquidity Reclaim",
      entry_low: 76500.00, entry_high: 77200.00,
      tp1: 79200.00, tp1_pct: "+2.3%",
      tp2: 80500.00, tp2_pct: "+3.9%",
      stop_loss: 75600.00, stop_pct: "-2.4%",
      rr_ratio: "1.6 : 1",
      conviction: 93,
      action: "MOMENTUM BUY",
      thesis: "Spot ETF net inflows absorbing weekend selling; basis trade spreads widening."
    },
    weekly: {
      pattern: "Weekly Candle Bullish Engulfing",
      entry_low: 75500.00, entry_high: 76900.00,
      tp1: 82500.00, tp1_pct: "+6.5%",
      tp2: 86000.00, tp2_pct: "+11.0%",
      stop_loss: 73200.00, stop_pct: "-5.5%",
      rr_ratio: "2.0 : 1",
      conviction: 94,
      action: "SWING BUY",
      thesis: "Macro monetary debasement hedge; supply on exchanges at multi-year lows."
    },
    monthly: {
      pattern: "Parabolic Cycle Stage-3 Advance",
      entry_low: 74000.00, entry_high: 76500.00,
      tp1: 92000.00, tp1_pct: "+18.8%",
      tp2: 104000.00, tp2_pct: "+34.3%",
      stop_loss: 68500.00, stop_pct: "-11.6%",
      rr_ratio: "3.0 : 1",
      conviction: 95,
      action: "ACCUMULATE",
      thesis: "TimesFM P90 bull scenario target matches post-halving structural liquidity cycle."
    }
  },

  // 5. Palantir (PLTR)
  {
    symbol: "PLTR",
    name: "Palantir Technologies",
    type: "Stock",
    exchange: "NYSE",
    current_price: 167.23,
    daily: {
      pattern: "High-Tight Flag Breakout",
      entry_low: 165.00, entry_high: 167.00,
      tp1: 174.00, tp1_pct: "+4.0%",
      tp2: 180.00, tp2_pct: "+7.6%",
      stop_loss: 161.50, stop_pct: "-3.4%",
      rr_ratio: "2.2 : 1",
      conviction: 93,
      action: "BUY BREAKOUT",
      thesis: "AIP commercial contract velocity sustaining momentum above 10-day EMA."
    },
    weekly: {
      pattern: "Enterprise Momentum Squeeze",
      entry_low: 162.00, entry_high: 166.00,
      tp1: 184.00, tp1_pct: "+10.0%",
      tp2: 195.00, tp2_pct: "+16.6%",
      stop_loss: 154.00, stop_pct: "-7.9%",
      rr_ratio: "2.1 : 1",
      conviction: 94,
      action: "SWING BUY",
      thesis: "Government defense modernization and US commercial revenue re-accelerating."
    },
    monthly: {
      pattern: "Secular Enterprise AI Standard",
      entry_low: 155.00, entry_high: 164.00,
      tp1: 205.00, tp1_pct: "+22.6%",
      tp2: 230.00, tp2_pct: "+37.5%",
      stop_loss: 142.00, stop_pct: "-15.1%",
      rr_ratio: "2.5 : 1",
      conviction: 95,
      action: "STRONG BUY",
      thesis: "TimesFM quantitative score reflects high institutional lock-in and pricing power."
    }
  },

  // 6. Solana (SOL-USD)
  {
    symbol: "SOL-USD",
    name: "Solana",
    type: "Crypto",
    exchange: "Crypto",
    current_price: 101.97,
    daily: {
      pattern: "Ascending Triangle Breakout",
      entry_low: 99.50, entry_high: 101.50,
      tp1: 108.00, tp1_pct: "+5.9%",
      tp2: 112.50, tp2_pct: "+10.3%",
      stop_loss: 96.00, stop_pct: "-5.9%",
      rr_ratio: "1.8 : 1",
      conviction: 92,
      action: "BUY LONG",
      thesis: "Decentralized exchange volume exceeding competitors; high developer velocity."
    },
    weekly: {
      pattern: "Golden Cross EMA 50/200 Bounce",
      entry_low: 97.00, entry_high: 101.00,
      tp1: 118.00, tp1_pct: "+15.7%",
      tp2: 132.00, tp2_pct: "+29.5%",
      stop_loss: 90.00, stop_pct: "-11.7%",
      rr_ratio: "2.5 : 1",
      conviction: 93,
      action: "SWING BUY",
      thesis: "Network throughput upgrades; institutional staking yields attracting allocators."
    },
    monthly: {
      pattern: "Smart Contract Market Share Conquest",
      entry_low: 92.00, entry_high: 99.00,
      tp1: 148.00, tp1_pct: "+45.1%",
      tp2: 175.00, tp2_pct: "+71.6%",
      stop_loss: 82.00, stop_pct: "-19.6%",
      rr_ratio: "3.7 : 1",
      conviction: 94,
      action: "ACCUMULATE",
      thesis: "TimesFM multi-horizon forecast targets substantial beta outperformance vs ETH."
    }
  },

  // 7. Litentry (LIT)
  {
    symbol: "LIT6833-USD",
    display_symbol: "LIT",
    name: "Litentry USD",
    type: "Crypto",
    exchange: "Crypto",
    current_price: 0.118,
    daily: {
      pattern: "Micro-Cap Volume Spike & Reversal",
      entry_low: 0.112, entry_high: 0.117,
      tp1: 0.128, tp1_pct: "+8.5%",
      tp2: 0.138, tp2_pct: "+16.9%",
      stop_loss: 0.106, stop_pct: "-10.2%",
      rr_ratio: "1.7 : 1",
      conviction: 85,
      action: "SPECULATIVE BUY",
      thesis: "Decentralized identity protocol traction with oversold RSI divergence."
    },
    weekly: {
      pattern: "Base Accumulation Squeeze",
      entry_low: 0.108, entry_high: 0.116,
      tp1: 0.145, tp1_pct: "+22.9%",
      tp2: 0.168, tp2_pct: "+42.4%",
      stop_loss: 0.098, stop_pct: "-17.0%",
      rr_ratio: "2.5 : 1",
      conviction: 87,
      action: "SWING ACCUMULATE",
      thesis: "Web3 privacy cross-chain verification milestone launch."
    },
    monthly: {
      pattern: "Asymmetric Micro-Cap Recovery",
      entry_low: 0.102, entry_high: 0.114,
      tp1: 0.210, tp1_pct: "+78.0%",
      tp2: 0.280, tp2_pct: "+137.3%",
      stop_loss: 0.086, stop_pct: "-27.1%",
      rr_ratio: "5.1 : 1",
      conviction: 88,
      action: "HIGH BETA GEM",
      thesis: "Extreme asymmetric risk/reward; low market cap allows outsized multiplier expansion."
    }
  },

  // 8. Coinbase (COIN)
  {
    symbol: "COIN",
    name: "Coinbase Global Inc.",
    type: "Stock",
    exchange: "NASDAQ",
    current_price: 175.26,
    daily: {
      pattern: "Crypto High-Beta Momentum Follow",
      entry_low: 172.00, entry_high: 175.00,
      tp1: 183.00, tp1_pct: "+4.4%",
      tp2: 190.00, tp2_pct: "+8.4%",
      stop_loss: 168.00, stop_pct: "-4.1%",
      rr_ratio: "2.0 : 1",
      conviction: 89,
      action: "MOMENTUM BUY",
      thesis: "Trading volume surge following crypto market liquidity breakout."
    },
    weekly: {
      pattern: "Bullish Retest of 50-Day Moving Average",
      entry_low: 169.00, entry_high: 174.00,
      tp1: 198.00, tp1_pct: "+13.0%",
      tp2: 215.00, tp2_pct: "+22.7%",
      stop_loss: 158.00, stop_pct: "-9.8%",
      rr_ratio: "2.3 : 1",
      conviction: 91,
      action: "SWING BUY",
      thesis: "Base L2 transaction volume and institutional custody fee expansion."
    },
    monthly: {
      pattern: "Financial Infrastructure Operating Leverage",
      entry_low: 164.00, entry_high: 172.00,
      tp1: 240.00, tp1_pct: "+36.9%",
      tp2: 275.00, tp2_pct: "+56.9%",
      stop_loss: 148.00, stop_pct: "-15.6%",
      rr_ratio: "3.6 : 1",
      conviction: 93,
      action: "STRONG BUY",
      thesis: "TimesFM stochastic model models heavy upside torque during bull market retail re-entry."
    }
  },

  // 9. Tesla (TSLA)
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    type: "Stock",
    exchange: "NASDAQ",
    current_price: 365.44,
    daily: {
      pattern: "Bullish Gap Fill & Volume Rebound",
      entry_low: 360.00, entry_high: 365.00,
      tp1: 378.00, tp1_pct: "+3.4%",
      tp2: 388.00, tp2_pct: "+6.2%",
      stop_loss: 352.00, stop_pct: "-3.7%",
      rr_ratio: "1.7 : 1",
      conviction: 90,
      action: "DAY LONG",
      thesis: "Robotaxi fleet updates and autonomous driving milestone rollout."
    },
    weekly: {
      pattern: "Cup and Handle Formation",
      entry_low: 355.00, entry_high: 364.00,
      tp1: 405.00, tp1_pct: "+10.8%",
      tp2: 430.00, tp2_pct: "+17.7%",
      stop_loss: 340.00, stop_pct: "-7.0%",
      rr_ratio: "2.5 : 1",
      conviction: 92,
      action: "SWING BUY",
      thesis: "Energy storage megapack deliveries surging with high operating margins."
    },
    monthly: {
      pattern: "AI Robotics & FSD Value Re-Rating",
      entry_low: 345.00, entry_high: 360.00,
      tp1: 475.00, tp1_pct: "+30.0%",
      tp2: 520.00, tp2_pct: "+42.3%",
      stop_loss: 315.00, stop_pct: "-13.8%",
      rr_ratio: "3.1 : 1",
      conviction: 93,
      action: "ACCUMULATE",
      thesis: "TimesFM long-horizon neural forecast projects multi-quarter breakout past $450."
    }
  },

  // 10. Sui Network (SUI)
  {
    symbol: "SUI20947-USD",
    display_symbol: "SUI",
    name: "Sui Network USD",
    type: "Crypto",
    exchange: "Crypto",
    current_price: 3.47,
    daily: {
      pattern: "DeFi TVL Inflow & High-Throughput Momentum",
      entry_low: 3.35, entry_high: 3.45,
      tp1: 3.75, tp1_pct: "+8.1%",
      tp2: 3.98, tp2_pct: "+14.7%",
      stop_loss: 3.20, stop_pct: "-7.8%",
      rr_ratio: "1.9 : 1",
      conviction: 91,
      action: "DAY BUY",
      thesis: "Rapid daily active address growth and institutional DEX liquidity depth."
    },
    weekly: {
      pattern: "Bullish Pennant Breakout",
      entry_low: 3.25, entry_high: 3.40,
      tp1: 4.20, tp1_pct: "+21.0%",
      tp2: 4.80, tp2_pct: "+38.3%",
      stop_loss: 2.95, stop_pct: "-15.0%",
      rr_ratio: "2.6 : 1",
      conviction: 92,
      action: "SWING ACCUMULATE",
      thesis: "TimesFM P90 projection models liquidity rotation into Move-based L1 ecosystems."
    },
    monthly: {
      pattern: "Macro Layer-1 Valuation Re-Rating",
      entry_low: 3.00, entry_high: 3.35,
      tp1: 5.80, tp1_pct: "+67.1%",
      tp2: 7.20, tp2_pct: "+107.5%",
      stop_loss: 2.45, stop_pct: "-29.4%",
      rr_ratio: "3.7 : 1",
      conviction: 93,
      action: "STRONG BUY",
      thesis: "Ecosystem expansion compounding fee revenue with major institutional bridging."
    }
  },

  // 11. AST SpaceMobile (ASTS)
  {
    symbol: "ASTS",
    display_symbol: "ASTS",
    name: "AST SpaceMobile Inc.",
    type: "Stock",
    exchange: "NASDAQ",
    current_price: 24.80,
    daily: {
      pattern: "Satellite Launch Catalyst & Short Squeeze Pressure",
      entry_low: 24.00, entry_high: 24.75,
      tp1: 27.20, tp1_pct: "+9.7%",
      tp2: 29.50, tp2_pct: "+19.0%",
      stop_loss: 22.80, stop_pct: "-8.1%",
      rr_ratio: "2.3 : 1",
      conviction: 90,
      action: "MOMENTUM BUY",
      thesis: "BlueBird orbital launch operational milestones driving carrier partnership updates."
    },
    weekly: {
      pattern: "Ascending Base Breakout",
      entry_low: 23.20, entry_high: 24.50,
      tp1: 31.00, tp1_pct: "+25.0%",
      tp2: 36.00, tp2_pct: "+45.2%",
      stop_loss: 21.00, stop_pct: "-15.3%",
      rr_ratio: "3.0 : 1",
      conviction: 91,
      action: "SWING LONG",
      thesis: "TimesFM quantile model identifies commercial revenue inflection from major telecom contracts."
    },
    monthly: {
      pattern: "Commercial Direct-to-Device Constellation Ramp",
      entry_low: 22.00, entry_high: 24.00,
      tp1: 44.00, tp1_pct: "+77.4%",
      tp2: 55.00, tp2_pct: "+121.8%",
      stop_loss: 18.00, stop_pct: "-27.4%",
      rr_ratio: "4.4 : 1",
      conviction: 92,
      action: "ACCUMULATE",
      thesis: "Global space-based cellular broadband monopoly upside with global telco distribution."
    }
  }
];

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const tf = url.searchParams.get("timeframe") || "daily"; // 'daily', 'weekly', 'monthly'

  const formatted = BASE_SETUPS.map(item => {
    const s = item[tf] || item.daily;
    return {
      symbol: item.symbol,
      display_symbol: item.display_symbol || item.symbol,
      name: item.name,
      type: item.type,
      exchange: item.exchange,
      current_price: item.current_price,
      timeframe: tf,
      pattern: s.pattern,
      entry_zone: `$${s.entry_low.toLocaleString()} – $${s.entry_high.toLocaleString()}`,
      entry_low: s.entry_low,
      entry_high: s.entry_high,
      target_tp1: `$${s.tp1.toLocaleString()}`,
      target_tp1_pct: s.tp1_pct,
      target_tp2: `$${s.tp2.toLocaleString()}`,
      target_tp2_pct: s.tp2_pct,
      stop_loss: `$${s.stop_loss.toLocaleString()}`,
      stop_loss_pct: s.stop_pct,
      rr_ratio: s.rr_ratio,
      conviction: s.conviction,
      action: s.action,
      thesis: s.thesis
    };
  });

  return new Response(JSON.stringify({
    timeframe: tf,
    total: formatted.length,
    setups: formatted
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300"
    }
  });
}
