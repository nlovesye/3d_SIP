<style lang="less">
  .partment{
    height: 100%;
    // background-color: #2C2B29;
    padding: 10px;

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
  <div class="partment">
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
        <FormItem label="父级节点" v-if="modalTitle === '添加部门'">
          <Input v-model="parentItem.name" disabled />
        </FormItem>
        <FormItem label="部门名称" prop="name">
          <Input v-model="formValid.name" placeholder="输入部门名称" />
        </FormItem>
        <FormItem label="排序" prop="orderNum">
          <InputNumber
            :max="99"
            :min="0"
            v-model="formValid.orderNum"
          />
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="default" @click="onCancel">取消</Button>
        <Button type="primary" @click="onSubmit" :loading="modalLoading">提交</Button>
      </template>
    </Modal>
    <Card class="card_box">
      <Tree
        :data="treeData"
        :render="renderNode"
      ></Tree>
    </Card>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { GET_DEPT, DEPT_ADD, DEPT_EDIT, DEPT_DELETE } from '@api/user'

export default {
  authCode: 'user_partment',
  data () {
    return {
      treeData: [
        {
          name: '所有部门',
          expand: true,
          render: this.renderRoot,
          code: '_root',
          children: []
        }
      ],
      parentItem: {},
      parentId: 0,
      currentId: null,
      modalVisible: false,
      modalTitle: '添加部门',
      modalLoading: false,
      formValid: {
        name: '',
        orderNum: 0
      },
      formRules: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'change' }
        ],
        orderNum: [
          {
            type: 'number',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    renderRoot (h, { root, node, data }) {
      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%'
        }
      }, [
        h('span', [
          h('Icon', {
            props: {
              type: 'ios-folder-outline'
            },
            style: {
              marginRight: '8px'
            }
          }),
          h('span', data.name)
        ]),
        h('span', {
          style: {
            display: 'inline-block',
            float: 'right',
            marginRight: '32px'
          }
        }, [
          h('Button', {
            directives: [
              {
                name: 'auth',
                value: 'user_partment_add'
              }
            ],
            props: {
              icon: 'md-add',
              type: 'primary'
            },
            style: {
              width: '64px'
            },
            on: {
              click: () => {
                this.onAdd(data)
              }
            }
          })
        ])
      ])
    },
    renderNode (h, { root, node, data }) {
      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%'
        }
      }, [
        h('span', [
          h('Icon', {
            props: {
              type: 'md-paper-outline'
            },
            style: {
              marginRight: '8px'
            }
          }),
          h('span', data.name)
        ]),
        h('span', {
          style: {
            display: 'inline-block',
            float: 'right',
            marginRight: '32px'
          }
        }, [
          h('Button', {
            directives: [
              {
                name: 'auth',
                value: 'user_partment_edit'
              }
            ],
            props: {
              type: 'default',
              icon: 'md-create'
            },
            style: {
              marginRight: '8px'
            },
            on: {
              click: () => {
                this.onEdit(data)
              }
            }
          }),
          h('Button', {
            directives: [
              {
                name: 'auth',
                value: 'user_partment_add'
              }
            ],
            props: {
              type: 'default',
              icon: 'md-add'
            },
            style: {
              marginRight: '8px'
            },
            on: {
              click: () => {
                this.onAdd(data)
              }
            }
          }),
          h('Button', {
            directives: [
              {
                name: 'auth',
                value: 'user_partment_delete'
              }
            ],
            props: {
              type: 'default',
              icon: 'md-remove'
            },
            on: {
              click: () => {
                this.onDelete(data)
              }
            }
          })
        ])
      ])
    },
    onAdd (data) {
      this.modalTitle = '添加部门'
      this.parentItem = { ...data }
      this.parentId = data.id
      // this.parentId = data.code === '_root' ? -1 : data.id
      this.modalVisible = true
    },
    onEdit (data) {
      this.modalTitle = '编辑部门'
      this.parentItem = {}
      this.parentId = data.parentId
      this.currentId = data.id
      this.formValid = {
        ...this.formValid,
        name: data.name,
        orderNum: data.orderNum
      }
      // console.log('data', data)
      this.modalVisible = true
    },
    onDelete (data) {
      this.$Modal.confirm({
        title: '是否确定删除?',
        onOk: () => {
          this.doDelete(data.id)
        }
      })
    },
    async doDelete (id) {
      if (this.modalLoading) return
      try {
        this.modalLoading = true
        await DEPT_DELETE(id)
        this.getData()
        this.$Message.success('操作成功！')
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
        let reqData = {}
        this.modalLoading = true
        if (this.modalTitle === '添加部门') {
          reqData = {
            ...this.formValid,
            parentId: this.parentId || 0
          }
          await DEPT_ADD(reqData)
        } else if (this.modalTitle === '编辑部门') {
          reqData = {
            ...this.formValid,
            parentId: this.parentId || 0,
            deptId: this.currentId
          }
          await DEPT_EDIT(reqData)
        }
        // console.log('reqData', reqData)
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
    },
    async getData () {
      try {
        const ret = await GET_DEPT()
        this.treeData[0].children = [...ret]
        this.treeData = [...this.treeData]
      } catch (error) {
        console.log(error)
      }
    }
  },
  mounted () {
    this.getData()
  }
}
</script>
