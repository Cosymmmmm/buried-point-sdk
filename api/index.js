import {post, postJson} from './request';

const urlList = {
  collectUpdload: '/business-data-analysis-platform/auth/upload',
};

const collectUpdload = (params = {}) => postJson(urlList.collectUpdload, params);

export default {
  collectUpdload
}