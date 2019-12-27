import axios from '@/libs/api.request'

const prevfix = '/api'

export const LOGIN = (params: any) => {
  // const data = params
  return axios.request({
    url: `${prevfix}/auth/oauth/token`,
    params,
    method: 'post'
  })
}

// 获取当前用户权限
export const GET_USER_POWERS = () => {
  return axios.request({
    url: `${prevfix}/admin/menu/userMenu`,
    method: 'get'
  })
}

// 获取所有权限集合
export const GET_ALL_POWERS = () => {
  return axios.request({
    url: `${prevfix}/admin/menu/allTree`,
    method: 'get'
  })
}

// 注册（添加）权限
export const ADD_POWERS = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/menu`,
    method: 'post',
    data
  })
}

// // Edit 权限
// export const EDIT_POWERS = (data: any) => {
//   return axios.request({
//     url: `${prevfix}/admin/menu`,
//     method: 'put',
//     data
//   })
// }

// delete 权限
export const DELETE_POWERS = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/menu/${data.id}`,
    method: 'delete',
    data
  })
}

// 获取部门树形菜单集合
export const GET_DEPT = () => {
  return axios.request({
    url: `${prevfix}/admin/dept/tree`,
    method: 'get'
  })
}

// 添加部门
export const DEPT_ADD = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/dept`,
    method: 'post',
    data
  })
}

// 编辑部门
export const DEPT_EDIT = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/dept`,
    method: 'put',
    data
  })
}

// 删除部门
export const DEPT_DELETE = (id: number) => {
  return axios.request({
    url: `${prevfix}/admin/dept/${id}`,
    method: 'delete'
  })
}

// 获取角色列表
export const GET_ROLE = (params: any) => {
  return axios.request({
    url: `${prevfix}/admin/role/rolePage`,
    method: 'get',
    params
  })
}

// 根据部门获取角色列表
export const GET_DEPT_ROLE = (deptId: number | string) => {
  return axios.request({
    url: `${prevfix}/admin/role/roleList/${deptId}`,
    method: 'get'
  })
}

// 添加角色
export const ROLE_ADD = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/role`,
    method: 'post',
    data
  })
}

// 编辑角色
export const ROLE_EDIT = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/role`,
    method: 'put',
    data
  })
}

// 删除角色
export const ROLE_DELETE = (id: number) => {
  return axios.request({
    url: `${prevfix}/admin/role/${id}`,
    method: 'delete'
  })
}

// 更新角色权限
export const ROLE_SET_AUTH = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/role/roleMenu`,
    method: 'put',
    data
  })
}

// 获取对应角色权限
export const GET_ROLE_POWERS = (roleCode: string) => {
  return axios.request({
    url: `${prevfix}/admin/menu/roleTree/${roleCode}`,
    method: 'get'
  })
}

// 获取用户列表
export const GET_USERS = (params: any) => {
  return axios.request({
    url: `${prevfix}/admin/user/userPage`,
    method: 'get',
    params
  })
}

// 添加用户
export const ADD_USERS = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/user`,
    method: 'post',
    data
  })
}

// 更新用户信息
export const EDIT_USERS = (data: any) => {
  return axios.request({
    url: `${prevfix}/admin/user`,
    method: 'put',
    data
  })
}

// 删除用户
export const DELETE_USERS = (userId: number | string) => {
  return axios.request({
    url: `${prevfix}/admin/user/${userId}`,
    method: 'delete'
  })
}
