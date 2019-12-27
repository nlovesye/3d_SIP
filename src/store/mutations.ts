import { RootStateTypes } from './types'
import { IRouter } from '@/router'

interface ITask {
  [url: string]: any
}

export default {
  // 设置content宽度和高度
  setContentSize (state: RootStateTypes, payload: any) {
    state.contentWidth = payload.width
    state.contentHeight = payload.height - state.headerHeight
  },
  setAccessToken (state: RootStateTypes, token: string) {
    state.access_token = token
  },
  setRefreshToken (state: RootStateTypes, token: string) {
    state.refresh_token = token
  },
  onSiderSelect (state: RootStateTypes, name: string) {
    console.log('tt', name)
  },
  setCurrentRouter (state: RootStateTypes, router: IRouter | null) {
    state.currentRouter = router
  },
  setActiveMenu (state: RootStateTypes, name: string) {
    state.activeMenu = name
  },
  setUserPowers (state: RootStateTypes, powers: any[]) {
    state.user_powers = powers
  },
  setUserId (state: RootStateTypes, userId: string | number) {
    state.userId = userId
  },
  onCollapsedChange (state: RootStateTypes) {
    state.isCollapsed = !state.isCollapsed
  },
  // 添加api请求
  addRequest (state: RootStateTypes, task: ITask) {
    // console.log('set', task)
    state.apiTasks = {
      ...state.apiTasks,
      ...task
    }
  },
  // 删除api请求
  removeRequest (state: RootStateTypes, url: string) {
    delete state.apiTasks[url]
  }
}
