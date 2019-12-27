import Index from '@/components/index/Index.vue'

export default [
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@views/login/Login.vue')
  },
  {
    path: '/',
    name: 'index',
    component: Index,
    redirect: '/home',
    meta: {
      show: true,
      title: '首页'
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          show: true,
          title: '首页'
        },
        component: () => import('@views/Home.vue')
      }
    ]
  },
  {
    path: '/user',
    // name: 'user',
    component: Index,
    meta: {
      show: true,
      title: '用户管理',
      power: {
        code: 'user',
        name: '用户管理',
        type: 1,
        children: [
          {
            code: 'user_index',
            type: 1,
            name: '用户管理',
            children: [
              {
                code: 'user_index_add',
                name: '新建',
                type: 2
              },
              {
                code: 'user_index_edit',
                name: '编辑',
                type: 2
              },
              {
                code: 'user_index_delete',
                name: '删除',
                type: 2
              }
            ]
          },
          {
            code: 'user_partment',
            type: 1,
            name: '部门管理',
            children: [
              {
                code: 'user_partment_add',
                name: '添加部门',
                type: 2
              },
              {
                code: 'user_partment_edit',
                name: '编辑部门',
                type: 2
              },
              {
                code: 'user_partment_delete',
                name: '删除部门',
                type: 2
              }
            ]
          },
          {
            code: 'user_role',
            type: 1,
            name: '角色权限管理',
            children: [
              {
                code: 'user_role_add',
                name: '新建角色',
                type: 2
              },
              {
                code: 'user_role_edit',
                name: '编辑角色',
                type: 2
              },
              {
                code: 'user_role_delete',
                name: '删除角色',
                type: 2
              },
              {
                code: 'user_role_power',
                name: '角色权限分配',
                type: 2
              }
            ]
          },
          {
            code: 'user_power',
            name: '权限注册',
            type: 1,
            children: [
              {
                code: 'user_power_add',
                name: '添加权限',
                type: 2
              },
              {
                code: 'user_power_delete',
                name: '删除权限',
                type: 2
              }
            ]
          }
        ]
      }
    },
    children: [
      {
        path: '',
        name: 'user_index',
        meta: {
          show: true,
          title: '用户管理'
        },
        components: {
          sider: () => import('@views/users/SiderMenu.vue'),
          default: () => import('@views/users/Users.vue')
        }
      },
      {
        path: 'user_partment',
        name: 'user_partment',
        meta: {
          show: true,
          title: '部门管理'
        },
        components: {
          sider: () => import('@views/users/SiderMenu.vue'),
          default: () => import('@views/users/Partment.vue')
        }
      },
      {
        path: 'user_role',
        name: 'user_role',
        meta: {
          show: true,
          title: '角色权限管理'
        },
        components: {
          sider: () => import('@views/users/SiderMenu.vue'),
          default: () => import('@views/users/Role.vue')
        }
      },
      {
        path: 'user_power',
        name: 'user_power',
        meta: {
          show: true,
          title: '权限注册'
        },
        components: {
          sider: () => import('@views/users/SiderMenu.vue'),
          default: () => import('@views/users/Power.vue')
        }
      }
    ]
  },
  {
    path: '/project',
    // name: 'project',
    component: Index,
    meta: {
      show: true,
      title: '工程管理',
      power: {
        code: 'project',
        name: '工程管理',
        type: 1,
        children: [
          {
            code: 'project_index',
            name: '工程管理',
            type: 1,
            children: [
              {
                code: 'project_collect',
                type: 2,
                name: '数据采集'
              }
            ]
          }
        ]
      }
    },
    children: [
      {
        path: '',
        name: 'project_index',
        meta: {
          show: true,
          title: '工程管理'
        },
        component: () => import('@views/project/Project.vue')
      }
    ]
  },
  {
    path: '/tools',
    component: Index,
    meta: {
      show: true,
      title: '调试工具',
      power: {
        show: true,
        code: 'tools',
        name: '调试工具',
        type: 1,
        children: [
          {
            code: 'tools_sendcode',
            type: 2,
            name: '发送指令'
          }
        ]
      }
    },
    children: [
      {
        path: '/tools',
        name: 'tools',
        meta: {
          show: true,
          title: '调试工具'
        },
        component: () => import('@views/tools/index.vue')
      }
    ]
  },
  {
    path: '/developing',
    // name: 'statistics',
    component: Index,
    meta: {
      show: false,
      title: '开发中...'
    },
    children: [
      {
        path: '',
        name: 'developing',
        meta: {
          show: true,
          title: '开发中...'
        },
        component: () => import('@views/error-page/Developing.vue')
      }
    ]
  },
  {
    path: '/_401',
    name: 'error_401',
    component: () => import('@views/error-page/401.vue')
  },
  {
    path: '*',
    name: 'error_404',
    component: () => import('@views/error-page/404.vue')
  }
]
