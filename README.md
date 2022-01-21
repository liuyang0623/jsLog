## 前端日志统计工具
**历史版本**  

版本号 | 发布日期    | 说明
----- | ---------- | ------
1.0.0 | 2022.01.20 | 
1.0.1 | 2019.01.21 | 修复事件委托bug

<br>
   
### 1.安装

#### 直接用```<script>```引入
在常规的前端页面中可使用```<script>```标签引入，此时js4log会被注册为一个全局变量js4Log，请通过该对象进行相关的配置和事件注册
```html
<script type="text/javascript" src="./x.x.x/js4Log.js"></script> 
<script>
js4Log.config({
  pageId: 123123,
  cusParam: {
    cus1: 'cus1...',
    cus2: 'cus2...',
  },
})
</script>
```  
 

#### NPM
对于使用spa框架开发的项目时建议使用NPM进行安装
```shell
npm install --save js4log
```

```javascript
import js4Log from 'js4Log/dist/js4Log'

js4Log.config({
  pageId: 123123  
  accessLog:false,
  loadLog:false,
  stayLog:false,
  cusParam: {
    cus1: 'cus1...',
    cus2: 'cus2...',
  },
})

```
对于SPA应用,需要在router守卫中重置pagePath，对于Vue来说，需要使用fullPath来保证携带了所有的GET参数

```javascript
router.beforeEach((to, from, next) => {
    js4Log.config({
        accessLog:true,
        stayLog:true,
        loadLog:true,
        pagePath: `#${to.fullPath}`,
    })
    ...
})
```


### 2.配置项

#### js4Log.config(Object)  

##### 参数（Object）
属性           | 类型       |  默认值      |  必填  | 说明
------------  | ---------- | ----------- | ----- | ------
pageId        | Number     |  0          |  否   | 页面vID
from          | String     |  ''         |  否   | 预留业务源字段
finger        | Boolean    |  true       |  否   | 是否开启指纹追踪
fingerKey     | String     |  'site_tp'  |  否   | 指纹追踪cookie的Key名
defaultParams | Boolean    |  true       |  否   | 是否添加默认浏览器参数
getQuery      | Array      |  [ ]        |  否   | 需要携带到日志参数中的的get参数数组 
throttleTime  | Number     | 200         |  否   | 函数节流的响应延迟（毫秒）
protocol      | String     | ''          |  否   | 日志接口协议
domain        | String     | jz.union-wifi.com | 否 | 日志接口域名
port          | String     | ''          |  否   | 日志接口端口
path          | String     |  hm.gif     |  否   | 日志资源路径，支持多级
accessLog     | Boolean    |  true       |  否   | 是否开启access日志（PV）
scrollLog     | Boolean    |  true       |  否   | 是否开启window原生滚动事件日志
stayLog       | Boolean    |  true       |  否   | 是否开启驻留日志
loadLog       | Boolean    |  true       |  否   | 是否开启load事件日志
pagePath      | String     |  ''         |  否   | 页面path,SPA应用容易用到
cusParam      | Object     |  {}         |  否   | 自定义全局日志参数
<br> 

### 3.公用方法

对于需要自定义上报日志的情况，可手动进行日志注册和日志上报

对于需要支持高级选择器的，需要手动引入Sizzle模块:
```javascript
npm install sizzle

import Sizzle from 'sizzle'
```

#### js4Log.initLog(Object)

##### 参数（Object）  

属性           | 类型       |  默认值      |  必填  | 说明
------------  | ---------- | ----------- | ----- | ------
el            | String     | -           | 是     | DOM对象选择，支持多种选择器，需要手动引入Sizzle
evtType       | String     | -           | 是     | html原生事件名
params        | Object     | -           | 是     | 自定义携带参数

比如需要不使用默认的滚动日志并自定义滚动日志

```javascript
js4Log.config({
   scrollLog:false 
})

js4Log.initLog(window,'scroll',{ info:'customScrollLog'})
```
则会在window注册一个scroll日志，并添加自定义参数，类似的日志可以注册到任意DOM的任意原生事件上
<br> 
#### js4Log.log(params)
立即上报一条日志，有3种调用方式：
##### js4Log.log(params)
##### js4Log.log(params, evt | fn)
##### js4Log.log(params, evt, fn)


##### 参数（Object） 

属性           | 类型       |  默认值      |  必填  | 说明
------------  | ---------- | ----------- | ----- | ------
params        | Object     | -           | 是     | 自定义携带参数
evt           | Event      | -           | 否     | DOM Event事件
fn            | Function   | -           | 否     | 日志发送成功后的回调函数

##### 成功回调函数参数（Object res）
属性           | 类型       |  值       | 说明
------------  | ---------- | ---------| ------
code          | Number     | 0        | 错误码
msg           | String     | 'send success' | 错误信息

##### 失败回调函数参数（Object err）
属性           | 类型       |  值       | 说明
------------  | ---------- | ---------| ------
code          | Number     | 1        | 错误码
error         | Object     | Event对象    | 错误信息

比如通过下列方式进行会回调：
```javascript
js4Log.log({...params},e,function(e){
    if(e.code == 1){
        console.log('发送失败',e.error)
    } else if(e.code == 0){
        console.log('发送成功',e.msg)
    }  
})
```
<br/>

#### js4Log.addExtra(params)
添加全局参数,这个和config中的customParam相互独立，并具有更高的优先级  

##### 参数（Object）

属性           | 类型       |  默认值      |  必填  | 说明
------------  | ---------- | ----------- | ----- | ------
params        | Object    | -           | 否     |  
<br/>

#### js4Log.removeExtra(key)
删除指定参数   

##### 参数（String | Array）

属性           | 类型       |  默认值      |  必填  | 说明
------------  | ---------- | ----------- | ----- | ------
key           | String 或 Array | -            | 否     |  
<br>

#### js4Log.getLpvs()
返回当前日志的lpvs参数   
<br>
#### js4Log.getPvs()
返回当前日志的pvs参数 
<br>
### 注意
__本日志工具的方法在对同一个对象的同一个事件进行日志初始化时，会先解绑上一次的日志事件，而不是追加。__