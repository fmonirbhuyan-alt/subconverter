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
   * @returns {Promise<Object>} Object containing nodes and groups
   */
  static async getNodes($axios, subUrl) {
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
        const backendUrl = `${baseUrl.replace(/\/$/, '')}/sub?target=v2ray&url=${encodeURIComponent(subUrl)}&insert=false&list=true&emoji=true`;

        console.log(`Scanning via Clash List: ${backendUrl}`);
        const response = await $axios.get(backendUrl, { timeout: 30000 });
        content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      }

      const proxyNames = [];
      const groupNames = [];

      const blacklist = [
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
}
