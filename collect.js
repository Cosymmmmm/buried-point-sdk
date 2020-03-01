import privateMethods from './common/private';
import { addEvent, register, remove, getCurrentTime } from './common/utils';
import { arrayExpression } from '@babel/types';
import apis from './api/index';
import Axios from 'axios';

class collect {
  constructor({application_id, router}) {
    this.commonProperties = {
      distinct_id: null, // 设备唯一标识
      token: '',
      screen_height: 0,
      screen_width: 0,
      type: 1, // web
      lib_version: '1.0.0', // SDK版本
      os: '', // 操作系统
      browser: '',
      browser_version: '',
      application_id,
    };
    this.params = {
      event_code: 'common',
    }; // 事件参数
    this.paramsData = [];
    this.eventParams = {};
    this.router = router;
  }

  // 初始化
  init() {
    this.params.entry_time = getCurrentTime();
    this.getDeviceInfo();
    this.registerEvent();
  }

  // 获取设备信息
  getDeviceInfo() {
    this.commonProperties.screen_height = privateMethods.getScreenMes('height');
    this.commonProperties.screen_width = privateMethods.getScreenMes('width');
    this.commonProperties.token = privateMethods.getToken();
    this.getUserInfo();
    // 获取设备标识
    privateMethods.getDeviceId().then(deviceId => {
      this.commonProperties.distinct_id = deviceId;
    });
    this.commonProperties.os = privateMethods.getOperationSys();
    this.commonProperties.browser = privateMethods.getBrowserInfo().browser;
    this.commonProperties.browser_version = privateMethods.getBrowserInfo().ver;
  }

  // 获取用户信息 
  getUserInfo() {
    let userInfo = privateMethods.userInfoInstance.getUrl();
    Object.assign(this.commonProperties, userInfo);
  }
  
  // 注册事件
  registerEvent() {
    // 改写replaceState和pushState，以确保window能监听到
    history.replaceState = addEvent('replaceState');
    history.pushState = addEvent('pushState');
    window.addEventListener('replaceState', (state) => this.onPushStateHandle(state));
    window.addEventListener('pushState', (state) => this.onPushStateHandle(state));
    register(window, 'popstate', (state) => this.onPopStateHandle(state));
    register(window, 'beforeunload', (state) => this.onBeforeunloadHandle(state));
  }
  // 页面回退回调
  onPopStateHandle(state) {
    this._calcParams();
    let commomParams = this._concatParams(1);
    this.collectUpload(commomParams).then(res => {
      this.params.entry_time = getCurrentTime();
      this._clearDataParams();
    })
  }
  // 离开页面回调
  onBeforeunloadHandle(event) {
    sessionStorage.clear();
    this._calcParams();
    let commomParams = this._concatParams(1);
    this.collectUpload(commomParams).then(res => {
      this.params.entry_time = getCurrentTime();
      this._clearDataParams();
    })
  }
  // 页面跳转回调
  onPushStateHandle(state) {
    // 调用common事件上传
    this._calcParams();
    let commomParams = this._concatParams(1);
    this.collectUpload(commomParams).then(res => {
      this.params.entry_time = getCurrentTime();
      this._clearDataParams();
    })
  }

  async collectUpload(params) {
    try {
      const res = await apis.collectUpdload(JSON.stringify(params));
      return res;
    } catch(err) {
      console.error(err);
    }
  }

  // 暴露出去的方法
  // 设置请求的baseUrl
  $setBaseUrl(url) {
    if(url) {
      Axios.defaults.baseURL = url;
      return;
    }
  }

  /**
   * 自定义事件触发
   * @param {*} enentType 事件名称
   * @param extraParams 额外参数 
   */
  $dispatch(eventType, extraParams = {}) {
    this.eventParams.event_code = eventType;
    this.eventParams.create_time = getCurrentTime();
    Object.assign(this.eventParams, extraParams);
    let commomParams = this._concatParams(2);
    this.collectUpload(commomParams);
  }

  // 设备参数拿属性里的，特定参数进行传递, type 1 common，2自定义事件
  _concatParams(type) {
    let { params, eventParams, commonProperties } = { ...this };
    let query;
    if(type === 1) {
      this.paramsData.push(params);
      query = {
        commonProperties,
        data: this.paramsData
      };
    } else if(type === 2) {
      query = {
        commonProperties,
        data: [eventParams]
      }
    }
    
    return query;
  }

  // 私有方法
  // 清空paramslist数组
  _clearDataParams() {
    this.paramsData = [];
  }
  // 计算common下params参数
  _calcParams() {
    this.commonProperties.token = privateMethods.getToken();
    this.params.leave_time = getCurrentTime();
    let urlArr = privateMethods.referUrlInstance.getUrl();
    Object.assign(this.params, urlArr);
  }
}




export default collect;