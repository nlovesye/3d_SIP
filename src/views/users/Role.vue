<style lang="less">
  .role{
    height: 100%;
    // background-color: #2C2B29;
    padding: 0 10px;

    .card_box{
      height: 100%;
      overflow-y: auto;
      width: 500px;
      max-width: 500px;

      .ivu-card-body{
        padding: 5px 16px 5px 16px;
      }
    }
  }
</style>

<template>
  <div class="role">
    <Modal
      v-model="modalVisible"
      :title="modalTitle"
      fullscreen
      :z-index="2000"
      :transfer="false"
      :mask-closable="false"
      @on-cancel="onCancel"
    >
      <Card class="card_box" v-if="modalTitle === '权限分配'">
        <Tree
          ref="tree"
          :data="treeData"
          :show-checkbox="true"
        ></Tree>
      </Card>
      <Form
        ref="form"
        :model="formValid"
        :rules="formRules"
        :label-width="80"
        inline
        v-else
      >
        <FormItem label="角色名称" prop="roleName">
          <Input v-model="formValid.roleName" placeholder="" />
        </FormItem>
        <FormItem label="角色标识" prop="roleCode">
          <Input v-model="formValid.roleCode" placeholder="" :disabled="modalTitle === '编辑角色'" />
        </FormItem>
        <FormItem label="部门" prop="roleDeptCode">
          <Cascader
            style="margin-top: 5px;"
            :data="deptList"
            v-model="formValid.roleDeptCode"
            placeholder=""
            :render-format="label => label.join('-')"
            @on-change="onDeptChange"
            ></Cascader>
        </FormItem>
        <FormItem label="角色描述" prop="roleDesc">
          <Input v-model="formValid.roleDesc" placeholder="" />
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
      <Col span="12">角色权限管理</Col>
      <Col span="4">
        <Input v-model="keywords" search placeholder="用户名称" enter-button @on-search="getData"></Input>
      </Col>
    </Row>
    <div class="table_header_title">
      <Button type="primary" @click="onAdd" v-auth="'user_role_add'">新建</Button>
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
        :transfer='true'
        @on-click="name => onActionClick(name, row)"
        v-auth="['user_role_add', 'user_role_edit', 'user_role_delete', 'user_role_power']"
      >
          <Button icon="md-create" type="default">
            <!-- <Icon type="md-create" /> -->
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="edit" v-auth="'user_role_edit'">编辑</DropdownItem>
            <DropdownItem name="delete" v-auth="'user_role_delete'">删除</DropdownItem>
            <DropdownItem name="power" v-auth="'user_role_power'">权限分配</DropdownItem>
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
import { GET_ROLE, ROLE_ADD, ROLE_EDIT, ROLE_DELETE, GET_DEPT, GET_ALL_POWERS, ROLE_SET_AUTH, GET_ROLE_POWERS } from '@api/user'

