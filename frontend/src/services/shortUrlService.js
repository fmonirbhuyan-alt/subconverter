import { CONSTANTS } from '@/config/constants';

/**
 * 短链接生成服务
 */
export class ShortUrlService {
  /**
   * 生成短链接
   * @param {Object} $axios - Axios实例
   * @param {string} longUrl - 长链接
   * @returns {Promise<string>} 短链接
   */
  static async generateShortUrl($axios, longUrl, sourceUrl = "") {
    const response = await $axios.post(CONSTANTS.SHORT_URL_API, {
      longUrl: longUrl,
      sourceUrl: sourceUrl
    }, {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });

    if (response.data && (response.data.Code === 1 || response.data.shortUrl)) {
      return response.data.ShortUrl || response.data.shortUrl;
    } else {
      throw new Error(response.data.Message || response.data.error || "Shortlink generation failed");
    }
  }

  /**
   * 处理短链接成功响应
   * @param {Object} res - 响应对象
   * @param {Function} $copyText - 复制文本函数
   * @param {Function} $message - 消息提示函数
   * @returns {string} 短链接
   */
  static handleShortUrlSuccess(res, $copyText, $message) {
    if (res.data.Code === 1 && res.data.ShortUrl !== "") {
      const shortUrl = res.data.ShortUrl;
      $copyText(shortUrl);
      $message.success("短链接已复制到剪贴板");
      return shortUrl;
    } else {
      throw new Error(res.data.Message);
    }
  }

  /**
   * 处理短链接错误
   * @param {Function} $message - 消息提示函数
   */
  static handleShortUrlError($message) {
    $message.error("短链接获取失败");
  }

  /**
   * List all shortlinks (Admin)
   * @param {Object} $axios - Axios实例
   * @param {string} password - Admin password
   * @returns {Promise<Array>} Shortlink list
   */
  static async listShortUrls($axios, password) {
    const response = await $axios.get('/api/admin/list', {
      headers: { 'Authorization': password }
    });
    return response.data;
  }

  /**
   * Delete a shortlink (Admin)
   * @param {Object} $axios - Axios实例
   * @param {string} id - Shortcode
   * @param {string} password - Admin password
   */
  static async deleteShortUrl($axios, id, password) {
    await $axios.post('/api/admin/delete', { id }, {
      headers: { 'Authorization': password }
    });
  }

  /**
   * Toggle block status (Admin)
   * @param {Object} $axios - Axios实例
   * @param {string} id - Shortcode
   * @param {string} password - Admin password
   * @returns {Promise<boolean>} New blocked status
   */
  static async toggleBlock($axios, id, password) {
    const response = await $axios.post('/api/admin/toggle', { id }, {
      headers: { 'Authorization': password }
    });
    return response.data.blocked;
  }
}
