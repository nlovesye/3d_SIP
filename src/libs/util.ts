import router, { IRouter, IMeta } from '@/router'
import { getCryptoJS } from '@/libs/getCryptoJS.js'
import Cookies from 'js-cookie'

const CryptoJS: any = getCryptoJS()

export const localSave = (key: string, value: string) => {
  localStorage.setItem(key, value)
}

export const localRead = (key: any): string => {
  if (key === 'access_token' && !localStorage.getItem(key)) {
    // debugger
    // console.log('router', router)
    router.replace('/login')
  }
  return localStorage.getItem(key) || ''
}

export const localReadArry = (key: any): any[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '')
  } catch (e) {
    return []
  }
}

export const localRemove = (key: string) => {
  localStorage.removeItem(key)
}

/**
 * @description 获取路由菜单
 */
export const getMenus = (routes: Array<IRouter>) => {
  return routes.filter(item => {
    if (item.meta && item.meta.show) {
      if (item.children && item.children.length) {
        item.children = getMenus(item.children)
      }
      return true
    }
    return false
  })
}

// 获取 router 信息
export const getRouter = (routes: IRouter[], name: string, rt: IRouter | null): IRouter | null => {
  routes.forEach(item => {
    if (item.children && item.children.length) {
      rt = getRouter(item.children, name, rt)
    }
    if (item.name === name) {
      rt = item
    }
  })
  return rt
}

// 获取子菜单列表数据
export const getParentRouter = (routes: IRouter[], name: string, rt: any): any => {
  for (let i = 0; i < routes.length; i++) {
    const item = routes[i]
    if (item.children && item.children.length) {
      if (item.children.some(c => c.name === name)) {
        rt = item
        break
      } else {
        rt = getParentRouter(item.children, name, rt)
      }
    }
  }
  return rt
}

// 获取 router meta信息
export const getRouterMeta = (routes: IRouter[], name: string, rt: IMeta | null): IMeta | null => {
  routes.forEach(item => {
    if (item.children && item.children.length) {
      rt = getRouterMeta(item.children, name, rt)
    }
    if (item.name === name && item.meta) {
      rt = item.meta
    }
  })
  return rt
}

/**
 * @description 获取权限表
 * @param routes
 */
export const getPowers = (routes: Array<IRouter>) => {
  return routes.filter(item => item.meta && item.meta.power && item.meta.power.show !== false).map((item: any) => item.meta.power)
}

/**
 * @description 获取权限表子列表
 * @param powers
 */
export const getPowerChildren = (powers: any[], code: string) => {
  if (code === '_root') {
    return powers
  } else {
    const getRet = (list: any[], rt: any) => {
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        if (item.children && item.children.length) {
          rt = getRet(item.children, rt)
        }
        if (item.code === code) {
          rt = item.children || []
          break
        }
      }
      return rt
    }
    // console.log('ret', getRet(powers, []))
    return getRet(powers, [])
  }
}

// 登录处理
export const encryption = (params: any) => {
  let {
    data,
    type,
    param,
    key
  } = params
  let result = JSON.parse(JSON.stringify(data))
  if (type === 'Base64') {
    param.forEach((ele: any) => {
      result[ele] = btoa(result[ele])
    })
  } else {
    param.forEach((ele: any) => {
      var data = result[ele]
      key = CryptoJS.enc.Latin1.parse(key)
      var iv = key
      // 加密
      var encrypted = CryptoJS.AES.encrypt(
        data,
        key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.ZeroPadding
        })
      result[ele] = encrypted.toString()
    })
  }
  return result
}

// 时间显示处理
export const timeToString = (time: string) => {
  const prev0 = (num: Number) => num < 10 ? `0${num}` : `${num}`
  const dt = new Date(time)
  const Y = dt.getFullYear()
  const M = prev0(dt.getMonth() + 1)
  const D = prev0(dt.getDate())
  const h = prev0(dt.getHours())
  const m = prev0(dt.getMinutes())
  const s = prev0(dt.getSeconds())
  const ret = `${Y}-${M}-${D} ${h}:${m}:${s}`
  // console.log('ttt', new Date(time).toLocaleString(), ret)
  return ret
}

/**
 * 鉴权
 * @param powers 权限数据
 * @param val 目标值
 */
export const authPassFn = (powers: any[], val: string): boolean => {
  let exist = false
  const fn = (arr: any[]) => {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (item.code === val) {
        exist = true
        break
      }
      if (item.children && item.children.length) {
        fn(item.children)
      }
    }
  }
  if (powers.length > 0 && (typeof powers === 'string')) {
    powers = JSON.parse(powers)
  }
  fn(powers)
  return exist
}

/**
 * 设置用户名密码cookie
 * @param username 用户名
 * @param password 密码
 */
export const setUserPass = (username: string, password: string) => {
  Cookies.set('username', username, { expires: 180 })
  Cookies.set('password', password, { expires: 180 })
}

/**
 * 获取用户名密码cookie
 */
export const getUserPass = (): any => {
  const username: string | undefined = Cookies.get('username')
  const password: string | undefined = Cookies.get('password')
  if (username && password) return { username, password }
  else return false
}
