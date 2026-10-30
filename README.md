<p align="center">
  <img src="assets/banner.png" alt="SiteTunnel Banner" width="100%" />
</p>

<p align="center">
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img src="https://img.shields.io/badge/Chrome-Manifest%20V3-30D158?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3"></a>
  <a href="#-features"><img src="https://img.shields.io/badge/Architecture-Split%20Tunnel-0A84FF?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Split Tunnel"></a>
  <a href="#-privacy-first--zero-permissions-proximity"><img src="https://img.shields.io/badge/Privacy-Zero%20Data%20Collected-AF52DE?style=for-the-badge&logo=shield&logoColor=white" alt="Zero Tracking"></a>
  <a href="#-license"><img src="https://img.shields.io/badge/License-MIT-FF9F0A?style=for-the-badge" alt="MIT License"></a>
</p>

<p align="center">
  <b>Route specific websites through your Surfshark VPN locations with one click. Latency-tested, fastest first.</b><br>
  <i>Precision-engineered split-tunneling — keeping your regular web browsing direct, ultra-fast, and unthrottled.</i>
</p>

---

## ⚡ The Problem vs. The Solution

| Traditional VPN Extensions | SiteTunnel |
| :--- | :--- |
| ❌ Forces **100% of your web traffic** through proxy servers | ✅ **Split-tunnels only your selected domains**; all other sites stay direct |
| ❌ Drastically slows down downloads, YouTube, and local browsing | ✅ Zero overhead or throttling on non-target websites |
| ❌ Breaks banking, local streaming, and intranet sites | ✅ Normal sites see your real IP and native connection speed |
| ❌ Heavy background daemons, battery drain, and logins | ✅ Self-contained, lightweight, zero accounts, and zero signups |
| ❌ Intrusive location permission popups | ✅ **Silent Proximity**: automatically connects to the closest datacenter silently |

---

## 📸 Interface Preview

<p align="center">
  <img src="assets/preview_active.png" width="310" alt="SiteTunnel Active State" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="assets/preview_preferences.png" width="310" alt="SiteTunnel Preferences Sheet" />
</p>

<p align="center">
  <i>Left: Active secure tunnel state with halo wave pulse animation.<br>Right: Preferences slide-over sheet with multi-site tags, quick presets, and datacenter selector.</i>
</p>

---

## ✨ Features

- **Tactile Concentric Tunnel Portal**:
  Spring-animated power switch with precision tactile feedback (`scale(0.93)`), concentric perspective aperture rings, live **halo wave** ripple (`2.8s cubic-bezier`), and ambient green backlight diffusion.
- **Silent Proximity Routing (Zero Permission Prompts)**:
  On `Auto`, SiteTunnel dynamically routes through the geographically closest cloud datacenter (**Singapore**, **United States**, or **Europe**) without ever triggering intrusive browser `navigator.geolocation` permission dialogs.
- **Multi-Site Split Routing**:
  Manage multiple target domains simultaneously. Enter custom domains or pick from one-tap presets (**ChatGPT**, **Netflix**, **Binance**, **Reddit**, **X / Twitter**, **YouTube**).
- **1-Click "+ Current Tab"**:
  Quickly add the website open in your active browser tab with a single click.
- **🦈 Full Surfshark Catalogue (142 locations, subscriber-ready)**:
  All Surfshark countries & cities from the live API (`api.surfshark.com/v4/server/clusters`) with bundled offline fallback. Search by country / city / hostname, filter by region (Europe / Americas / Asia Pacific / Middle East & Africa).
- **⚡ One-Tap Latency Test (lowest ping → highest)**:
  `Test Speed` pings every Surfshark location (6-way parallel, 3.5s timeout) and re-sorts the picker fastest-first with color badges (green <150ms, amber <400ms, red slower, timeout gray). Results persist, progress bar shows live fastest.
- **🔗 Subscriber Handoff (Dashboard + .ovpn)**:
  Selecting a location shows hostname + `Copy host` / `Dashboard` (`my.surfshark.com/home/dashboard`) / `.ovpn` (`my.surfshark.com/vpn/manual-setup`) actions. Chrome MV3 cannot open WireGuard/OpenVPN sockets, so SiteTunnel guides you to connect the Surfshark app to the exact low-ping city — toggle stays ON as intent state.
- **🧩 True Split-Tunnel via Local Proxy (optional)**:
  Run Surfshark WireGuard in Docker/Gluetun exposing `127.0.0.1:8888`, set it in `Optional local Surfshark proxy` — SiteTunnel then routes *only* your chosen sites through the Surfshark tunnel via PAC (`PROXY 127.0.0.1:8888; DIRECT`).
- **Strict Target Enforcement**:
  On first launch or whenever no websites are configured, SiteTunnel refuses to proxy all traffic—it prompts you to choose the exact site you want to tunnel, safeguarding your normal browsing speed.
- **Custom Proxy Support**:
  Supports standard HTTP and SOCKS5 user proxies (`1.2.3.4:8080` or `socks5://...`).
- **Toolbar Status Badge**:
  Real-time vibrant green `ON` toolbar badge indicator whenever your tunnel is engaged.
