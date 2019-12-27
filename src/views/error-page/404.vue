<template>
  <error-content code="404" desc="Oh~~您的页面好像飞走了~" :src="src"/>
</template>

<script lang="ts">
import error404 from '@assets/images/error-page/error-404.svg'
import ErrorContent from './ErrorContent.vue'
import { Component, Vue, Provide } from 'vue-property-decorator'

@Component({
  components: {
    ErrorContent
  }
})
export default class NotFound extends Vue {
  @Provide() private src: any = error404
}
</script>
