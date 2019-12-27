import axios from '@/libs/api.request'

const prevfix = '/api'

/**
 * @description 获取静态资源文件
 */
export const GET_STATIC = (url: string, opt: object = {}) => {
  return axios.request({
    url: `${prevfix}/datagram/static/${url}`,
    method: 'get',
    ...opt
  })
}

/**
 * @description 获取分组
 */
export const GET_GROUP = () => {
  return axios.request({
    url: `${prevfix}/project/group`,
    method: 'get'
  })
}

/**
 * @description 新建分组
 * @param params
 */
export const ADD_GROUP = (params: any) => {
  return axios.request({
    url: `${prevfix}/project/group`,
    method: 'post',
    params
  })
}

/**
 * @description 修改分组
 * @param params
 */
export const EDIT_GROUP = (data: any) => {
  return axios.request({
    url: `${prevfix}/project/group`,
    method: 'put',
    data
  })
}

/**
 * @description 删除分组
 * @param groupId 分组ID
 */
export const DELETE_GROUP = (groupId: string) => {
  return axios.request({
    url: `${prevfix}/project/group/${groupId}`,
    method: 'delete'
  })
}

/**
 * @description 根据分组id获取工程
 * @param groupId 分组ID
 */
export const GET_PROJECT_BYGROUP = (groupId: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering`,
    method: 'get',
    params: { groupId }
  })
}

/**
 * @description 获取工程信息
 * @param id
 */
export const GET_PROJECT = (id: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/${id}`,
    method: 'get'
  })
}

/**
 * @description 获取工程设备
 * @param id
 */
export const GET_DEVICE_INFO = (id: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/device/${id}`,
    method: 'get'
  })
}

/**
 * @description 新建工程
 * @param data
 */
export const ADD_PROJECT = (data: any) => {
  return axios.request({
    url: `${prevfix}/project/engineering`,
    method: 'post',
    data
  })
}

/**
 * @description 修改工程
 * @param params
 */
export const EDIT_PROJECT = (data: any) => {
  return axios.request({
    url: `${prevfix}/project/engineering`,
    method: 'put',
    data
  })
}

/**
 * @description 删除工程
 * @param id ID
 */
export const DELETE_PROJECT = (id: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/${id}`,
    method: 'delete'
  })
}

/**
 * @description 启动工程
 * @param projectId
 */
export const START_PROJECT = (projectId: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/start/${projectId}`,
    method: 'get'
  })
}

/**
 * @description 停止工程
 * @param projectId
 */
export const STOP_PROJECT = (projectId: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/stop/${projectId}`,
    method: 'get'
  })
}

/**
 * @description 根据工程id获取设备列表
 * @param projectId 工程ID
 */
export const GET_PROJECT_DEVICE = (projectId: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/device`,
    method: 'get',
    params: { projectId }
  })
}

/**
 * @description 添加工程设备
 * @param data
 */
export const ADD_PROJECT_DEVICE = (data: any) => {
  return axios.request({
    url: `${prevfix}/project/engineering/device`,
    method: 'post',
    data
  })
}

/**
 * @description 修改工程设备
 * @param params
 */
export const EDIT_PROJECT_DEVICE = (data: any) => {
  return axios.request({
    url: `${prevfix}/project/engineering/device`,
    method: 'put',
    data
  })
}

/**
 * @description 删除工程设备
 * @param id 设备ID
 */
export const DELETE_PROJECT_DEVICE = (id: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/device/${id}`,
    method: 'delete'
  })
}

/**
 * @description 获取设备列表
 */
export const GET_DEVICE_LIST = () => {
  return axios.request({
    url: `${prevfix}/project/device`,
    method: 'get'
  })
}

/**
 * @description 数据采集
 * @param projectId 工程ID
 */
export const GATHER_DATA = (projectId: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/gather/${projectId}`,
    method: 'get'
  })
}

/**
 * @description 复位
 * @param projectId 工程ID
 */
export const RESET_DATA = (projectId: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/gather/reset/${projectId}`,
    method: 'get'
  })
}

/**
 * @description 获取标定
 */
export const GET_CALIBRATION = (params: any) => {
  return axios.request({
    url: `${prevfix}/project/engineering/calibration`,
    method: 'get',
    params
  })
}

/**
 * @description 添加标定
 */
export const ADD_CALIBRATION = (data: any) => {
  return axios.request({
    url: `${prevfix}/project/engineering/calibration`,
    method: 'post',
    data
  })
}

// /**
//  * @description 编辑标定
//  */
// export const EDIT_CALIBRATION = (data: any) => {
//   return axios.request({
//     url: `${prevfix}/project/engineering/calibration`,
//     method: 'put',
//     data
//   })
// }

/**
 * @description 删除标定
 */
export const DELETE_CALIBRATION = (ids: string[]) => {
  const urlAppend = ids.join(',')
  // console.log('url', urlAppend)
  return axios.request({
    url: `${prevfix}/project/engineering/calibration/${urlAppend}`,
    method: 'delete'
  })
}

/**
 * @description 数据拟合
 */
export const CALIBRATION_DATA = (id: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/merge/${id}`,
    method: 'get'
  })
}

/**
 * @description 建模
 */
export const MODELING_GENERATE = (projectId: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/modeling/${projectId}`,
    method: 'get'
  })
}

/**
 * @description 计算
 */
export const GET_CALCULATE = (projectId: string) => {
  return axios.request({
    url: `${prevfix}/project/engineering/calculate/${projectId}`,
    method: 'get'
  })
}

/**
 * @description 去噪
 */
export const PROJECT_DENOISE = (projectId: string, count: number) => {
  return axios.request({
    url: `${prevfix}/project/engineering/denoise/${projectId}/${count}`,
    method: 'get'
  })
}

/**
 * @description 设置工程周期
 */
export const PROJECT_SET_PERIOD = (projectId: string, params: any) => {
  return axios.request({
    url: `${prevfix}/project/engineering/period/${projectId}`,
    method: 'put',
    params
  })
}

/**
 * @description 获取工程历史数据
 */
export const GET_PROJECT_HISTORY = (params: any) => {
  return axios.request({
    url: `${prevfix}/project/engineering/history/data`,
    method: 'get',
    params: { ...params }
  })
}
