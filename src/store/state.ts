
import { localRead, localReadArry } from '@/libs/util'

export default {
  headerHeight: 48,
  contentWidth: 0,
  contentHeight: 0,
  isCollapsed: false,
  currentRouter: null,
  activeMenu: '', // 当前激活菜单项
  access_token: localRead('access_token'),
  refresh_token: localRead('refresh_token'),
  user_powers: localReadArry('user_powers'),
  userId: localRead('userId') ? parseInt(localRead('userId'), 10) : 0,
  apiTasks: {}
}