export default {
  authCode: 'user_role',
  data () {
    return {
      tableHeader: [
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
          title: '角色名称',
          key: 'roleName',
          tooltip: true,
          resizable: true,
          width: 140,
          ellipsis: true
        },
        {
          title: '所属部门',
          key: 'deptName',
          tooltip: true,
          resizable: true,
          width: 140,
          ellipsis: true
        },
        {
          title: '备注',
          key: 'roleDesc',
          tooltip: true,
          resizable: true,
          ellipsis: true
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
        roleId: null,
        roleName: '',
        roleCode: '',
        roleDeptId: null,
        roleDeptCode: [],
        deptName: '',
        roleDesc: ''
      },
      formRules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'change' }
        ],
        roleCode: [
          { required: true, message: '角色标识不能为空', trigger: 'change' }
        ],
        roleDeptCode: [
          { type: 'array', message: '部门不能为空', trigger: 'change', required: true }
        ],
        roleDesc: []
      },
      deptList: [], // 部门列表
      treeData: [], // 所有权限
      roleId: null, // 当前分配角色id
      roleCode: '', // 当前分配角色code
      checkedData: [] // 当前分配角色已有权限
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
        const ret = await GET_ROLE({
          limit: this.pageSize,
          page: this.pageNo,
          keywords: this.keywords
        })
        this.tableData = ret.records || []
        this.tableCount = ret.total
      } catch (error) {
        console.error(error)
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
      // console.log('action', name, row)
      if (name === 'delete') {
        if (this.modalLoading) return
        this.$Modal.confirm({
          title: '是否确定删除?',
          onOk: () => {
            this.doDelete(row.roleId)
          }
        })
      } else if (name === 'edit') {
        this.modalTitle = '编辑角色'
        this.formValid = {
          ...this.formValid,
          roleCode: row.roleCode,
          roleDeptId: row.roleDeptId,
          roleDeptCode: row.roleDeptCode ? row.roleDeptCode.split('-').map(str => parseInt(str, 10)) : [],
          deptName: row.deptName,
          roleDesc: row.roleDesc,
          roleId: row.roleId,
          roleName: row.roleName
        }
        // console.log('this.', row, this.formValid)
        this.modalVisible = true
        this.getDeptList()
      } else if (name === 'power') {
        this.modalTitle = '权限分配'
        this.roleId = row.roleId
        this.roleCode = row.roleCode
        this.getTreeData()
        this.modalVisible = true
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
    async getTreeData () {
      try {
        const dealFn = (list, checkedArr) => list.map(item => {
          if (item.children && item.children.length) {
            item.children = dealFn(item.children, checkedArr)
          }
          item.selected = false
          item.title = item.name
          item.checked = checkedArr.some(ck => ck === item.id)
          return item
        })
        const filterFn = (list, treeList) => list.filter(checkedId => {
          let noParentId = true
          const forFn = (arr) => {
            for (let i = 0; i < arr.length; i++) {
              const c = arr[i]
              if (c.parentId === checkedId) {
                noParentId = false
                break
              }
              if (c.children && c.children.length) {
                noParentId = forFn(c.children)
              }
            }
            return noParentId
          }
          forFn(treeList)
          return noParentId
        })
        const [treeRet, roleRet] = await Promise.all([GET_ALL_POWERS(), GET_ROLE_POWERS(this.roleCode)])
        this.checkedData = filterFn(roleRet || [], treeRet || [])
        // console.log('d', treeRet, roleRet, this.checkedData, filterFn(roleRet, treeRet))
        this.treeData = dealFn(treeRet || [], this.checkedData)
      } catch (error) {
        console.error(error)
      }
    },
    onDeptChange (ids, selectedData) {
      // console.log('onDeptChange', ids, selectedData)
      this.formValid = {
        ...this.formValid,
        deptName: selectedData.map(item => item.label).join('-')
      }
    },
    onAdd () {
      this.modalTitle = '添加角色'
      this.modalVisible = true
      this.getDeptList()
    },
    async doDelete (id) {
      try {
        this.modalLoading = true
        await ROLE_DELETE(id)
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
        if (this.modalTitle === '权限分配') {
          // console.log('d', this.$refs.tree.getCheckedAndIndeterminateNodes(), this.$refs.tree.getCheckedNodes())
          this.modalLoading = true
          const menuIds = this.$refs.tree.getCheckedAndIndeterminateNodes().map(item => item.id)
          await ROLE_SET_AUTH({
            menuIds,
            roleId: this.roleId
          })
        } else {
          const valid = await this.$refs.form.validate()
          if (!valid) return
          let reqData = {}
          this.modalLoading = true
          const mixinObj = {
            roleDeptId: this.formValid.roleDeptCode && this.formValid.roleDeptCode instanceof Array ? this.formValid.roleDeptCode[this.formValid.roleDeptCode.length - 1] : null,
            roleDeptCode: this.formValid.roleDeptCode && this.formValid.roleDeptCode instanceof Array ? this.formValid.roleDeptCode.join('-') : ''
          }
          if (this.modalTitle === '添加角色') {
            reqData = {
              ...this.formValid,
              ...mixinObj
            }
            await ROLE_ADD(reqData)
          } else if (this.modalTitle === '编辑角色') {
            reqData = {
              ...this.formValid,
              ...mixinObj
            }
            await ROLE_EDIT(reqData)
          }
          // console.log('reqData', reqData)
        }
        this.getData()
        this.onCancel()
        this.$Message.success('操作成功！')
      } catch (error) {
        console.error(error)
      } finally {
        this.modalLoading = false
      }
    },
    onCancel () {
      if (this.modalTitle !== '权限分配') {
        this.$refs.form.resetFields()
      }
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
