import z from "./base";
import logger from "./logger";
import getDefParams from "./window";
import _ from "lodash";

// 配置参数，可通过config方法重新赋值
const defaultConfigs = {
  pageId: 0, // 页面ID（预留）
  from: "", // 业务源（预留）
  finger: false, // 指纹追踪
  fingerKey: "", // 指纹cookie id
  defaultParams: true, // 是否添加浏览器默认参数
  accessLog: true, // 开启accessLog
  scrollLog: true, // 开启window原生scrollLog
  stayLog: true, // 开启驻留日志stayLog
  loadLog: true, // 开启load时间Log
  sendLogType: 'img', // 发送日志方式（img: 利用请求img src发送日志，无跨域风险（推荐）/ ajax：利用ajax发送日志）
  pagePath: "", // 页面路径
  getQuery: [], // url get参数
  protocol: "", // 日志协议
  domain: "", // 日志服务器域名
  port: "", // 端口
  path: "hm.gif", // 请求资源path或接口请求path
  // interfacePath: "/", // ajax请求path（sendLogType为ajax时需要配置）
  throttleTime: 200, // 滚动日志节流时间
  cusParam: {}, // 自定义全局参数
};

/**
 * 日志参数，部分从配置参数读取
 */
const defaultOptions = {
  _pageId: 0,
  _from: "",
  _lpvs: z.randomString(32), // 单次加载区分id,与load事件1对1
  _pvs: z.randomString(32), // 单次驻留区分id
  _fp: z.getCookie(defaultConfigs.fingerKey),
  _url: window.location.href,
  _pagePath: "",
};

/**
 * 额外的指定参数
 */
let extraParams = {};

class Tracker {
  constructor() {
    if (!Tracker.instance) {
      this.initState = false;
      this.configs = defaultConfigs;
      this.options = defaultOptions;
      this.addedStayLog = false;
      this.addedScrollLog = false;
      Tracker.instance = this;
    }
    return Tracker.instance;
  }

  /**
   * 配置, 在SPA中需要在路由(hash)变化时重新配置pagePath,并重新触发日志
   * @date 2022-01-19
   * @param {any} opts
   * @returns {any}
   */
  config(opts) {
    if (typeof opts !== "object") {
      throw new Error("type of config param must be the object");
    }
    this.initState = false;
    this.configs = this._mergeConfig(opts);
    this.options = this._mergeOption();
    if (this.options._siteId !== 0) {
      this.initState = true;
    }
    this.printAccessLog();
    this.initScrollLog(window);
    this.initLoadLog();
    this.initStayLog();
  }

  /**
   * 合并配置
   * @date 2022-01-19
   * @param {any} opts
   * @returns {any}
   */
  _mergeConfig(opts) {
    if (!opts) opts = {};
    let configs = Object.assign(this.configs, opts);
    // 处理logger参数
    let logConfigs = {
      protocol:
        typeof opts.protocol === "string"
          ? opts.protocol
          : this.configs.protocol,
      domain:
        typeof opts.domain === "string" ? opts.domain : this.configs.domain,
      port:
        typeof opts.port === "string" || typeof opts.port === "number"
          ? opts.port
          : this.configs.port,
      path: typeof opts.path === "string" ? opts.path : this.configs.path,
      sType: typeof opts.sendLogType === "string" ? opts.sendLogType : this.configs.sendLogType
    };
    logger.config(logConfigs);
    return configs;
  }

  /**
   * 合并日志参数
   * @date 2022-01-19
   * @returns {any}
   */
  _mergeOption() {
    let op = {
      _pageId: this.configs.pageId,
      _lpvs: this.options._lpvs,
      _pvs: this.options._pvs,
      _from: !!this.configs.from ? this.configs.from : this.options.from,
      _pagePath: !!this.configs.pagePath
        ? this.configs.pagePath
        : this.options._pagePath,
      _url: window.location.href,
    };
    if (this.configs.getQuery && _.isArray(this.configs.getQuery))
      this._getQuery(this.configs.getQuery);
    if (this.configs.finger && this.configs.finger === true) {
      op._fp = z.getCookie(this.configs.fingerKey || defaultConfigs.fingerKey);
    }
    return op;
  }

