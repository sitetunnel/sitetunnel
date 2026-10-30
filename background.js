importScripts("vpn_registry.js");

async function getConfig() {
  const data = await chrome.storage.local.get(DEFAULT_CONFIG);
  return { ...DEFAULT_CONFIG, ...data };
}

async function setConfig(updates) {
  const current = await getConfig();
  const next = { ...current, ...updates };
  await chrome.storage.local.set(next);
  return next;
}

async function updateBadge(on) {
  try {
    if (chrome.action) {
      if (on) {
        await chrome.action.setBadgeText({ text: "ON" });
        await chrome.action.setBadgeBackgroundColor({ color: "#30D158" });
      } else {
        await chrome.action.setBadgeText({ text: "" });
      }
    }
  } catch (e) {
    // Non-critical badge update fallback
  }
}

// Silently detect closest region from IP without asking user for location permission
async function updateDetectedRegion() {
  try {
    const resp = await fetch("https://api.country.is", { cache: "no-store" });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.country) {
        const region = getClosestRegionFromCountry(data.country);
        await setConfig({ detectedRegion: region });
        return region;
      }
    }
  } catch (e) {
    // Silent fallback
  }
  const fallback = getClosestRegionFromTimezone();
  await setConfig({ detectedRegion: fallback });
  return fallback;
}

function formatProxyDirective(raw) {
  const s = (raw || "").trim();
  if (!s || s.toUpperCase() === "DIRECT") return "DIRECT";
  const up = s.toUpperCase();
  if (up.startsWith("SOCKS5 ") || up.startsWith("SOCKS ") || up.startsWith("PROXY ") || up.startsWith("HTTPS ")) return s;
  if (up.startsWith("HTTP ")) return "PROXY " + s.slice(5).trim();
  if (s.toLowerCase().startsWith("socks5://")) return `SOCKS5 ${s.slice(9).trim()}`;
  if (s.toLowerCase().startsWith("socks://")) return `SOCKS5 ${s.slice(8).trim()}`;
  if (s.toLowerCase().startsWith("http://")) return `PROXY ${s.slice(7).trim()}`;
  if (s.toLowerCase().startsWith("https://")) return `HTTPS ${s.slice(8).trim()}`;
  return `PROXY ${s}`;
}

function normalizeProxyChain(proxies) {
  const list = (Array.isArray(proxies) ? proxies : [proxies])
    .map(p => formatProxyDirective(p))
    .filter(Boolean);
  const withoutDirect = list.filter(p => p.toUpperCase() !== "DIRECT");
  return [...withoutDirect, "DIRECT"].join("; ");
}

function buildPacData(targetSites, proxyDirectiveList) {
  const checks = targetSites.map(s => {
    const d = cleanDomain(s);
    if (!d) return null;
    return `(host === "${d}" || dnsDomainIs(host, ".${d}"))`;
  }).filter(Boolean);

  const matchExpr = checks.length > 0 ? checks.join(" || ") : "false";

  return `function FindProxyForURL(url, host) {
  if (${matchExpr}) {
    return "${proxyDirectiveList}";
  }
  return "DIRECT";
}`;
}

async function filterHealthyProxies(proxyList) {
  if (!Array.isArray(proxyList) || proxyList.length === 0) return ["DIRECT"];
  const healthy = [];
  const rest = [];

  for (const p of proxyList) {
    if (!p || p === "DIRECT") continue;
    const parts = p.trim().split(/\s+/);
    if (parts.length === 2 && (parts[0].toUpperCase() === "PROXY" || parts[0].toUpperCase() === "HTTP")) {
      const hostPort = parts[1];
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 700);
        await fetch(`http://${hostPort}/`, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
        clearTimeout(tid);
        healthy.push(p);
      } catch (err) {
        rest.push(p);
      }
    } else {
      healthy.push(p);
    }
  }

  const combined = [...healthy, ...rest];
  if (combined.length === 0) return ["DIRECT"];
  return [...combined.slice(0, 2), "DIRECT"];
}

