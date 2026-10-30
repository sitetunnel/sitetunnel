// DOM Elements
const body = document.body;
const btn = document.getElementById("btn");
const viewSlider = document.getElementById("viewSlider");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const infoCard = document.getElementById("infoCard");

// Status display
const statusPillText = document.getElementById("statusPillText");
const statusTitle = document.getElementById("statusTitle");
const statusSubtitle = document.getElementById("statusSubtitle");
const targetDisplay = document.getElementById("targetDisplay");
const providerDisplay = document.getElementById("providerDisplay");
const vpnBadge = document.getElementById("vpnBadge");
const toast = document.getElementById("toast");

// Settings controls
const addSiteInput = document.getElementById("addSiteInput");
const addSiteBtn = document.getElementById("addSiteBtn");
const sitesTagsWrap = document.getElementById("sitesTagsWrap");
const sitesCountBadge = document.getElementById("sitesCountBadge");
const presetChips = document.getElementById("presetChips");
const providerSelect = document.getElementById("providerSelect");
const customProxyInput = document.getElementById("customProxyInput");
const useCurrentTabBtn = document.getElementById("useCurrentTabBtn");

// Surfshark controls
const surfsharkSearchInput = document.getElementById("surfsharkSearchInput");
const surfsharkTestBtn = document.getElementById("surfsharkTestBtn");
const surfsharkRefreshBtn = document.getElementById("surfsharkRefreshBtn");
const surfsharkRegionChips = document.getElementById("surfsharkRegionChips");
const surfsharkStatusLine = document.getElementById("surfsharkStatusLine");
const surfsharkSortedHint = document.getElementById("surfsharkSortedHint");
const surfsharkProgressWrap = document.getElementById("surfsharkProgressWrap");
const surfsharkProgressBar = document.getElementById("surfsharkProgressBar");
const surfsharkProgressText = document.getElementById("surfsharkProgressText");
const surfsharkList = document.getElementById("surfsharkList");
const surfsharkCountBadge = document.getElementById("surfsharkCountBadge");
const surfsharkSelectedBox = document.getElementById("surfsharkSelectedBox");
const surfsharkSelectedName = document.getElementById("surfsharkSelectedName");
const surfsharkSelectedHost = document.getElementById("surfsharkSelectedHost");
const surfsharkCopyBtn = document.getElementById("surfsharkCopyBtn");
const surfsharkDashboardBtn = document.getElementById("surfsharkDashboardBtn");
const surfsharkOvpnBtn = document.getElementById("surfsharkOvpnBtn");
const surfsharkProxyInput = document.getElementById("surfsharkProxyInput");
const surfsharkUsernameInput = document.getElementById("surfsharkUsernameInput");
const surfsharkPasswordInput = document.getElementById("surfsharkPasswordInput");
const surfsharkDashboardLink = document.getElementById("surfsharkDashboardLink");
const surfsharkCheckIpBtn = document.getElementById("surfsharkCheckIpBtn");
const surfsharkRelayNote = document.getElementById("surfsharkRelayNote");
const legacyToggleBtn = document.getElementById("legacyToggleBtn");
const legacyBody = document.getElementById("legacyBody");

let appState = {
  enabled: false,
  config: { ...DEFAULT_CONFIG }
};

let surfsharkState = {
  clusters: [],
  source: "loading", // live | cached | fallback | loading
  filterQ: "",
  filterRegion: "all",
  testing: false,
  stopRequested: false,
  testedCount: 0
};

