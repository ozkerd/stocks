# Cloudflare Setup Guide for `stocks.primerllm.com`

This guide explains how to expose the TimesFM-3 Stock Forecaster web application securely under `stocks.primerllm.com` using Cloudflare Tunnel (Zero Trust) or standard Cloudflare DNS Proxy.

---

## Method 1: Cloudflare Tunnel (Recommended - Zero Open Ports)

Cloudflare Tunnels allow you to host the web app without exposing IP addresses or configuring firewall ports.

### 1. Install `cloudflared` on your server

- **macOS**:
  ```bash
  brew install cloudflared
  ```
- **Ubuntu / Debian Linux**:
  ```bash
  curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  sudo dpkg -i cloudflared.deb
  ```

### 2. Authenticate with Cloudflare
```bash
cloudflared tunnel login
```
Select the domain `primerllm.com`.

### 3. Create a Tunnel
```bash
cloudflared tunnel create stocks-primerllm
```
Note down the Tunnel UUID output (e.g. `12345678-abcd-1234-abcd-1234567890ab`).

### 4. Configure DNS in Cloudflare
Route `stocks.primerllm.com` to your tunnel:
```bash
cloudflared tunnel route dns stocks-primerllm stocks.primerllm.com
```

### 5. Configure `cloudflared-config.yml`
Copy `deploy/cloudflare/cloudflared-config.yml` to `~/.cloudflared/config.yml` and replace `<YOUR-CLOUDFLARE-TUNNEL-UUID>` with your actual UUID.

### 6. Run the Tunnel as a Service
```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

---

## Method 2: Cloudflare DNS A / CNAME Record + Reverse Proxy (Caddy or Nginx)

If your server has a public static IP:
1. In Cloudflare Dashboard for `primerllm.com`:
   - Add a `CNAME` record: Name `stocks`, Target `your-server-ip-or-host`, Proxy status: **Proxied (Orange Cloud)**.
   - SSL/TLS mode: Set to **Full (Strict)**.
2. On the server, run Caddy using `deploy/caddy/Caddyfile` or Nginx using `deploy/nginx/stocks.primerllm.com.conf`.
3. Start the FastAPI server:
   ```bash
   uvicorn app:app --host 127.0.0.1 --port 8000
   ```
