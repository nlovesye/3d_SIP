<template>
  <div>
    <Button size="large" type="text" @click="backHome">返回首页</Button>
    <Button size="large" type="text" @click="backPrev">返回上一页({{ second }}s)</Button>
  </div>
</template>

<script lang="ts">
import './error.less'
import { Vue, Provide, Prop } from 'vue-property-decorator'

export default class BackBtnGroup extends Vue {
  $config: any

  @Provide() private second: number = 5
  @Provide() private timer: any = null

  backHome (): void {
    this.$router.replace({
      name: this.$config.homeName
    })
  }

  backPrev () {
    this.$router.go(-1)
  }

  mounted () {
    this.timer = setInterval(() => {
      if (this.second === 0) this.backPrev()
      else this.second--
    }, 1000)
  }

  beforeDestroy () {
    clearInterval(this.timer)
  }
}
</script>