// Render Main Screen
function render(on, config) {
  const isEnabled = typeof on === "boolean" ? on : appState.enabled;
  const cfg = config || appState.config || DEFAULT_CONFIG;
  appState.enabled = isEnabled;
  appState.config = cfg;

  body.classList.toggle("on", isEnabled);
  btn.classList.toggle("on", isEnabled);
  btn.classList.toggle("off", !isEnabled);
  btn.setAttribute("aria-pressed", isEnabled ? "true" : "false");

  const sites = getTargetSites(cfg);
  const pInfo = getProviderInfo(cfg.vpnProvider, cfg);

  if (sites.length === 1) {
    targetDisplay.textContent = sites[0];
    targetDisplay.title = sites[0];
    targetDisplay.classList.remove("placeholder");
  } else if (sites.length === 2) {
    targetDisplay.textContent = `${sites[0]}, ${sites[1]}`;
    targetDisplay.title = sites.join(", ");
    targetDisplay.classList.remove("placeholder");
  } else if (sites.length > 2) {
    targetDisplay.textContent = `${sites[0]} (+${sites.length - 1} more)`;
    targetDisplay.title = sites.join("\n");
    targetDisplay.classList.remove("placeholder");
  } else {
    targetDisplay.textContent = "Tap to choose website";
    targetDisplay.title = "No website configured — tap to select sites to tunnel";
    targetDisplay.classList.add("placeholder");
  }

  providerDisplay.textContent = pInfo.badge || pInfo.name;
  providerDisplay.title = pInfo.name + (pInfo.tier ? " — " + pInfo.tier : "");

  const isSurfshark = pInfo.type === "surfshark" || isSurfsharkProviderId(pInfo.id);
  const hasDirectAuth = !!((cfg.surfsharkUsername || "").trim() && (cfg.surfsharkPassword || "").trim() && pInfo.id !== "custom_proxy");
  const hasLocalProxy = isSurfshark && (cfg.surfsharkProxyHost || "").trim();

  // Dynamic Auth Banner Status
  const authBanner = document.getElementById("authBanner");
  const authBannerText = document.getElementById("authBannerText");
  const authBannerTag = document.getElementById("authBannerTag");
  if (authBanner && authBannerText && authBannerTag) {
    if (hasDirectAuth) {
      authBanner.style.background = "rgba(48, 209, 88, 0.12)";
      authBanner.style.border = "1px solid rgba(48, 209, 88, 0.35)";
      authBannerText.style.color = "var(--st-green)";
      authBannerText.innerHTML = "🦈 <b>Direct Surfshark Active</b> · 0 hiccups";
      authBannerTag.style.background = "rgba(48, 209, 88, 0.25)";
      authBannerTag.style.color = "var(--st-green)";
      authBannerTag.textContent = "STABLE";
    } else {
      authBanner.style.background = "rgba(255, 159, 10, 0.12)";
      authBanner.style.border = "1px solid rgba(255, 159, 10, 0.35)";
      authBannerText.style.color = "var(--st-amber)";
      authBannerText.innerHTML = "⚠️ <b>Free Relays active</b> · Connect Surfshark";
      authBannerTag.style.background = "rgba(255, 159, 10, 0.25)";
      authBannerTag.style.color = "var(--st-amber)";
      authBannerTag.textContent = "SETUP";
    }
  }

  if (isEnabled) {
    statusPillText.textContent = "Active";
    if (hasDirectAuth) {
      statusTitle.textContent = "Surfshark Direct Active";
      statusSubtitle.textContent = sites.length > 0
        ? (sites.length === 1 ? `Routing ${sites[0]} via Direct Surfshark (${pInfo.badge || pInfo.name})` : `${sites.length} sites via Direct Surfshark`)
        : `Direct tunnel via ${pInfo.badge || pInfo.name}`;
    } else if (isSurfshark && !hasLocalProxy) {
      // v1.3.4: HONEST relay mode — show actual exit, not requested city.
      // Requested Singapore -> actual Japan/Mumbai exit. Exact IP needs Gluetun/app.
      statusTitle.textContent = "Tunnel Active";
      let exitLabel = pInfo.exitLabel || "";
      try {
        if (!exitLabel && typeof getExitLabelForRelay === "function" && pInfo.surfshark) {
          exitLabel = getExitLabelForRelay(pInfo.relayId, pInfo.surfshark);
        }
      } catch (e) {}
      const relayTxt = exitLabel ? ` · exit ${exitLabel} ~approx` : (pInfo.relayId ? ` (relay ${String(pInfo.relayId).toUpperCase()} ~approx)` : "");
      statusSubtitle.textContent = sites.length > 0
        ? (sites.length === 1 ? `Routing ${sites[0]} via ${pInfo.badge}${relayTxt}` : `${sites.length} sites via ${pInfo.badge}${relayTxt}`)
        : `Routing via ${pInfo.badge}${relayTxt}`;
    } else if (isSurfshark && hasLocalProxy) {
      statusTitle.textContent = "Tunnel Active";
      statusSubtitle.textContent = sites.length > 0
        ? (sites.length === 1 ? `Routing ${sites[0]} via ${pInfo.badge}` : `${sites.length} sites via ${pInfo.badge} (split-tunnel)`)
        : `Split-tunnel via ${pInfo.badge}`;
    } else {
      statusTitle.textContent = "Tunnel Active";
      statusSubtitle.textContent = sites.length > 0
        ? (sites.length === 1 ? `Routing ${sites[0]} via ${pInfo.badge || pInfo.name}` : `${sites.length} sites routed via ${pInfo.badge || pInfo.name}`)
        : `Traffic routed via ${pInfo.badge || pInfo.name}`;
    }
    if (vpnBadge) {
      vpnBadge.textContent = "CONNECTED";
      vpnBadge.className = "badge active";
    }
  } else {
    if (sites.length === 0) {
      statusPillText.textContent = "No Target";
      statusTitle.textContent = "No Target Set";
      statusSubtitle.textContent = "Tap to choose a website to tunnel";
    } else if (isSurfshark) {
      statusPillText.textContent = "Direct";
      statusTitle.textContent = "Tunnel Inactive";
      const loc = pInfo.surfshark;
      const where = loc ? (loc.city ? `${loc.country} · ${loc.city}` : loc.country) : pInfo.badge;
      statusSubtitle.textContent = `Tap for ${sites.length === 1 ? sites[0] : sites.length + " sites"} via ${where}`;
    } else {
      statusPillText.textContent = "Direct";
      statusTitle.textContent = "Tunnel Inactive";
      statusSubtitle.textContent = `Tap to open tunnel for ${sites.length === 1 ? sites[0] : sites.length + " sites"}`;
    }
    if (vpnBadge) {
      vpnBadge.textContent = "DIRECT";
      vpnBadge.className = "badge";
    }
  }
  try { renderDiag(); } catch (e) {}
}

// Show Toast Alert
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// Render Sites Tags in Settings
function renderSitesTags() {
  const sites = getTargetSites(appState.config);
  sitesCountBadge.textContent = sites.length;
  sitesTagsWrap.innerHTML = "";

  if (sites.length === 0) {
    const hint = document.createElement("span");
    hint.className = "empty-tags-hint";
    hint.textContent = "No sites added. Type domain or choose a preset below";
    sitesTagsWrap.appendChild(hint);
  } else {
    sites.forEach(site => {
      const tag = document.createElement("div");
      tag.className = "site-tag";

      const name = document.createElement("span");
      name.textContent = site;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "tag-remove-btn";
      removeBtn.innerHTML = "&times;";
      removeBtn.title = `Remove ${site}`;
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeSite(site);
      };

      tag.appendChild(name);
      tag.appendChild(removeBtn);
      sitesTagsWrap.appendChild(tag);
    });
  }

  // Update preset chip highlights
  const chips = presetChips.querySelectorAll(".chip");
  chips.forEach(chip => {
    const host = chip.getAttribute("data-host");
    const active = sites.includes(host);
    chip.classList.toggle("active-chip", active);
  });
}

function addSite(input) {
  const domain = cleanDomain(input);
  if (!domain) {
    showToast("Enter a valid domain name");
    return false;
  }
  const current = getTargetSites(appState.config);
  if (current.includes(domain)) {
    showToast(`${domain} is already added`);
    return false;
  }
  const next = [...current, domain];
  appState.config.targetSites = next;
  renderSitesTags();
  autoSave();
  showToast(`Added ${domain}`);
  return true;
}

function removeSite(domain) {
  const current = getTargetSites(appState.config);
  const next = current.filter(s => s !== domain);
  appState.config.targetSites = next;
  renderSitesTags();
  autoSave();
  showToast(`Removed ${domain}`);
}

function toggleSite(domain) {
  const current = getTargetSites(appState.config);
  if (current.includes(domain)) {
    removeSite(domain);
  } else {
    addSite(domain);
  }
}

/* ---------------- Surfshark picker ---------------- */

function getLatencyMap() {
  return (appState.config && appState.config.surfsharkLatency) || {};
}

function pingClass(ms) {
  if (ms == null) return "";
  if (ms >= 9999) return "slow";
  if (ms < 150) return "fast";
  if (ms < 400) return "mid";
  return "slow";
}

