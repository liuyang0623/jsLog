/**
 * 获取浏览器参数
 * @date 2022-01-19
 * @returns {any}
 */
const getDefParams = () => {
  if (!window || !window.document) return {};
  let n = window.navigator,
    s = window.screen,
    w = window;
  return {
    _cEnabled: n.cookieEnabled,
    _ua: n.userAgent,
    // _pform: n.platform,
    _sColorDepth: s.colorDepth,
    _l: n.language,
    _sW: s.width, // 屏幕宽高
    _sH: s.height,
    _sInnerW: s.availWidth, // 屏幕高度除去windows任务栏
    _sInnerH: s.availHeight,
    _wInnerW: w.innerWidth, // 视口(文档显示区的)宽高
    _wInnerH: w.innerHeight,
    // _appVer: n.appVersion,
    _dpr: w.devicePixelRatio, // 像素比
    _referrer: document.referrer == "" ? "null" : document.referrer,
  };
};
export default getDefParams;
