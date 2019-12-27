<style lang="less">
  .users{
    height: 100%;
    // background-color: #2C2B29;
    padding: 0 10px;
  }
</style>

<template>
  <div class="users">
    <Modal
      v-model="modalVisible"
      :title="modalTitle"
      fullscreen
      :z-index="2000"
      :transfer="false"
      :mask-closable="false"
      @on-cancel="onCancel"
    >
      <Form
        ref="form"
        :model="formValid"
        :rules="formRules"
        :label-width="80"
        inline
      >
        <FormItem label="账号" prop="username">
          <Input v-model="formValid.username" placeholder="" />
        </FormItem>
        <FormItem label="密码" prop="newPassword" v-if="modalTitle === '添加用户'">
          <Input v-model="formValid.newPassword" placeholder="" />
        </FormItem>
        <FormItem label="部门" prop="deptCode">
          <Cascader
            style="margin-top: 5px;"
            :data="deptList"
            v-model="formValid.deptCode"
            placeholder=""
            :render-format="label => label.join('-')"
            ></Cascader>
        </FormItem>
        <FormItem label="角色" prop="role">
          <Select v-model="formValid.role" @on-open-change="onOpenChange" placeholder="" multiple style="width:200px">
            <Option
              v-for="item in roleList"
              :value="item.roleId"
              :key="item.roleId"
            >{{ item.roleName }}</Option>
          </Select>
        </FormItem>
        <FormItem label="姓名" prop="name">
          <Input v-model="formValid.name" placeholder="" />
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="formValid.email" placeholder="" />
        </FormItem>
        <FormItem label="联系方式" prop="phone">
          <Input v-model="formValid.phone" placeholder="" />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formValid.remark" placeholder="" type="textarea" style="width:260px" :autosize="{minRows: 2,maxRows: 5}" />
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="default" @click="onCancel">取消</Button>
        <Button type="primary" @click="onSubmit" :loading="modalLoading">提交</Button>
      </template>
    </Modal>
    <Row
      class-name="table_header_top"
      align="middle"
      justify="space-between"
      type="flex"
    >
      <Col span="12">用户管理</Col>
      <Col span="4">
        <Input v-model="keywords" search placeholder="用户名称" enter-button @on-search="getData" />
      </Col>
    </Row>
    <div class="table_header_title">
      <Button type="primary" @click="onAdd" v-auth="'user_index_add'">新建</Button>
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
        slot-scope="{ row }"
        slot="action"
        trigger="click"
        @on-click="name => onActionClick(name, row)"
        :transfer="true"
        v-auth="['user_index_edit', 'user_index_delete']"
      >
          <Button icon="md-create" type="default">
            <!-- <Icon type="md-create" /> -->
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="edit" v-auth="'user_index_edit'">编辑</DropdownItem>
            <DropdownItem name="delete" v-auth="'user_index_delete'">删除</DropdownItem>
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
import { GET_USERS, ADD_USERS, EDIT_USERS, DELETE_USERS, GET_DEPT, GET_DEPT_ROLE } from '@/api/user'
import { timeToString } from '@libs/util'

const ruleNoEmpty = function (str) {
  return { required: true, message: `${str}不能为空`, trigger: 'change' }
}