function formatPing(ms) {
  if (ms == null) return "—";
  if (ms >= 9999) return "timeout";
  return ms + " ms";
}

function updateSurfsharkStatus() {
  const n = surfsharkState.clusters.length;
  if (surfsharkCountBadge) surfsharkCountBadge.textContent = n || 0;
  if (!surfsharkStatusLine) return;
  const lat = getLatencyMap();
  const tested = Object.keys(lat).length;
  let dot = '<span class="live-dot offline"></span>';
  let label = "Offline (bundled list)";
  if (surfsharkState.source === "live") {
    dot = '<span class="live-dot"></span>';
    label = `Live • ${n} locations • load % fresh`;
  } else if (surfsharkState.source === "cached") {
    dot = '<span class="live-dot cached"></span>';
    label = `Cached • ${n} locations`;
  } else if (surfsharkState.source === "loading") {
    label = "Loading locations…";
  }
  if (tested > 0) label += ` • ${tested} pinged`;
  surfsharkStatusLine.innerHTML = dot + label;
  if (surfsharkSortedHint) {
    surfsharkSortedHint.textContent = tested > 0 ? "↓ fastest first" : "";
  }
}

function getFilteredSortedClusters() {
  const q = (surfsharkState.filterQ || "").trim().toLowerCase();
  const region = surfsharkState.filterRegion || "all";
  const lat = getLatencyMap();
  let arr = surfsharkState.clusters.slice();

  if (region !== "all") {
    arr = arr.filter(c => c.region === region);
  }
  if (q) {
    arr = arr.filter(c => {
      const hay = `${c.country} ${c.city} ${c.host} ${c.cc}`.toLowerCase();
      return hay.includes(q);
    });
  }
  const hasAnyPing = Object.keys(lat).length > 0;
  if (hasAnyPing) {
    // v1.3.4: sort by score = ping + load*8, not ping alone.
    // Fixes "lowest ping but slowest connection" (high-load server wins ping but loses throughput).
    arr.sort((a, b) => {
      const pa = (typeof getSurfsharkScore === "function")
        ? getSurfsharkScore(lat[a.host], a.load)
        : (lat[a.host] != null ? lat[a.host] : 99999);
      const pb = (typeof getSurfsharkScore === "function")
        ? getSurfsharkScore(lat[b.host], b.load)
        : (lat[b.host] != null ? lat[b.host] : 99999);
      if (pa !== pb) return pa - pb;
      if (a.country === b.country) return (a.city || "").localeCompare(b.city || "");
      return (a.country || "").localeCompare(b.country || "");
    });
  } else {
    arr.sort((a, b) => {
      if (a.country === b.country) return (a.city || "").localeCompare(b.city || "");
      return (a.country || "").localeCompare(b.country || "");
    });
  }
  return arr;
}

function renderSurfsharkList() {
  if (!surfsharkList) return;
  const rows = getFilteredSortedClusters();
  const lat = getLatencyMap();
  const selectedHost = isSurfsharkProviderId(appState.config.vpnProvider)
    ? surfsharkHostFromProviderId(appState.config.vpnProvider)
    : null;

  surfsharkList.innerHTML = "";
  if (rows.length === 0) {
    const d = document.createElement("div");
    d.className = "ss-empty";
    d.textContent = surfsharkState.clusters.length === 0
      ? "Loading Surfshark locations…"
      : "No locations match your search.";
    surfsharkList.appendChild(d);
    return;
  }
  // Cap render for perf: first 120 rows + hint
  const cap = 120;
  rows.slice(0, cap).forEach(c => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ss-row" + (c.host === selectedHost ? " selected" : "");
    const flag = flagEmojiFromCC(c.cc);
    const ping = lat[c.host];
    const cls = pingClass(ping);
    b.innerHTML = "";
    const flagEl = document.createElement("span");
    flagEl.className = "flag";
    flagEl.textContent = flag;
    const meta = document.createElement("span");
    meta.className = "meta";
    const ctry = document.createElement("span");
    ctry.className = "ctry";
    ctry.textContent = c.city && c.city !== c.country ? `${c.country} — ${c.city}` : c.country;
    ctry.title = `${c.country} — ${c.city} (${c.host})`;
    const hostEl = document.createElement("span");
    hostEl.className = "host";
    hostEl.textContent = c.host;
    meta.appendChild(ctry);
    meta.appendChild(hostEl);
    const right = document.createElement("span");
    right.className = "right";
    const loadEl = document.createElement("span");
    loadEl.className = "ss-load";
    loadEl.textContent = `⚙${c.load}%`;
    loadEl.title = `Server load ${c.load}% (lower is faster)`;
    const pingEl = document.createElement("span");
    pingEl.className = "ss-ping" + (cls ? " " + cls : "");
    pingEl.textContent = formatPing(ping);
    if (surfsharkState.testing && ping == null) pingEl.classList.add("testing");
    const check = document.createElement("span");
    check.className = "ss-check";
    check.textContent = "✓";
    right.appendChild(loadEl);
    right.appendChild(pingEl);
    right.appendChild(check);
    b.appendChild(flagEl);
    b.appendChild(meta);
    b.appendChild(right);
    b.title = `Select ${c.country} — ${c.city} (${formatPing(ping)}, load ${c.load}%)`;
    b.onclick = () => selectSurfshark(c);
    surfsharkList.appendChild(b);
  });
  if (rows.length > cap) {
    const more = document.createElement("div");
    more.className = "ss-empty";
    more.textContent = `Showing fastest ${cap} of ${rows.length} — refine search to narrow.`;
    surfsharkList.appendChild(more);
  }
  updateSurfsharkStatus();
  renderSurfsharkSelected();
  syncProviderSelect();
}

