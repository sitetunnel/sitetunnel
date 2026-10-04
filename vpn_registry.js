const TUNNEL_LOCATIONS = [
  {
    id: "auto",
    name: "⚡ Auto (Closest Cloud Tunnel)",
    tier: "Automatic Closest Region",
    badge: "Auto Cloud",
    proxies: [] // dynamically populated from closest region
  },
  {
    id: "us",
    name: "🇺🇸 United States (Cloud Tunnel)",
    tier: "US Datacenter (California / New Jersey)",
    badge: "US Cloud",
    proxies: [
      "PROXY 43.173.120.13:8899",
      "PROXY 198.199.86.11:3128",
      "PROXY 108.61.29.163:10001",
      "PROXY 107.167.18.122:443",
      "DIRECT"
    ]
  },
  {
    id: "eu",
    name: "🇪🇺 Europe (Cloud Tunnel)",
    tier: "EU Datacenter (Frankfurt / Amsterdam)",
    badge: "EU Cloud",
    proxies: [
      "PROXY 103.237.102.191:11111",
      "PROXY 161.35.70.249:80",
      "PROXY 95.211.174.135:3128",
      "PROXY 65.109.218.174:8443",
      "DIRECT"
    ]
  },
  {
    id: "sg",
    name: "🇸🇬 Singapore / Asia (Cloud Tunnel)",
    tier: "Asia Datacenter (Singapore / Hong Kong)",
    badge: "Asia Cloud",
    proxies: [
      "PROXY 4.144.146.21:80",
      "PROXY 213.163.198.77:8080",
      "PROXY 165.154.7.156:8888",
      "DIRECT"
    ]
  },
  {
    id: "custom_proxy",
    name: "🛠️ Custom Proxy (SOCKS5 / HTTP)",
    tier: "Host & Port",
    badge: "Custom Proxy",
    proxies: []
  }
];

const ASIA_PACIFIC_COUNTRIES = [
  "BD", "IN", "SG", "JP", "KR", "AU", "NZ", "MY", "TH", "ID", "PH", "VN", "HK", "TW", "CN", "PK", "LK", "NP", "AE", "SA", "QA"
];

const AMERICAS_COUNTRIES = [
  "US", "CA", "MX", "BR", "AR", "CO", "CL", "PE"
];

function getClosestRegionFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("America/")) return "us";
    if (tz.startsWith("Europe/") || tz.startsWith("Africa/")) return "eu";
    if (tz.startsWith("Asia/") || tz.startsWith("Australia/") || tz.startsWith("Pacific/")) return "sg";
  } catch (e) {}
  return "us";
}

function getClosestRegionFromCountry(countryCode) {
  if (!countryCode) return getClosestRegionFromTimezone();
  const c = countryCode.toUpperCase();
  if (ASIA_PACIFIC_COUNTRIES.includes(c)) return "sg";
  if (AMERICAS_COUNTRIES.includes(c)) return "us";
  return "eu";
}

const DEFAULT_CONFIG = {
  enabled: false,
  targetSites: [],
  targetUrl: "",
  vpnProvider: "auto",
  detectedRegion: getClosestRegionFromTimezone(),
  customProxyHost: ""
};

const POPULAR_PRESETS = [
  { name: "ChatGPT", host: "chatgpt.com" },
  { name: "Netflix", host: "netflix.com" },
  { name: "Binance", host: "binance.com" },
  { name: "Reddit", host: "reddit.com" },
  { name: "X / Twitter", host: "x.com" },
  { name: "YouTube", host: "youtube.com" }
];

function getAutoRegion(config) {
  if (config && config.detectedRegion && ["us", "eu", "sg"].includes(config.detectedRegion)) {
    return config.detectedRegion;
  }
  return getClosestRegionFromTimezone();
}

function getProviderInfo(providerId, config) {
  const p = TUNNEL_LOCATIONS.find(item => item.id === providerId) || TUNNEL_LOCATIONS[0];
  if (p.id === "auto") {
    const regionId = getAutoRegion(config);
    const regionObj = TUNNEL_LOCATIONS.find(l => l.id === regionId);
    const regionName = regionId === "us" ? "United States" : (regionId === "eu" ? "Europe" : "Singapore");
    return {
      ...p,
      badge: `Auto (${regionName})`,
      proxies: regionObj ? regionObj.proxies : TUNNEL_LOCATIONS[1].proxies
    };
  }
  return p;
}

function cleanDomain(input) {
  if (!input || typeof input !== "string") return "";
  let str = input.trim().toLowerCase();
  str = str.replace(/^[a-zA-Z]+:\/\//, ""); // remove protocol
  str = str.replace(/\/.*$/, ""); // remove path / queries
  str = str.replace(/^www\./, ""); // remove leading www
  return str.trim();
}

function extractHostname(url) {
  return cleanDomain(url);
}

function getTargetSites(config) {
  if (config && Array.isArray(config.targetSites) && config.targetSites.length > 0) {
    return Array.from(new Set(config.targetSites.map(cleanDomain).filter(Boolean)));
  }
  if (config && config.targetUrl && config.targetUrl.trim()) {
    const h = cleanDomain(config.targetUrl);
    return h ? [h] : [];
  }
  return [];
}