  /**
   * 配置需要获取的get参数列表
   * @date 2022-01-19
   * @param {any} getParamsArr
   * @returns {any}
   */
  _getQuery(getParamsArr) {
    if (!_.isArray(getParamsArr)) return;
    for (let i = getParamsArr.length - 1; i >= 0; i--) {
      let exp = z.getUrlQuery(getParamsArr[i]);

      if (exp) {
        extraParams[`_${getParamsArr[i]}`] = exp;
      }
      console.log(exp, extraParams);
    }
  }

  /**
   * Access日志
   * @date 2022-01-19
   * @param {Object} param 自定义日志参数
   * @param {any} evt
   * @returns {any}
   */
  printAccessLog(param, evt) {
    if (!this.initState || !this.configs.accessLog) return;
    let p = typeof param === "object" ? param : {};
    let onloadParams = Object.assign(
      {
        _action: "access",
      },
      this._getDefaultParams(),
      p
    );
    this._log(this._convertParams(onloadParams, evt));
  }

  /**
   * load日志
   * @date 2022-01-19
   * @param {any} param
   * @returns {any}
   */
  initLoadLog(param) {
    if (!this.initState || !this.configs.loadLog) return;
    let p = typeof param === "object" ? param : {};
    this.initLog(window, "load", p);
  }

  /**
   * scroll日志
   * @date 2022-01-19
   * @param {any} selector
   * @param {any} param
   * @returns {any}
   */
  initScrollLog(selector, param) {
    if (!this.initState || !this.configs.scrollLog) return;
    let p = typeof param === "object" ? param : {};
    this.initLog(selector, "scroll", p);
  }

  /**
   * 驻留时间日志
   * @date 2022-01-19
   * @param {any} param
   * @param {any} evt
   * @returns {any}
   */
  initStayLog(param, evt) {
    if (!this.initState || !this.configs.stayLog) return;
    let p = typeof param === "object" ? param : {};
    let startTime = new Date().getTime();
    let pageshowRarams = Object.assign(
      {
        _action: "enterpage",
        _enterTime: startTime,
      },
      this._getDefaultParams(),
      p
    );
    this._log(this._convertParams(pageshowRarams, evt));
    /**
     *
     * @param {*} evt
     */
    let _vchanged = (evt) => {
      // console.log('visibilitychange binded')
      if (document.hidden) {
        let nTime = new Date().getTime();
        let pagehideRarams = Object.assign(
          {
            _action: "leavepage",
            _enterTime: startTime,
            _leaveTime: nTime,
            _stayTime: nTime - startTime,
          },
          this._getDefaultParams(),
          p
        );
        this._log(this._convertParams(pagehideRarams, evt));
      } else {
        this._setPvs(z.randomString(32));
        startTime = new Date().getTime();
        let pageshowRarams = Object.assign(
          {
            _action: "enterpage",
            _enterTime: startTime,
          },
          this._getDefaultParams(),
          p
        );
        this._log(this._convertParams(pageshowRarams, evt));
      }
    };
    z._$(window)
      .off("visibilitychange", _vchanged)
      .on("visibilitychange", _vchanged);
  }