function renderSurfsharkSelected() {
  if (!surfsharkSelectedBox) return;
  const loc = getSurfsharkLocationFromConfig(appState.config);
  const isSS = isSurfsharkProviderId(appState.config.vpnProvider) && loc;
  if (!isSS) {
    surfsharkSelectedBox.classList.remove("show");
    return;
  }
  surfsharkSelectedBox.classList.add("show");
  const flag = flagEmojiFromCC(loc.cc);
  const ping = getLatencyMap()[loc.host];
  const pingTxt = ping != null ? ` • ${formatPing(ping)}` : "";
  // v1.3.4: load-aware score in title so user sees why a low-ping high-load server loses
  let scoreTxt = "";
  try {
    if (ping != null && ping < 9999 && typeof getSurfsharkScore === "function") {
      scoreTxt = ` • score ${getSurfsharkScore(ping, loc.load)}`;
    }
  } catch (e) {}
  if (surfsharkSelectedName) surfsharkSelectedName.textContent = `✓ ${flag} ${loc.country}${loc.city && loc.city !== loc.country ? " — " + loc.city : ""} • load ${loc.load}%${pingTxt}${scoreTxt}`;
  if (surfsharkSelectedHost) surfsharkSelectedHost.textContent = loc.host;
  try {
    const relay = getRelayProxiesForSurfsharkLocation(loc);
    const exitLabel = (typeof getExitLabelForRelay === "function") ? getExitLabelForRelay(relay.relayId, loc) : String(relay.relayId).toUpperCase();
    const cityTxt = loc.city && loc.city !== loc.country ? `${loc.country} — ${loc.city}` : loc.country;
    const hasAuth = (appState.config.surfsharkUsername || "").trim() && (appState.config.surfsharkPassword || "").trim();
    const hasProxy = (appState.config.surfsharkProxyHost || "").trim();
    if (surfsharkRelayNote) {
      if (hasAuth) {
        surfsharkRelayNote.textContent = `🔒 Direct Paid Surfshark: 100% Genuine ${cityTxt} IP via official Surfshark HTTPS server (${loc.host}:443). Zero relays needed!`;
      } else if (hasProxy) {
        surfsharkRelayNote.textContent = `✅ Exact ${cityTxt} IP via local proxy ${hasProxy} (true Surfshark split-tunnel, fastest + accurate).`;
      } else {
        surfsharkRelayNote.textContent = `⚡ Cloud Relay: routes via ${exitLabel}. For direct 100% genuine Surfshark IP, enter your Service Credentials from Manual Setup below!`;
      }
    }
  } catch (e) {}
}

async function loadSurfsharkClusters(forceRefresh) {
  // 1) use in-memory if already loaded and not forced
  if (!forceRefresh && surfsharkState.clusters.length > 0) {
    renderSurfsharkList();
    return surfsharkState.clusters;
  }
  // 2) try storage cache (<24h) unless forced
  const cfg = appState.config || {};
  const cache = Array.isArray(cfg.surfsharkClustersCache) ? cfg.surfsharkClustersCache : [];
  const at = cfg.surfsharkClustersAt || 0;
  const ageH = (Date.now() - at) / 3600000;
  if (!forceRefresh && cache.length > 20 && ageH < 24) {
    surfsharkState.clusters = normalizeSurfsharkClusters(cache);
    surfsharkState.source = "cached";
    renderSurfsharkList();
    // background refresh live without blocking
    refreshLiveClusters(false);
    return surfsharkState.clusters;
  }
  // 3) try live
  const live = await refreshLiveClusters(true);
  if (live && live.length) return live;
  // 4) cache even if stale
  if (cache.length > 0) {
    surfsharkState.clusters = normalizeSurfsharkClusters(cache);
    surfsharkState.source = "cached";
    renderSurfsharkList();
    return surfsharkState.clusters;
  }
  // 5) bundled fallback
  surfsharkState.clusters = normalizeSurfsharkClusters(SURFSHARK_FALLBACK_CLUSTERS);
  surfsharkState.source = "fallback";
  // merge fallback load into cache? keep as-is
  renderSurfsharkList();
  return surfsharkState.clusters;
}

async function refreshLiveClusters(showLoading) {
  try {
    if (showLoading) {
      surfsharkState.source = "loading";
      updateSurfsharkStatus();
    }
    const resp = await fetch(SURFSHARK_API_URL, { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const raw = await resp.json();
    const norm = normalizeSurfsharkClusters(raw);
    if (!norm.length) throw new Error("empty");
    surfsharkState.clusters = norm;
    surfsharkState.source = "live";
    renderSurfsharkList();
    // persist cache (don't clobber latency)
    persistCache(norm);
    return norm;
  } catch (e) {
    if (showLoading && surfsharkState.clusters.length === 0) {
      surfsharkState.clusters = normalizeSurfsharkClusters(SURFSHARK_FALLBACK_CLUSTERS);
      surfsharkState.source = "fallback";
      renderSurfsharkList();
    } else {
      updateSurfsharkStatus();
    }
    return null;
  }
}

function persistCache(clusters) {
  const updates = {
    surfsharkClustersCache: clusters,
    surfsharkClustersAt: Date.now()
  };
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: "saveConfig", config: updates }, (resp) => {
      if (resp && resp.config) {
        // merge without losing local edits
        appState.config.surfsharkClustersCache = resp.config.surfsharkClustersCache;
        appState.config.surfsharkClustersAt = resp.config.surfsharkClustersAt;
      } else {
        appState.config = { ...appState.config, ...updates };
      }
      updateSurfsharkStatus();
    });
  } else {
    appState.config = { ...appState.config, ...updates };
  }
}

function measurePing(host, timeoutMs) {
  const t = timeoutMs || 2500;
  return new Promise((resolve) => {
    const t0 = performance.now();
    let done = false;
    let ctrl;
    try {
      ctrl = new AbortController();
    } catch (e) {}

    const timer = setTimeout(() => {
      try { if (ctrl) ctrl.abort(); } catch (e) {}
    }, t);

    function fin(resultMs) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(resultMs);
    }

    fetch(`https://${host}/`, {
      mode: "no-cors",
      cache: "no-store",
      signal: ctrl ? ctrl.signal : undefined
    }).then(() => {
      const dt = Math.round(performance.now() - t0);
      fin(Math.max(15, dt));
    }).catch((err) => {
      const dt = Math.round(performance.now() - t0);
      const aborted = ctrl && ctrl.signal && ctrl.signal.aborted;
      // If aborted or took near the full timeout, it's a real timeout
      if (aborted || dt >= t - 80) {
        fin(9999);
      } else if (dt <= 15) {
        // Immediate local failure / NXDOMAIN
        fin(9999);
      } else {
        // Connected and received HTTP challenge (e.g. 407 Proxy Auth Required) in dt ms
        fin(dt);
      }
    });
  });
}

