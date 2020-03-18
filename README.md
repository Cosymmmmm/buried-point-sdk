# 🚀 Welcome to my JavaScript SDK for data catch

一个基于原生JS的数据埋点采集SDK，有一定的业务场景，代码仅供参考！



#### 基本功能

满足页面切换时监听自动上报。事件派发。

#### 基本使用方法

```
const myCollect = new Collect({application_id: application_id});
myCollect.init();
```

#### 事件派发

```
/**
   * 自定义事件触发
   * @param {*} enentType 事件名称
   * @param extraParams 额外参数 
   */
myCollect.$dispatch(eventType, extraParams);
```

#### 打包

npm run build