async function applyState(on) {
  const config = await getConfig();
  const rawSites = getTargetSites(config);
  // expand single site to include its CDN/video/API hosts so the whole page loads via the same exit
  let targetSites = rawSites;
  try {
    if (typeof expandTargetSitesForPAC === "function") {
      targetSites = expandTargetSitesForPAC(rawSites);
    }
  } catch (e) { targetSites = rawSites; }
  const provider = getProviderInfo(config.vpnProvider, config);

  if (!on) {
    try {
      await chrome.proxy.settings.clear({ scope: "regular" });
    } catch (e) {}
    return { success: true, enabled: false, provider };
  }

  // Never tunnel all traffic — user must specify sites to tunnel
  if (targetSites.length === 0) {
    try {
      await chrome.proxy.settings.clear({ scope: "regular" });
    } catch (e) {}
    return { success: false, error: "NO_TARGET_SITES", provider };
  }

  // 0. Surfshark subscriber mode (ss:<hostname>)
  if (provider.type === "surfshark" || isSurfsharkProviderId(provider.id)) {
    const user = (config.surfsharkUsername || "").trim();
    const pass = (config.surfsharkPassword || "").trim();
    const localProxy = (config.surfsharkProxyHost || "").trim();
    const host = provider.surfshark && provider.surfshark.host ? provider.surfshark.host : surfsharkHostFromProviderId(provider.id);

    // Priority 1: Direct Paid Surfshark HTTPS Proxy (100% Genuine Surfshark Network IP!)
    if (user && pass && host) {
      try {
        const proxyDirective = `HTTPS ${host}:443; PROXY ${host}:80; DIRECT`;
        const pacData = buildPacData(targetSites, proxyDirective);
        await chrome.proxy.settings.set({
          value: {
            mode: "pac_script",
            pacScript: { data: pacData }
          },
          scope: "regular"
        });
        const cityTxt = provider.surfshark ? surfsharkDisplayName(provider.surfshark) : host;
        return {
          success: true,
          enabled: true,
          provider,
          mode: "surfshark-direct",
          accuracy: "exact",
          exitLabel: `${cityTxt} (Direct Surfshark)`,
          expandedSites: targetSites
        };
      } catch (e) {
        return { success: false, error: "PROXY_ERROR", provider };
      }
    }

    // Priority 2: local Gluetun true split-tunnel
    if (localProxy) {
      try {
        const proxyChain = normalizeProxyChain(localProxy);
        const pacData = buildPacData(targetSites, proxyChain);
        await chrome.proxy.settings.set({
          value: {
            mode: "pac_script",
            pacScript: { data: pacData }
          },
          scope: "regular"
        });
        return { success: true, enabled: true, provider, mode: "surfshark-proxy", accuracy: "exact", expandedSites: targetSites };
      } catch (e) {
        return { success: false, error: "PROXY_ERROR", provider };
      }
    }
    // Priority 3: instant cloud relay — Surfshark city -> closest working verified relay
    try {
      let relayProxies = (provider.proxies && provider.proxies.length)
        ? provider.proxies
        : getRelayProxiesForSurfsharkLocation(provider.surfshark).proxies;
      try {
        relayProxies = await filterHealthyProxies(relayProxies);
      } catch (e) {}
      const proxyList = normalizeProxyChain(relayProxies);
      const pacData = buildPacData(targetSites, proxyList);
      await chrome.proxy.settings.set({
        value: {
          mode: "pac_script",
          pacScript: { data: pacData }
        },
        scope: "regular"
      });
      let exitLabel = provider.exitLabel || "";
      try {
        if (!exitLabel && typeof getExitLabelForRelay === "function") {
          const rid = provider.relayId || getRelayIdForSurfsharkLocation(provider.surfshark);
          exitLabel = getExitLabelForRelay(rid, provider.surfshark);
        }
      } catch (e) {}
      return {
        success: true,
        enabled: true,
        provider,
        mode: "surfshark-relay",
        relayId: provider.relayId || getRelayIdForSurfsharkLocation(provider.surfshark),
        exitLabel: exitLabel,
        accuracy: "approximate",
        expandedSites: targetSites,
        handoff: {
          hostname: provider.surfshark ? provider.surfshark.host : null,
          dashboard: SURFSHARK_DASHBOARD_URL,
          manualSetup: SURFSHARK_MANUAL_SETUP_URL
        }
      };
    } catch (e) {
      return { success: false, error: "PROXY_ERROR", provider };
    }
  }

  // 1. Custom Proxy Mode
  if (provider.id === "custom_proxy") {
    try {
      const proxyChain = normalizeProxyChain(config.customProxyHost);
      const pacData = buildPacData(targetSites, proxyChain);
      await chrome.proxy.settings.set({
        value: {
          mode: "pac_script",
          pacScript: { data: pacData }
        },
        scope: "regular"
      });
      return { success: true, enabled: true, provider };
    } catch (e) {
      return { success: false, error: "PROXY_ERROR", provider };
    }
  }

  // 2. Cloud Tunnel Locations (Auto, US, EU, SG)
  try {
    let cloudProxies = provider.proxies || [];
    try {
      cloudProxies = await filterHealthyProxies(cloudProxies);
    } catch (e) {}
    const proxyList = normalizeProxyChain(cloudProxies);
    const pacData = buildPacData(targetSites, proxyList);
    await chrome.proxy.settings.set({
      value: {
        mode: "pac_script",
        pacScript: { data: pacData }
      },
      scope: "regular"
    });
    return { success: true, enabled: true, provider };
  } catch (e) {
    return { success: false, error: "PROXY_ERROR", provider };
  }
}

