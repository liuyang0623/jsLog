import qs from "qs";
import base from "./base.js";
// qs会处理所有的encode

const defaults = {
  domain: "testnode.wdabuliu.com", // 日志服务器
  protocol: "",
  port: "", // 端口
  path: "hm.gif",
  globalId: `__log__${base.randomString(32)}`, // 全局id
};
// 一个页面的生命周期定义一个
class Logger {
  constructor() {
    if (!Logger.instance) {
      this.options = defaults;
      this._initConfig();
      Logger.instance = this;
    }
    return Logger.instance;
  }
  // 初始化
  config(opts) {
    this.options = this._mergeOption(opts);
    this._initConfig();
  }
  // 合并配置项
  _mergeOption(opts) {
    if (!opts) return this.options;
    let nOptions = Object.assign(this.options, opts);
    return nOptions;
  }
  // 发送日志
  // params {Object} 日志中的get参数
  log(params) {
    return new Promise((resolve, reject) => {
      if (typeof params !== "object") {
        throw new Error("the typeof params must be object");
      }
      params.__uid = base.unique(); // 防止日志缓存
      params._ts = new Date().getTime(); // 携带时间戳
      let urlParams = qs.stringify(params),
        uid = params.__uid,
        logImg;
      logImg = this.globalContainer[uid] = logImg = new Image(1, 1);

      logImg.onload = () => {
        resolve({ code: 0, msg: "send success" });
        logImg.onload = logImg.onerror = null;
        delete this.globalContainer[uid];
        logImg = null;
      };
      logImg.onerror = (e) => {
        reject({ code: 1, error: e });
        logImg.onload = logImg.onerror = null;
        delete this.globalContainer[uid];
        logImg = null;
      };
      logImg.src = `${this.baseImgUrl}?${urlParams}`;
    });
  }
  /**
   * 初始化config
   * @date 2022-01-19
   * @returns {any}
   */
  _initConfig() {
    if (
      this.options.protocol.indexOf(":") !==
      this.options.protocol.length - 1
    ) {
      this.options.protocol = `${this.protocol}:`;
    }
    let portStr = this.options.port === "" ? "" : `:${this.options.port}`;
    this.baseImgUrl = `${this.options.protocol}//${this.options.domain}${portStr}/${this.options.path}`;
    this.globalContainer =
      window[this.options.globalId] || (window[this.options.globalId] = {});
  }
}
export default new Logger();
