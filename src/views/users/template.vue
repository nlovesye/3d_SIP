<style lang="less">
  .template{
    height: 100%;
    // background-color: #2C2B29;
    padding: 0 10px;
  }
</style>
<template>
  <div class="template">
    <Row
      class-name="table_header_top"
      align="middle"
      justify="space-between"
      type="flex"
    >
      <Col span="12">col-12</Col>
      <Col span="4">
        <Input v-model="keywords" search placeholder="用户名称" enter-button></Input>
      </Col>
    </Row>
    <div class="table_header_title">
      <Button type="primary">新建</Button>
    </div>
    <Table
      border
      stripe
      :columns="tableHeader"
      :data="tableData"
      :loading="tableLoading"
      :max-height="tableHeight"
    >
      <Dropdown
        slot="action"
        trigger="click"
        @on-click="onActionClick"
      >
          <Button icon="md-create" type="default">
            <!-- <Icon type="md-create" /> -->
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="edit">编辑</DropdownItem>
            <DropdownItem name="delete">删除</DropdownItem>
            <DropdownItem name="power">权限分配</DropdownItem>
            <DropdownItem name="reset">密码重置</DropdownItem>
          </DropdownMenu>
      </Dropdown>
      <Page
        slot="footer"
        show-sizer
        show-total
        :page-size-opts="[20, 50, 100, 200]"
        :total="tableCount"
        :current="pageNo"
        :page-size="pageSize"
        @on-change="pageNo => onPageChange('pageNo', pageNo)"
        @on-page-size-change="pageSize => onPageChange('pageSize', pageSize)"
        :transfer="true"
      />
    </Table>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

// const renderHeader = (h, { column, index }) => {
//   console.log('h', column)
//   return h('span', '')
// }

export default {
  data () {
    return {
      tableHeader: [
        {
          type: 'selection',
          width: 50,
          align: 'center'
          // fixed: 'left'
        },
        {
          title: '操作',
          slot: 'action',
          align: 'center',
          width: 70
        },
        {
          title: '序号',
          type: 'index',
          width: 65,
          align: 'center'
          // fixed: 'left'
        },
        {
          title: '用户账号',
          key: 'userAccount',
          tooltip: true,
          resizable: true,
          width: 140,
          ellipsis: true
        },
        {
          title: '用户姓名',
          key: 'userName',
          tooltip: true,
          resizable: true,
          width: 140,
          ellipsis: true
        },
        {
          title: '部门',
          key: 'part',
          tooltip: true,
          resizable: true,
          width: 120,
          ellipsis: true
        },
        {
          title: '电话',
          key: 'phone',
          tooltip: true,
          resizable: true,
          width: 140,
          ellipsis: true
        },
        {
          title: '邮箱',
          key: 'email',
          tooltip: true,
          resizable: true,
          width: 150,
          ellipsis: true
        },
        {
          title: '入职时间',
          key: 'address5',
          tooltip: true,
          resizable: true,
          width: 140,
          ellipsis: true
        },
        {
          title: '创建时间',
          key: 'address6',
          tooltip: true,
          // resizable: true,
          ellipsis: true
          // width: 140
        }
      ],
      tableData: [],
      tableHeight: 0,
      tableLoading: false,
      tableCount: 0,
      pageNo: 1,
      pageSize: 20,
      keywords: ''
    }
  },
  computed: {
    ...mapState(['contentHeight'])
  },
  methods: {
    ...mapMutations(['getContentHeight']),
    async getData () {
      try {
        this.tableLoading = true
        const d = []
        for (let i = 0; i < 624; i++) {
          d.push({
            userAccount: `xxxxxxxxx${i}`,
            userName: `用户${i}`,
            part: 'ssddd',
            phone: Math.round(Math.random() * 10) + '68422' + i,
            email: 'email'
          })
        }
        setTimeout(() => {
          let end = this.pageNo * this.pageSize
          end = end > d.length ? d.length : end
          this.tableData = d.slice((this.pageNo - 1) * this.pageSize, end)
          this.tableCount = d.length || 0
          this.tableLoading = false
        }, (Math.random() * 1200))
      } catch (error) {
        this.tableLoading = false
        console.error(error)
      }
    },
    onPageChange (key, val) {
      // console.log('pageChange', key, val)
      this[key] = val
      this.getData()
    },
    /**
     * @description 操作点击
     * @param name 操作名称
     */
    onActionClick (name) {

    }
  },
  mounted () {
    this.tableHeight = this.contentHeight - 20 - 44 - 50
    this.getData()
    // console.log('contentHeight', this.tableHeight)
  }
}
</script>
