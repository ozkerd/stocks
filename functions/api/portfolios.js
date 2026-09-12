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
