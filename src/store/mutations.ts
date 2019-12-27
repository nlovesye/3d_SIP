import { RootStateTypes } from './types'
import { IRouter } from '@/router'

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
  }
}
