// itty-router bundle (Source: https://github.com/kwhitley/itty-router)
const Router = ({ base: e = "", routes: t = [], ...o } = {}) => ({ __proto__: new Proxy({}, { get: (o, s, r, n) => "handle" == s ? r.fetch : (o, ...a) => t.push([s.toUpperCase?.(), RegExp(`^${(n = (e + o).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), a, n]) && r }), routes: t, ...o, async fetch(e, ...o) { let s, r, n = new URL(e.url), a = e.query = { __proto__: null }; for (let [e, t] of n.searchParams) a[e] = a[e] ? [].concat(a[e], t) : t; for (let [a, c, p, i] of t) if ((a == e.method || "ALL" == a) && (r = n.pathname.match(c))) { e.params = r.groups || {}, e.route = i; for (let t of p) if (null != (s = await t(e.proxy ?? e, ...o))) return s } } });

// Create a new router
const router = Router();

// --- Core Guardian Logic Utilities ---
const safeB64 = (str) => {
    try {
        const bytes = new TextEncoder().encode(str);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary).replace(/[\s\r\n]/g, "");
    } catch (e) { return ""; }
};

const tryDecode = (str) => {
    try { return atob(str.replace(/[\s\r\n]/g, "")); } catch (e) { return null; }
};

/**
 * Generate SHA-256 hash of a string
 */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Return a non-functional configuration to blocked users
 * This forces the client to overwrite their working config with a "dead" one.
 */
async function returnDummyConfig(target, filename) {
    const remoteUrl = "http://192.168.31.222:8888/87mf5l";
    const displayName = "🔴 ACCOUNT BLOCKED - CONTACT ADMIN";
    let data = "";
    const h = new Headers();
    h.set("Access-Control-Allow-Origin", "*");
    h.set("Content-Disposition", `attachment; filename=${filename}`);
    h.set("Profile-Title", filename);

    h.set("Profile-Update-Interval", "1");
    h.set("X-Config-Update-Interval", "1");

    // Add unique timestamp to bypass any app-level caching
    const blockID = "BLOCK-" + Date.now();

    try {
        console.log(`[BLOCK] Fetching remote demo config from ${remoteUrl}`);
        const response = await fetch(remoteUrl, {
            headers: {
                'User-Agent': 'Guardian-Worker-Watcher'
            }
        });

        if (response.ok) {
            data = await response.text();
            console.log(`[BLOCK] Successfully fetched remote demo config (${data.length} bytes)`);
            h.set("X-Demo-Fetch", "Remote-Success");

            // Set Content-Type based on target or use what the remote server sent
            if (target === "clash") {
                h.set("Content-Type", "application/yaml; charset=utf-8");
            } else {
                h.set("Content-Type", "text/plain; charset=utf-8");
            }
        } else {
            throw new Error(`Remote fetch failed with status ${response.status}`);
        }
    } catch (error) {
        console.error(`[BLOCK] Remote fetch error: ${error.message}. Using fallback dead proxies.`);
        h.set("X-Demo-Fetch", `Remote-Failed: ${error.message}`);

        // Fallback to local dead proxies if remote fetch fails
        if (target === "clash") {
            h.set("Content-Type", "application/yaml; charset=utf-8");
            data = `proxies:
  - {name: User Blocked, server: aeryy5gfrp630ww1.lovebaipiao.net, port: 443, type: trojan, password: ca7a8865-d967-49fd-ac53-60ed4dd8b4e1, sni: aeryy5gfrp630ww1.lovebaipiao.net, skip-cert-verify: true, network: ws, ws-opts: {path: /images, headers: {Host: aeryy5gfrp630ww1.lovebaipiao.net}}}
  - {name: Contact with provider-Digital Freedom, server: 23.227.38.166, port: 443, type: trojan, password: ca7a8865-d967-49fd-ac53-60ed4dd8b4e1, sni: ni5qwas2a6ysde23.usgogo202510.top, skip-cert-verify: true, network: ws, ws-opts: {path: /images, headers: {Host: ni5qwas2a6ysde23.usgogo202510.top}}}
proxy-groups:
  - name: "🔴 STATUS"
    type: select
    proxies:
      - "User Blocked"
      - "Contact with provider-Digital Freedom"
  - name: "INFO-${blockID}"
    type: select
    proxies:
      - "User Blocked"
rules:
  - MATCH,"🔴 STATUS"`;
        } else {
            h.set("Content-Type", "text/plain; charset=utf-8");
            const trojanLink1 = `trojan://ca7a8865-d967-49fd-ac53-60ed4dd8b4e1@aeryy5gfrp630ww1.lovebaipiao.net:443?security=tls&sni=aeryy5gfrp630ww1.lovebaipiao.net&type=ws&host=aeryy5gfrp630ww1.lovebaipiao.net&path=%2Fimages#User%20Blocked`;
            const trojanLink2 = `trojan://ca7a8865-d967-49fd-ac53-60ed4dd8b4e1@23.227.38.166:443?security=tls&sni=ni5qwas2a6ysde23.usgogo202510.top&type=ws&host=ni5qwas2a6ysde23.usgogo202510.top&path=%2Fimages#Contact%20with%20provider-Digital%20Freedom`;
            data = safeB64(trojanLink1 + "\n" + trojanLink2 + "\n");
        }
    }

    h.set("X-Block-Status", "BLOCKED");
    h.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    h.set("Pragma", "no-cache");
    h.set("Expires", "0");
    h.set("Access-Control-Expose-Headers", "*");

    return new Response(data, { status: 200, headers: h });
}

/**
 * Handle OPTIONS request for CORS
 */
function handleOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

/**
 * Proxy request to backend subconverter with Guardian enhancements
 */
async function proxyToBackend(request, env) {
    try {
        const url = new URL(request.url);
        console.log(`Incoming request: ${request.method} ${url.pathname}${url.search}`);

        // 1. Initial Metadata Fetch (Needed for block check and filename)
        const excludedPaths = ["/sub", "/short", "/health", "/version"];
        let resolvedUrl = null;
        let shortlinkMetadata = null;
        let shortCode = null;

        // More robust shortCode extraction: /abc123/ -> abc123
        const pathParts = url.pathname.split('/').filter(Boolean);
        const potientialCode = pathParts.length > 0 ? pathParts[pathParts.length - 1] : null;

        if (potientialCode && !excludedPaths.includes("/" + potientialCode) && !url.pathname.startsWith("/admin/")) {
            if (env.SHORT_URL_STORAGE) {
                shortCode = potientialCode;
                const stored = await env.SHORT_URL_STORAGE.get(shortCode);
                if (stored) {
                    try {
                        shortlinkMetadata = JSON.parse(stored);
                        resolvedUrl = shortlinkMetadata.url;
                    } catch (e) {
                        resolvedUrl = stored; // Old string format
                    }
                }
            }
        }

        // 2. Parse Parameters (Moved up to avoid ReferenceError in block check)
        const sourceUrl = resolvedUrl || request.url;
        const longUrlObj = new URL(sourceUrl.includes("url=") ? sourceUrl : `https://dummy.com/?url=${encodeURIComponent(sourceUrl)}`, sourceUrl);

        const target = url.searchParams.get("target") || longUrlObj.searchParams.get("target") || "clash";
        const actualSub = longUrlObj.searchParams.get("url");

        // Prioritize filename from shortlink metadata, then URL param, then default
        const filename = (shortlinkMetadata && shortlinkMetadata.filename) ||
            url.searchParams.get("filename") ||
            longUrlObj.searchParams.get("filename") ||
            "Digital_Freedom";

        // 3. Block Check (Must be after parameter parsing)
        if (shortlinkMetadata && shortlinkMetadata.blocked) {
            console.log(`[BLOCK] Shortlink ${url.pathname} is BLOCKED. Returning Dummy Config.`);
            const res = await returnDummyConfig(target, filename);
            res.headers.set("X-Block-Reason", "Metadata Flag");
            res.headers.set("X-Target-Parsed", target);
            return res;
        }

        if (!actualSub || actualSub === "undefined") {
            if (url.pathname === "/sub" || url.pathname === "/") {
                console.error("No valid subscription URL found.");
                return new Response(JSON.stringify({ error: "No subscription URL provided." }), { status: 400 });
            }
            // If it's a random path and not a shortlink, 404
            return new Response("Not Found", { status: 404 });
        }

        console.log(`Processing subscription for target ${target}: ${actualSub}`);

        // --- Device Lock Logic ---
        const devLock = url.searchParams.get("dev_lock") === "true" || longUrlObj.searchParams.get("dev_lock") === "true";
        if (devLock && env.SHORT_URL_STORAGE) {
            try {
                const clientIP = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "0.0.0.0";
                const ua = (request.headers.get("User-Agent") || "Unknown").toLowerCase();

                // Extract OS/App Category from UA
                let deviceCat = "other";
                if (ua.includes("windows")) deviceCat = "windows";
                else if (ua.includes("macintosh") || ua.includes("mac os")) deviceCat = "mac";
                else if (ua.includes("android")) deviceCat = "android";
                else if (ua.includes("iphone") || ua.includes("ipad")) deviceCat = "ios";
                else if (ua.includes("clash")) deviceCat = "clash";
                else if (ua.includes("shadowrocket")) deviceCat = "shadowrocket";
                else if (ua.includes("hidify") || ua.includes("hiddify")) deviceCat = "hidify";
                else if (ua.includes("sing-box")) deviceCat = "sing-box";
                else if (ua.includes("v2ray")) deviceCat = "v2ray";

                const subHash = await sha256(actualSub);
                // IMPORTANT: Isolate lock by ShortCode if possible so users sharing same sub don't block each other
                const currentShortCode = url.pathname.length > 1 ? url.pathname.substring(1) : "direct";
                const lockId = shortlinkMetadata ? currentShortCode : subHash;

                // Allow IP roaming (subnet /24) instead of strict single IP
                const ipParts = clientIP.split(".");
                const ipSubnet = ipParts.length === 4 ? `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0` : clientIP;

                const currentSignature = `${ipSubnet}|${deviceCat}`;
                const lockKey = `lock:${lockId}`;

                const storedSignature = await env.SHORT_URL_STORAGE.get(lockKey);

                if (!storedSignature) {
                    // First time access - Lock it
                    console.log(`Locking subscription ${subHash} to device: ${currentSignature}`);
                    await env.SHORT_URL_STORAGE.put(lockKey, currentSignature);
                } else if (storedSignature !== currentSignature && !ua.includes("browser")) {
                    // Device mismatch - skip block if it's just a browser preview
                    const [storedIP, storedCat] = storedSignature.split("|");
                    console.warn(`Device mismatch blocked for ${subHash}. Stored: ${storedSignature}, Current: ${currentSignature}`);

                    return new Response(JSON.stringify({
                        error: "Device Locked",
                        details: "This subscription is locked to another device.",
                        locked_to: storedCat,
                        locked_ip: storedIP.replace(/\.\d+$/, ".*")
                    }), {
                        status: 403,
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }
            } catch (lockErr) {
                console.warn("Device lock logic failed, skipping protection:", lockErr.message);
            }
        }

        // 3. UserInfo Extraction (Disabled as per user request to hide quota/expiry)
        let realUserinfo = null;


        // 5. Backend Fallback Proxy Logic
        const backends = [
            "https://api.v1.mk",
            "https://sub.xeton.dev",
            "https://sub.id9.cc",
            "https://sub.d1.mk",
            "https://api.asailor.org"
        ];

        const listSupportTargets = ['clash', 'surge', 'quan', 'quanx', 'surfboard', 'loon', 'clashr'];
        const useList = listSupportTargets.includes(target.toLowerCase());

        for (const backend of backends) {
            try {
                const finalParams = new URLSearchParams(longUrlObj.searchParams);

                // Clean up local parameters before sending to public backends
                finalParams.delete("dev_lock");
                finalParams.delete("device");
                finalParams.delete("os");

                if (useList) {
                    finalParams.set("list", "true");
                    finalParams.set("emoji", "true");
                }
                if (!finalParams.has("fpg")) finalParams.set("fpg", "true");

                // Force UA=v2rayNG to bypass 502/blocked source fetches
                finalParams.set("ua", "v2rayNG");

                const proxyUrl = `${backend}/sub?${finalParams.toString()}`;
                const isLong = proxyUrl.length > 2000;
                console.log(`Trying ${backend} | Method: ${isLong ? 'POST' : 'GET'} | Length: ${proxyUrl.length}`);

                let res;
                if (isLong && (backend.includes("api.v1.mk") || backend.includes("id9.cc"))) {
                    try {
                        res = await fetch(`${backend}/sub`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "User-Agent": "v2rayNG/1.8.8"
                            },
                            body: finalParams.toString()
                        });
                        console.log(`POST to ${backend} status: ${res.status}`);
                    } catch (fetchErr) {
                        console.warn(`POST failed for ${backend}: ${fetchErr.message}`);
                    }
                }

                if (!res || !res.ok) {
                    res = await fetch(proxyUrl, {
                        headers: { "User-Agent": "v2rayNG/1.8.8" },
                        method: "GET",
                        cf: { cacheTtl: 600 }
                    });
                }

                if (res.ok) {
                    let data = await res.text();
                    if (data.trim().length < 10) continue;

                    console.log(`Success from ${backend}. Size: ${data.length}`);

                    // Strip potential quota/expiry comments added by backends like api.v1.mk
                    // These usually look like: 
                    // # upload=... download=... total=... expire=...
                    // # 剩余流量：...
                    data = data.replace(/^#\s*(upload|download|total|expire|剩余流量|已用流量|總流量|到期時間).*\n/gim, "");
                    data = data.replace(/^#\s*Sub-info:.*\n/gim, "");

                    const h = new Headers();
                    h.set("Access-Control-Allow-Origin", "*");
                    h.set("Content-Type", target === 'clash' ? "application/yaml; charset=utf-8" : "text/plain; charset=utf-8");
                    h.set("Content-Disposition", `attachment; filename=${filename}`);

                    // Update Intervals (Minutes vs Hours compatibility)
                    h.set("Profile-Update-Interval", "2");      // Clash (Minutes)
                    h.set("X-Config-Update-Interval", "2");    // Shadowrocket/Surfboard (Minutes)
                    h.set("Subscription-Update-Interval", "0.033"); // Some clients parse as hours

                    // Userinfo / Quota (REMOVED as per user request to hide progress bars)
                    // h.set("Subscription-Userinfo", "upload=0; download=0; total=999999999; expire=0");

                    // Profile Title (Helping HIDIFY/Shadowrocket show correct name)
                    h.set("Profile-Title", filename);

                    h.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
                    h.set("Pragma", "no-cache");
                    h.set("Expires", "0");
                    h.set("Access-Control-Expose-Headers", "*");

                    console.log(`Sending response headers:`, JSON.stringify(Object.fromEntries(h.entries())));

                    if (target !== "clash") {
                        data = safeB64(tryDecode(data) || data);
                    }

                    // Final watchdog headers
                    h.set("X-Worker-Status", "Processed");
                    h.set("X-Link-ID", shortCode || "direct");
                    h.set("X-Block-Active", "false");

                    return new Response(data, { status: 200, headers: h });
                } else {
                    console.warn(`Backend ${backend} failed with status ${res.status}`);
                }
            } catch (e) {
                console.error(`Error with ${backend}:`, e.message);
            }
        }

        const errorMsg = `Error: All backends failed (502).
The backend servers could not process the request. 
URL Length: ${longUrlObj.toString().length}
Possible causes: URL too long, Source URL down, or Backend overloaded.`;

        if (target === 'clash') {
            return new Response(`proxies:\n  - name: "⚠️ ${errorMsg.replace(/\n/g, ' ')}"\n    type: vmess\n    server: 127.0.0.1\n    port: 1\n    uuid: 00000000-0000-0000-0000-000000000000\n    alterId: 0\n    cipher: auto`, {
                status: 200,
                headers: { "Content-Type": "application/yaml; charset=utf-8", "Access-Control-Allow-Origin": "*" }
            });
        }

        return new Response(errorMsg, {
            status: 502,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        console.error("Critical worker error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
}

/**
 * Health check endpoint
 */
function handleHealthCheck(request, env) {
    return new Response(
        JSON.stringify({
            status: 'ok',
            service: 'Guardian Subscription Converter',
            version: '2.4-stable',
            backends: ["sub.xeton.dev", "sub.id9.cc", "sub.url.fyi"]
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
}

/**
 * Handle short link creation
 */
/**
 * Handle short link creation
 */
async function handleShorten(request, env) {
    console.log("--- handleShorten called ---");
    try {
        const body = await request.json();
        console.log("Request body:", JSON.stringify(body));
        const { longUrl, sourceUrl } = body;
        if (!longUrl) return new Response(JSON.stringify({ error: "No URL" }), { status: 400 });

        const shortCode = Math.random().toString(36).substring(2, 8);

        // Extract metadata from longUrl
        let filename = "unnamed";
        let devLock = false;
        try {
            const urlObj = new URL(longUrl.startsWith('http') ? longUrl : `http://d.com/${longUrl}`);
            filename = urlObj.searchParams.get("filename") || "unnamed";
            devLock = urlObj.searchParams.get("dev_lock") === "true";
        } catch (e) {
            console.warn("Failed to parse metadata from longUrl:", e.message);
        }

        const metadata = {
            url: longUrl,
            source_url: sourceUrl || longUrl, // Fallback to longUrl if not provided
            filename: filename,
            dev_lock: devLock,
            created_at: new Date().toISOString(),
            blocked: false
        };

        if (env.SHORT_URL_STORAGE) {
            console.log(`[STORAGE] Saving ${shortCode} to KV`);
            await env.SHORT_URL_STORAGE.put(shortCode, JSON.stringify(metadata));
            console.log(`[STORAGE] Metadata saved for ${shortCode}:`, JSON.stringify(metadata));

            let shortUrlBase = env.SHORT_URL_BASE || env.FRONTEND_URL;
            if (shortUrlBase) shortUrlBase = shortUrlBase.replace(/\/$/, "");
            else {
                const url = new URL(request.url);
                shortUrlBase = `${url.protocol}//${url.host}`;
            }
            const shortUrl = `${shortUrlBase}/${shortCode}`;

            return new Response(JSON.stringify({ Code: 1, ShortUrl: shortUrl, shortUrl, shortCode }), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
        return new Response(JSON.stringify({ error: "KV not bound" }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

/**
 * Admin: List all shortlinks
 */
async function handleAdminList(request, env) {
    if (!env.SHORT_URL_STORAGE) return new Response("KV not bound", { status: 500 });

    // Auth Check
    const auth = request.headers.get("Authorization");
    if (auth !== env.ADMIN_PASSWORD) {
        console.warn(`Admin list auth failed. Provided: ${auth}`);
        return new Response("Unauthorized", { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    try {
        console.log("[ADMIN] Listing keys...");
        const list = await env.SHORT_URL_STORAGE.list();
        const results = [];
        const keys = list.keys || [];
        console.log(`[ADMIN] Found ${keys.length} keys in KV`);

        for (const key of keys) {
            if (key.name.startsWith("lock:")) continue;

            const value = await env.SHORT_URL_STORAGE.get(key.name);
            if (!value) continue;

            try {
                const data = JSON.parse(value);
                results.push({
                    id: key.name,
                    ...data
                });
            } catch (e) {
                results.push({
                    id: key.name,
                    url: value,
                    filename: "legacy",
                    dev_lock: false,
                    created_at: null,
                    blocked: false
                });
            }
        }

        console.log(`[ADMIN] Returning ${results.length} processed shortlinks`);
        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (e) {
        console.error(`[ADMIN] Fatal error in list: ${e.message}`);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

/**
 * Admin: Delete shortlink
 */
async function handleAdminDelete(request, env) {
    // Auth Check
    const auth = request.headers.get("Authorization");
    if (auth !== env.ADMIN_PASSWORD) return new Response("Unauthorized", { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });

    try {
        const { id } = await request.json();
        if (!id) return new Response("No ID", { status: 400 });
        await env.SHORT_URL_STORAGE.delete(id);
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

/**
 * Admin: Toggle block
 */
async function handleAdminToggle(request, env) {
    // Auth Check
    const auth = request.headers.get("Authorization");
    if (auth !== env.ADMIN_PASSWORD) return new Response("Unauthorized", { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });

    try {
        const { id } = await request.json();
        if (!id) return new Response("No ID", { status: 400 });

        const value = await env.SHORT_URL_STORAGE.get(id);
        if (!value) return new Response("Not found", { status: 404 });

        let data;
        try {
            data = JSON.parse(value);
        } catch (e) {
            data = { url: value, filename: "legacy", blocked: false };
        }

        data.blocked = !data.blocked;
        await env.SHORT_URL_STORAGE.put(id, JSON.stringify(data));

        return new Response(JSON.stringify({ success: true, blocked: data.blocked }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

/**
 * Version check endpoint
 */
function handleVersion(request, env) {
    return new Response("subconverter v2.4-stable", {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
}

// Routes
router.options('*', handleOptions);
router.get('/health', (req, env) => handleHealthCheck(req, env));
router.get('/version', (req, env) => handleVersion(req, env));
router.get('/sub', (req, env) => proxyToBackend(req, env));
router.post('/sub', (req, env) => proxyToBackend(req, env));
router.post('/short', (req, env) => handleShorten(req, env));

// Admin Routes
router.get('/admin/list', (req, env) => handleAdminList(req, env));
router.post('/admin/delete', (req, env) => handleAdminDelete(req, env));
router.post('/admin/toggle', (req, env) => handleAdminToggle(req, env));

router.get('/:id', (req, env) => proxyToBackend(req, env));
router.all('*', () => new Response("Not Found", { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }));

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        console.log(`[REQUEST] ${request.method} ${url.pathname}${url.search}`);
        return router.handle(request, env, ctx);
    },
};
