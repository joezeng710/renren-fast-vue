import http from './httpRequest'
export default {
  product: '/product',
  post (url, data = {}, param = {}, openDefaultData = false) {
    return http({
      url: http.adornUrl(url),
      method: 'post',
      data: http.adornData(data, openDefaultData),
      params: http.adornParams(param)
    })
  },
  get (url, data = {}, openDefaultData = false) {
    return http({
      url: http.adornUrl(url),
      method: 'get',
      params: http.adornParams(data, openDefaultData)
    })
  }
}
