import Taro from '@tarojs/taro'
import { API_USER_LOGIN } from '@constants/api'

const CODE_SUCCESS = 0
const CODE_AUTH_EXPIRED = 10001
//const CODE_ERROR = 10003
//10003   该用户未注册
function getStorage(key) {
  return Taro.getStorage({ key })
    .then(res => res.data)
    .catch(() => '')
}

function updateStorage(data = {}) {
  return Promise.all([
    Taro.setStorage({ key: 'token', data: data['token'] || false }),
    Taro.setStorage({ key: 'uid', data: data['uid'] || '' })
  ])
}

/**
 * 简易封装网络请求
 * // NOTE 需要注意 RN 不支持 *StorageSync，此处用 async/await 解决
 * @param {*} options
 */
export default async function fetch(options) {
  const {
    url,
    payload,
    method = 'GET',
    showToast = true,
    autoLogin = true
  } = options
  const token = await getStorage('token')
  const header = token ? { Authorization: 'Bearer ' + token } : {}
  if (method === 'POST') {
    header['content-type'] = 'application/json'
  }

  return Taro.request({
    url,
    method,
    data: payload,
    header
  })
    .then(async res => {
      console.log(res.data)
      const { respCode, data } = res.data
      /**
       * {"respCode":0,"respDesc":"SUCCESS","data":{"token":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNTUzNjg3MDA5LCJpYXQiOjE1NTM2Nzk4MDl9.DDflYYIHtBj8b7MAmKd8Zfs2sk07cMlKnImVAB8bR6VIYDMGFGKtGIKoV0Eo0O42ed6lZ_YFd8YSacTm_rP65g"},"suc":true}
       *
       */
      if (respCode !== CODE_SUCCESS) {
        if (respCode === CODE_AUTH_EXPIRED) {
          await updateStorage({})
        }
        return Promise.reject(res.data)
      }

      if (url === API_USER_LOGIN) {
        await updateStorage(data)
      }

      return data
    })
    .catch(err => {
      const defaultMsg =
        err.respCode === CODE_AUTH_EXPIRED
          ? '登录失效'
          : err.respDesc || '请求异常'
      if (showToast) {
        Taro.showToast({
          title: (err && err.errorMsg) || defaultMsg,
          icon: 'none'
        })
      }

      if (err.respCode === CODE_AUTH_EXPIRED && autoLogin) {
        Taro.navigateTo({
          url: '/pages/login/index'
        })
      }

      return Promise.reject({ message: defaultMsg, ...err })
    })
}
