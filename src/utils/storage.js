import Taro from '@tarojs/taro'

export const getStorage = function(key) {
  return Taro.getStorage({ key })
    .then(res => res.data)
    .catch(() => '')
}

export const updateStorage = function(data = {}) {
  return Taro.setStorage(data)
    .then(res => res.data)
    .catch(() => '')
}
