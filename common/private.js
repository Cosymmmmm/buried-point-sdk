import Fingerprint2 from 'fingerprintjs2';
import { getPageUrlParam, checkNullObj, getRouterName } from './utils';
import Cookies from 'js-cookie';
import { urlMode } from './config';

// 生成一个唯一的设备id
function getDeviceId() {
  return new Promise((resolve, reject) => {
    if (window.requestIdleCallback) {
      requestIdleCallback(function () {
          Fingerprint2.get(function (components) {
            var values = components.map(function (component) { return component.value });
            var murmur = Fingerprint2.x64hash128(values.join(''), 31);
            resolve(murmur);
          });
      });
    } else {
      setTimeout(function () {
          Fingerprint2.get(function (components) {
            var values = components.map(function (component) { return component.value });
            var murmur = Fingerprint2.x64hash128(values.join(''), 31);
            resolve(murmur);
          })
      }, 500);
    }
  });
}

// 获取当前token，先从当前url中取，没有再从cookie中取
function getToken() {
  let locationUrl;
  if(urlMode() === 'hash') {
    locationUrl = window.location.hash;
  } else {
    locationUrl = window.location.search;
  }
  return getPageUrlParam(locationUrl, 'token') ? getPageUrlParam(locationUrl, 'token') : Cookies.get('ovo_ticket');
}

// 获取屏幕宽高
function getScreenMes(name) {
  return window.screen[name];
}

// 获取用户信息，从cookie中取值，本地保留一份，保证不再重复取值
class userInfo {
  constructor() {
    this.userInfo = {};
  }

  getUrl() {
    if(!checkNullObj(this.userInfo)) {
      return this.userInfo;
    } else {
      let cookieInfoStr = Cookies.get('userInfo');
      let cookieInfo = {};
      if(cookieInfoStr) {
        cookieInfo = JSON.parse(cookieInfoStr);
        this.setUrl(cookieInfo);
      } else {
        this.setUrl({});
      }
      return cookieInfo;
    }
  }

  setUrl(url) {
    this.userInfo = url;
  }
}
const userInfoInstance = new userInfo();

/**
 * 获取当前操作系统
 */
function getOperationSys() {
  var OS = '';
  var OSArray = {};
  var UserAgent = navigator.userAgent.toLowerCase();
  OSArray.Windows = (navigator.platform == 'Win32') || (navigator.platform == 'Windows');
  OSArray.Mac = (navigator.platform == 'Mac68K') || (navigator.platform == 'MacPPC')
    || (navigator.platform == 'Macintosh') || (navigator.platform == 'MacIntel');
  OSArray.iphone = UserAgent.indexOf('iPhone') > -1;
  OSArray.ipod = UserAgent.indexOf('iPod') > -1;
  OSArray.ipad = UserAgent.indexOf('iPad') > -1;
  OSArray.Android = UserAgent.indexOf('Android') > -1;
  for (var i in OSArray) {
    if (OSArray[i]) {
      OS = i;
    }
  }
  return OS;
}

// 获取浏览器和版本号
function getBrowserInfo(){
  var Sys = {};
  var ua = navigator.userAgent.toLowerCase();
   var re =/(msie|firefox|chrome|opera|version).*?([\d.]+)/;
   var m = ua.match(re);
   Sys.browser = m[1].replace(/version/, "'safari");
   Sys.ver = m[2];
   return Sys;
}

// 前置页面地址和当前页面地址
class referUrl {
  constructor() {
    this.currentUrl = '';
    this.referUrl = '';
    this.currentName = '';
    this.referName = '';
    this.init();
  }

  getUrl() {
    
    let currentTempUrl = sessionStorage.getItem('currentUrl');
    let referTempUrl = sessionStorage.getItem('referUrl');
    let currentTempName = sessionStorage.getItem('currentName');
    let referTempName = sessionStorage.getItem('referName');
    this.currentUrl = window.location.href.split('?')[0];
    this.currentName = getRouterName();
    if((currentTempUrl == null && referTempUrl == null) || (currentTempName == null && referTempName == null)) {
      // 第一次进入页面没有缓存
      this.referUrl = currentTempUrl;
      this.referName = currentTempName;
      this.setSession();
    } else if(this.currentUrl !== currentTempUrl || this.currentName !== currentTempName) {
      // 页面切换了
      this.referUrl = currentTempUrl;
      this.referName = currentTempName;
      this.setSession();
    }
    return {
      currentUrl: sessionStorage.getItem('currentUrl'),
      referUrl: sessionStorage.getItem('referUrl'),
      page_code: sessionStorage.getItem('currentName'),
      refer_page_code: sessionStorage.getItem('referName'),
    }
  }

  setSession() {
    sessionStorage.setItem('currentUrl', this.currentUrl);
    sessionStorage.setItem('referUrl', this.referUrl);
    sessionStorage.setItem('currentName', this.currentName);
    sessionStorage.setItem('referName', this.referName);
  }

  init() {
    this.currentUrl = window.location.href.split('?')[0];
    this.referUrl = document.referrer || '';
    this.currentName = getRouterName();
    this.setSession();
  }
}

const referUrlInstance = new referUrl();

export default {
  getDeviceId,
  getToken,
  getScreenMes,
  userInfoInstance,
  getOperationSys,
  getBrowserInfo,
  referUrlInstance
};
