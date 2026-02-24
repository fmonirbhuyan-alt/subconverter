/* Digital Freedom - Unified Backend v1.3.5 (The Final Surgical Fix) */
const BACKENDS = ['https://api.asailor.org', 'https://sub-api.nanako.vip', 'https://sub.asailor.org'];
const SHORT_DOMAIN = 'https://s.digital-freedom.site';

export default {
    async fetch(request, env, ctx) {
        let url = new URL(request.url);
        const ua = request.headers.get('User-Agent') || '';
        const isVpnApp = /hiddify|shadowrocket|clash|v2ray|v2rayng|surfboard|stash|sing-box|quantumult|cfnetwork|dart|okhttp|ios/i.test(ua) || ua.trim() === '';

        // UTF-8 Safe Base64 Helper
        const safeB64 = (str) => {
            try {
                const bytes = new TextEncoder().encode(str);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                return btoa(binary).replace(/[\s\r\n]/g, '');
            } catch (e) { return ""; }
        };

        const tryDecode = (str) => {
            try { return atob(str.replace(/[\s\r\n]/g, '')); } catch (e) { return null; }
        };

        // 1. Diagnostics & Health
        if (url.pathname === '/version') {
            return new Response('Digital Freedom v1.3.5', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
            });
        }

        if (url.pathname === '/' || url.pathname === '/health') {
            return new Response('Gateway Live (v1.3.5)', {
                status: 200,
                headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
            });
        }

        let path = url.pathname;
        const isAdmin = path.endsWith('/AdMiN');
        const cleanPath = isAdmin ? path.replace('/AdMiN', '') : path;

        // 2. Identify target for SUB or SHORT resolution
        let finalLongUrl = '';
        if (cleanPath === '/sub') {
            finalLongUrl = request.url.replace('/AdMiN', '');
        } else if (cleanPath.length > 1 && cleanPath !== '/short') {
            const code = cleanPath.substring(1);
            if (env.SHORT_URL_STORAGE) {
                const storedUrl = await env.SHORT_URL_STORAGE.get(code);
                if (storedUrl) finalLongUrl = storedUrl;
            }
        }

        // 3. Short URL Generation (POST)
        if (url.pathname === '/short' && request.method === 'POST') {
            try {
                const formData = await request.formData();
                const rawLongUrl = formData.get('longUrl');
                const longUrl = tryDecode(rawLongUrl) || rawLongUrl;
                const code = Math.random().toString(36).substring(2, 7);
                if (env.SHORT_URL_STORAGE) {
                    await env.SHORT_URL_STORAGE.put(code, longUrl);
                    return new Response(JSON.stringify({ Code: 1, ShortUrl: `${SHORT_DOMAIN}/${code}` }), {
                        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
                    });
                }
            } catch (e) { return new Response(e.message, { status: 500 }); }
        }

        // 4. Subscription Proxy Logic
        if (finalLongUrl) {
            const targetUrl = new URL(finalLongUrl);

            // PRESERVE QUERY PARAMS: if the user agent / app appended query string (like target=clash) 
            // to the shortlink, we need to apply them to our targetUrl so the backend knows what to return.
            for (const [key, value] of url.searchParams.entries()) {
                targetUrl.searchParams.set(key, value);
            }

            const targetParam = targetUrl.searchParams.get('target') || 'v2ray';

            const buildHeaders = () => {
                const h = new Headers();
                h.set('Access-Control-Allow-Origin', '*');
                h.set('Content-Type', 'text/plain; charset=utf-8');
                h.set('Cache-Control', 'no-store');
                h.set('Content-Disposition', `attachment; filename="config.txt"`);
                h.set('Subscription-Userinfo', 'upload=0;download=0;total=10995116277760;expire=1893456000');
                h.set('Profile-Update-Interval', '6');
                return h;
            };

            // TRY BACKENDS
            for (const backend of BACKENDS) {
                const proxyUrl = new URL(backend + '/sub' + targetUrl.search);
                try {
                    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'v2rayNG/1.8.8' } });
                    if (res.ok) {
                        const data = await res.text();
                        if (data.includes('No nodes') || data.trim().length < 10) continue;

                        let finalBody = data.trim();
                        if (targetParam !== 'clash' && !finalBody.includes('proxies:')) {
                            const decoded = tryDecode(finalBody);
                            finalBody = safeB64(decoded || finalBody);
                        }

                        const h = buildHeaders();
                        const realUserinfo = res.headers.get('subscription-userinfo');
                        if (realUserinfo) {
                            h.set('Subscription-Userinfo', realUserinfo);
                        }

                        return new Response(finalBody, { status: 200, headers: h });
                    }
                } catch (e) { continue; }
            }

            // FALLBACK TO RAW LINKS
            const rawUrlParam = targetUrl.searchParams.get('url');
            if (rawUrlParam) {
                try {
                    let combined = '';
                    let realUserinfo = null;
                    for (const u of rawUrlParam.split('|')) {
                        const r = await fetch(u, { headers: { 'User-Agent': 'v2rayNG/1.8.8' } });
                        if (r.ok) {
                            combined += (await r.text()) + '\n';
                            if (!realUserinfo) realUserinfo = r.headers.get('subscription-userinfo');
                        }
                    }
                    if (combined.trim()) {
                        let finalBody = combined.trim();
                        if (targetParam !== 'clash') finalBody = safeB64(finalBody);

                        const h = buildHeaders();
                        if (realUserinfo) {
                            h.set('Subscription-Userinfo', realUserinfo);
                        }

                        return new Response(finalBody, { status: 200, headers: h });
                    }
                } catch (e) { }
            }
        }

        return new Response('Digital Freedom Gateway Active', { status: 200 });
    }
};
