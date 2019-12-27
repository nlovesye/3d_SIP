import { RootStateTypes } from './types'
import { ActionTree } from 'vuex'
import router from '@/router'
import { Message } from 'view-design'
import { LOGIN, GET_USER_POWERS } from '@/api/user'
import { localSave, localRemove, setUserPass } from '@/libs/util'

const actions: ActionTree<RootStateTypes, any> = {
  // 登录
  async LOGIN ({ commit, state: RootStateTypes }, data: any) {
    try {
      // console.log('reqData', data)
      const ret: any = await LOGIN(data)
      // console.log('ret', ret)
      localSave('access_token', ret.access_token)
      localSave('refresh_token', ret.refresh_token)
      localSave('userId', ret.userId)
      commit('setAccessToken', ret.access_token)
      commit('setRefreshToken', ret.refresh_token)
      commit('setUserId', ret.userId)
      let powerRet: any = await GET_USER_POWERS()
      powerRet = powerRet && powerRet.length ? JSON.stringify(powerRet) : ''
      localSave('user_powers', powerRet)
      commit('setUserPowers', powerRet)
      if (data.remember) {
        setUserPass(data.username, data.password)
      }
      // console.log('power', powerRet)
      ;(Message as any).success('登陆成功!')
      router.replace('/project')
    } catch (error) {
      console.log('login error', error)
      // router.push('/')
    }
    // commit('SET_AUTHOR', data);
  },
  // 退出登录
  LOGOUT ({ commit }) {
    localRemove('access_token')
    localRemove('refresh_token')
    localRemove('user_powers')
    localRemove('userId')
    commit('setAccessToken', '')
    commit('setRefreshToken', '')
    commit('setUserPowers', [])
    commit('setUserId', '')
    router.push({ name: 'login' })
  }
}

export default actions
