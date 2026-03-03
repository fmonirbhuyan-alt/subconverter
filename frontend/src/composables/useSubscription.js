import { validateForm } from '@/utils/validators';

/**
 * 订阅链接生成逻辑
 */
export function useSubscription() {
  /**
   * 构建基础URL
   * @param {Object} form - 表单数据
   * @param {string} processedSubUrl - 处理后的订阅链接
   * @param {string} currentBackend - 当前后端地址
   * @returns {string} 基础URL
   */
  const buildBaseUrl = (form, processedSubUrl, currentBackend) => {
    return currentBackend +
      "target=" + form.clientType +
      "&url=" + encodeURIComponent(processedSubUrl) +
      "&insert=" + form.insert;
  };

  /**
   * 构建布尔参数
   * @param {Object} form - 表单数据
   * @returns {string} 参数字符串
   */
  const buildBooleanParams = (form) => {
    return "&emoji=" + form.emoji.toString() +
      "&list=" + form.nodeList.toString() +
      "&tfo=" + form.tfo.toString() +
      "&scv=" + form.scv.toString() +
      "&fdn=" + form.fdn.toString() +
      "&expand=" + form.expand.toString() +
      "&sort=" + form.sort.toString() +
      "&fpg=" + form.fpg.toString();
  };

  /**
   * 构建模板特定参数
   * @param {Object} form - 表单数据
   * @returns {string} 参数字符串
   */
  const buildTemplateParams = (form) => {
    let params = "";

    if (form.tpl.surge.doh === true) {
      params += "&surge.doh=true";
    }

    if (form.clientType === "clash") {
      if (form.tpl.clash.doh === true) {
        params += "&clash.doh=true";
      }
      params += "&new_name=" + form.new_name.toString();
    }

    return params;
  };

  /**
   * 构建自定义参数
   * @param {Array} customParams - 自定义参数数组
   * @returns {string} 参数字符串
   */
  const buildCustomParams = (customParams) => {
    return customParams
      .filter(param => param.name && param.value)
      .map(param => `&${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`)
      .join("");
  };

  /**
   * 构建进阶模式参数
   * @param {Object} form - 表单数据
   * @param {Array} customParams - 自定义参数数组
   * @param {boolean} needUdp - 是否需要UDP
   * @returns {string} 参数字符串
   */
  const buildAdvancedParams = (form, customParams, needUdp) => {
    let params = "";

    // 远程配置
    if (form.remoteConfig) {
      params += "&config=" + encodeURIComponent(form.remoteConfig);
    }

    // 过滤参数 (Include)
    if (form.includeRemarks) {
      params += "&include=" + encodeURIComponent(form.includeRemarks);
    }

    // 自动清理 & 过滤参数 (Exclude)
    // Always hide status nodes (GB, Expiry, etc.)
<<<<<<< HEAD
    const autoExclude = "(到期|GB|expire)";
=======
    const autoExclude = "(重置|剩余|流量|到期|GB|MB|官网|更-新|线路|bing)";
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
    let excludeRules = form.excludeRemarks || "";
    if (excludeRules) {
      // Avoid duplicating if already present
      if (!excludeRules.includes(autoExclude)) {
        excludeRules += "|" + autoExclude;
      }
    } else {
<<<<<<< HEAD
=======
      // If no include filter is set, apply the auto-exclude
      // If include is set, we don't strictly need exclude but it's fine to keep
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
      excludeRules = autoExclude;
    }
    params += "&exclude=" + encodeURIComponent(excludeRules);

    // 自动重命名 & Global Rename (reg_subs)
    // Default mappings for common Chinese group names
    const defaultRenames = [
      "节点选择@Node Select",
      "自动选择@Auto Select",
      "国外媒体@Global Media",
      "国内媒体@Domestic Media",
      "微软服务@Microsoft",
      "电报信息@Telegram",
      "苹果服务@Apple",
      "全球直连@Direct",
      "全球拦截@Reject",
      "漏网之鱼@Final"
    ];

    let regSubsParts = [...defaultRenames];

    // Add user defined global renames if any
    if (form.globalFindValue && form.globalReplaceValue) {
      const gLines = form.globalFindValue.split('\n').map(line => line.trim()).filter(line => line !== '');
      if (gLines.length > 0) {
        const gPart = gLines.join('|');
        regSubsParts.push(`(${gPart})@${form.globalReplaceValue}`);
      }
    }

    if (regSubsParts.length > 0) {
      params += `&reg_subs=${encodeURIComponent(regSubsParts.join('|'))}`;
    }

    if (form.findValue && form.replaceValue) {
      const findLines = form.findValue.split('\n').map(line => line.trim()).filter(line => line !== '');
      if (findLines.length > 0) {
        const findPart = findLines.join('|');
        const renameRule = `(${findPart})@${form.replaceValue}`;
        params += `&rename=${encodeURIComponent(renameRule)}`;
      }
    }
    // 文件名
    if (form.filename) {
      params += "&filename=" + encodeURIComponent(form.filename);
    }

    // 节点类型
    if (form.appendType) {
      params += "&append_type=" + form.appendType.toString();
    }

    // 基础布尔参数
    // Always enable fpg (Filter Proxy Groups) when auto-cleaning to hide empty groups
    const originalFpg = form.fpg;
    form.fpg = true;
    params += buildBooleanParams(form);
    form.fpg = originalFpg; // Restore state

    // UDP 参数
    if (needUdp) {
      params += "&udp=" + form.udp.toString();
    }

    // 模板特定参数
    params += buildTemplateParams(form);

    // 自定义参数
    params += buildCustomParams(customParams);

    // Device Lock
    if (form.devLock) {
      params += "&dev_lock=true";
    }

    return params;
  };

  /**
   * 生成订阅链接
   * @param {Object} form - 表单数据
   * @param {string} advanced - 高级模式标识
   * @param {string} processedSubUrl - 处理后的订阅链接
   * @param {string} currentBackend - 当前后端地址
   * @param {Array} customParams - 自定义参数数组
   * @param {boolean} needUdp - 是否需要UDP
   * @returns {string} 生成的订阅链接
   */
  const makeUrl = (form, advanced, processedSubUrl, currentBackend, customParams, needUdp) => {
    // 验证必填项
    if (!validateForm(form)) {
      return "";
    }

    // 构建基础 URL
    const baseUrl = buildBaseUrl(form, processedSubUrl, currentBackend);
    let customSubUrl = baseUrl;

    // 进阶模式添加额外参数
    if (advanced === "2") {
      customSubUrl += buildAdvancedParams(form, customParams, needUdp);
    }

    return customSubUrl;
  };

  return {
    makeUrl,
    buildBaseUrl,
    buildAdvancedParams
  };
}