  /**
   * 初始化log
   * @date 2022-01-19
   * @param {any} selector
   * @param {any} evtType
   * @param {any} param
   * @returns {any}
   */
  initLog(selector, evtType, param) {
    let p = typeof param === "object" ? param : {};
    /**
     *
     * @param {Event} evt
     */
    let _bundFn = (evt) => {
      evt.target["__" + evt.type] = evt.target["__" + evt.type] || {};
      if (evt.target["__" + evt.type]._timmer) {
        clearTimeout(evt.target["__" + evt.type]._timmer);
        evt.target["__" + evt.type]._timmer = null;
        delete evt.target["__" + evt.type]._timmer;
      }
      evt.target["__" + evt.type]._timmer = setTimeout(() => {
        let onParam = Object.assign(
          {
            _action: evt.type,
          },
          this._getDefaultParams(),
          p
        );
        console.log("test", p, onParam);
        this._log(this._convertParams(onParam, evt));
      }, this.configs.throttleTime);
      evt.stopPropagation();
    };
    z._$(selector).off(evtType, _bundFn).on(evtType, _bundFn);
  }

  /**
   * 日志发送
   * @date 2022-01-19
   * @param {any} param
   * @param {any} evt
   * @param {any} fn
   * @returns {any}
   */
  _log(param, evt, fn) {
    let p = typeof param === "object" ? param : {};
    let e = evt ? evt : null;
    console.log(777777, param);
    let resParam = this._convertParams(
      Object.assign({}, this._getDefaultParams(), p),
      e
    );
    logger
      .log(resParam)
      .then((res) => {
        if (typeof fn === "function") fn(res);
      })
      .catch((err) => {
        if (typeof fn === "function") fn(err);
      });
    console.log("触发日志");
  }

  /**
   * 公有日志发送
   * @date 2022-01-19
   * @returns {any}
   */
  log() {
    console.log(88888, arguments, arguments[0]);
    let p = typeof arguments[0] === "object" ? arguments[0] : {};
    switch (arguments.length) {
      case 0:
        Tracker.instance._log(p);
        break;
      case 1:
        Tracker.instance._log(p);
        break;
      case 2:
        typeof arguments[1] === "function"
          ? Tracker.instance._log(p, null, arguments[1])
          : Tracker.instance._log(p, arguments[1]);
        break;
      case 3:
        typeof arguments[2] === "function"
          ? Tracker.instance._log(p, arguments[1], arguments[2])
          : Tracker.instance._log(p, arguments[1]);
        break;
    }
  }

  /**
   * 合并额外参数
   * @date 2022-01-19
   * @param {any} param
   * @returns {any}
   */
  addExtra(param) {
    let p = typeof param === "object" ? param : {};
    extraParams = Object.assign(extraParams, p);
  }

  /**
   * 移除额外参数
   * @date 2022-01-19
   * @param {any} key
   * @returns {any}
   */
  removeExtra(key) {
    if (Array.isArray(key)) {
      let i = key.length;
      while (i--) {
        if (extraParams && extraParams[key[i]]) delete extraParams[key[i]];
      }
    } else if (typeof key === "string") {
      if (extraParams && extraParams[key]) delete extraParams[key];
    }
  }

  /**
   * merge基础参数
   * @date 2022-01-19
   * @returns {any}
   */
  _getDefaultParams() {
    let r = Object.assign(
      {},
      this.options,
      !!this.configs.defaultParams ? getDefParams() : {},
      this.configs.cusParam,
      extraParams
    );
    console.log(r, extraParams);
    return r;
  }

  /**
   * 支持函数
   * @date 2022-01-19
   * @param {any} params
   * @param {any} evt
   * @returns {any}
   */
  _convertParams(params, evt) {
    let res = {};
    if (typeof params !== "object") return;
    let keys = Object.keys(params);
    let val = keys.map((key) => {
      if (typeof params[key] === "function") {
        return evt ? params[key](evt) : params[key]();
      } else {
        return params[key];
      }
    });
    let i = keys.length;
    while (i--) {
      res[keys[i]] = val[i];
    }
    return res;
  }

  _setPvs(pvs) {
    this.options._pvs = pvs;
  }

  _setLpvs(lpvs) {
    this.options._lpvs = lpvs;
  }

  getLpvs() {
    return this.options._lpvs;
  }

  getPvs() {
    return this.options._pvs;
  }
}

export default new Tracker();