export default {
  authCode: 'user_index',
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
          key: 'username',
          tooltip: true,
          resizable: true,
          width: 140,
          ellipsis: true
        },
        {
          title: '用户姓名',
          key: 'name',
          tooltip: true,
          resizable: true,
          width: 140,
          ellipsis: true
        },
        {
          title: '部门',
          key: 'deptName',
          tooltip: true,
          resizable: true,
          width: 120,
          ellipsis: true
        },
        {
          title: '角色',
          key: 'roleList',
          tooltip: true,
          resizable: true,
          width: 120,
          ellipsis: true,
          render: (h, { row }) => h('span', row.roleList.map(item => item.roleName).join(','))
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
          title: '创建时间',
          key: 'createTime',
          tooltip: true,
          // resizable: true,
          ellipsis: true,
          // width: 140
          render: (h, { row }) => h('span', timeToString(row.createTime))
        }
      ],
      tableData: [],
      tableHeight: 0,
      tableLoading: false,
      tableCount: 0,
      pageNo: 1,
      pageSize: 20,
      keywords: '',
      modalVisible: false,
      modalTitle: '添加角色',
      modalLoading: false,
      formValid: {
        userId: null,
        username: '',
        newPassword: '',
        deptId: null,
        deptCode: [],
        role: [],
        name: '',
        email: '',
        phone: '',
        remark: ''
      },
      formRules: {
        username: [
          ruleNoEmpty('账号')
        ],
        newPassword: [
          ruleNoEmpty('密码')
        ],
        deptId: [],
        deptCode: [
          { type: 'array', message: '部门不能为空', trigger: 'change', required: true }
        ],
        role: [
          { type: 'array', message: '角色不能为空', trigger: 'change', required: true }
        ],
        name: [
          ruleNoEmpty('姓名')
        ],
        email: [
          // ruleNoEmpty('邮箱'),
          { type: 'email', message: '请输入正确格式的邮箱', trigger: 'change' }
        ],
        phone: [],
        remark: []
      },
      deptList: [], // 部门列表
      roleList: [] // 角色列表
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
        const ret = await GET_USERS({
          limit: this.pageSize,
          page: this.pageNo
        })
        this.tableData = ret.records || []
        this.tableCount = ret.total || 0
        // console.log('ret', ret)
      } catch (error) {
        console.log(error)
      } finally {
        this.tableLoading = false
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
    onActionClick (name, row) {
      if (name === 'edit') {
        this.modalTitle = '编辑用户'
        this.formValid = {
          ...this.formValid,
          ...row,
          deptCode: row.deptCode ? row.deptCode.split('-').map(item => parseInt(item, 10)) : [],
          role: row.roleList.map(item => parseInt(item.roleId, 10))
        }
        this.getDeptList()
        this.getRoleList()
        this.modalVisible = true
      } else if (name === 'delete') {
        this.$Modal.confirm({
          title: '是否确定删除?',
          onOk: () => {
            this.doDelete(row.userId)
          }
        })
      }
    },
    onAdd () {
      this.modalTitle = '添加用户'
      this.getDeptList()
      this.modalVisible = true
    },
    onOpenChange (show) {
      if (show) {
        this.getRoleList()
      }
    },
    async getDeptList () {
      try {
        const dealFn = (list) => {
          return list.map(item => {
            if (item.children && item.children.length) {
              item.children = dealFn(item.children)
            }
            item.value = item.id
            item.label = item.name
            return item
          })
        }
        const ret = await GET_DEPT()
        this.deptList = dealFn(ret || [])
      } catch (error) {
        console.log(error)
      }
    },
    async getRoleList () {
      try {
        if (!(this.formValid.deptCode instanceof Array) || this.formValid.deptCode.length < 1) return
        const deptId = this.formValid.deptCode[this.formValid.deptCode.length - 1]
        const ret = await GET_DEPT_ROLE(deptId)
        this.roleList = ret || []
      } catch (error) {
        console.log(error)
      }
    },
    async doDelete (id) {
      try {
        if (this.modalLoading) return
        this.modalLoading = true
        await DELETE_USERS(id)
        this.getData()
        this.$Message.success('操作成功')
      } catch (error) {
        console.log(error)
      } finally {
        this.modalLoading = false
      }
    },
    async onSubmit () {
      try {
        const valid = await this.$refs.form.validate()
        if (!valid) return
        this.modalLoading = true
        const mixinObj = {
          deptId: this.formValid.deptCode && this.formValid.deptCode instanceof Array ? this.formValid.deptCode[this.formValid.deptCode.length - 1] : null,
          deptCode: this.formValid.deptCode && this.formValid.deptCode instanceof Array ? this.formValid.deptCode.join('-') : ''
        }
        if (this.modalTitle === '添加用户') {
          await ADD_USERS({
            ...this.formValid,
            ...mixinObj
          })
        } else if (this.modalTitle === '编辑用户') {
          await EDIT_USERS({
            ...this.formValid,
            ...mixinObj
          })
        }
        this.modalVisible = false
        this.getData()
        this.$refs.form.resetFields()
        this.$Message.success('操作成功！')
      } catch (error) {
        console.error(error)
      } finally {
        this.modalLoading = false
      }
    },
    onCancel () {
      this.$refs.form.resetFields()
      this.modalVisible = false
    }
  },
  mounted () {
    this.tableHeight = this.contentHeight - 20 - 44 - 50
    this.getData()
    // console.log('contentHeight', this.tableHeight)
  }
}
</script>
