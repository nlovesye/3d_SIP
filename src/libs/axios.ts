import axios from 'axios'
import router from '@/router'
import { Message, Modal } from 'view-design'
import store from '@/store'
import { getUserPass } from './util'

const baseToken: string = 'Basic Y29tbWE6Y29tbWE='

class HttpRequest {
  baseUrl: string = ''
  queue: any = {}

  constructor (baseUrl: string = '') {
    this.baseUrl = baseUrl
    this.queue = {}
  }

  getInsideConfig () {
    const Authorization: string = store.state && store.state.access_token ? `Bearer ${store.state.access_token}` : baseToken
    const config = {
      baseURL: this.baseUrl,
      headers: {
        Authorization
      },
      withCredentials: true
    }
    // console.log('getInsideConfig', config)
    return config
  }
  destroy (url: string): void {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance: any, url: string) {
    // 请求拦截
    instance.interceptors.request.use((config: any) => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, (error: any) => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use((res: any) => {
      this.destroy(url)
      const { data, status } = res
      // console.log('响应拦截response', res, data, url)
      if (status === 200) {
        if (url !== '/auth/oauth/token') {
          if (data instanceof Object) {
            if ('success' in data && !data.success) {
              (Message as any).error(data.msg || '服务器错误')
              return Promise.reject(data)
            } else if ('data' in data) {
              return data.data
            } else {
              return data
            }
          } else {
            // (Message as any).error(data.message || `[${url}]错误`)
            return data
          }
        } else {
          return data
        }
      } else if (status === 401 || status === 403) {
        router.replace('/login')
      } else {
        return Promise.reject(data)
      }
    }, (error: any) => {
      this.destroy(url)
      // console.log('error', error, error.response)
      if (error && error.message === 'Request failed with status code 401') {
        (Modal as any).error({
          title: '登录超时，请重新登录！',
          onOk: () => {
            store.dispatch('LOGOUT')
          }
        })
        // (Modal as any).confirm({
        //   title: '登录超时',
        //   content: '是否重新登录？',
        //   onOk: () => {
        //     if (getUserPass()) {
        //       // console.log('c', getUserPass())
        //       store.commit('setAccessToken', '')
        //       store.dispatch('LOGIN', {
        //         username: getUserPass().username,
        //         password: getUserPass().password,
        //         remember: true,
        //         code: '',
        //         randomStr: '',
        //         scope: 'server',
        //         grant_type: 'password'
        //       })
        //       // .then(() => {
        //       //   window.location.reload()
        //       // })
        //     } else {
        //       (Message as any).error('未记住密码，请退出重新登录！')
        //       setTimeout(() => {
        //         store.dispatch('LOGOUT')
        //       }, 500)
        //     }
        //   }
        // })
        return Promise.reject(error)
      } else {
        if (error.response && error.response.data) {
          if (error.response.data.status === 404) {
            (Message as any).error('404-服务器资源不存在！')
          } else {
            (Message as any).error(error.response.data.msg || error.response.data.error || error.response.data.message || '服务器错误')
          }
          return Promise.reject(error.response.data)
        } else {
          (Message as any).error(error.msg || error.message || '服务器错误')
          return Promise.reject(error)
        }
      }
    })
  }
  request (options: any) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
