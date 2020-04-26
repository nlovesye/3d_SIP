# surveillance_system

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### description
src/views: 页面组件
src/views/login: 登录页
src/views/users: 权限配置、角色权限管理、部门管理、用户管理等模块
src/views/project: 项目工程模块
src/views/tools: 调试小工具
src/views/error-page: 错误页
src/router: 路由和权限配置
src/store: vuex数据仓库，公共资源等
src/libs: 静态文件库，axios接口请求封装处理，全局mixin、directive，第三方库potree、threejs等
src/components: 公共组件
src/assets: 图片样式资源等
src/api: 所有接口请求

使用ui组件库iView4.x
元素权限验证指令v-auth：src/libs/directive.js
模块权限验证方式使用mixin在beforeCreate生命周期进行验证：src/libs/mixin.js
统一错误处理和请求封装在axios响应拦截器： src/libs/axios.ts
接口鉴权token登陆成功后保存在localStorage和store，axios初始化配置时从store里面取值并设置到请求头
部分第三方库直接在public/index.html以script方式引入
