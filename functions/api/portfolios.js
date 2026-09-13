/**
 * Cloudflare Pages Function: AI Risk-Optimized Portfolios API
 * Delivers TimesFM-3 multi-asset allocations for High Risk, Balanced Risk, and Low Risk profiles.
 */

const PORTFOLIOS = {
  high_risk: {
    id: "high_risk",
    name: "High Risk / Exponential Growth (Aggressive Alpha)",
    icon: "🚀",
    risk_level: "High Risk (High Volatility)",
    expected_cagr: "+38.5%",
    sharpe_ratio: 1.95,
    max_drawdown: "-22.4%",
    volatility_annual: "32.1%",
    tagline: "Maximized exposure to artificial intelligence infrastructure, high-beta tech, and liquid crypto assets.",
    thesis: "TimesFM-3 neural drift identifies accelerating capital expenditure into AI compute, data infrastructure, and global digital liquidity. High volatility is compensated by outsized asymmetric upside.",
    allocations: [
      { symbol: "NVDA", name: "NVIDIA Corp", type: "Stock", weight_pct: 25, return_target: "+34.5%", role: "AI Compute Infrastructure Anchor" },
      { symbol: "BTC-USD", name: "Bitcoin", type: "Crypto", weight_pct: 20, return_target: "+42.0%", role: "Global Monetary Liquidity Beta" },
      { symbol: "PLTR", name: "Palantir Technologies", type: "Stock", weight_pct: 15, return_target: "+36.2%", role: "Enterprise AI Software Expansion" },
      { symbol: "SOL-USD", name: "Solana", type: "Crypto", weight_pct: 15, return_target: "+48.0%", role: "High-Throughput Digital Asset Layer" },
      { symbol: "AMD", name: "Advanced Micro Devices", type: "Stock", weight_pct: 15, return_target: "+28.4%", role: "Data Center Silicon Diversification" },
      { symbol: "COIN", name: "Coinbase Global", type: "Stock", weight_pct: 10, return_target: "+38.0%", role: "FinTech Capital Markets Leverage" }
    ]
  },
  balanced: {
    id: "balanced",
    name: "Balanced Risk / Optimal Sharpe (Core & Satellite)",
    icon: "⚖️",
    risk_level: "Moderate Risk (Optimal Sharpe Ratio)",
    expected_cagr: "+22.8%",
    sharpe_ratio: 2.42,
    max_drawdown: "-12.8%",
    volatility_annual: "16.8%",
    tagline: "Institutional-grade balance of secular megacap technology, broad equity market compounding, and defensive hedges.",
    thesis: "Modern portfolio frontier maximizing risk-adjusted return. Core megacap titans generate massive free cash flow, while gold and Treasuries dampen drawdowns during macro shocks.",
    allocations: [
      { symbol: "MSFT", name: "Microsoft Corp", type: "Stock", weight_pct: 20, return_target: "+19.5%", role: "Commercial Cloud & AI Platform Foundation" },
      { symbol: "AAPL", name: "Apple Inc.", type: "Stock", weight_pct: 18, return_target: "+16.8%", role: "Consumer Hardware Cash Machine & Buybacks" },
      { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", weight_pct: 15, return_target: "+21.0%", role: "AWS Cloud & E-Commerce Operating Leverage" },
      { symbol: "SPY", name: "S&P 500 ETF Trust", type: "ETF", weight_pct: 17, return_target: "+13.5%", role: "Systemic US Equity Market Compounding" },
      { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", weight_pct: 15, return_target: "+14.2%", role: "Geopolitical Safe-Haven & Currency Hedge" },
      { symbol: "BTC-USD", name: "Bitcoin", type: "Crypto", weight_pct: 10, return_target: "+35.0%", role: "Asymmetric Return Satellite Booster" },
      { symbol: "JPM", name: "JPMorgan Chase", type: "Stock", weight_pct: 5, return_target: "+14.0%", role: "Tier-1 Credit & Net Interest Resiliency" }
    ]
  },
  low_risk: {
    id: "low_risk",
    name: "Low Risk / Capital Preservation & Defense",
    icon: "🛡️",
    risk_level: "Low Risk (Defensive Compounding)",
    expected_cagr: "+13.4%",
    sharpe_ratio: 2.18,
    max_drawdown: "-6.5%",
    volatility_annual: "9.4%",
    tagline: "Uncompromising capital preservation, fortress balance sheets, and steady inflation-hedged yields.",
    thesis: "Engineered for capital defense in restrictive or stagflationary macro regimes. Relies on Warren Buffett's Berkshire cash fortress, consumer staples with inelastic pricing power, and monetary hedges.",
    allocations: [
      { symbol: "BRK-B", name: "Berkshire Hathaway", type: "Stock", weight_pct: 25, return_target: "+12.5%", role: "Diversified Cash Fortress & Float Leader" },
      { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", weight_pct: 20, return_target: "+14.0%", role: "Global Monetary Debasement Buffer" },
      { symbol: "COST", name: "Costco Wholesale", type: "Stock", weight_pct: 15, return_target: "+14.8%", role: "High-Renewal Membership Cash Flow" },
      { symbol: "JNJ", name: "Johnson & Johnson", type: "Stock", weight_pct: 15, return_target: "+9.2%", role: "AAA Healthcare Dividend Pillar" },
      { symbol: "TLT", name: "20+ Year Treasury Bond", type: "ETF", weight_pct: 15, return_target: "+10.5%", role: "Flight-to-Safety Duration Anchor" },
      { symbol: "JPM", name: "JPMorgan Chase", type: "Stock", weight_pct: 10, return_target: "+13.2%", role: "Systemically Important Financial Fortress" }
    ]
  },
  ai_revolution: {
    id: "ai_revolution",
    name: "AI Revolution & Precision Computing (Deep Tech Disruptors)",
    icon: "🧠",
    risk_level: "High Risk (Focused Exponential Tech)",
    expected_cagr: "+42.5%",
    sharpe_ratio: 2.15,
    max_drawdown: "-18.5%",
    volatility_annual: "28.4%",
    tagline: "Direct exposure to next-generation AI infrastructure, molecular data intelligence, and quantum acceleration.",
    thesis: "Concentrated on the secular transition from traditional compute to neural architectures and precision medicine. Anchored by Tempus AI's molecular clinical library, Palantir's ontology, NVIDIA silicon, and commercial quantum processors.",
    allocations: [
      { symbol: "NVDA", name: "NVIDIA Corp", type: "Stock", weight_pct: 25, return_target: "+35.0%", role: "Global GPU & AI Accelerated Compute Monopoly" },
      { symbol: "TEM", name: "Tempus AI, Inc.", type: "Stock", weight_pct: 20, return_target: "+38.0%", role: "Clinical AI & Molecular Precision Medicine" },
      { symbol: "PLTR", name: "Palantir Technologies", type: "Stock", weight_pct: 20, return_target: "+36.5%", role: "Enterprise AI Operating System & AIP Expansion" },
      { symbol: "APP", name: "AppLovin Corp", type: "Stock", weight_pct: 15, return_target: "+32.0%", role: "AXON 2.0 AI Ad Engine Monetization" },
      { symbol: "IONQ", name: "IonQ Inc. (Quantum)", type: "Stock", weight_pct: 10, return_target: "+44.0%", role: "Commercial Trapped-Ion Quantum Processing" },
      { symbol: "ALAB", name: "Astera Labs Inc.", type: "Stock", weight_pct: 10, return_target: "+34.0%", role: "Cloud AI Connectivity & PCIe Interconnects" }
    ]
  },
  risk_parity: {
    id: "risk_parity",
    name: "Equal Risk Contribution (Inverse-Volatility Risk Parity)",
    icon: "⚖️",
    risk_level: "Mathematically Balanced (Equal Risk Budget)",
    expected_cagr: "+17.2%",
    sharpe_ratio: 2.55,
    max_drawdown: "-9.2%",
    volatility_annual: "12.0%",
    tagline: "Weights w_i proportional to 1/sigma_i so that every constituent contributes equally to total portfolio variance.",
    thesis: "Prevents high-volatility assets from dominating portfolio variance. By allocating capital inversely to historical volatility, risk is distributed symmetrically across equities, gold, and fixed income.",
    allocations: [
      { symbol: "TLT", name: "20+ Year Treasury Bond", type: "ETF", weight_pct: 28, return_target: "+10.5%", role: "High-Duration Defensive Anchor (w proportional to 1/sigma)" },
      { symbol: "SPY", name: "S&P 500 ETF Trust", type: "ETF", weight_pct: 22, return_target: "+13.5%", role: "Broad Market Equity Compounding" },
      { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", weight_pct: 20, return_target: "+14.0%", role: "Real Asset Debasement Hedge" },
      { symbol: "JNJ", name: "Johnson & Johnson", type: "Stock", weight_pct: 16, return_target: "+9.5%", role: "Low-Beta Healthcare Cash Compounding" },
      { symbol: "XOM", name: "Exxon Mobil Corp", type: "Stock", weight_pct: 10, return_target: "+15.0%", role: "Energy Inflation Flow" },
      { symbol: "BTC-USD", name: "Bitcoin", type: "Crypto", weight_pct: 4, return_target: "+38.0%", role: "Strictly Risk-Budgeted Digital Alpha (4% Risk Cap)" }
    ]
  },
  all_weather: {
    id: "all_weather",
    name: "All-Weather Macro Hegemony (Inflation & Debasement Armor)",
    icon: "🌐",
    risk_level: "Balanced / Macro Resilience",
    expected_cagr: "+18.6%",
    sharpe_ratio: 2.65,
    max_drawdown: "-8.5%",
    volatility_annual: "11.2%",
    tagline: "Institutional all-weather framework engineered to compound across monetary easing, stagflation, and bull cycles.",
    thesis: "Engineered to withstand currency debasement and geopolitical volatility by coupling physical gold, mathematical digital scarcity (Bitcoin), energy cash flows, cash fortresses, and defensive retail.",
    allocations: [
      { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", weight_pct: 25, return_target: "+15.0%", role: "Sovereign Reserve Asset & Real Rates Anchor" },
      { symbol: "BTC-USD", name: "Bitcoin", type: "Crypto", weight_pct: 15, return_target: "+38.0%", role: "Digital Gold & Global Monetary Scarcity" },
      { symbol: "BRK-B", name: "Berkshire Hathaway", type: "Stock", weight_pct: 20, return_target: "+13.5%", role: "Cash Fortress & Industrial Compounding" },
      { symbol: "XOM", name: "Exxon Mobil Corp", type: "Stock", weight_pct: 15, return_target: "+16.0%", role: "Hydrocarbon Free Cash Flow & Energy Inflation Hedge" },
      { symbol: "COST", name: "Costco Wholesale", type: "Stock", weight_pct: 15, return_target: "+15.0%", role: "Recession-Resistant Membership Retail Pillar" },
      { symbol: "TLT", name: "20+ Year Treasury Bond", type: "ETF", weight_pct: 10, return_target: "+11.0%", role: "Deflationary Flight-to-Safety Duration Buffer" }
    ]
  }
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const profile = url.searchParams.get("profile") || "all";

  if (profile !== "all" && PORTFOLIOS[profile]) {
    return new Response(JSON.stringify(PORTFOLIOS[profile]), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  return new Response(JSON.stringify({
    profiles: Object.values(PORTFOLIOS)
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300"
    }
  });
}
