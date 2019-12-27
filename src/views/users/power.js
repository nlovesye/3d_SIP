import { routes } from '@/router'
import { getPowers, getPowerChildren } from '@/libs/util'
import {
  GET_ALL_POWERS,
  ADD_POWERS,
  DELETE_POWERS
} from '@api/user'
import {
  Message
} from 'view-design'

export default {
  authCode: 'user_power',
  data () {
    return {
      localPowers: getPowers(routes),
      localData: [
        {
          name: '本地权限表',
          expand: true,
          code: '_localroot',
          children: getPowers(routes)
        }
      ],
      treeData: [
        {
          name: '系统权限表',
          expand: true,
          render: this.renderRoot,
          code: '_root',
          children: []
        }
      ],
      currentClickItem: {}, // 当前点击权限项
      parentId: -1,
      modalVisible: false,
      formValid: {
        name: '',
        code: '',
        sort: 0,
        type: ''
      },
      formRules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'change' }
        ],
        code: [
          { required: true, message: '代码值不能为空', trigger: 'change' }
        ],
        sort: [
          {
            type: 'number',
            trigger: 'change'
          }
        ]
      },
      submitLoading: false,
      currentPowerChildren: [] // 当前权限子列表
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
                value: 'user_power_add'
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
        }, parseInt(data.type, 10) === 1 ? [
          // h('Button', {
          //   props: {
          //     type: 'default',
          //     icon: 'md-create'
          //   },
          //   style: {
          //     marginRight: '8px'
          //   },
          //   on: {
          //     click: () => {
          //       this.onEdit(data)
          //     }
          //   }
          // }),
          h('Button', {
            directives: [
              {
                name: 'auth',
                value: 'user_power_add'
                // expression: '1 + 1',
                // arg: 'foo',
                // modifiers: {
                //     bar: true
                // }
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
                value: 'user_power_delete'
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
        ] : [
          h('Button', {
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
    renderNodeLocal (h, { root, node, data }) {
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
        ])
      ])
    },
    onAdd (data) {
      this.currentClickItem = { ...data }
      this.parentId = data.code === '_root' ? -1 : data.id
      this.modalVisible = true
    },
    async onDelete (data) {
      try {
        await DELETE_POWERS(data)
        this.getData()
        Message.success('操作成功！')
      } catch (error) {
        console.error(error)
      }
    },
    // onEdit (data) {
    //   this.currentClickItem = { ...data }
    //   this.formValid = {
    //     ...data
    //   }
    //   // console.log('data', data)
    //   this.modalVisible = true
    // },
    onSelectOpenChange (open) {
      if (open) {
        const filterFn = function (list, allTree) {
          return list.filter(item => {
            let noExist = true
            const forFn = (arr) => {
              for (let i = 0; i < arr.length; i++) {
                const c = arr[i]
                if (c.children && c.children.length) {
                  noExist = forFn(c.children)
                }
                if (c.code === item.code) {
                  noExist = false
                  break
                }
              }
              return noExist
            }
            forFn(allTree)
            return noExist
          })
        }
        const list = getPowerChildren(this.localPowers, this.currentClickItem.code)
        const existList = getPowerChildren(this.treeData[0].children, this.currentClickItem.code)
        this.currentPowerChildren = list.filter(item => !existList.some(c => c.code === item.code))
        // console.log('ret', this.currentPowerChildren)
      } else {
        // this.currentPowerChildren = []
      }
    },
    onSelectChange (code) {
      const target = this.currentPowerChildren.find(item => item.code === code) || {}
      // console.log('code', code, target)
      this.formValid = {
        ...this.formValid,
        code,
        name: target.name,
        type: target.type || 1
      }
    },
    async onSubmit () {
      try {
        const valid = await this.$refs.form.validate()
        if (!valid) return
        this.submitLoading = true
        const reqData = {
          parentId: this.parentId,
          ...this.formValid,
          permission: this.formValid.code
        }
        // console.log('reqData', reqData)
        await ADD_POWERS(reqData)
        this.modalVisible = false
        this.$refs.form.resetFields()
        Message.success('操作成功！')
        this.getData()
      } catch (error) {
        console.error(error)
      } finally {
        this.submitLoading = false
      }
    },
    onCancel () {
      this.$refs.form.resetFields()
      this.modalVisible = false
    },
    async getData () {
      try {
        const dealFn = (list) => list.map(item => {
          item.expand = true
          if (item.children && item.children.length > 0) {
            item.children = dealFn(item.children)
          }
          return item
        })
        const ret = await GET_ALL_POWERS()
        this.treeData[0].children = dealFn([...ret])
        this.treeData = [...this.treeData]
      } catch (error) {
        console.error(error)
      }
    }
  },
  mounted () {
    // console.log('routes', getPowers(routes))
    this.getData()
  }
}
