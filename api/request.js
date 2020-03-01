import Axios from 'axios';
import qs from "qs";

// 测试环境
// Axios.defaults.baseURL = 'http://120.55.124.98:8001';

// 正式环境
Axios.defaults.baseURL = 'http://118.31.237.177:8001';

export function post(url, params, options = {}) {
  return Axios.post(url, qs.stringify(params), options);
}

export async function postJson(url, params) {
  try {
    const res = await Axios.post(url, params, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    return res;
  } catch(err) {
    throw Error(err);
  }
}