if (chrome.webRequest && chrome.webRequest.onAuthRequired) {
  chrome.webRequest.onAuthRequired.addListener(
    (details, callback) => {
      (async () => {
        try {
          const config = await getConfig();
          const user = (config.surfsharkUsername || "").trim();
          const pass = (config.surfsharkPassword || "").trim();
          if (user && pass && details.isProxy) {
            callback({
              authCredentials: {
                username: user,
                password: pass
              }
            });
            return;
          }
        } catch (e) {}
        callback({});
      })();
      return true;
    },
    { urls: ["<all_urls>"] },
    ["asyncBlocking"]
  );
}

chrome.runtime.onInstalled.addListener(async () => {
  const cur = await chrome.storage.local.get(null);
  if (typeof cur.enabled === "undefined") {
    await chrome.storage.local.set(DEFAULT_CONFIG);
  } else {
    // migrate older configs missing new surfshark keys
    const patch = {};
    if (typeof cur.surfsharkUsername === "undefined") patch.surfsharkUsername = "";
    if (typeof cur.surfsharkPassword === "undefined") patch.surfsharkPassword = "";
    if (typeof cur.surfsharkLocation === "undefined") patch.surfsharkLocation = null;
    if (typeof cur.surfsharkProxyHost === "undefined") patch.surfsharkProxyHost = "";
    if (typeof cur.surfsharkLatency === "undefined") patch.surfsharkLatency = {};
    if (typeof cur.surfsharkClustersCache === "undefined") patch.surfsharkClustersCache = [];
    if (typeof cur.surfsharkClustersAt === "undefined") patch.surfsharkClustersAt = 0;
    if (typeof cur.relayHealth === "undefined") patch.relayHealth = {};
    if (Object.keys(patch).length) await chrome.storage.local.set(patch);
  }
  await updateDetectedRegion();
  const config = await getConfig();
  await updateBadge(config.enabled);
});

chrome.runtime.onStartup.addListener(async () => {
  await updateDetectedRegion();
  const config = await getConfig();
  if (config.enabled) {
    const res = await applyState(true);
    if (!res.success) {
      await setConfig({ enabled: false });
      await updateBadge(false);
      return;
    }
  }
  await updateBadge(config.enabled);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;

  if (msg.type === "state") {
    (async () => {
      const config = await getConfig();
      await updateBadge(config.enabled);
      sendResponse({
        enabled: config.enabled,
        config: config
      });
    })();
    return true;
  }

  if (msg.type === "toggle") {
    (async () => {
      const config = await getConfig();
      const nextEnabled = !config.enabled;

      if (nextEnabled) {
        const result = await applyState(true);
        if (!result.success) {
          await setConfig({ enabled: false });
          await updateBadge(false);
          sendResponse({ enabled: false, error: result.error, provider: result.provider });
          return;
        }
        await setConfig({ enabled: true });
        await updateBadge(true);
        sendResponse({ enabled: true, mode: result.mode, handoff: result.handoff, provider: result.provider });
      } else {
        await applyState(false);
        await setConfig({ enabled: false });
        await updateBadge(false);
        sendResponse({ enabled: false });
      }
    })();
    return true;
  }

  if (msg.type === "saveConfig") {
    (async () => {
      const updated = await setConfig(msg.config || {});
      if (updated.enabled) {
        await applyState(true);
      }
      sendResponse({ success: true, config: updated });
    })();
    return true;
  }
});
