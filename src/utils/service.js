const { deepMerge, formatTime } = require('./util')

const g = {
  url: {
    dev: 'https://sit-cs.allcitygo.com:2844',
    pro: ''
  }['dev'],
  header: {
    'content-type': 'application/json'
  }
}

const genBody = (...bodys) => bodys.reduce(deepMerge, {})

const net = type => (url, ...args) =>
  new Promise((resolve, reject) =>
    wx.request({
      ...genBody(g, ...args, { url: g.url + url, method: type }),
      success: resolve,
      fail: reject
    })
  )

const checkLogin = () =>
  new Promise((resolve, reject) =>
    wx.checkSession({
      success: resolve,
      fail: () => {
        getApp().needCheckSession = false
        reject()
      }
    })
  )

module.exports = {
  doGet: net('GET'),
  doPost: net('POST'),
  checkLogin,
  formatTime
}
