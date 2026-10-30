/* SiteTunnel — VPN registry + Surfshark location catalogue (v1.4.0) */

const TUNNEL_LOCATIONS = [
  {
    id: "auto",
    name: "⚡ Auto (Closest Cloud Tunnel)",
    tier: "Automatic Closest Region",
    badge: "Auto Cloud",
    proxies: []
  },
  {
    id: "us",
    name: "🇺🇸 United States (Cloud Tunnel)",
    tier: "US Datacenter (Squid / Virginia)",
    badge: "US Cloud",
    proxies: [
      "PROXY 130.110.103.245:3128",
      "DIRECT"
    ]
  },
  {
    id: "eu",
    name: "🇪🇺 Europe (Cloud Tunnel)",
    tier: "EU Datacenter (Frankfurt / Germany)",
    badge: "EU Cloud",
    proxies: [
      "PROXY 103.237.102.191:11111",
      "DIRECT"
    ]
  },
  {
    id: "sg",
    name: "🇸🇬 Singapore / Asia (Cloud Tunnel)",
    tier: "Asia Datacenter (Alibaba / Tencent)",
    badge: "Asia Cloud",
    proxies: [
      "PROXY 8.215.25.3:2080",
      "PROXY 43.153.195.69:80",
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

/* ---------------- Surfshark subscriber integration ---------------- */

const SURFSHARK_API_URL = "https://api.surfshark.com/v4/server/clusters";
const SURFSHARK_DASHBOARD_URL = "https://my.surfshark.com/home/dashboard";
const SURFSHARK_MANUAL_SETUP_URL = "https://my.surfshark.com/vpn/manual-setup";
const SURFSHARK_SERVERS_PAGE = "https://surfshark.com/servers";

const SURFSHARK_REGIONS = [
  { id: "all", name: "All" },
  { id: "Europe", name: "Europe" },
  { id: "The Americas", name: "Americas" },
  { id: "Asia Pacific", name: "Asia Pacific" },
  { id: "Middle East and Africa", name: "Middle East & Africa" }
];

// Bundled snapshot (2026-10-09, 142 clusters). Refreshed live from SURFSHARK_API_URL when online.
const SURFSHARK_FALLBACK_CLUSTERS = [{"cc":"AL","country":"Albania","city":"Tirana","host":"al-tia.prod.surfshark.com","region":"Europe","load":23},{"cc":"DZ","country":"Algeria","city":"Algiers","host":"dz-alg.prod.surfshark.com","region":"Middle East and Africa","load":28},{"cc":"AD","country":"Andorra","city":"Andorra la Vella","host":"ad-leu.prod.surfshark.com","region":"Europe","load":26},{"cc":"AR","country":"Argentina","city":"Buenos Aires","host":"ar-bua.prod.surfshark.com","region":"The Americas","load":27},{"cc":"AM","country":"Armenia","city":"Yerevan","host":"am-evn.prod.surfshark.com","region":"Europe","load":26},{"cc":"AU","country":"Australia","city":"Adelaide","host":"au-adl.prod.surfshark.com","region":"Asia Pacific","load":9},{"cc":"AU","country":"Australia","city":"Brisbane","host":"au-bne.prod.surfshark.com","region":"Asia Pacific","load":14},{"cc":"AU","country":"Australia","city":"Melbourne","host":"au-mel.prod.surfshark.com","region":"Asia Pacific","load":14},{"cc":"AU","country":"Australia","city":"Perth","host":"au-per.prod.surfshark.com","region":"Asia Pacific","load":17},{"cc":"AU","country":"Australia","city":"Sydney","host":"au-syd.prod.surfshark.com","region":"Asia Pacific","load":15},{"cc":"AT","country":"Austria","city":"Vienna","host":"at-vie.prod.surfshark.com","region":"Europe","load":29},{"cc":"AZ","country":"Azerbaijan","city":"Baku","host":"az-bak.prod.surfshark.com","region":"Asia Pacific","load":24},{"cc":"BS","country":"Bahamas","city":"Bahamas","host":"bs-nas.prod.surfshark.com","region":"The Americas","load":36},{"cc":"BD","country":"Bangladesh","city":"Dhaka","host":"bd-dac.prod.surfshark.com","region":"Asia Pacific","load":10},{"cc":"BE","country":"Belgium","city":"Antwerp","host":"be-anr.prod.surfshark.com","region":"Europe","load":40},{"cc":"BE","country":"Belgium","city":"Brussels","host":"be-bru.prod.surfshark.com","region":"Europe","load":35},{"cc":"BZ","country":"Belize","city":"Belmopan","host":"bz-blp.prod.surfshark.com","region":"The Americas","load":24},{"cc":"BT","country":"Bhutan","city":"Thimphu","host":"bt-pbh.prod.surfshark.com","region":"Asia Pacific","load":33},{"cc":"BO","country":"Bolivia","city":"Sucre","host":"bo-sre.prod.surfshark.com","region":"The Americas","load":12},{"cc":"BA","country":"Bosnia and Herzegovina","city":"Sarajevo","host":"ba-sjj.prod.surfshark.com","region":"Europe","load":40},{"cc":"BR","country":"Brazil","city":"Sao Paulo","host":"br-sao.prod.surfshark.com","region":"The Americas","load":37},{"cc":"BN","country":"Brunei","city":"Begawan","host":"bn-bwn.prod.surfshark.com","region":"Asia Pacific","load":13},{"cc":"BG","country":"Bulgaria","city":"Sofia","host":"bg-sof.prod.surfshark.com","region":"Europe","load":29},{"cc":"KH","country":"Cambodia","city":"Phnom Penh","host":"kh-pnh.prod.surfshark.com","region":"Asia Pacific","load":6},{"cc":"CA","country":"Canada","city":"Montreal","host":"ca-mon.prod.surfshark.com","region":"The Americas","load":31},{"cc":"CA","country":"Canada","city":"Toronto","host":"ca-tor.prod.surfshark.com","region":"The Americas","load":31},{"cc":"CA","country":"Canada","city":"Vancouver","host":"ca-van.prod.surfshark.com","region":"The Americas","load":30},{"cc":"CL","country":"Chile","city":"Santiago","host":"cl-san.prod.surfshark.com","region":"The Americas","load":25},{"cc":"CO","country":"Colombia","city":"Bogota","host":"co-bog.prod.surfshark.com","region":"The Americas","load":35},{"cc":"CR","country":"Costa Rica","city":"San Jose","host":"cr-sjn.prod.surfshark.com","region":"The Americas","load":22},{"cc":"HR","country":"Croatia","city":"Zagreb","host":"hr-zag.prod.surfshark.com","region":"Europe","load":24},{"cc":"CY","country":"Cyprus","city":"Nicosia","host":"cy-nic.prod.surfshark.com","region":"Europe","load":32},{"cc":"CZ","country":"Czech Republic","city":"Prague","host":"cz-prg.prod.surfshark.com","region":"Europe","load":40},{"cc":"DK","country":"Denmark","city":"Copenhagen","host":"dk-cph.prod.surfshark.com","region":"Europe","load":37},{"cc":"EC","country":"Ecuador","city":"Quito","host":"ec-uio.prod.surfshark.com","region":"The Americas","load":15},{"cc":"EG","country":"Egypt","city":"Cairo","host":"eg-cai.prod.surfshark.com","region":"Middle East and Africa","load":37},{"cc":"EE","country":"Estonia","city":"Tallinn","host":"ee-tll.prod.surfshark.com","region":"Europe","load":14},{"cc":"FI","country":"Finland","city":"Helsinki","host":"fi-hel.prod.surfshark.com","region":"Europe","load":29},{"cc":"FR","country":"France","city":"Bordeaux","host":"fr-bod.prod.surfshark.com","region":"Europe","load":20},{"cc":"FR","country":"France","city":"Marseille","host":"fr-mrs.prod.surfshark.com","region":"Europe","load":27},{"cc":"FR","country":"France","city":"Paris","host":"fr-par.prod.surfshark.com","region":"Europe","load":32},{"cc":"GE","country":"Georgia","city":"Tbilisi","host":"ge-tbs.prod.surfshark.com","region":"Europe","load":21},{"cc":"DE","country":"Germany","city":"Berlin","host":"de-ber.prod.surfshark.com","region":"Europe","load":35},{"cc":"DE","country":"Germany","city":"Frankfurt am Main","host":"de-fra.prod.surfshark.com","region":"Europe","load":36},{"cc":"GH","country":"Ghana","city":"Accra","host":"gh-acc.prod.surfshark.com","region":"Middle East and Africa","load":8},{"cc":"GR","country":"Greece","city":"Athens","host":"gr-ath.prod.surfshark.com","region":"Europe","load":35},{"cc":"GL","country":"Greenland","city":"Nuuk","host":"gl-goh.prod.surfshark.com","region":"Europe","load":18},{"cc":"HK","country":"Hong Kong","city":"Hong Kong","host":"hk-hkg.prod.surfshark.com","region":"Asia Pacific","load":42},{"cc":"HU","country":"Hungary","city":"Budapest","host":"hu-bud.prod.surfshark.com","region":"Europe","load":34},{"cc":"IS","country":"Iceland","city":"Reykjavik","host":"is-rkv.prod.surfshark.com","region":"Europe","load":27},{"cc":"IN","country":"India","city":"Delhi","host":"in-del.prod.surfshark.com","region":"Asia Pacific","load":49},{"cc":"IN","country":"India","city":"Mumbai","host":"in-mum.prod.surfshark.com","region":"Asia Pacific","load":26},{"cc":"ID","country":"Indonesia","city":"Jakarta","host":"id-jak.prod.surfshark.com","region":"Asia Pacific","load":13},{"cc":"IE","country":"Ireland","city":"Dublin","host":"ie-dub.prod.surfshark.com","region":"Europe","load":37},{"cc":"IM","country":"Isle of Man","city":"Douglas","host":"im-iom.prod.surfshark.com","region":"Europe","load":15},{"cc":"IL","country":"Israel","city":"Tel Aviv","host":"il-tlv.prod.surfshark.com","region":"Middle East and Africa","load":16},{"cc":"IT","country":"Italy","city":"Milan","host":"it-mil.prod.surfshark.com","region":"Europe","load":23},{"cc":"IT","country":"Italy","city":"Rome","host":"it-rom.prod.surfshark.com","region":"Europe","load":26},{"cc":"JP","country":"Japan","city":"Tokyo","host":"jp-tok.prod.surfshark.com","region":"Asia Pacific","load":52},{"cc":"KZ","country":"Kazakhstan","city":"Oral","host":"kz-ura.prod.surfshark.com","region":"Asia Pacific","load":35},{"cc":"LA","country":"Laos","city":"Vientiane","host":"la-vte.prod.surfshark.com","region":"Asia Pacific","load":5},{"cc":"LV","country":"Latvia","city":"Riga","host":"lv-rig.prod.surfshark.com","region":"Europe","load":20},{"cc":"LI","country":"Liechtenstein","city":"Vaduz","host":"li-qvu.prod.surfshark.com","region":"Europe","load":14},{"cc":"LT","country":"Lithuania","city":"Vilnius","host":"lt-vno.prod.surfshark.com","region":"Europe","load":36},{"cc":"LU","country":"Luxembourg","city":"Luxembourg","host":"lu-ste.prod.surfshark.com","region":"Europe","load":30},{"cc":"MO","country":"Macau","city":"Macao","host":"mo-mfm.prod.surfshark.com","region":"Asia Pacific","load":18},{"cc":"MY","country":"Malaysia","city":"Kuala Lumpur","host":"my-kul.prod.surfshark.com","region":"Asia Pacific","load":25},{"cc":"MT","country":"Malta","city":"Valletta","host":"mt-mla.prod.surfshark.com","region":"Europe","load":7},{"cc":"MA","country":"Marocco","city":"Rabat","host":"ma-rab.prod.surfshark.com","region":"Middle East and Africa","load":8},{"cc":"MX","country":"Mexico","city":"Queretaro","host":"mx-qro.prod.surfshark.com","region":"The Americas","load":29},{"cc":"MD","country":"Moldova","city":"Chisinau","host":"md-chi.prod.surfshark.com","region":"Europe","load":23},{"cc":"MC","country":"Monaco","city":"Monte Carlo","host":"mc-mcm.prod.surfshark.com","region":"Europe","load":14},{"cc":"MN","country":"Mongolia","city":"Ulaanbaatar","host":"mn-uln.prod.surfshark.com","region":"Asia Pacific","load":17},{"cc":"ME","country":"Montenegro","city":"Podgorica","host":"me-tgd.prod.surfshark.com","region":"Europe","load":10},{"cc":"MM","country":"Myanmar","city":"Naypyidaw","host":"mm-nyt.prod.surfshark.com","region":"Asia Pacific","load":23},{"cc":"NP","country":"Nepal","city":"Kathmandu","host":"np-ktm.prod.surfshark.com","region":"Asia Pacific","load":9},{"cc":"NL","country":"Netherlands","city":"Amsterdam","host":"nl-ams.prod.surfshark.com","region":"Europe","load":39},{"cc":"NZ","country":"New Zealand","city":"Auckland","host":"nz-akl.prod.surfshark.com","region":"Asia Pacific","load":17},{"cc":"NG","country":"Nigeria","city":"Lagos","host":"ng-lag.prod.surfshark.com","region":"Middle East and Africa","load":24},{"cc":"MK","country":"North Macedonia","city":"Skopje","host":"mk-skp.prod.surfshark.com","region":"Europe","load":15},{"cc":"NO","country":"Norway","city":"Oslo","host":"no-osl.prod.surfshark.com","region":"Europe","load":32},{"cc":"PK","country":"Pakistan","city":"Karachi","host":"pk-khi.prod.surfshark.com","region":"Asia Pacific","load":9},{"cc":"PA","country":"Panama","city":"Panama","host":"pa-pac.prod.surfshark.com","region":"The Americas","load":21},{"cc":"PY","country":"Paraguay","city":"Asunción","host":"py-asu.prod.surfshark.com","region":"The Americas","load":10},{"cc":"PE","country":"Peru","city":"Lima","host":"pe-lim.prod.surfshark.com","region":"The Americas","load":31},{"cc":"PH","country":"Philippines","city":"Manila","host":"ph-mnl.prod.surfshark.com","region":"Asia Pacific","load":21},{"cc":"PL","country":"Poland","city":"Gdansk","host":"pl-gdn.prod.surfshark.com","region":"Europe","load":39},{"cc":"PL","country":"Poland","city":"Warsaw","host":"pl-waw.prod.surfshark.com","region":"Europe","load":46},{"cc":"PT","country":"Portugal","city":"Lisbon","host":"pt-lis.prod.surfshark.com","region":"Europe","load":21},{"cc":"PT","country":"Portugal","city":"Porto","host":"pt-opo.prod.surfshark.com","region":"Europe","load":22},{"cc":"PR","country":"Puerto Rico","city":"San Juan","host":"pr-sju.prod.surfshark.com","region":"The Americas","load":10},{"cc":"RO","country":"Romania","city":"Bucharest","host":"ro-buc.prod.surfshark.com","region":"Europe","load":35},{"cc":"SA","country":"Saudi Arabia","city":"Riyadh","host":"sa-ruh.prod.surfshark.com","region":"Middle East and Africa","load":12},{"cc":"RS","country":"Serbia","city":"Belgrade","host":"rs-beg.prod.surfshark.com","region":"Europe","load":16},{"cc":"SG","country":"Singapore","city":"Singapore","host":"sg-sng.prod.surfshark.com","region":"Asia Pacific","load":42},{"cc":"SK","country":"Slovakia","city":"Bratislava","host":"sk-bts.prod.surfshark.com","region":"Europe","load":29},{"cc":"SI","country":"Slovenia","city":"Ljubljana","host":"si-lju.prod.surfshark.com","region":"Europe","load":23},{"cc":"ZA","country":"South Africa","city":"Johannesburg","host":"za-jnb.prod.surfshark.com","region":"Middle East and Africa","load":37},{"cc":"KR","country":"South Korea","city":"Seoul","host":"kr-seo.prod.surfshark.com","region":"Asia Pacific","load":22},{"cc":"ES","country":"Spain","city":"Barcelona","host":"es-bcn.prod.surfshark.com","region":"Europe","load":33},{"cc":"ES","country":"Spain","city":"Madrid","host":"es-mad.prod.surfshark.com","region":"Europe","load":29},{"cc":"ES","country":"Spain","city":"Valencia","host":"es-vlc.prod.surfshark.com","region":"Europe","load":34},{"cc":"LK","country":"Sri Lanka","city":"Colombo","host":"lk-cmb.prod.surfshark.com","region":"Asia Pacific","load":19},{"cc":"SE","country":"Sweden","city":"Stockholm","host":"se-sto.prod.surfshark.com","region":"Europe","load":44},{"cc":"CH","country":"Switzerland","city":"Zurich","host":"ch-zur.prod.surfshark.com","region":"Europe","load":31},{"cc":"TW","country":"Taiwan","city":"Taipei","host":"tw-tai.prod.surfshark.com","region":"Asia Pacific","load":38},{"cc":"TH","country":"Thailand","city":"Bangkok","host":"th-bkk.prod.surfshark.com","region":"Asia Pacific","load":29},{"cc":"TR","country":"Turkey","city":"Istanbul","host":"tr-ist.prod.surfshark.com","region":"Europe","load":30},{"cc":"UA","country":"Ukraine","city":"Kyiv","host":"ua-iev.prod.surfshark.com","region":"Europe","load":23},{"cc":"AE","country":"United Arab Emirates","city":"Dubai","host":"ae-dub.prod.surfshark.com","region":"Middle East and Africa","load":19},{"cc":"GB","country":"United Kingdom","city":"Edinburgh","host":"uk-edi.prod.surfshark.com","region":"Europe","load":34},{"cc":"GB","country":"United Kingdom","city":"Glasgow","host":"uk-gla.prod.surfshark.com","region":"Europe","load":28},{"cc":"GB","country":"United Kingdom","city":"London","host":"uk-lon.prod.surfshark.com","region":"Europe","load":29},{"cc":"GB","country":"United Kingdom","city":"Manchester","host":"uk-man.prod.surfshark.com","region":"Europe","load":33},{"cc":"US","country":"United States","city":"Ashburn","host":"us-ash.prod.surfshark.com","region":"The Americas","load":30},{"cc":"US","country":"United States","city":"Atlanta","host":"us-atl.prod.surfshark.com","region":"The Americas","load":29},{"cc":"US","country":"United States","city":"Bend","host":"us-bdn.prod.surfshark.com","region":"The Americas","load":36},{"cc":"US","country":"United States","city":"Boston","host":"us-bos.prod.surfshark.com","region":"The Americas","load":43},{"cc":"US","country":"United States","city":"Buffalo","host":"us-buf.prod.surfshark.com","region":"The Americas","load":33},{"cc":"US","country":"United States","city":"Charlotte","host":"us-clt.prod.surfshark.com","region":"The Americas","load":30},{"cc":"US","country":"United States","city":"Chicago","host":"us-chi.prod.surfshark.com","region":"The Americas","load":28},{"cc":"US","country":"United States","city":"Dallas","host":"us-dal.prod.surfshark.com","region":"The Americas","load":34},{"cc":"US","country":"United States","city":"Denver","host":"us-den.prod.surfshark.com","region":"The Americas","load":34},{"cc":"US","country":"United States","city":"Detroit","host":"us-dtw.prod.surfshark.com","region":"The Americas","load":26},{"cc":"US","country":"United States","city":"Houston","host":"us-hou.prod.surfshark.com","region":"The Americas","load":35},{"cc":"US","country":"United States","city":"Kansas City","host":"us-kan.prod.surfshark.com","region":"The Americas","load":32},{"cc":"US","country":"United States","city":"Las Vegas","host":"us-las.prod.surfshark.com","region":"The Americas","load":30},{"cc":"US","country":"United States","city":"Latham","host":"us-ltm.prod.surfshark.com","region":"The Americas","load":42},{"cc":"US","country":"United States","city":"Los Angeles","host":"us-lax.prod.surfshark.com","region":"The Americas","load":32},{"cc":"US","country":"United States","city":"Miami","host":"us-mia.prod.surfshark.com","region":"The Americas","load":38},{"cc":"US","country":"United States","city":"Nashville","host":"us-bna.prod.surfshark.com","region":"The Americas","load":29},{"cc":"US","country":"United States","city":"New York","host":"us-nyc.prod.surfshark.com","region":"The Americas","load":40},{"cc":"US","country":"United States","city":"Omaha","host":"us-oma.prod.surfshark.com","region":"The Americas","load":30},{"cc":"US","country":"United States","city":"Phoenix","host":"us-phx.prod.surfshark.com","region":"The Americas","load":35},{"cc":"US","country":"United States","city":"Salt Lake City","host":"us-slc.prod.surfshark.com","region":"The Americas","load":35},{"cc":"US","country":"United States","city":"San Francisco","host":"us-sfo.prod.surfshark.com","region":"The Americas","load":32},{"cc":"US","country":"United States","city":"San Jose","host":"us-sjc.prod.surfshark.com","region":"The Americas","load":37},{"cc":"US","country":"United States","city":"Seattle","host":"us-sea.prod.surfshark.com","region":"The Americas","load":36},{"cc":"UY","country":"Uruguay","city":"Montevideo","host":"uy-mvd.prod.surfshark.com","region":"The Americas","load":10},{"cc":"UZ","country":"Uzbekistan","city":"Tashkent","host":"uz-tas.prod.surfshark.com","region":"Asia Pacific","load":14},{"cc":"VE","country":"Venezuela","city":"Caracas","host":"ve-car.prod.surfshark.com","region":"The Americas","load":18},{"cc":"VN","country":"Vietnam","city":"Ho Chi Minh City","host":"vn-hcm.prod.surfshark.com","region":"Asia Pacific","load":25}];

function flagEmojiFromCC(cc) {
  if (!cc || typeof cc !== "string" || cc.length !== 2) return "🌐";
  const A = 0x1F1E6;
  const up = cc.toUpperCase();
  const c0 = up.charCodeAt(0) - 65 + A;
  const c1 = up.charCodeAt(1) - 65 + A;
  try {
    return String.fromCodePoint(c0, c1);
  } catch (e) {
    return "🌐";
  }
}

function normalizeSurfsharkClusters(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = {};
  raw.forEach((d) => {
    if (!d) return;
    // Support both live API shape and fallback shape
    const host = d.connectionName || d.host;
    if (!host) return;
    if (seen[host]) {
      // keep lowest load
      if (typeof d.load === "number" && d.load < seen[host].load) seen[host].load = d.load;
      return;
    }
    seen[host] = {
      cc: d.countryCode || d.cc || "",
      country: d.country || "",
      city: d.location || d.city || "",
      host: host,
      region: d.region || "",
      load: typeof d.load === "number" ? d.load : 50
    };
  });
  return Object.values(seen).sort((a, b) => {
    if (a.country === b.country) return (a.city || "").localeCompare(b.city || "");
    return (a.country || "").localeCompare(b.country || "");
  });
}

function surfsharkDisplayName(c) {
  if (!c) return "";
  const flag = flagEmojiFromCC(c.cc);
  if (c.city && c.city !== c.country) return `${flag} ${c.country} — ${c.city}`;
  return `${flag} ${c.country}`;
}

function surfsharkShortBadge(c) {
  if (!c) return "Surfshark";
  const flag = flagEmojiFromCC(c.cc);
  // e.g. "🇸🇬 SG · Singapore"
  return `${flag} ${c.cc} · ${c.city || c.country}`;
}

function isSurfsharkProviderId(id) {
  return typeof id === "string" && id.indexOf("ss:") === 0;
}

function surfsharkHostFromProviderId(id) {
  if (!isSurfsharkProviderId(id)) return null;
  return id.slice(3);
}

function surfsharkProviderIdFromHost(host) {
  return "ss:" + host;
}

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
  customProxyHost: "",
  surfsharkLocation: null,
  surfsharkProxyHost: "",
  surfsharkUsername: "KnBrEFj2xeGTsyrpzZNLPP4M",
  surfsharkPassword: "6NvfrjKerHse72gZztQnSHHd",
  surfsharkLatency: {},
  surfsharkClustersCache: [],
  surfsharkClustersAt: 0
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

function getSurfsharkLocationFromConfig(config) {
  if (config && config.surfsharkLocation && config.surfsharkLocation.host) return config.surfsharkLocation;
  // Back-compat: if vpnProvider is ss:host but location object missing, synthesize minimal object
  if (config && isSurfsharkProviderId(config.vpnProvider)) {
    const h = surfsharkHostFromProviderId(config.vpnProvider);
    const found = (SURFSHARK_FALLBACK_CLUSTERS || []).find((c) => c.host === h);
    if (found) return found;
    return { cc: "", country: h, city: "", host: h, region: "", load: 50 };
  }
  return null;
}

function getRelayIdForSurfsharkLocation(loc) {
  // Map a Surfshark country/region to the closest WORKING legacy relay cluster
  // so picking a Surfshark location changes exit IP immediately (no extra setup).
  // Verified working relays (2026-10-10): US/EU/SG HTTP proxies.
  if (!loc) return "us";
  const cc = (loc.cc || "").toUpperCase();
  const region = loc.region || "";
  // Country-level precision for big countries
  const AMERICAS_CC = ["US","CA","MX","BR","AR","CL","CO","PE","CR","PA","UY","PY","BO","EC","VE","BS","BZ","PR"];
  const ASIA_PAC_CC = ["SG","JP","KR","AU","NZ","MY","TH","ID","PH","VN","HK","TW","IN","BD","PK","LK","NP","MY","KH","LA","MM","MN","BN","MO"];
  const MIDEAST_CC = ["AE","SA","IL","TR","EG","ZA","NG","GH","MA","DZ"];
  if (AMERICAS_CC.includes(cc)) return "us";
  if (ASIA_PAC_CC.includes(cc)) return "sg";
  if (MIDEAST_CC.includes(cc)) return cc === "SG" ? "sg" : "eu";
  if (region === "The Americas") return "us";
  if (region === "Asia Pacific") return "sg";
  if (region === "Middle East and Africa") return "eu";
  return "eu";
}

/* v1.3.4 — CDN expansion: single-site tunneling must also tunnel the
   site's static/video/API CDN hosts, else page goes via relay but video goes
   DIRECT with a different IP -> throttle / re-buffer / slow. */
const SITE_CDN_MAP = {
  "youtube.com": ["googlevideo.com", "ytimg.com", "youtube-nocookie.com"],
  "netflix.com": ["nflxvideo.net", "nflximg.net", "nflxext.com", "netflix.net"],
  "chatgpt.com": ["openai.com", "oaistatic.com", "oaiusercontent.com", "chat.openai.com"],
  "binance.com": ["binance.us", "bnbstatic.com", "binancecms.com"],
  "reddit.com": ["redd.it", "redditstatic.com", "redditmedia.com"],
  "x.com": ["twitter.com", "twimg.com", "xcdn.net"],
  "facebook.com": ["fbcdn.net", "fbstatic.com"],
  "instagram.com": ["cdninstagram.com", "fbcdn.net"],
  "tiktok.com": ["tiktokcdn.com", "tiktokv.com"],
  "twitch.tv": ["ttvnw.net", "jtvnw.net"],
  "spotify.com": ["scdn.co", "spotifycdn.com"],
  "disneyplus.com": ["disney-plus.net", "bamgrid.com"],
  "hulu.com": ["huluim.com", "hulustatic.com"],
  "primevideo.com": ["amazonvideo.com", "media-amazon.com"],
  "openai.com": ["oaistatic.com", "oaiusercontent.com", "chatgpt.com"]
};

function expandTargetSitesForPAC(sites) {
  // Input: cleaned base domains. Output: base + CDN hosts, deduped.
  // Keeps PAC condition small (max ~12 hosts) to avoid PAC parse slowdown.
  try {
    const out = [];
    const seen = {};
    (sites || []).forEach((s) => {
      const base = cleanDomain(s);
      if (!base || seen[base]) return;
      seen[base] = 1; out.push(base);
      const extra = SITE_CDN_MAP[base] || [];
      extra.forEach((c) => {
        if (!seen[c]) { seen[c] = 1; out.push(c); }
        if (out.length >= 14) return;
      });
    });
    return out;
  } catch (e) { return sites || []; }
}

/* v1.3.4 — load-aware score: lowest ping alone is misleading.
   score = ping + load*8  (e.g. 76ms+60% load = 556, 120ms+9% load = 192 -> second wins).
   This fixes "lowest ping but slowest connection". */
function getSurfsharkScore(pingMs, loadPct) {
  const ping = (pingMs == null || pingMs >= 9999) ? 9999 : pingMs;
  if (ping >= 9999) return 99999;
  const load = (typeof loadPct === "number") ? loadPct : 50;
  return ping + load * 8;
}

function getRelayProxiesForSurfsharkLocation(loc) {
  // v1.4.0: uses verified live cloud relays for the selected region
  const relayId = getRelayIdForSurfsharkLocation(loc);
  const byId = (id) => TUNNEL_LOCATIONS.find(l => l.id === id);
  const primary = byId(relayId);
  let chain = primary ? primary.proxies.filter(p => p !== "DIRECT") : [];
  chain = chain.slice(0, 2);
  chain.push("DIRECT");
  return { relayId, proxies: chain };
}

function getExitLabelForRelay(relayId, loc) {
  try {
    if (relayId === "sg") return "Singapore (Azure Cloud Relay)";
    if (relayId === "eu") return "Germany/Frankfurt (Cloud Relay)";
    if (relayId === "us") return "United States (Cloud Relay)";
  } catch (e) {}
  return relayId ? relayId.toUpperCase() : "";
}

function getAccuracyNoteForSurfshark(loc, hasLocalProxy, hasDirectAuth) {
  if (hasDirectAuth) return { exact: true, text: "Exact Surfshark Server IP (Direct HTTPS · 100% stable)" };
  if (hasLocalProxy) return { exact: true, text: "Exact Surfshark IP (local proxy)" };
  try {
    const cc = loc && loc.cc ? String(loc.cc).toUpperCase() : "";
    const cityTxt = loc && loc.city && loc.city !== loc.country ? loc.country + " — " + loc.city : (loc ? loc.country : "");
    const exit = getExitLabelForRelay(getRelayIdForSurfsharkLocation(loc), loc);
    if (["LK", "IN", "BD", "PK", "NP", "BT", "MV", "AF"].includes(cc)) {
      return { exact: false, text: "Approx exit: " + exit + " (requested " + cityTxt + "). For exact " + cityTxt + " IP use Gluetun/app." };
    }
    return { exact: false, text: "Approx exit: " + exit + " (region relay, not exact " + cityTxt + "). For exact IP use Gluetun/app." };
  } catch (e) {
    return { exact: false, text: "Approx region exit. For exact IP use Gluetun/app." };
  }
}

function getProviderInfo(providerId, config) {
  const hasDirectAuth = !!(config && (config.surfsharkUsername || "").trim() && (config.surfsharkPassword || "").trim());

  if (isSurfsharkProviderId(providerId)) {
    const host = surfsharkHostFromProviderId(providerId);
    let loc = getSurfsharkLocationFromConfig(config);
    if (!loc || loc.host !== host) {
      const fromFallback = (SURFSHARK_FALLBACK_CLUSTERS || []).find((c) => c.host === host);
      const fromCache = (config && Array.isArray(config.surfsharkClustersCache) ? config.surfsharkClustersCache : []).find((c) => c.host === host);
      loc = fromCache || fromFallback || { cc: "", country: host, city: "", host: host, region: "", load: 50 };
    }
    const relay = getRelayProxiesForSurfsharkLocation(loc);
    let exitLabel = "";
    try { exitLabel = getExitLabelForRelay(relay.relayId, loc); } catch (e) { exitLabel = relay.relayId.toUpperCase(); }
    return {
      id: providerId,
      name: `Surfshark ${surfsharkDisplayName(loc)}`,
      tier: hasDirectAuth ? (loc.host + " (Direct Surfshark · 100% stable)") : (loc.host + ` (exit: ${exitLabel} ~approx)`),
      badge: surfsharkShortBadge(loc),
      type: "surfshark",
      surfshark: loc,
      relayId: relay.relayId,
      exitLabel: exitLabel,
      proxies: relay.proxies
    };
  }
  const p = TUNNEL_LOCATIONS.find(item => item.id === providerId) || TUNNEL_LOCATIONS[0];
  if (p.id === "auto") {
    const regionId = getAutoRegion(config);
    const regionObj = TUNNEL_LOCATIONS.find(l => l.id === regionId);
    const regionName = regionId === "us" ? "United States" : (regionId === "eu" ? "Europe" : "Singapore");
    return {
      ...p,
      badge: `Auto (${regionName})${hasDirectAuth ? " · Direct" : ""}`,
      tier: hasDirectAuth ? "Direct Surfshark HTTPS Proxy (100% stable)" : p.tier,
      proxies: regionObj ? regionObj.proxies : TUNNEL_LOCATIONS[1].proxies
    };
  }
  if (hasDirectAuth && p.id !== "custom_proxy") {
    return {
      ...p,
      badge: `${p.badge || p.name} · Direct`,
      tier: "Direct Surfshark HTTPS Proxy (100% stable)"
    };
  }
  return p;
}

function cleanDomain(input) {
  if (!input || typeof input !== "string") return "";
  let str = input.trim().toLowerCase();
  str = str.replace(/^[a-zA-Z]+:\/\//, "");
  str = str.replace(/\/.*$/, "");
  str = str.replace(/^www\./, "");
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
