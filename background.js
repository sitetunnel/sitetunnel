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

async function applyState(on) {
  const config = await getConfig();
  const targetSites = getTargetSites(config);
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

  const condition = targetSites.map(s => `shExpMatch(host, "*${s}*")`).join(" || ");

  // 1. Custom Proxy Mode
  if (provider.id === "custom_proxy") {
    try {
      const rawProxy = (config.customProxyHost || "").trim() || "DIRECT";
      const proxyStr = rawProxy.toUpperCase().startsWith("SOCKS") || rawProxy.toUpperCase().startsWith("PROXY")
        ? rawProxy
        : `PROXY ${rawProxy}`;
      const pacData = `
        function FindProxyForURL(url, host) {
          if (${condition}) {
            return "${proxyStr}; DIRECT";
          }
          return "DIRECT";
        }
      `;
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
    const proxyList = (provider.proxies || []).join("; ");
    const pacData = `
      function FindProxyForURL(url, host) {
        if (${condition}) {
          return "${proxyList}; DIRECT";
        }
        return "DIRECT";
      }
    `;
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

chrome.runtime.onInstalled.addListener(async () => {
  const cur = await chrome.storage.local.get(null);
  if (typeof cur.enabled === "undefined") {
    await chrome.storage.local.set(DEFAULT_CONFIG);
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
        sendResponse({ enabled: true });
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
