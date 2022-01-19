import _ from "lodash";
import Event from "./event";

/**
 * 累加器
 * @date 2022-01-19
 * @param {any} (
 * @returns {any}
 */
const unique = (() => {
  var step = 0;
  return () => {
    let ts = new Date().getTime();
    return `${ts}-${step++}`;
  };
})();

/**
 * 生成随机变量
 * @date 2022-01-19
 * @returns {string}
 */
const rndStr = () => {
  return Math.random().toString(36).slice(2);
};

/**
 * 支持HTMLElement的浏览器中
 * 在Chrome,Opera中HTMLElement的类型为function，此时就不能用它来判断了
 * @date 2022-01-19
 * @param {any} (
 * @returns {any}
 */
const isDOM = (() => {
  typeof HTMLElement === "object"
    ? (obj) => {
        return obj instanceof HTMLElement;
      }
    : (obj) => {
        return (
          obj &&
          typeof obj === "object" &&
          obj.nodeType === 1 &&
          typeof obj.nodeName === "string"
        );
      };
})();

/**
 * 生成当前页面的guid
 * @date 2022-01-19
 * @param {any} (
 * @returns {any}
 */
const guid = (() => {
  var step = 0;
  return () => {
    return `${rndStr()}-${rndStr()}-${rndStr()}-${step++}`;
  };
})();

/**
 * 获取url参数
 * @date 2022-01-19
 * @param {any} name
 * @returns {string}
 */
const getUrlQuery = (name) => {
  let res = null;
  if (window.location.href.indexOf("?") === -1) return null; //如果url中没有传参直接返回空
  //name存在先通过search取值如果取不到就通过hash来取
  res = getQuery(name, window.location.search.substr(1));
  if (res === null) res = getQuery(name, window.location.hash.split("?")[1]);
  console.log("结果", res);
  return res;
};

/**
 * 获取get参数
 * @date 2022-01-19
 * @param {any} name
 * @param {any} query
 * @returns {any}
 */
const getQuery = (name, query) => {
  if (typeof query !== "string" || typeof name !== "string") return null;
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = query.match(reg);
  return r === null ? null : unescape(r[2]);
};

/**
 * 生成随机字符串
 * @date 2022-01-19
 * @param {any} length
 * @returns {any}
 */
const randomString = (length) => {
  if (!length) {
    console.warn("the type of argument must be the Number");
    return;
  }
  let str = Math.random().toString(36).substr(2);
  if (str.length >= length) {
    const res = str.substr(0, length);
    return res;
  } else {
    str += randomString(length - str.length);
    return str;
  }
};

/**
 * 获取cookie
 * @date 2022-01-19
 * @param {any} key
 * @returns {any}
 */
const getCookie = (key) => {
  let cname = key + "=";
  let cookieArr = document.cookie.split(";");
  for (let i = 0; i < cookieArr.length; i++) {
    let c = cookieArr[i].trim();
    if (c.indexOf(cname) == 0) {
      return c.substring(cname.length, c.length);
    }
  }
};

/**
 * 节点选择
 * @date 2022-01-19
 * @param {any} node
 * @returns {any}
 */
const _nodeSelect = (node) => {
  console.log(node);
  if (node && node.toString() === "[object HTMLCollection]") {
    return node;
  } else if (node && node.nodeType && typeof node.nodeType === "number") {
    return [node];
  } else {
    throw new Error(
      "the type of param must be node or HTMLCollection, or you should install Sizzle before using a string parameter!"
    );
  }
};

/**
 * dom选择器
 * @date 2022-01-19
 * @param {String ｜ HTMLCollection} selector
 * @returns {any}
 */
const _$ = (selector) => {
  var doms;
  const hasSizzle = typeof Sizzle !== "undefined";
  const getDom = hasSizzle ? Sizzle : _nodeSelect;
  selector === window ? (doms = [window]) : (doms = getDom(selector));
  console.log(9999, selector, doms);
  doms.on = (type, cb) => {
    if (!doms) return;
    for (let i = 0; i < doms.length; i++) {
      Event.on(doms[i], type, cb, false);
    }
    return doms;
  };
  doms.off = (type, cb) => {
    if (!doms) return;
    for (let i = 0; i < doms.length; i++) {
      Event.off(doms[i], type, cb, false);
    }
    return doms;
  };

  return doms;
};

export default {
  unique,
  rndStr,
  guid,
  isDOM,
  getUrlQuery,
  randomString,
  getCookie,
  _$,
};