- **100% Private & Local**:
  Zero analytics, zero telemetry, zero accounts. Operates purely client-side within Chrome via native PAC proxy routing.

---

## 🏗️ Architecture & How It Works

```mermaid
flowchart TD
    UserReq[User Navigates to a Website] --> CheckPAC{Is domain in\nTarget Sites?}
    CheckPAC -- "YES (e.g. binance.com)" --> CloudTunnel[Route via Secure Cloud Tunnel\nSingapore / US / EU Datacenter]
    CheckPAC -- "NO (General Traffic)" --> DirectWeb[Route Direct ISP\nFull Bandwidth & Zero Latency]
    CloudTunnel --> DestSite[Target Website Reached]
    DirectWeb --> DestSite
```

**Surfshark mode:** Chrome MV3 extensions cannot dial WireGuard/OpenVPN directly. SiteTunnel is therefore a smart *picker + latency optimizer + handoff* for subscribers: pick the fastest Surfshark city, connect the Surfshark app to it, and optionally route only chosen sites through a local Surfshark-connected proxy (Gluetun `127.0.0.1:8888`).

**Legacy relay mode:** When a legacy cloud relay is selected, Chrome's native `chrome.proxy` API injects an isolated PAC script:

```javascript
function FindProxyForURL(url, host) {
  // Only route explicitly configured domains
  if (shExpMatch(host, "*binance.com*") || shExpMatch(host, "*chatgpt.com*")) {
    return "PROXY 4.144.146.21:80; DIRECT";
  }
  // All other web traffic bypasses the proxy completely
  return "DIRECT";
}
```

---

## 📁 Repository Structure

```text
sitetunnel/
├── manifest.json         # Manifest V3 extension definition
├── background.js         # Service worker, Surfshark-app handoff + split-tunnel PAC
├── vpn_registry.js       # Surfshark catalogue (142 fallback) + legacy relays + presets
├── popup.html            # Minimalist UI + Surfshark picker, latency list & handoff
├── popup.js              # State controller, latency tester (lowest→highest) & picker
├── make_logo.py          # 4x supersampled icon generator
├── assets/               # High-DPI banner & UI preview images
│   ├── banner.png
│   ├── preview_active.png
│   ├── preview_inactive.png
│   └── preview_preferences.png
├── icons/                # High-DPI extension icons (16px, 32px, 48px, 128px)
├── sitetunnel-v1.3.0.zip # Production-ready Chrome Web Store package (Surfshark edition)
└── README.md             # Project documentation
```

---

## 🚀 Quick Start (Install Locally)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/sitetunnel/sitetunnel.git
   ```
2. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** (top-left) and select the `sitetunnel` folder.
5. Click the **SiteTunnel** icon in your Chrome toolbar to start tunneling!

### 🦈 Surfshark subscriber quick-start

1. Open **Preferences → 🦈 Surfshark Locations**.
2. Click **↻ Refresh** once (pulls live load % for all 142 locations).
3. Click **⚡ Test Speed** — wait ~10-20s, list re-sorts fastest-first.
4. Tap the fastest city (e.g. Singapore 76ms) → **Copy host**.
5. Open **🔗 Dashboard** (`my.surfshark.com/home/dashboard`) → connect the Surfshark app to the *same* city, or **⬇️ .ovpn** for manual WireGuard/OpenVPN setup.
6. Toggle SiteTunnel ON — main screen shows `Surfshark Handoff Active • Connect app → Singapore`.
7. *(Optional true split-tunnel)* Run `gluetun` with Surfshark WireGuard exposing `127.0.0.1:8888`, paste it into *Optional local Surfshark proxy* — now only your chosen sites go through Surfshark, rest stays DIRECT.

---

## 🛒 Chrome Web Store Submission Kit

The ready-to-upload archive is pre-built at:
`sitetunnel-v1.2.0.zip`

### Submission Metadata

- **Title**: `SiteTunnel — Single Site VPN Switcher`
- **Short Name**: `SiteTunnel`
- **Category**: `Productivity` or `Privacy & Security`
- **Short Summary (95/132 chars)**:
  ```text
  Route specific websites through secure cloud tunnel with one click. Clean, instant, and minimalist.
  ```

### Permissions Justification (For Chrome Reviewers)
- **`proxy`**: Required to set PAC (Proxy Auto-Config) rules so only user-designated domains are routed through the cloud tunnel while all other web traffic remains direct.
- **`storage`**: Required to store user preferences locally (target domain list and preferred tunnel region).
- **`tabs`**: Required to capture the active tab's domain when the user clicks the "+ Current Tab" button.

---

## 🛡️ Privacy Policy

**SiteTunnel operates with a strict zero-telemetry policy:**
- **Zero Data Collection**: No logs, no telemetry, no tracking, and no external analytics.
- **Zero Account Requirement**: No signups, passwords, or emails.
- **No Location Tracking**: Silent proximity detection calculates the nearest datacenter locally from your timezone without ever accessing `navigator.geolocation`.
- **Local Storage Only**: Your list of tunneled websites is stored strictly in your browser's local `chrome.storage.local`.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

Built with ❤️ using modern Chrome Extension Manifest V3 standards.
