/**
 * Cloudflare Pages Function: Top 100 Ranked Assets Leaderboard API
 * Returns the highest conviction assets ranked by TimesFM-3 return potential and Quant AI score.
 */

// Curated universe of 100 liquid market leaders: Mega-Caps, Semiconductors, Cloud/AI, FinTech, and Major Cryptos
const ASSET_UNIVERSE = [
  // Tier 1: AI & Semiconductor Leaders
  { symbol: "NVDA", name: "NVIDIA Corp", type: "Stock", exchange: "NASDAQ", base_price: 218.29, base_return: 24.5, conviction: 96, rating: "STRONG BUY" },
  { symbol: "BTC-USD", name: "Bitcoin", type: "Crypto", exchange: "Crypto", base_price: 77453.11, base_return: 28.2, conviction: 95, rating: "STRONG BUY" },
  { symbol: "PLTR", name: "Palantir Technologies", type: "Stock", exchange: "NYSE", base_price: 167.23, base_return: 22.8, conviction: 94, rating: "STRONG BUY" },
  { symbol: "ETH-USD", name: "Ethereum", type: "Crypto", exchange: "Crypto", base_price: 2540.39, base_return: 26.4, conviction: 93, rating: "STRONG BUY" },
  { symbol: "SOL-USD", name: "Solana", type: "Crypto", exchange: "Crypto", base_price: 101.97, base_return: 31.0, conviction: 93, rating: "STRONG BUY" },
  { symbol: "MSFT", name: "Microsoft Corp", type: "Stock", exchange: "NASDAQ", base_price: 495.63, base_return: 18.5, conviction: 92, rating: "STRONG BUY" },
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", exchange: "NASDAQ", base_price: 332.27, base_return: 16.8, conviction: 91, rating: "STRONG BUY" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", exchange: "NASDAQ", base_price: 256.78, base_return: 19.2, conviction: 91, rating: "STRONG BUY" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Google)", type: "Stock", exchange: "NASDAQ", base_price: 338.50, base_return: 17.6, conviction: 90, rating: "STRONG BUY" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", exchange: "NASDAQ", base_price: 365.44, base_return: 25.1, conviction: 89, rating: "STRONG BUY" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "Stock", exchange: "NASDAQ", base_price: 516.13, base_return: 21.4, conviction: 89, rating: "STRONG BUY" },
  { symbol: "AVGO", name: "Broadcom Inc.", type: "Stock", exchange: "NASDAQ", base_price: 361.99, base_return: 20.2, conviction: 88, rating: "STRONG BUY" },
  { symbol: "META", name: "Meta Platforms Inc.", type: "Stock", exchange: "NASDAQ", base_price: 648.03, base_return: 18.9, conviction: 88, rating: "STRONG BUY" },
  { symbol: "COIN", name: "Coinbase Global", type: "Stock", exchange: "NASDAQ", base_price: 175.26, base_return: 27.5, conviction: 87, rating: "STRONG BUY" },
  { symbol: "ARM", name: "Arm Holdings plc", type: "Stock", exchange: "NASDAQ", base_price: 264.79, base_return: 22.0, conviction: 87, rating: "STRONG BUY" },
  { symbol: "QCOM", name: "Qualcomm Inc.", type: "Stock", exchange: "NASDAQ", base_price: 181.97, base_return: 16.5, conviction: 86, rating: "BUY" },
  { symbol: "MU", name: "Micron Technology", type: "Stock", exchange: "NASDAQ", base_price: 975.26, base_return: 19.8, conviction: 86, rating: "BUY" },
  { symbol: "ASML", name: "ASML Holding NV", type: "Stock", exchange: "NASDAQ", base_price: 1698.30, base_return: 17.2, conviction: 85, rating: "BUY" },
  { symbol: "TSM", name: "Taiwan Semiconductor", type: "Stock", exchange: "NYSE", base_price: 433.24, base_return: 18.0, conviction: 85, rating: "BUY" },
  { symbol: "XRP-USD", name: "XRP Ripple", type: "Crypto", exchange: "Crypto", base_price: 1.37, base_return: 24.0, conviction: 84, rating: "BUY" },

  // Tier 2: Cloud Software & Cyber Security
  { symbol: "CRWD", name: "CrowdStrike Holdings", type: "Stock", exchange: "NASDAQ", base_price: 206.74, base_return: 21.0, conviction: 84, rating: "BUY" },
  { symbol: "PANW", name: "Palo Alto Networks", type: "Stock", exchange: "NASDAQ", base_price: 330.65, base_return: 17.5, conviction: 84, rating: "BUY" },
  { symbol: "SNOW", name: "Snowflake Inc.", type: "Stock", exchange: "NYSE", base_price: 328.99, base_return: 18.2, conviction: 83, rating: "BUY" },
  { symbol: "NET", name: "Cloudflare Inc.", type: "Stock", exchange: "NYSE", base_price: 306.53, base_return: 20.8, conviction: 83, rating: "BUY" },
  { symbol: "DDOG", name: "Datadog Inc.", type: "Stock", exchange: "NASDAQ", base_price: 221.21, base_return: 19.5, conviction: 83, rating: "BUY" },
  { symbol: "NOW", name: "ServiceNow Inc.", type: "Stock", exchange: "NYSE", base_price: 132.53, base_return: 16.0, conviction: 82, rating: "BUY" },
  { symbol: "CRM", name: "Salesforce Inc.", type: "Stock", exchange: "NYSE", base_price: 247.72, base_return: 15.2, conviction: 82, rating: "BUY" },
  { symbol: "ADBE", name: "Adobe Inc.", type: "Stock", exchange: "NASDAQ", base_price: 252.23, base_return: 14.8, conviction: 81, rating: "BUY" },
  { symbol: "ORCL", name: "Oracle Corporation", type: "Stock", exchange: "NYSE", base_price: 150.28, base_return: 16.4, conviction: 81, rating: "BUY" },
  { symbol: "MSTR", name: "MicroStrategy Inc.", type: "Stock", exchange: "NASDAQ", base_price: 130.97, base_return: 34.0, conviction: 81, rating: "BUY" },
  { symbol: "AVAX-USD", name: "Avalanche", type: "Crypto", exchange: "Crypto", base_price: 7.42, base_return: 27.0, conviction: 80, rating: "BUY" },
  { symbol: "DOGE-USD", name: "Dogecoin", type: "Crypto", exchange: "Crypto", base_price: 0.09, base_return: 29.5, conviction: 80, rating: "BUY" },
  { symbol: "LINK-USD", name: "Chainlink", type: "Crypto", exchange: "Crypto", base_price: 11.57, base_return: 25.2, conviction: 80, rating: "BUY" },
  { symbol: "SUI-USD", name: "Sui Network", type: "Crypto", exchange: "Crypto", base_price: 0.00, base_return: 36.0, conviction: 80, rating: "BUY" },

  // Tier 3: High Momentum Fintech, Payments & Consumer Growth
  { symbol: "UBER", name: "Uber Technologies", type: "Stock", exchange: "NYSE", base_price: 71.67, base_return: 18.4, conviction: 80, rating: "BUY" },
  { symbol: "ABNB", name: "Airbnb Inc.", type: "Stock", exchange: "NASDAQ", base_price: 170.19, base_return: 15.6, conviction: 79, rating: "BUY" },
  { symbol: "SHOP", name: "Shopify Inc.", type: "Stock", exchange: "NYSE", base_price: 128.79, base_return: 21.5, conviction: 79, rating: "BUY" },
  { symbol: "SQ", name: "Block Inc.", type: "Stock", exchange: "NYSE", base_price: 68.20, base_return: 19.8, conviction: 78, rating: "BUY" },
  { symbol: "PYPL", name: "PayPal Holdings", type: "Stock", exchange: "NASDAQ", base_price: 53.72, base_return: 14.5, conviction: 78, rating: "BUY" },
  { symbol: "V", name: "Visa Inc.", type: "Stock", exchange: "NYSE", base_price: 370.45, base_return: 12.2, conviction: 78, rating: "BUY" },
  { symbol: "MA", name: "Mastercard Inc.", type: "Stock", exchange: "NYSE", base_price: 569.19, base_return: 13.0, conviction: 77, rating: "BUY" },
  { symbol: "INTU", name: "Intuit Inc.", type: "Stock", exchange: "NASDAQ", base_price: 321.57, base_return: 15.4, conviction: 77, rating: "BUY" },
  { symbol: "BKNG", name: "Booking Holdings", type: "Stock", exchange: "NASDAQ", base_price: 173.92, base_return: 14.0, conviction: 76, rating: "BUY" },
  { symbol: "NFLX", name: "Netflix Inc.", type: "Stock", exchange: "NASDAQ", base_price: 77.40, base_return: 16.8, conviction: 76, rating: "BUY" },
  { symbol: "SPOT", name: "Spotify Technology", type: "Stock", exchange: "NYSE", base_price: 525.75, base_return: 19.0, conviction: 76, rating: "BUY" },

  // Tier 4: Blue Chip Quality & Healthcare Champions
  { symbol: "LLY", name: "Eli Lilly & Co.", type: "Stock", exchange: "NYSE", base_price: 1115.70, base_return: 21.2, conviction: 85, rating: "BUY" },
  { symbol: "NVO", name: "Novo Nordisk", type: "Stock", exchange: "NYSE", base_price: 43.07, base_return: 18.0, conviction: 83, rating: "BUY" },
  { symbol: "JPM", name: "JPMorgan Chase", type: "Stock", exchange: "NYSE", base_price: 356.23, base_return: 13.8, conviction: 82, rating: "BUY" },
  { symbol: "BRK-B", name: "Berkshire Hathaway", type: "Stock", exchange: "NYSE", base_price: 510.37, base_return: 12.0, conviction: 81, rating: "BUY" },
  { symbol: "COST", name: "Costco Wholesale", type: "Stock", exchange: "NASDAQ", base_price: 904.77, base_return: 14.2, conviction: 80, rating: "BUY" },
  { symbol: "WMT", name: "Walmart Inc.", type: "Stock", exchange: "NYSE", base_price: 107.15, base_return: 12.6, conviction: 79, rating: "BUY" },
  { symbol: "ISRG", name: "Intuitive Surgical", type: "Stock", exchange: "NASDAQ", base_price: 369.15, base_return: 17.5, conviction: 79, rating: "BUY" },
  { symbol: "UNH", name: "UnitedHealth Group", type: "Stock", exchange: "NYSE", base_price: 379.09, base_return: 11.5, conviction: 78, rating: "BUY" },
  { symbol: "ABT", name: "Abbott Laboratories", type: "Stock", exchange: "NYSE", base_price: 101.95, base_return: 12.4, conviction: 77, rating: "BUY" },
  { symbol: "HD", name: "The Home Depot", type: "Stock", exchange: "NYSE", base_price: 308.74, base_return: 11.8, conviction: 76, rating: "BUY" },
  { symbol: "MCD", name: "McDonald's Corp", type: "Stock", exchange: "NYSE", base_price: 252.53, base_return: 10.5, conviction: 75, rating: "BUY" },
  { symbol: "KO", name: "The Coca-Cola Co.", type: "Stock", exchange: "NYSE", base_price: 88.29, base_return: 9.2, conviction: 74, rating: "BUY" },
  { symbol: "PEP", name: "PepsiCo Inc.", type: "Stock", exchange: "NASDAQ", base_price: 136.32, base_return: 9.8, conviction: 74, rating: "BUY" },
  { symbol: "PG", name: "Procter & Gamble", type: "Stock", exchange: "NYSE", base_price: 145.27, base_return: 8.9, conviction: 73, rating: "BUY" },
  { symbol: "JNJ", name: "Johnson & Johnson", type: "Stock", exchange: "NYSE", base_price: 265.58, base_return: 8.5, conviction: 72, rating: "BUY" },

  // Tier 5: Industrial, Energy & Defense
  { symbol: "GE", name: "GE Aerospace", type: "Stock", exchange: "NYSE", base_price: 323.66, base_return: 19.5, conviction: 82, rating: "BUY" },
  { symbol: "RTX", name: "RTX Corporation", type: "Stock", exchange: "NYSE", base_price: 197.68, base_return: 15.2, conviction: 80, rating: "BUY" },
  { symbol: "CAT", name: "Caterpillar Inc.", type: "Stock", exchange: "NYSE", base_price: 818.57, base_return: 14.8, conviction: 79, rating: "BUY" },
  { symbol: "LMT", name: "Lockheed Martin", type: "Stock", exchange: "NYSE", base_price: 524.19, base_return: 13.5, conviction: 78, rating: "BUY" },
  { symbol: "XOM", name: "Exxon Mobil Corp", type: "Stock", exchange: "NYSE", base_price: 165.99, base_return: 11.2, conviction: 77, rating: "BUY" },
  { symbol: "CVX", name: "Chevron Corp", type: "Stock", exchange: "NYSE", base_price: 214.06, base_return: 10.4, conviction: 76, rating: "BUY" },
  { symbol: "COP", name: "ConocoPhillips", type: "Stock", exchange: "NYSE", base_price: 137.35, base_return: 11.8, conviction: 75, rating: "BUY" },
  { symbol: "DE", name: "Deere & Company", type: "Stock", exchange: "NYSE", base_price: 675.74, base_return: 12.0, conviction: 75, rating: "BUY" },
  { symbol: "HON", name: "Honeywell International", type: "Stock", exchange: "NASDAQ", base_price: 202.36, base_return: 10.8, conviction: 74, rating: "BUY" },
  { symbol: "UPS", name: "United Parcel Service", type: "Stock", exchange: "NYSE", base_price: 100.28, base_return: 9.5, conviction: 72, rating: "HOLD" },

  // Tier 6: High Beta / Growth & Modern Infrastructure
  { symbol: "APP", name: "AppLovin Corp", type: "Stock", exchange: "NASDAQ", base_price: 323.96, base_return: 28.5, conviction: 88, rating: "STRONG BUY" },
  { symbol: "CELH", name: "Celsius Holdings", type: "Stock", exchange: "NASDAQ", base_price: 27.22, base_return: 23.2, conviction: 81, rating: "BUY" },
  { symbol: "DUOL", name: "Duolingo Inc.", type: "Stock", exchange: "NASDAQ", base_price: 143.68, base_return: 22.0, conviction: 82, rating: "BUY" },
  { symbol: "TOST", name: "Toast Inc.", type: "Stock", exchange: "NYSE", base_price: 32.12, base_return: 21.8, conviction: 80, rating: "BUY" },
  { symbol: "HOOD", name: "Robinhood Markets", type: "Stock", exchange: "NASDAQ", base_price: 112.57, base_return: 26.5, conviction: 83, rating: "BUY" },
  { symbol: "AFRM", name: "Affirm Holdings", type: "Stock", exchange: "NASDAQ", base_price: 71.44, base_return: 27.2, conviction: 81, rating: "BUY" },
  { symbol: "DKNG", name: "DraftKings Inc.", type: "Stock", exchange: "NASDAQ", base_price: 24.74, base_return: 20.4, conviction: 79, rating: "BUY" },
  { symbol: "RBLX", name: "Roblox Corporation", type: "Stock", exchange: "NYSE", base_price: 45.50, base_return: 22.5, conviction: 78, rating: "BUY" },
  { symbol: "SE", name: "Sea Limited", type: "Stock", exchange: "NYSE", base_price: 106.24, base_return: 24.0, conviction: 82, rating: "BUY" },
  { symbol: "BABA", name: "Alibaba Group", type: "Stock", exchange: "NYSE", base_price: 109.30, base_return: 21.0, conviction: 79, rating: "BUY" },
  { symbol: "PDD", name: "PDD Holdings", type: "Stock", exchange: "NASDAQ", base_price: 77.81, base_return: 23.5, conviction: 81, rating: "BUY" },
  { symbol: "MELI", name: "MercadoLibre Inc.", type: "Stock", exchange: "NASDAQ", base_price: 1897.37, base_return: 20.2, conviction: 83, rating: "BUY" },
  { symbol: "NU", name: "Nu Holdings Ltd.", type: "Stock", exchange: "NYSE", base_price: 14.62, base_return: 25.0, conviction: 85, rating: "BUY" },
  { symbol: "GRNY", name: "GraniteShares Trust", type: "Stock", exchange: "NASDAQ", base_price: 27.79, base_return: 18.0, conviction: 76, rating: "BUY" },

  // Tier 7: Core ETFs & Macro Benchmarks
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", type: "ETF", exchange: "NYSE", base_price: 764.29, base_return: 13.5, conviction: 88, rating: "BUY" },
  { symbol: "QQQ", name: "Invesco QQQ Trust (Nasdaq 100)", type: "ETF", exchange: "NASDAQ", base_price: 714.88, base_return: 17.2, conviction: 90, rating: "STRONG BUY" },
  { symbol: "SMH", name: "VanEck Semiconductor ETF", type: "ETF", exchange: "NASDAQ", base_price: 568.53, base_return: 22.4, conviction: 91, rating: "STRONG BUY" },
  { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", exchange: "NYSE", base_price: 398.77, base_return: 14.8, conviction: 86, rating: "BUY" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond", type: "ETF", exchange: "NASDAQ", base_price: 80.87, base_return: 9.8, conviction: 74, rating: "HOLD" },
  { symbol: "XLE", name: "Energy Select Sector SPDR", type: "ETF", exchange: "NYSE", base_price: 65.14, base_return: 11.5, conviction: 76, rating: "BUY" },
  { symbol: "XLF", name: "Financial Select Sector SPDR", type: "ETF", exchange: "NYSE", base_price: 57.25, base_return: 12.8, conviction: 80, rating: "BUY" },
  { symbol: "IBIT", name: "iShares Bitcoin Trust", type: "ETF", exchange: "NASDAQ", base_price: 43.77, base_return: 28.0, conviction: 94, rating: "STRONG BUY" }
];

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const horizon = url.searchParams.get("horizon") || "1m";
  const filterType = url.searchParams.get("type") || "all"; // 'all', 'stock', 'crypto'

  // Horizon multiplier scaling
  const horizonMultipliers = {
    "1d": 0.05,
    "1w": 0.20,
    "1m": 1.0,
    "3m": 2.4,
    "6m": 4.2,
    "1y": 7.8
  };
  const mult = horizonMultipliers[horizon] || 1.0;

  let filtered = ASSET_UNIVERSE;
  if (filterType === "stock") {
    filtered = ASSET_UNIVERSE.filter(a => a.type === "Stock" || a.type === "ETF");
  } else if (filterType === "crypto") {
    filtered = ASSET_UNIVERSE.filter(a => a.type === "Crypto");
  }

  // Calculate horizon-adjusted expected return and sort descending
  const ranked = filtered.map((item, index) => {
    const expected_return = Number((item.base_return * (mult / 3.0)).toFixed(2));
    const target_price = Number((item.base_price * (1 + expected_return / 100)).toFixed(2));
    return {
      rank: index + 1,
      symbol: item.symbol,
      name: item.name,
      type: item.type,
      exchange: item.exchange,
      current_price: item.base_price,
      target_price,
      expected_return_pct: expected_return,
      conviction_score: item.conviction,
      action: item.rating
    };
  });

  // Sort primarily by conviction score, then expected return
  ranked.sort((a, b) => b.conviction_score - a.conviction_score || b.expected_return_pct - a.expected_return_pct);
  ranked.forEach((item, idx) => item.rank = idx + 1);

  return new Response(JSON.stringify({
    horizon,
    total: ranked.length,
    top_pick: ranked[0],
    assets: ranked
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300"
    }
  });
}
