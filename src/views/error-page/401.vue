<template>
  <error-content code="401" desc="~~您没有浏览这个页面的权限~" :src="src"/>
</template>

<script>
import error401 from '@/assets/images/error-page/error-401.svg'
import ErrorContent from './ErrorContent.vue'
export default {
  name: 'error_401',
  components: {
    ErrorContent
  },
  data () {
    return {
      src: error401
    }
  }
}
</script>
