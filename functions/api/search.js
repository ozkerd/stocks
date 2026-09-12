/**
 * Cloudflare Pages Function: Company Name & Crypto / Stock Ticker Autocomplete Search
 * Resolves company names (e.g. "Apple", "Bitcoin", "Tesla") to Yahoo Finance tickers.
 */

const POPULAR_ASSETS = [
  // Mega Cap & Popular Tech
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", exchange: "NASDAQ" },
  { symbol: "APP", name: "AppLovin Corporation", type: "Stock", exchange: "NASDAQ", aliases: ["APP", "APPLOVIN"] },
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Stock", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Google)", type: "Stock", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc. (Facebook)", type: "Stock", exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "Stock", exchange: "NASDAQ" },
  { symbol: "PLTR", name: "Palantir Technologies", type: "Stock", exchange: "NYSE" },
  { symbol: "COIN", name: "Coinbase Global Inc.", type: "Stock", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix Inc.", type: "Stock", exchange: "NASDAQ" },
  { symbol: "BRK-B", name: "Berkshire Hathaway Inc.", type: "Stock", exchange: "NYSE" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "Stock", exchange: "NYSE" },

  // Crypto Assets
  { symbol: "BTC-USD", name: "Bitcoin USD", type: "Crypto", exchange: "Crypto", aliases: ["BTC", "BITCOIN"] },
  { symbol: "ETH-USD", name: "Ethereum USD", type: "Crypto", exchange: "Crypto", aliases: ["ETH", "ETHEREUM"] },
  { symbol: "SOL-USD", name: "Solana USD", type: "Crypto", exchange: "Crypto", aliases: ["SOL", "SOLANA"] },
  { symbol: "XRP-USD", name: "XRP Ripple USD", type: "Crypto", exchange: "Crypto", aliases: ["XRP", "RIPPLE"] },
  { symbol: "DOGE-USD", name: "Dogecoin USD", type: "Crypto", exchange: "Crypto", aliases: ["DOGE", "DOGECOIN"] },
  { symbol: "ADA-USD", name: "Cardano USD", type: "Crypto", exchange: "Crypto", aliases: ["ADA", "CARDANO"] },
  { symbol: "AVAX-USD", name: "Avalanche USD", type: "Crypto", exchange: "Crypto", aliases: ["AVAX", "AVALANCHE"] },
  { symbol: "BNB-USD", name: "BNB Binance USD", type: "Crypto", exchange: "Crypto", aliases: ["BNB", "BINANCE"] },
  { symbol: "HYPE32196-USD", name: "Hyperliquid USD (HYPE)", type: "Crypto", exchange: "Crypto", aliases: ["HYPE", "HYPERLIQUID"] },
  { symbol: "LIT6833-USD", name: "Litentry USD (LIT)", type: "Crypto", exchange: "Crypto", aliases: ["LIT", "LITENTRY"] },
  { symbol: "TAO-USD", name: "Bittensor USD (TAO)", type: "Crypto", exchange: "Crypto", aliases: ["TAO", "BITTENSOR"] },
  { symbol: "AAVE-USD", name: "Aave USD", type: "Crypto", exchange: "Crypto", aliases: ["AAVE"] }
];

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  if (!q) {
    return new Response(JSON.stringify({ results: POPULAR_ASSETS.slice(0, 8) }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // 1. Check built-in popular assets
  const localMatches = POPULAR_ASSETS.filter(item => {
    return item.symbol.toLowerCase().includes(q) ||
           item.name.toLowerCase().includes(q) ||
           (item.aliases && item.aliases.some(a => a.toLowerCase().includes(q)));
  });

  // 2. Query Yahoo Finance Search API for broad coverage
  let remoteMatches = [];
  try {
    const yUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&enableFuzzyQuery=true`;
    const res = await fetch(yUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });
    if (res.ok) {
      const data = await res.json();
      const quotes = data.quotes || [];
      remoteMatches = quotes
        .filter(qItem => qItem.symbol && (qItem.shortname || qItem.longname))
        .map(qItem => ({
          symbol: qItem.symbol,
          name: qItem.shortname || qItem.longname,
          type: qItem.quoteType === "CRYPTOCURRENCY" ? "Crypto" : (qItem.quoteType || "Stock"),
          exchange: qItem.exchange || "US"
        }));
    }
  } catch (err) {
    // Graceful fallback to local matches
  }

  // Deduplicate and combine (local priority first)
  const seen = new Set();
  const combined = [];
  for (const item of [...localMatches, ...remoteMatches]) {
    if (!seen.has(item.symbol)) {
      seen.add(item.symbol);
      combined.push(item);
    }
    if (combined.length >= 8) break;
  }

  return new Response(JSON.stringify({ results: combined }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300"
    }
  });
}
