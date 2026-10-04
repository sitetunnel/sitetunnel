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

let appState = {
  enabled: false,
  config: { ...DEFAULT_CONFIG }
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

  if (isEnabled) {
    statusPillText.textContent = "Active";
    statusTitle.textContent = "Tunnel Active";
    statusSubtitle.textContent = sites.length > 0
      ? (sites.length === 1 ? `Routing ${sites[0]} via ${pInfo.badge || pInfo.name}` : `${sites.length} sites routed via ${pInfo.badge || pInfo.name}`)
      : `Traffic routed via ${pInfo.badge || pInfo.name}`;
    if (vpnBadge) {
      vpnBadge.textContent = "CONNECTED";
      vpnBadge.className = "badge active";
    }
  } else {
    if (sites.length === 0) {
      statusPillText.textContent = "No Target";
      statusTitle.textContent = "No Target Set";
      statusSubtitle.textContent = "Tap to choose a website to tunnel";
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

  // Populate Tunnel Locations Dropdown
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

  // Field values
  providerSelect.value = appState.config.vpnProvider || "us";
  customProxyInput.value = appState.config.customProxyHost || "";

  renderSitesTags();
  updateCustomFieldsVisibility();
}

function updateCustomFieldsVisibility() {
  const val = providerSelect.value;
  customProxyInput.style.display = val === "custom_proxy" ? "block" : "none";
}

// Auto-Save Configuration
function autoSave(callback) {
  const sites = getTargetSites(appState.config);
  const newProvider = providerSelect.value;
  const newCustomProxy = (customProxyInput.value || "").trim();

  const updates = {
    targetSites: sites,
    vpnProvider: newProvider,
    customProxyHost: newCustomProxy
  };

  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: "saveConfig", config: updates }, (resp) => {
      if (resp && resp.config) {
        appState.config = resp.config;
      } else {
        appState.config = { ...appState.config, ...updates };
      }
      render(appState.enabled, appState.config);
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

providerSelect.onchange = () => {
  updateCustomFieldsVisibility();
  autoSave();
};

customProxyInput.oninput = () => autoSave();

// View Navigation
function showSettingsView() {
  initSettingsUI();
  viewSlider.classList.add("show-settings");
}

function hideSettingsView() {
  viewSlider.classList.remove("show-settings");
}

openSettingsBtn.onclick = showSettingsView;
infoCard.onclick = showSettingsView;
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
      appState.config = r.config || DEFAULT_CONFIG;

      // Migrate legacy targetUrl if targetSites is empty
      if ((!appState.config.targetSites || appState.config.targetSites.length === 0) && appState.config.targetUrl) {
        const legacy = cleanDomain(appState.config.targetUrl);
        if (legacy) {
          appState.config.targetSites = [legacy];
          chrome.runtime.sendMessage({ type: "saveConfig", config: { targetSites: [legacy] } });
        }
      }

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
        render(appState.enabled, appState.config);
      }
    });
  }
} else {
  render(false, DEFAULT_CONFIG);
}
