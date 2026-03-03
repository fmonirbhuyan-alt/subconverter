import { CONSTANTS } from '@/config/constants';
import { formatVersion } from '@/utils/formatters';

/**
 * 后端版本检查服务
 */
export class BackendService {
  /**
   * 获取后端版本信息
   * @param {Object} $axios - Axios实例
   * @returns {Promise<string>} 版本信息
   */
  static async getBackendVersion($axios) {
    // 提取版本 API 路径
    const versionApiUrl = CONSTANTS.DEFAULT_BACKEND.substring(0, CONSTANTS.DEFAULT_BACKEND.length - 5) + "/version";

    try {
      const response = await $axios.get(versionApiUrl);
      // 清理版本信息格式
      let version = formatVersion(response.data);
      if (typeof version === 'string' && (version.includes('<!DOCTYPE') || version.includes('<html'))) {
        return "";
      }
      return version;
    } catch (error) {
      // 静默处理，不显示错误信息，避免干扰用户体验
      return "";
    }
  }

  /**
   * Scan nodes from subscription URL
   * @param {Object} $axios - Axios instance
   * @param {string} subUrl - Subscription URL
   * @returns {Promise<Array<string>>} List of node names
   */
  static async getNodes($axios, subUrl) {
<<<<<<< HEAD
    const logs = [];
    const addLog = (msg) => {
      console.log(`[Scan] ${msg}`);
      logs.push(msg);
    };

    try {
      let content = "";

      // 1. Try direct fetch (ONLY in development mode)
      if (import.meta.env.DEV) {
        addLog("Attempting Direct Fetch (DEV ONLY)...");
        try {
          const response = await $axios.get(subUrl, { timeout: 10000 });
          content = response.data;
          if (content) addLog("Direct Fetch success.");
        } catch (e) {
          addLog(`Direct Fetch failed: ${e.message}`);
        }
      }

      // 2. Try primary backend proxy
      if (!this.isValidContent(content)) {
        const baseUrl = import.meta.env.DEV ? '/api' : CONSTANTS.DEFAULT_BACKEND.replace(/\/sub\?$/, '');
        const backendUrl = `${baseUrl}/sub?target=clash&url=${encodeURIComponent(subUrl)}&insert=false&ua=clash`;

        addLog(`Attempting Backend Proxy: ${baseUrl}`);
        try {
          const response = await $axios.get(backendUrl, { timeout: 15000 });
          content = response.data;
          if (content) addLog("Backend Proxy success.");
        } catch (e) {
          addLog(`Backend Proxy failed: ${e.message}`);
        }
      }

      // 3. Fallback to a public CORS Proxy (allorigins)
      if (!this.isValidContent(content)) {
        const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(subUrl)}`;
        addLog("Attempting Public CORS Proxy (allorigins)...");

        try {
          const resp = await fetch(corsProxyUrl);
          if (resp.ok) {
            content = await resp.text();
            addLog("Public CORS Proxy success.");
          } else {
            addLog(`Public CORS Proxy error status: ${resp.status}`);
          }
        } catch (e) {
          addLog(`Public CORS Proxy failed: ${e.message}`);
        }
      }

      // FINAL VALIDATION & DECODING
      if (!content || typeof content !== 'string') {
        throw new Error(`Failed to fetch content. Attempts: ${logs.join(' -> ')}`);
      }

      // Handle Base64 encoded content
      if (!content.includes('proxies:') && !content.includes('- name:') && !content.includes('://')) {
        try {
          const trimmed = content.trim().replace(/\s/g, '');
          if (trimmed.length > 30 && /^[A-Za-z0-9+/=]+$/.test(trimmed)) {
            const decoded = atob(trimmed);
            if (this.isValidContent(decoded)) {
              addLog("Detected and decoded Base64 content.");
              content = decoded;
            }
          }
        } catch (e) {
          addLog("Content is not Base64 or decoding failed.");
        }
      }

      if (this.isHtml(content)) {
        throw new Error("Received HTML instead of subscription. The provider might be blocking the request or requiring a login.");
      }

      if (!this.isValidContent(content)) {
        const snippet = content.substring(0, 50).replace(/\n/g, ' ');
        throw new Error(`Invalid subscription format. Content preview: "${snippet}..."`);
      }

      // Parsing logic
=======
    try {
      let content = "";
      try {
        const response = await $axios.get(subUrl, { timeout: 10000 });
        content = response.data;
      } catch (e) {
        console.log("Direct fetch failed, trying backend proxy...");
      }

      if (!content || (!content.includes('proxies:') && !content.includes('- name:'))) {
        // Ensure baseUrl is just the API root
        const baseUrl = import.meta.env.DEV ? '/api' : CONSTANTS.DEFAULT_BACKEND.replace(/\/sub\?$/, '');
        // target=clash&list=true is the industry standard for getting raw node lists
        const backendUrl = `${baseUrl.replace(/\/$/, '')}/sub?target=clash&url=${encodeURIComponent(subUrl)}&insert=false&list=true&emoji=true`;

        console.log(`Scanning via Clash List: ${backendUrl}`);
        const response = await $axios.get(backendUrl, { timeout: 30000 });
        content = response.data;
      }

>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
      const proxyNames = [];
      const groupNames = [];

      const blacklist = [
<<<<<<< HEAD
        "到期", "GB"
      ];

      // Format 1: Clash YAML
      const isYaml = content.includes('proxies:') || content.includes('proxy-groups:');
      if (isYaml) {
        addLog("Parsing as Clash YAML...");
        const sections = content.split('proxy-groups:');
        const proxySection = sections[0];
        const groupsSection = sections[1] || "";

        const regex = /name:\s*['"]?([^'"},\n\r\t]+)['"]?/g;
        let match;

        while ((match = regex.exec(proxySection)) !== null) {
          const name = match[1].trim();
          if (name && !blacklist.some(item => name === item || name.includes(item)) && !proxyNames.includes(name)) {
            proxyNames.push(name);
          }
        }

        while ((match = regex.exec(groupsSection)) !== null) {
          const name = match[1].trim();
          if (name && !blacklist.some(item => name === item) && !groupNames.includes(name)) {
            groupNames.push(name);
          }
        }
      }

      // Format 2: Raw Protocol List (SS/SSR/VMess/VLESS/Trojan)
      // Attempt to parse line by line if YAML yielded nothing or if protocols are prevalent
      if (proxyNames.length === 0 || content.includes('://')) {
        addLog("Checking for raw proxy protocols...");
        const lines = content.split(/\r?\n/);
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;

          // Pattern for links often followed by #name
          const hashMatch = line.match(/#(.*)$/);
          if (hashMatch) {
            let name = "";
            try {
              name = decodeURIComponent(hashMatch[1]);
            } catch (e) {
              name = hashMatch[1];
            }

            if (name && !blacklist.some(item => name.includes(item)) && !proxyNames.includes(name)) {
              proxyNames.push(name);
            }
          }
        }
      }

      addLog(`Parsing complete. Found ${proxyNames.length} nodes and ${groupNames.length} groups.`);

      return {
        nodes: proxyNames,
        groups: groupNames
      };
    } catch (error) {
      console.error("[Scan Service Error]", error);
      throw error;
    }
  }

  /**
   * Simple validation for YAML/Clash or proxy lists
   */
  static isValidContent(content) {
    if (!content || typeof content !== 'string') return false;
    if (this.isHtml(content)) return false;
    const c = content.trim();
    return c.includes('proxies:') ||
      c.includes('- name:') ||
      c.includes('ssr://') ||
      c.includes('vmess://') ||
      c.includes('vless://') ||
      c.includes('trojan://') ||
      c.includes('ss://');
  }

  static isHtml(content) {
    if (!content || typeof content !== 'string') return false;
    const c = content.trim().toLowerCase();
    return (c.includes('<!doctype') || c.includes('<html') || c.includes('<body') || c.includes('<div')) && (c.includes('</html>') || c.includes('</body>'));
  }
=======
        "DIRECT", "REJECT", "Selector", "URLTest", "Fallback", "LoadBalance",
        "距离下次重置剩余", "重置", "剩余", "到期", "流量", "GB", "MB", "条线路", "过滤掉", "更-新", "订阅",
        "剩余流量", "套餐到期", "www.bing.com", "ipv6免流", "请自行修改host",
        "手动选择", "自动选择", "即時通訊", "即时通讯", "社交媒體", "社交媒体", "GitHub", "ChatGPT", "AI服務", "AI服务", "TikTok", "YouTube",
        "Netflix", "DisneyPlus", "HBO", "PrimeVideo", "AppleTV+", "Emby", "Spotify", "Bahamut",
        "国外媒体", "国外电商", "谷歌FCM", "谷歌服务", "苹果服务", "微软服务", "游戏平台", "Steam",
        "测速工具", "漏网之鱼", "非标端口", "香港节点", "美国节点", "日本节点", "新加坡节点", "台湾节点", "韩国节点", "全球直连",
        "Provider_", "proxy-provider", "subscription-userinfo"
      ];

      const cleanStr = (s) => s.replace(/[\u2000-\u2BFF\u{1F000}-\u{1F9FF}]/gu, '').replace(/\s+/g, '').trim();

      try {
        let lines = content.split('\n');
        console.log(`Parser starting: ${lines.length} lines. Content starts with: ${content.substring(0, 100)}`);

        // --- Smart Parser: Handle Base64 / Share Links ---
        const firstLine = lines[0].trim();
        const isBase64 = firstLine.length > 50 && !firstLine.includes(':') && !firstLine.includes('://');

        if (isBase64) {
          try {
            const decoded = atob(firstLine.replace(/[\s\r\n]/g, ""));
            content = decoded;
            lines = content.split('\n');
            console.log("Detected Base64 subscription, decoded successfully.");
          } catch (e) {
            console.warn("Attempted Base64 decode but failed.");
          }
        }

        // Regex for common share links
        const nodeRegex = /(?:vmess|ss|vless|trojan|ssr):\/\/([^#\s\n]+)(?:#([^#\s\n]+))?/gi;
        const matches = [...content.matchAll(nodeRegex)];

        if (matches.length > 0) {
          console.log(`Smart Parser: Found ${matches.length} share links.`);
          matches.forEach(match => {
            let name = "";
            if (match[2]) {
              // Extract from #remarks
              name = decodeURIComponent(match[2]).trim();
            } else if (match[0].startsWith('vmess://')) {
              // Try to parse vmess JSON for 'ps' field
              try {
                const config = JSON.parse(atob(match[1]));
                name = config.ps || config.add || "Unknown Vmess";
              } catch (e) { name = "Vmess Node"; }
            }

            if (name) {
              const cleanedName = cleanStr(name);
              const isBlacklisted = blacklist.some(item => cleanedName === cleanStr(item));
              if (!isBlacklisted && !proxyNames.includes(name)) {
                proxyNames.push(name);
              }
            }
          });
        }

        // --- Standard YAML Parser ---
        let currentSection = "";
        console.log(`Starting standard scan of ${lines.length} lines...`);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;

          // 1. Identify Sections
          const indent = line.search(/\S/);
          const sectionMatch = trimmed.match(/^([^:\s]+):/);

          if (sectionMatch && (indent === 0 || !currentSection)) {
            const potentialSection = sectionMatch[1].toLowerCase();
            if (["proxies", "proxy-groups", "rules"].includes(potentialSection)) {
              currentSection = potentialSection;
              console.log(`Entering section: ${currentSection} at line ${i}`);
            }
          }

          // 2. Fallback: If we see a proxy definition but no section yet, assume proxies
          if (!currentSection && trimmed.match(/^-\s*name:/)) {
            currentSection = "proxies";
          }

          // Only process proxies and groups sections
          if (currentSection !== "proxies" && currentSection !== "proxy-groups") continue;

          // 2. Extract Names
          // Support both: - name: "Node"  AND  - {name: "Node", ...}
          const nameMatch = trimmed.match(/name:\s*['"]?([^'"}\n\r,]+)['"]?/i);

          if (nameMatch) {
            const name = nameMatch[1].trim();
            if (i < 100) console.log(`Found name: ${name} in ${currentSection}`);
            const cleanedName = cleanStr(name);

            const isBlacklisted = blacklist.some(item => {
              const cleanedItem = cleanStr(item);
              return cleanedName === cleanedItem || (name.includes(item) && item.length > 3);
            });

            if (!isBlacklisted) {
              if (currentSection === "proxies") {
                if (!proxyNames.includes(name)) proxyNames.push(name);
              } else if (currentSection === "proxy-groups") {
                // In proxy-groups, if it has a 'type', it's a group
                if (trimmed.toLowerCase().includes('type:') || line.includes('type:')) {
                  if (!groupNames.includes(name)) groupNames.push(name);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Advanced scan failed:", err);
        // Fallback to simple regex if line-by-line fails
        const regex = /name:\s*['"]?([^'"},\n\r]+)['"]?/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          const name = match[1].trim();
          if (name && !blacklist.some(item => name.includes(item)) && !proxyNames.includes(name)) {
            proxyNames.push(name);
          }
        }
      }

      console.log(`Scan Complete. Found ${proxyNames.length} nodes and ${groupNames.length} groups.`);
      return { nodes: proxyNames, groups: groupNames };
    } catch (error) {
      console.error("Failed to scan nodes:", error);
      const msg = error.response?.data?.error || error.message || "Unknown error";
      throw new Error(`Scan failed: ${msg}. Please check if the link is valid.`);
    }
  }
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
}