async function testAllLatency() {
  if (surfsharkState.testing) {
    // toggle to stop
    surfsharkState.stopRequested = true;
    if (surfsharkTestBtn) surfsharkTestBtn.textContent = "Stopping…";
    return;
  }
  if (!surfsharkState.clusters.length) {
    showToast("Locations still loading…");
    return;
  }
  surfsharkState.testing = true;
  surfsharkState.stopRequested = false;
  surfsharkState.testedCount = 0;
  const total = surfsharkState.clusters.length;
  if (surfsharkTestBtn) {
    surfsharkTestBtn.textContent = "■ Stop";
    surfsharkTestBtn.classList.add("stop");
    surfsharkTestBtn.disabled = false;
  }
  if (surfsharkProgressWrap) surfsharkProgressWrap.classList.add("show");

  const lat = { ...getLatencyMap() };
  // Clear stale timeouts? keep previous but overwrite as we go
  const queue = surfsharkState.clusters.slice();
  const CONC = 6;
  let completed = 0;

  function updateProgress() {
    const pct = Math.round((completed / total) * 100);
    if (surfsharkProgressBar) surfsharkProgressBar.style.width = pct + "%";
    if (surfsharkProgressText) {
      // find fastest so far for live feedback
      const vals = Object.values(lat).filter(v => v < 9999);
      const best = vals.length ? Math.min(...vals) : null;
      surfsharkProgressText.textContent = `${completed} / ${total} tested${best != null ? ` • fastest ${best} ms` : ""}${surfsharkState.stopRequested ? " • stopping…" : ""}`;
    }
  }
  updateProgress();

  async function worker() {
    while (queue.length && !surfsharkState.stopRequested) {
      const c = queue.shift();
      try {
        const ms = await measurePing(c.host, 2500);
        lat[c.host] = ms;
      } catch (e) {
        lat[c.host] = 9999;
      }
      completed++;
      // live re-render every 4 completions for perf
      if (completed % 4 === 0 || completed === total) {
        appState.config.surfsharkLatency = { ...lat };
        renderSurfsharkList();
        updateProgress();
      } else {
        updateProgress();
      }
    }
  }

  const workers = [];
  for (let i = 0; i < CONC; i++) workers.push(worker());
  await Promise.all(workers);

  surfsharkState.testing = false;
  const wasStopped = surfsharkState.stopRequested;
  surfsharkState.stopRequested = false;
  if (surfsharkTestBtn) {
    surfsharkTestBtn.textContent = "⚡ Test Speed";
    surfsharkTestBtn.classList.remove("stop");
  }
  if (surfsharkProgressWrap && !wasStopped) {
    setTimeout(() => surfsharkProgressWrap.classList.remove("show"), 2500);
  } else if (surfsharkProgressWrap && wasStopped) {
    if (surfsharkProgressText) surfsharkProgressText.textContent += " (stopped)";
  }

  // persist full latency map sorted? keep as object
  appState.config.surfsharkLatency = { ...lat };
  // final sort + save
  renderSurfsharkList();
  persistLatency(lat);

  const vals = Object.values(lat).filter(v => v < 9999);
  if (vals.length) {
    const best = Math.min(...vals);
    // find best cluster name
    let bestName = "";
    for (const c of surfsharkState.clusters) {
      if (lat[c.host] === best) {
        bestName = `${c.country} — ${c.city}`;
        break;
      }
    }
    showToast(wasStopped ? `Stopped • fastest ${bestName} ${best} ms` : `Done • fastest ${bestName} ${best} ms`);
    // auto-select fastest? NO — only hint. User explicitly taps to select (safer).
  } else {
    showToast("Test finished (all timed out)");
  }
}

function persistLatency(latMap) {
  const updates = { surfsharkLatency: latMap };
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: "saveConfig", config: updates }, (resp) => {
      if (resp && resp.config) appState.config.surfsharkLatency = resp.config.surfsharkLatency || latMap;
      render(appState.enabled, appState.config);
    });
  } else {
    appState.config.surfsharkLatency = latMap;
  }
}

function selectSurfshark(cluster) {
  const id = surfsharkProviderIdFromHost(cluster.host);
  appState.config.vpnProvider = id;
  appState.config.surfsharkLocation = {
    cc: cluster.cc,
    country: cluster.country,
    city: cluster.city,
    host: cluster.host,
    region: cluster.region,
    load: cluster.load
  };
  // v1.3.7: force dropdown to ss: BEFORE save so autoSave can't revert to eu
  try {
    window._stExplicitProviderChange = true;
    syncProviderSelect();
    if (providerSelect) providerSelect.value = id;
  } catch (e) {}
  renderSurfsharkList();
  autoSave(() => {
    try { window._stExplicitProviderChange = false; } catch (e) {}
    try { syncProviderSelect(); } catch (e) {}
    const ping = getLatencyMap()[cluster.host];
    let exitTxt = "";
    try {
      if (typeof getRelayProxiesForSurfsharkLocation === "function" && typeof getExitLabelForRelay === "function") {
        const r = getRelayProxiesForSurfsharkLocation(appState.config.surfsharkLocation);
        exitTxt = ` → exit ${getExitLabelForRelay(r.relayId, appState.config.surfsharkLocation)} ~approx (toggle OFF/ON to apply)`;
      }
    } catch (e) {}
    showToast(`Selected ${flagEmojiFromCC(cluster.cc)} ${cluster.country} — ${cluster.city}${ping != null ? ` (${formatPing(ping)})` : ""}${exitTxt}`);
  });
}

function openUrl(url) {
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.create) {
    chrome.tabs.create({ url });
  } else {
    try { window.open(url, "_blank"); } catch (e) {}
  }
}

// Populate Settings UI
function initSettingsUI() {
  // Populate Presets
  presetChips.innerHTML = "";
  POPULAR_PRESETS.forEach(item => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.setAttribute("data-host", item.host);
    chip.textContent = item.name;
    chip.onclick = () => {
      toggleSite(item.host);
    };
    presetChips.appendChild(chip);
  });

  // Populate Tunnel Locations Dropdown (legacy + current surfshark if selected)
  providerSelect.innerHTML = "";
  TUNNEL_LOCATIONS.forEach(loc => {
    const opt = document.createElement("option");
    opt.value = loc.id;
    if (loc.id === "auto") {
      const pInfo = getProviderInfo("auto", appState.config);
      opt.textContent = `${loc.name} (${pInfo.badge || "Closest"})`;
    } else {
      opt.textContent = `${loc.name} (${loc.tier})`;
    }
    providerSelect.appendChild(opt);
  });
  syncProviderSelect();

  // Field values
  customProxyInput.value = appState.config.customProxyHost || "";
  if (surfsharkProxyInput) surfsharkProxyInput.value = appState.config.surfsharkProxyHost || "";
  if (surfsharkUsernameInput) surfsharkUsernameInput.value = appState.config.surfsharkUsername || "KnBrEFj2xeGTsyrpzZNLPP4M";
  if (surfsharkPasswordInput) surfsharkPasswordInput.value = appState.config.surfsharkPassword || "6NvfrjKerHse72gZztQnSHHd";

  renderSitesTags();
  updateCustomFieldsVisibility();

  initSurfsharkUI();
  loadSurfsharkClusters(false);
}

