<template>
  <Modal
    :class-name="className"
    title="历史数据"
    v-model="modalVisible"
    :mask="false"
    :transfer="false"
    width="255"
    footer-hide
    @on-visible-change="onVisibleChange"
  >
    <DatePicker
      type="daterange"
      placement="bottom"
      placeholder=""
      style="width: 100%;"
      :options="options"
      @on-change="onDateChange"
    ></DatePicker>
    <Table
      border
      class="history_table"
      height="300"
      :columns="[
        {
          tooltip: true,
          title: '文件名称',
          key: 'fileName'
        },
        {
          title: '操作',
          width: 90,
          slot: 'action'
        }
      ]"
      :data="historyList"
      :loading="loading"
    >
      <template slot-scope="{ row }" slot="action">
        <Icon type="md-arrow-dropright" class="tb_play" size="22" @click="onStart(row)" />
        <!-- <Icon type="md-trash" class="tb_trash" @click="deleteDeviceFromProject(row)" /> -->
      </template>
    </Table>
  </Modal>
</template>

<script>
import { GET_PROJECT_HISTORY } from '@api/project'
export default {
  props: {
    className: String,
    project: Object,
    show: Boolean
  },
  computed: {
    modalVisible: {
      get () {
        return this.show
      },
      set (val) {
        // console.log('setVal')
      }
    }
  },
  data () {
    return {
      options: {
        disabledDate (date) {
          return date && date.valueOf() > Date.now()
        }
      },
      historyList: [],
      loading: false,
      startTime: '',
      endTime: ''
    }
  },
  methods: {
    onVisibleChange (visible) {
      if (visible) {
        this.getHistoryList()
      } else {
        this.historyList = []
        this.startTime = ''
        this.endTime = ''
        this.$emit('close')
      }
    },
    // 日期发生变化
    onDateChange (dateStr) {
      // console.log('d', dateStr)
      this.startTime = dateStr[0]
      this.endTime = dateStr[1]
      this.getHistoryList()
    },
    onStart (row) {
      this.$emit('onStart', row)
    },
    async getHistoryList () {
      try {
        if (!this.startTime && !this.endTime) return
        this.loading = true
        const ret = await GET_PROJECT_HISTORY({
          projectId: this.project.id,
          startTime: this.startTime,
          endTime: this.endTime
        })
        this.historyList = ret || []
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
