import axios from '@/libs/api.request'

const prevfix = '/api'

export const TOOLS = (params: any) => {
  const deviceId = params.deviceId
  delete params.deviceId
  return axios.request({
    url: `${prevfix}/project/debug/run/${deviceId}`,
    data: params,
    method: 'post'
  })
}
