/**
 * Cloudflare Pages Function: Proxy /api/* requests to the TimesFM-3 Python Backend.
 * 
 * In Cloudflare Pages Dashboard:
 * Settings -> Environment Variables -> Add:
 * BACKEND_URL = https://your-python-backend-or-tunnel-url (e.g. http://127.0.0.1:8000 via Tunnel or https://api-stocks.primerllm.com)
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // If BACKEND_URL is set in Cloudflare Pages Environment Variables, forward there
  const backendBase = env.BACKEND_URL || "http://127.0.0.1:8000";
  const targetUrl = `${backendBase}${url.pathname}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    });

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    return newResponse;
  } catch (err) {
    return new Response(JSON.stringify({
      error: "Backend Unavailable",
      detail: "Could not reach Python TimesFM-3 backend. Please ensure BACKEND_URL is configured in Cloudflare Pages.",
      message: err.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
