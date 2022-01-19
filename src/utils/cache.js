import _ from "lodash";

// 缓存类
// 为单个dom添加事件绑定缓存
class DataCache {
  constructor() {
    if (!DataCache.instance) {
      this.guid = _.uniqueId("event_");
      DataCache.instance = this;
    }
    return DataCache.instance;
  }

  /**
   * 为dom添加事件缓存
   * @date 2022-01-19
   * @param {any} el
   * @param {any} key
   * @param {any} fn
   * @returns {any}
   */
  add(el, key, fn) {
    let cache = el[this.guid];
    if (!cache) {
      cache = {};
      if (el.nodeType) {
        el[this.guid] = cache;
      } else {
        Object.defineProperty(el, this.guid, {
          value: cache,
          configurable: true,
        });
      }
    }
    if (typeof key === "string" || typeof fn === "function") {
      cache[key] = cache[key] || [];
      cache[key].push(fn);
    }
    return cache;
  }

  /**
   * 获取缓存事件
   * @date 2022-01-19
   * @param {any} el
   * @param {any} key
   * @returns {any}
   */
  get(el, key) {
    let cache = el[this.guid];
    return key === undefined ? this.add(el) : cache && cache[key];
  }

  /**
   * 移除缓存对象
   * @date 2022-01-19
   * @param {any} el
   * @param {any} key
   * @param {any} fn
   * @returns {any}
   */
  remove(el, key, fn) {
    let cache = el[this.guid];
    if (!cache) return;
    if (fn === undefined && typeof key === "string" && cache[key]) {
      cache[key] = [];
    }
    if (typeof fn === "function" && typeof key === "string" && cache[key]) {
      for (let i = cache[key].length - 1; i >= 0; i--) {
        if (cache[key][i].toString() === fn.toString()) {
          cache[key].splice(i, 1);
        }
      }
    }
    if (_.isEmpty(cache)) {
      if (el.nodeType) {
        el[this.guid] = undefined;
      } else {
        delete el[this.guid];
      }
    }
  }
}

export default new DataCache();
