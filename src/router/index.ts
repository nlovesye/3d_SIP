import Vue from 'vue'
import VueRouter from 'vue-router'
import ViewUI from 'view-design'
import rs from './routes'
import store from '@/store'
import { authPassFn, getPowers } from '@/libs/util'

Vue.use(VueRouter)

const Router: any = VueRouter

export interface IMeta {
  show?: boolean;
  power?: any
}

export interface IRouter {
  path: string;
  name?: string;
  component?: any;
  components?: any;
  redirect?: string;
  meta?: IMeta;
  children?: IRouter[];
}

export const routes = rs

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((_to: any, _from: any, next: any) => {
  (ViewUI as any).LoadingBar.start()
  next()
  // const { state } = store
  // const code = _to.name
  // // console.log('router.beforeEach', _to, code, state, authPassFn(state.user_powers, code), authPassFn(getPowers(routes), code))
  // if (state.userId === 1) {
  //   next()
  // } else {
  //   if (code && authPassFn(getPowers(routes), code) && !authPassFn(state.user_powers, code)) {
  //     next('/_401')
  //     // next()
  //   } else {
  //     next()
  //   }
  // }
})

router.afterEach((to: any) => {
  (ViewUI as any).LoadingBar.finish()
})

export default router
