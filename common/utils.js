import moment from 'moment';
import { urlMode } from '../common/config';
import { homedir } from 'os';

/**
 * 获取请求参数
 * @param {} name 
 */
export function getPageUrlParam(locationUrl, name) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = locationUrl.substr(3).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

/**
 * 将history中的事件注册到window事件
 * @param {*} type 
 */
export function addEvent(type) {
  let orig = window.history[type];
  return function () {
    let newHistoryEvent = orig.apply(this, arguments);
    let e = new Event(type);
    e.arguments = arguments;
    window.dispatchEvent(e);
    return newHistoryEvent;
  }
}

/**
 * 注册监听事件
 */
export function register(target, type, handle) {
  if(target.addEventListener) {
    target.addEventListener(type, handle, false);
  } else {
    target.attachEvent('on'+ type, function(event) {
      return handle.call(target, event);
    }, false);
  }
}

/**
 * 移除监听事件
 */
export function remove(target, type, handle) {
  if(target.removeEventListener) {
    target.removeEventListener(type, handle, false);
  } else {
    target.detachEvent('on'+ type, function(event) {
      return handle.call(target, event);
    }, true);
  }
}

/**
 * 检查对象是否为空
 */
export function checkNullObj (obj) {
  return Boolean(Object.keys(obj).length === 0);
}

/**
 * 当前时间
 */
export function getCurrentTime() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 解析出路由中的name
 */
export function getRouterName() {
  let name = '';
  let nameArr = [];
  let paramsUrl;
  if(urlMode() === 'hash') {
    paramsUrl = window.location.hash;
  } else {
    paramsUrl = window.location.pathname;
  }
  // 去掉？后面的内容
  if(paramsUrl.indexOf('?') !== -1) {
    paramsUrl = paramsUrl.substring(0, paramsUrl.indexOf('?'));
  }
  
  nameArr = paramsUrl.split('/');

  
  // 无子路由时返回home
  if(nameArr.length <= 2) {
    if(nameArr[nameArr.length - 1] === '') {
      name = 'home';
    } else {
      name = nameArr[nameArr.length - 1];
    }
  } else {// 多级路由需要拼接
    // 去除id情况
    if(!isNaN(Number(nameArr[nameArr.length - 1]))) {
      nameArr.pop();
    }
    nameArr.shift();
    name = nameArr.join('&');
  }
  return name;
}