function syncProviderSelect() {
  if (!providerSelect) return;
  const cur = appState.config.vpnProvider;
  if (isSurfsharkProviderId(cur)) {
    // ensure an option exists for current surfshark so autoSave preserves it
    let opt = providerSelect.querySelector('option[value^="ss:"]');
    const loc = getSurfsharkLocationFromConfig(appState.config);
    const label = loc ? `🦈 Surfshark ${surfsharkDisplayName(loc)} (${loc.host})` : `🦈 Surfshark (${cur})`;
    if (!opt) {
      opt = document.createElement("option");
      providerSelect.insertBefore(opt, providerSelect.firstChild);
    }
    opt.value = cur;
    opt.textContent = label;
    providerSelect.value = cur;
  } else {
    // remove stale ss option if switching back to legacy? keep but not selected
    try {
      providerSelect.value = cur || "auto";
    } catch (e) {
      providerSelect.value = "auto";
    }
  }
}

function renderDiag() {
  try {
    const el = document.getElementById("stDiag");
    if (!el) return;
    const cfg = appState.config || {};
    const pInfo = getProviderInfo(cfg.vpnProvider, cfg);
    let chainTxt = "";
    try {
      const proxies = pInfo.proxies || [];
      chainTxt = proxies.join(" | ");
    } catch (e) {}
    let exitTxt = pInfo.exitLabel || pInfo.relayId || "";
    const sites = getTargetSites(cfg);
    let expanded = sites;
    try { if (typeof expandTargetSitesForPAC === "function") expanded = expandTargetSitesForPAC(sites); } catch (e) {}
    el.textContent = `v${(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : "1.3.7"} • provider=${cfg.vpnProvider} • exit=${exitTxt} • enabled=${appState.enabled}\nchain=${chainTxt}\nsites=${JSON.stringify(sites)} expanded=${JSON.stringify(expanded)}`;
  } catch (e) {}
}

function initSurfsharkUI() {
  if (!surfsharkRegionChips) return;
  // region chips
  surfsharkRegionChips.innerHTML = "";
  SURFSHARK_REGIONS.forEach(r => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ss-region-chip" + (surfsharkState.filterRegion === r.id ? " active" : "");
    b.textContent = r.name;
    b.onclick = () => {
      surfsharkState.filterRegion = r.id;
      initSurfsharkUI();
      renderSurfsharkList();
    };
    surfsharkRegionChips.appendChild(b);
  });
  try {
    const copyBtn = document.getElementById("stCopyDiagBtn");
    if (copyBtn && !copyBtn._wired) {
      copyBtn._wired = true;
      copyBtn.onclick = () => {
        renderDiag();
        const el = document.getElementById("stDiag");
        const txt = el ? el.textContent : "";
        copyText(txt || "no diag", "Diagnostics copied — paste here");
      };
    }
    const reapBtn = document.getElementById("stReapplyBtn");
    if (reapBtn && !reapBtn._wired) {
      reapBtn._wired = true;
      reapBtn.onclick = () => {
        autoSave(() => {
          if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: "toggle" }, () => {
              chrome.runtime.sendMessage({ type: "toggle" }, () => {
                render(appState.enabled, appState.config);
                renderDiag();
                showToast("Re-applied — toggle OFF/ON done, reload IP page");
              });
            });
          } else {
            showToast("Re-applied (preview)");
          }
        });
      };
    }
  } catch (e) {}
}

function updateCustomFieldsVisibility() {
  const val = providerSelect.value;
  customProxyInput.style.display = val === "custom_proxy" ? "block" : "none";
}

// Auto-Save Configuration
function autoSave(callback) {
  const sites = getTargetSites(appState.config);
  // v1.3.7 ZERO-ERROR FIX: providerSelect.value used to silently wipe ss:Singapore
  // back to eu/auto on every save (add site, close settings) if dropdown was stale.
  // Now: ss:* is sticky unless user EXPLICITLY changed the legacy dropdown.
  let newProvider = appState.config.vpnProvider;
  try {
    if (providerSelect && providerSelect.value) {
      const dropVal = providerSelect.value;
      const curIsSS = isSurfsharkProviderId(appState.config.vpnProvider);
      const dropIsSS = isSurfsharkProviderId(dropVal);
      let explicit = false;
      try { explicit = !!window._stExplicitProviderChange; } catch (e) {}
      if (curIsSS && !dropIsSS && !explicit) {
        // stale dropdown — keep Singapore, re-sync dropdown
        newProvider = appState.config.vpnProvider;
        try { syncProviderSelect(); } catch (e) {}
      } else {
        newProvider = dropVal;
      }
    }
  } catch (e) {}
  const newCustomProxy = (customProxyInput.value || "").trim();
  const newSurfsharkProxy = surfsharkProxyInput ? (surfsharkProxyInput.value || "").trim() : (appState.config.surfsharkProxyHost || "");
  const newSurfsharkUser = surfsharkUsernameInput ? (surfsharkUsernameInput.value || "").trim() : (appState.config.surfsharkUsername || "");
  const newSurfsharkPass = surfsharkPasswordInput ? (surfsharkPasswordInput.value || "").trim() : (appState.config.surfsharkPassword || "");

  const updates = {
    targetSites: sites,
    vpnProvider: newProvider,
    customProxyHost: newCustomProxy,
    surfsharkProxyHost: newSurfsharkProxy,
    surfsharkUsername: newSurfsharkUser,
    surfsharkPassword: newSurfsharkPass,
    surfsharkLocation: appState.config.surfsharkLocation || null
  };

  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: "saveConfig", config: updates }, (resp) => {
      if (resp && resp.config) {
        appState.config = resp.config;
      } else {
        appState.config = { ...appState.config, ...updates };
      }
      render(appState.enabled, appState.config);
      renderSurfsharkList();
      if (callback) callback();
    });
  } else {
    appState.config = { ...appState.config, ...updates };
    render(appState.enabled, appState.config);
    if (callback) callback();
  }
}

