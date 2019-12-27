import store from '@/store'
import { authPassFn } from '@libs/util'

export default {
  auth: {
    inserted: function (el, { value }) {
      const { state } = store
      // console.log('inserted', value, state, typeof state.user_powers, authPassFn(state.user_powers, value))
      if (parseInt(state.userId, 10) === 1) {
        return
      }
      if ((typeof (value)) === 'string') {
        if (!authPassFn(state.user_powers, value)) {
          el.parentNode.removeChild(el)
        }
      } else if (value instanceof Array && value.length > 0) {
        if (value.every(val => !authPassFn(state.user_powers, val))) {
          el.parentNode.removeChild(el)
        }
      }
    }
  }
}
