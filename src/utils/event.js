import cache from "./cache";

// 事件工具函数
const Event = {
  /**
   * 事件绑定 冒泡/捕获
   * @date 2022-01-19
   * @param {any} el
   * @param {any} evtType
   * @param {any} cb
   * @param {any} type
   * @param {any} bubble
   * @returns {any}
   */
  bind: (el, evtType, cb, type, bubble) => {
    let eType = evtType.replace(/^on/i, "").toLowerCase();
    el.addEventListener
      ? el.addEventListener(eType, cb, type && type == true ? true : false)
      : el.attachEvent("on" + eType, cb);
    return el;
  },

  /**
   * 事件解绑
   * @date 2022-01-19
   * @param {any} el
   * @param {any} evtType
   * @param {any} cb
   * @param {any} type
   * @returns {any}
   */
  unbind: (el, evtType, cb, type) => {
    let eType = evtType.replace(/^on/i, "").toLowerCase();
    el.removeEventListener
      ? el.removeEventListener(eType, cb, type && type == true ? true : false)
      : el.detachEvent("on" + eType, cb);
    return el;
  },

  /**
   * 订阅事件监听
   * @date 2022-01-19
   * @param {any} el
   * @param {any} evtType
   * @param {any} fn
   * @returns {any}
   */
  on: function (el, evtType, fn) {
    // 是否是新事件
    let isNewType = false,
      evtList = [];

    if (!cache.get(el, evtType)) {
      isNewType = true;
    }
    cache.add(el, evtType, fn);
    evtList = cache.get(el, evtType);
    let fire = function (e) {
      let i = evtList.length;
      while (i--) {
        evtList[i](e);
      }
    };
    // 新事件需要绑定一次
    if (isNewType) {
      this.bind(el, evtType, fire, false);
    }
  },

  /**
   * 取消事件监听
   * @date 2022-01-19
   * @param {any} el
   * @param {any} evtType
   * @param {any} fn
   * @returns {any}
   */
  off: function (el, evtType, fn) {
    cache.remove(el, evtType, fn);
  },
};

export default Event;