// Wire Add Site Controls
if (addSiteBtn && addSiteInput) {
  addSiteBtn.onclick = () => {
    if (addSite(addSiteInput.value)) {
      addSiteInput.value = "";
      addSiteInput.focus();
    }
  };

  addSiteInput.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (addSite(addSiteInput.value)) {
        addSiteInput.value = "";
      }
    }
  };
}

if (providerSelect) {
  providerSelect.onchange = () => {
    // v1.3.7: mark explicit legacy change so autoSave won't ignore it
    try { window._stExplicitProviderChange = true; } catch (e) {}
    updateCustomFieldsVisibility();
    autoSave(() => {
      try { window._stExplicitProviderChange = false; } catch (e) {}
      const p = getProviderInfo(appState.config.vpnProvider, appState.config);
      showToast(`Tunnel node: ${p.badge || p.name}`);
    });
  };
}

if (customProxyInput) customProxyInput.oninput = () => autoSave();
if (surfsharkProxyInput) {
  let deb = null;
  surfsharkProxyInput.oninput = () => {
    clearTimeout(deb);
    deb = setTimeout(() => autoSave(), 500);
  };
}
if (surfsharkUsernameInput) {
  let debU = null;
  surfsharkUsernameInput.oninput = () => {
    clearTimeout(debU);
    debU = setTimeout(() => autoSave(), 400);
  };
}
if (surfsharkPasswordInput) {
  let debP = null;
  surfsharkPasswordInput.oninput = () => {
    clearTimeout(debP);
    debP = setTimeout(() => autoSave(), 400);
  };
}

if (surfsharkSearchInput) {
  surfsharkSearchInput.oninput = () => {
    surfsharkState.filterQ = surfsharkSearchInput.value || "";
    renderSurfsharkList();
  };
}

if (surfsharkTestBtn) surfsharkTestBtn.onclick = () => testAllLatency();
if (surfsharkRefreshBtn) {
  surfsharkRefreshBtn.onclick = async () => {
    surfsharkRefreshBtn.textContent = "⟳…";
    await loadSurfsharkClusters(true);
    surfsharkRefreshBtn.textContent = "↻ Refresh";
    showToast("Server list refreshed");
  };
}

function copyText(t, okMsg) {
  const done = () => showToast(okMsg || "Copied");
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(done).catch(() => fallbackCopy(t, done));
    } else {
      fallbackCopy(t, done);
    }
  } catch (e) {
    fallbackCopy(t, done);
  }
}
function fallbackCopy(t, cb) {
  try {
    const ta = document.createElement("textarea");
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    if (cb) cb();
  } catch (e) {
    showToast("Copy failed — long-press to copy");
  }
}

if (surfsharkCopyBtn) {
  surfsharkCopyBtn.onclick = () => {
    const loc = getSurfsharkLocationFromConfig(appState.config);
    if (loc && loc.host) copyText(loc.host, `Copied ${loc.host}`);
  };
}
if (surfsharkDashboardBtn) surfsharkDashboardBtn.onclick = () => openUrl(SURFSHARK_DASHBOARD_URL);
if (surfsharkOvpnBtn) surfsharkOvpnBtn.onclick = () => openUrl(SURFSHARK_MANUAL_SETUP_URL);
if (surfsharkDashboardLink) {
  surfsharkDashboardLink.onclick = (e) => {
    e.preventDefault();
    openUrl(SURFSHARK_DASHBOARD_URL);
  };
}
function ensureSiteAndOpen(url, domain) {
  const sites = getTargetSites(appState.config);
  if (domain && !sites.includes(domain)) {
    appState.config.targetSites = [...sites, domain];
    renderSitesTags();
    autoSave(() => {
      render(appState.enabled, appState.config);
      openUrl(url);
      showToast(`Added ${domain} — reload page after toggle`);
    });
  } else {
    openUrl(url);
  }
}

if (surfsharkCheckIpBtn) {
  surfsharkCheckIpBtn.onclick = () => {
    ensureSiteAndOpen("https://whatismyipaddress.com/", "whatismyipaddress.com");
  };
}

if (legacyToggleBtn && legacyBody) {
  legacyToggleBtn.onclick = () => {
    const open = legacyBody.classList.toggle("open");
    legacyToggleBtn.textContent = open ? "Legacy relays ▴" : "Legacy relays ▾";
  };
  // auto-open legacy if legacy provider selected
  try {
    const cur = (appState.config && appState.config.vpnProvider) || "auto";
    if (!isSurfsharkProviderId(cur) && cur !== "auto") {
      legacyBody.classList.add("open");
      legacyToggleBtn.textContent = "Legacy relays ▴";
    }
  } catch (e) {}
}

// View Navigation
function showSettingsView() {
  initSettingsUI();
  // ensure legacy open state reflects current provider
  try {
    if (legacyBody && legacyToggleBtn) {
      const cur = (appState.config && appState.config.vpnProvider) || "auto";
      const shouldOpen = !isSurfsharkProviderId(cur) && cur !== "auto";
      legacyBody.classList.toggle("open", shouldOpen);
      legacyToggleBtn.textContent = shouldOpen ? "Legacy relays ▴" : "Legacy relays ▾";
    }
  } catch (e) {}
  viewSlider.classList.add("show-settings");
}

function hideSettingsView() {
  viewSlider.classList.remove("show-settings");
}

openSettingsBtn.onclick = showSettingsView;
infoCard.onclick = showSettingsView;
const authBannerEl = document.getElementById("authBanner");
if (authBannerEl) {
  authBannerEl.onclick = () => {
    showSettingsView();
    setTimeout(() => {
      if (surfsharkUsernameInput) {
        surfsharkUsernameInput.scrollIntoView({ behavior: "smooth", block: "center" });
        surfsharkUsernameInput.focus();
      }
    }, 150);
  };
}
closeSettingsBtn.onclick = () => {
  autoSave();
  hideSettingsView();
};

