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

  { symbol: "ARM", name: "Arm Holdings plc", type: "Stock", exchange: "NASDAQ" },
  { symbol: "SMCI", name: "Super Micro Computer Inc.", type: "Stock", exchange: "NASDAQ" },
  { symbol: "ASTS", name: "AST SpaceMobile Inc.", type: "Stock", exchange: "NASDAQ" },
  { symbol: "RKLB", name: "Rocket Lab USA Inc.", type: "Stock", exchange: "NASDAQ" },
  { symbol: "IONQ", name: "IonQ Inc. (Quantum)", type: "Stock", exchange: "NYSE" },
  { symbol: "MSTR", name: "MicroStrategy Inc.", type: "Stock", exchange: "NASDAQ" },

  // Crypto Assets & Trending Coins
  { symbol: "BTC-USD", name: "Bitcoin USD", type: "Crypto", exchange: "Crypto", aliases: ["BTC", "BITCOIN"] },
  { symbol: "ETH-USD", name: "Ethereum USD", type: "Crypto", exchange: "Crypto", aliases: ["ETH", "ETHEREUM"] },
  { symbol: "SOL-USD", name: "Solana USD", type: "Crypto", exchange: "Crypto", aliases: ["SOL", "SOLANA"] },
  { symbol: "HYPE32196-USD", name: "Hyperliquid USD (HYPE)", type: "Crypto", exchange: "Crypto", aliases: ["HYPE", "HYPERLIQUID"] },
  { symbol: "LIT6833-USD", name: "Litentry USD (LIT)", type: "Crypto", exchange: "Crypto", aliases: ["LIT", "LITENTRY"] },
  { symbol: "SUI20947-USD", name: "Sui Network USD (SUI)", type: "Crypto", exchange: "Crypto", aliases: ["SUI"] },
  { symbol: "SEI-USD", name: "Sei Network USD (SEI)", type: "Crypto", exchange: "Crypto", aliases: ["SEI"] },
  { symbol: "APT21794-USD", name: "Aptos USD (APT)", type: "Crypto", exchange: "Crypto", aliases: ["APT", "APTOS"] },
  { symbol: "TIA-USD", name: "Celestia USD (TIA)", type: "Crypto", exchange: "Crypto", aliases: ["TIA", "CELESTIA"] },
  { symbol: "INJ-USD", name: "Injective USD (INJ)", type: "Crypto", exchange: "Crypto", aliases: ["INJ", "INJECTIVE"] },
  { symbol: "JUP-USD", name: "Jupiter DEX USD (JUP)", type: "Crypto", exchange: "Crypto", aliases: ["JUP", "JUPITER"] },
  { symbol: "ONDO-USD", name: "Ondo Finance RWA USD (ONDO)", type: "Crypto", exchange: "Crypto", aliases: ["ONDO"] },
  { symbol: "KAS-USD", name: "Kaspa USD (KAS)", type: "Crypto", exchange: "Crypto", aliases: ["KAS", "KASPA"] },
  { symbol: "NEAR-USD", name: "NEAR Protocol USD", type: "Crypto", exchange: "Crypto", aliases: ["NEAR"] },
  { symbol: "FET-USD", name: "Artificial Superintelligence Alliance (FET)", type: "Crypto", exchange: "Crypto", aliases: ["FET", "ASI"] },
  { symbol: "TAO-USD", name: "Bittensor USD (TAO)", type: "Crypto", exchange: "Crypto", aliases: ["TAO", "BITTENSOR"] },
  { symbol: "RENDER-USD", name: "Render Network USD (RENDER)", type: "Crypto", exchange: "Crypto", aliases: ["RENDER", "RNDR"] },
  { symbol: "ENA-USD", name: "Ethena USD (ENA)", type: "Crypto", exchange: "Crypto", aliases: ["ENA", "ETHENA"] },
  { symbol: "AAVE-USD", name: "Aave USD", type: "Crypto", exchange: "Crypto", aliases: ["AAVE"] },
  { symbol: "LINK-USD", name: "Chainlink USD", type: "Crypto", exchange: "Crypto", aliases: ["LINK", "CHAINLINK"] },
  { symbol: "AVAX-USD", name: "Avalanche USD", type: "Crypto", exchange: "Crypto", aliases: ["AVAX", "AVALANCHE"] },
  { symbol: "XRP-USD", name: "XRP Ripple USD", type: "Crypto", exchange: "Crypto", aliases: ["XRP", "RIPPLE"] },
  { symbol: "DOGE-USD", name: "Dogecoin USD", type: "Crypto", exchange: "Crypto", aliases: ["DOGE", "DOGECOIN"] },
  { symbol: "ADA-USD", name: "Cardano USD", type: "Crypto", exchange: "Crypto", aliases: ["ADA", "CARDANO"] },
  { symbol: "BNB-USD", name: "BNB Binance USD", type: "Crypto", exchange: "Crypto", aliases: ["BNB", "BINANCE"] }
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
