/* Digital Freedom - Unified Backend v1.2.1 (Final Bypass + iOS Format Fix) */
const BACKENDS = ['https://api.asailor.org', 'https://sub-api.nanako.vip'];
const SHORT_DOMAIN = 'https://s.digital-freedom.site';

export default {
    async fetch(request, env, ctx) {
        let url = new URL(request.url);
        const originalUserAgent = request.headers.get('User-Agent') || '';

        // Allow iOS native client agents (cfnetwork, dart, ios) to bypass the Worker Protection
        const isVpnApp = /hiddify|shadowrocket|clash|v2ray|v2rayng|surfboard|stash|sing-box|quantumult|cfnetwork|dart|okhttp|ios/i.test(originalUserAgent) || originalUserAgent.trim() === '';

        // 1. Version
        if (url.pathname === '/version') {
            return new Response('Digital Freedom v1.2.1', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
            });
        }

        let path = url.pathname;
        const isAdmin = path.endsWith('/AdMiN');
        const cleanPath = isAdmin ? path.replace('/AdMiN', '') : path;

        // Fixed Access Denied Template (Added charset)
        const accessDeniedHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Access Denied</title>
      </head>
      <body style="background:#0f0f0f; color:#ff4d4d; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; flex-direction:column; text-align:center;">
          <div style="border: 2px solid #ff4d4d; padding: 40px; border-radius: 15px; background: #1a1a1a; box-shadow: 0 0 20px rgba(255,77,77,0.3);">
            <h1 style="font-size:3rem; margin-bottom:10px;">🚫 ACCESS DENIED</h1>
            <p style="font-size:1.2rem; color:#888;">Direct browser access is strictly prohibited.</p>
            <p style="font-weight:bold; color:#00ff88; margin-top:20px; border:1px solid #00ff88; padding:15px; border-radius:8px; display:inline-block; letter-spacing:1px;">PLEASE USE YOUR APPLICATION</p>
          </div>
      </body>
      </html>`;

        // 2. Main Protection Logic
        if (cleanPath !== '/' && cleanPath !== '/health' && cleanPath !== '/short') {

            // UNIVERSAL PROTECTION
            if (!isVpnApp && !isAdmin) {
                return new Response(accessDeniedHtml, {
                    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
                });
            }

            let finalLongUrl = '';
            if (cleanPath === '/sub') {
                finalLongUrl = request.url.replace('/AdMiN', '');
            } else {
                // If no SHORT_URL_STORAGE is bound, just return finalLongUrl as empty so it falls through or fails gracefully
                const code = cleanPath.substring(1);
                if (env.SHORT_URL_STORAGE) {
                    const storedUrl = await env.SHORT_URL_STORAGE.get(code);
                    if (storedUrl) finalLongUrl = storedUrl;
                }
            }

            // === MODIFIED FOR MOBILE APPS ===
            if (finalLongUrl) {
                const targetUrl = new URL(finalLongUrl);
                if (targetUrl.hostname === 'api.digital-freedom.site') {
                    url.pathname = targetUrl.pathname;
                    url.search = targetUrl.search;
                } else {
                    const fetchHeaders = new Headers(request.headers);
                    // Spoof User-Agent as a common VPN app so public subconverters don't block iOS devices
                    if (/cfnetwork|dart|okhttp|ios/i.test(originalUserAgent) || originalUserAgent.includes('Mozilla')) {
                        fetchHeaders.set('User-Agent', 'v2rayNG/1.8.8');
                    }

                    const subResponse = await fetch(new Request(finalLongUrl, {
                        headers: fetchHeaders,
                        method: 'GET',
                        redirect: 'follow'
                    }));

                    const contentType = subResponse.headers.get('Content-Type') || '';
                    const newHeaders = new Headers(subResponse.headers);
                    newHeaders.delete('subscription-userinfo');
                    newHeaders.set('Access-Control-Allow-Origin', '*');

                    // Only format text/plain if it's NOT an HTML error page
                    if (subResponse.ok && !contentType.includes('text/html') && !isAdmin) {
                        newHeaders.set('Content-Type', 'text/plain; charset=utf-8');
                    } else if (isAdmin) {
                        newHeaders.set('Content-Disposition', 'attachment; filename="DigitalFreedom.yml"');
                        newHeaders.set('Content-Type', 'application/octet-stream; charset=utf-8');
                    }

                    return new Response(subResponse.body, { status: subResponse.status, headers: newHeaders });
                }
            }
        }

        // 3. Short Link Generation
        if (url.pathname === '/short' && request.method === 'POST') {
            try {
                const formData = await request.formData();
                const rawLongUrl = formData.get('longUrl');
                const longUrl = atob(rawLongUrl);
                const code = Math.random().toString(36).substring(2, 7);
                if (env.SHORT_URL_STORAGE) {
                    await env.SHORT_URL_STORAGE.put(code, longUrl);
                    return new Response(JSON.stringify({ Code: 1, ShortUrl: `${SHORT_DOMAIN}/${code}` }), {
                        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
                    });
                } else {
                    return new Response(JSON.stringify({ Code: 0, Message: "KV Storage not configured" }), { status: 500 });
                }
            } catch (e) { return new Response(JSON.stringify({ Code: 0, Message: e.message }), { status: 500 }); }
        }

        // 4. Default Gateway
        if (url.pathname === '/health' || url.pathname === '/') {
            return new Response('Digital Freedom Gateway Live', { status: 200 });
        }

        // === MODIFIED FOR MOBILE APPS ===
        for (const backend of BACKENDS) {
            const proxyUrl = new URL(backend);
            proxyUrl.pathname = url.pathname;
            proxyUrl.search = url.search;
            try {
                const fetchHeaders = new Headers(request.headers);
                // Spoof standard VPN app User-Agent to bypass public subconverter Cloudflare checks
                if (/cfnetwork|dart|okhttp|ios/i.test(originalUserAgent) || originalUserAgent.includes('Mozilla')) {
                    fetchHeaders.set('User-Agent', 'v2rayNG/1.8.8');
                }

                const response = await fetch(new Request(proxyUrl, {
                    method: request.method,
                    headers: fetchHeaders,
                    body: request.body,
                    redirect: 'follow'
                }));

                const contentType = response.headers.get('Content-Type') || '';

                // ONLY ACCEPT 200 OK without HTML! If this backend sends 403 Forbidden HTML, skip to the next backend!
                if (response.ok && !contentType.includes('text/html')) {
                    const proxyHeaders = new Headers(response.headers);
                    proxyHeaders.delete('subscription-userinfo');
                    proxyHeaders.set('Access-Control-Allow-Origin', '*');

                    if (!isAdmin) {
                        proxyHeaders.set('Content-Type', 'text/plain; charset=utf-8');
                    } else {
                        proxyHeaders.set('Content-Disposition', 'attachment; filename="DigitalFreedom.yml"');
                        proxyHeaders.set('Content-Type', 'application/octet-stream; charset=utf-8');
                    }

                    return new Response(response.body, { status: response.status, headers: proxyHeaders });
                }
            } catch (e) { continue; }
        }

        // Fallback: If all backends are down or blocking, fetch the raw config directly for V2Ray apps!
        const targetParam = url.searchParams.get('target') || 'v2ray';
        const rawUrlParam = url.searchParams.get('url');

        if (rawUrlParam && (targetParam === 'v2ray' || targetParam === 'mixed')) {
            try {
                // The URL might be multiple URLs joined by '|'
                const urls = rawUrlParam.split('|');
                let combinedText = '';

                for (const singleUrl of urls) {
                    const fallbackResponse = await fetch(new Request(singleUrl, {
                        method: 'GET',
                        redirect: 'follow',
                        headers: { 'User-Agent': 'v2rayNG/1.8.8' }
                    }));

                    if (fallbackResponse.ok) {
                        const text = await fallbackResponse.text();
                        combinedText += text + '\n';
                    }
                }

                if (combinedText.trim()) {
                    const fallbackHeaders = new Headers();
                    fallbackHeaders.set('Access-Control-Allow-Origin', '*');

                    if (!isAdmin) {
                        fallbackHeaders.set('Content-Type', 'text/plain; charset=utf-8');
                    } else {
                        fallbackHeaders.set('Content-Disposition', 'attachment; filename="DigitalFreedom.yml"');
                        fallbackHeaders.set('Content-Type', 'application/octet-stream; charset=utf-8');
                    }
                    return new Response(combinedText, { status: 200, headers: fallbackHeaders });
                }
            } catch (e) {
                // Ignore fallback error and proceed to Gateway Error
            }
        }

        // If all backends are down or blocking the request, and fallback also fails, return a clear 503
        return new Response('Gateway Error: All remote backends are blocking the request or offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
        });
    }
};