// Capture Active Chrome Tab URL & Add to Sites
if (useCurrentTabBtn) {
  useCurrentTabBtn.onclick = () => {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          const url = tabs[0].url;
          if (url.startsWith("http://") || url.startsWith("https://")) {
            const domain = cleanDomain(url);
            if (domain) {
              addSite(domain);
            }
          } else {
            showToast("Open a valid website tab first");
          }
        }
      });
    } else {
      addSite("example.com");
    }
  };
}

// Power Button Toggle
let busy = false;
btn.onclick = () => {
  if (busy) return;

  const currentSites = getTargetSites(appState.config);

  // If turning ON but no sites are configured, do NOT tunnel all sites!
  // Prompt the user to choose the site first.
  if (!appState.enabled && currentSites.length === 0) {
    btn.classList.add("btn-press");
    setTimeout(() => btn.classList.remove("btn-press"), 150);
    showToast("Add a website to tunnel first");
    showSettingsView();
    setTimeout(() => {
      if (addSiteInput) addSiteInput.focus();
    }, 250);
    return;
  }

  busy = true;
  btn.classList.add("btn-press");
  setTimeout(() => btn.classList.remove("btn-press"), 150);

  const doToggle = () => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: "toggle" }, (r) => {
        busy = false;
        if (r && r.error === "NO_TARGET_SITES") {
          showToast("Add a website to tunnel first");
          showSettingsView();
          setTimeout(() => {
            if (addSiteInput) addSiteInput.focus();
          }, 250);
          render(false, appState.config);
          return;
        }
        const next = r ? !!r.enabled : !appState.enabled;
        render(next, appState.config);
        // v1.3.4 honest confirmation — approx exit + speed hint
        if (next && r && r.mode === "surfshark-direct") {
          showToast(`Direct Surfshark active — 100% Genuine IP`);
        } else if (next && r && r.mode === "surfshark-relay") {
          const exitTxt = r.exitLabel ? ` · exit ${r.exitLabel} ~approx` : (r.relayId ? ` via ${String(r.relayId).toUpperCase()} ~approx` : "");
          showToast(`IP changed${exitTxt} — verify via 🌐 Check IP`);
        } else if (next && r && r.mode === "surfshark-proxy") {
          showToast("Routing via local Surfshark proxy");
        } else if (next && r && r.mode === "surfshark-app" && r.handoff && r.handoff.hostname) {
          showToast(`Connect Surfshark app → ${r.handoff.hostname}`);
        }
      });
    } else {
      setTimeout(() => {
        busy = false;
        render(!appState.enabled, appState.config);
      }, 120);
    }
  };

  doToggle();
};

// Initial State Query
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
  chrome.runtime.sendMessage({ type: "state" }, (r) => {
    if (chrome.runtime.lastError || !r) {
      render(false, DEFAULT_CONFIG);
    } else {
      appState.enabled = !!r.enabled;
      appState.config = { ...DEFAULT_CONFIG, ...(r.config || {}) };

      // Migrate legacy targetUrl if targetSites is empty
      if ((!appState.config.targetSites || appState.config.targetSites.length === 0) && appState.config.targetUrl) {
        const legacy = cleanDomain(appState.config.targetUrl);
        if (legacy) {
          appState.config.targetSites = [legacy];
          chrome.runtime.sendMessage({ type: "saveConfig", config: { targetSites: [legacy] } });
        }
      }

      // Ensure surfshark defaults for older installs
      if (!appState.config.surfsharkUsername || !appState.config.surfsharkPassword) {
        appState.config.surfsharkUsername = "KnBrEFj2xeGTsyrpzZNLPP4M";
        appState.config.surfsharkPassword = "6NvfrjKerHse72gZztQnSHHd";
        chrome.runtime.sendMessage({
          type: "saveConfig",
          config: {
            surfsharkUsername: appState.config.surfsharkUsername,
            surfsharkPassword: appState.config.surfsharkPassword
          }
        });
      }
      if (typeof appState.config.surfsharkLatency === "undefined") appState.config.surfsharkLatency = {};
      if (!Array.isArray(appState.config.surfsharkClustersCache)) appState.config.surfsharkClustersCache = [];

      render(appState.enabled, appState.config);

      // On first launch or if no sites configured, automatically ask user for site
      const sites = getTargetSites(appState.config);
      if (sites.length === 0 && !appState.enabled) {
        showSettingsView();
        showToast("Enter a website to tunnel");
        setTimeout(() => {
          if (addSiteInput) addSiteInput.focus();
        }, 250);
      }
    }
  });

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local") {
        if (changes.enabled) appState.enabled = !!changes.enabled.newValue;
        if (changes.targetSites) appState.config.targetSites = changes.targetSites.newValue;
        if (changes.vpnProvider) appState.config.vpnProvider = changes.vpnProvider.newValue;
        if (changes.detectedRegion) appState.config.detectedRegion = changes.detectedRegion.newValue;
        if (changes.customProxyHost) appState.config.customProxyHost = changes.customProxyHost.newValue;
        if (changes.surfsharkLocation) appState.config.surfsharkLocation = changes.surfsharkLocation.newValue;
        if (changes.surfsharkProxyHost) {
          appState.config.surfsharkProxyHost = changes.surfsharkProxyHost.newValue;
          if (surfsharkProxyInput && document.activeElement !== surfsharkProxyInput) {
            surfsharkProxyInput.value = changes.surfsharkProxyHost.newValue || "";
          }
        }
        if (changes.surfsharkUsername) {
          appState.config.surfsharkUsername = changes.surfsharkUsername.newValue;
          if (surfsharkUsernameInput && document.activeElement !== surfsharkUsernameInput) {
            surfsharkUsernameInput.value = changes.surfsharkUsername.newValue || "";
          }
        }
        if (changes.surfsharkPassword) {
          appState.config.surfsharkPassword = changes.surfsharkPassword.newValue;
          if (surfsharkPasswordInput && document.activeElement !== surfsharkPasswordInput) {
            surfsharkPasswordInput.value = changes.surfsharkPassword.newValue || "";
          }
        }
        if (changes.surfsharkLatency) {
          appState.config.surfsharkLatency = changes.surfsharkLatency.newValue || {};
          renderSurfsharkList();
        }
        if (changes.surfsharkClustersCache) {
          // refresh list if settings open
          if (viewSlider.classList.contains("show-settings")) {
            loadSurfsharkClusters(false);
          }
        }
        render(appState.enabled, appState.config);
      }
    });
  }
} else {
  render(false, DEFAULT_CONFIG);
}
