import store from '@/store'
import router, { routes } from '@/router'
import { authPassFn, getPowers } from '@/libs/util'

export default {
  beforeCreate: function () {
    const { authCode } = this.$options
    if (authCode) {
      const { state } = store
      if (parseInt(state.userId, 10) === 1) return
      if (authPassFn(getPowers(routes), authCode) && !authPassFn(state.user_powers, authCode)) {
        // console.log('global mixin', authCode)
        router.replace('/_401')
      }
    }
  }
}
