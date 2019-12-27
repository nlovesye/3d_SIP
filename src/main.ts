import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import mixin from './libs/mixin'
import directives from './libs/directive'
import ViewUI from 'view-design'
import '@assets/styles/index.less'

Vue.config.productionTip = false

Vue.use(ViewUI, {
  size: 'small'
})

Vue.mixin(mixin)
for (const name in directives) {
  if (directives.hasOwnProperty(name)) {
    const dirc = (directives as any)[name]
    Vue.directive(name, {
      bind: dirc.bind,
      inserted: dirc.inserted
    })
  }
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
