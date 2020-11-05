const { KEYUTIL, KJUR, b64tohex } = require('./jsrsasign-all-min')
const { doGet, doPost, checkLogin, formatTime } = require('./service')
const { createQR, getTimestamp } = require('./genQrcode')

const doNet = (url, request = doPost, needCheck = true, needToken = true) => (
  data = {},
  opts = {}
) =>
  new Promise((resolve, reject) => {
    if (needToken) {
      try {
        let { phone, token } = wx.getStorageSync('uinfo') || {}
        data = { phone, token, ...data }
      } catch (e) {
        reject()
      }
    }
    let { cityId, systemInfo } = getApp()

    data = {
      cityId,
      systemInfo,
      ...data
    }

    const login = doNet('/wx/login', doGet, false, false)
    let goLogin = () =>
      wx.login({
        success(res) {
          debugger
          login({
            js_code: res.code
          }).then(({ data }) => {
            if (data.code != 200) {
              wx.hideLoading({
                success() {
                  wx.showToast({
                    title: data.message,
                    icon: 'none',
                    duration: 1000
                  })
                }
              })
              return false
            }
            wx.setStorageSync('uinfo', {
              phone: '17764592651',
              // userId: data.data.userId,
              token: data.token
            })
            if (getCurrentPages().length != 0) {
              //刷新当前页面的数据
              getCurrentPages()[getCurrentPages().length - 1].onLoad()
            }
          })
        },
        fail() {}
      })

    let succ = res => {
      let { code, token } = res.data
      if (+code === 403) {
        getApp().needCheckSession = false
        goLogin()
        return false
      }

      if (token) {
        wx.setStorageSync('uinfo', {
          ...(wx.getStorageSync('uinfo') || {}),
          token
        })
      }
      resolve(res)
    }

    needCheck
      ? checkLogin().then(
          () => request(url, { data }, opts).then(succ, reject),
          goLogin
        )
      : request(url, { data }, opts).then(succ, reject)
  })

/**
 * 生成公钥和私钥及公钥md5值的后面4字节
 */
const genSecretKeys = () => {
  const { prvKeyObj, pubKeyObj } = KEYUTIL.generateKeypair('RSA', 2048)
  const prvKey = KEYUTIL.getPEM(prvKeyObj, 'PKCS8PRV')
  let pubKey = KEYUTIL.getPEM(pubKeyObj)
  let m = KJUR.crypto.Util.md5(pubKey)
  m = m.substring(m.length - 4)

  wx.setStorageSync('sKeys', { prvKey, pubKey, m })

  return new Promise((resolve, reject) => {
    resolve({ pubKey, prvKey, m })
  })
}

const decrypt = str =>
  KJUR.crypto.Cipher.decrypt(
    b64tohex(str),
    KEYUTIL.getKey(wx.getStorageSync('sKeys').prvKey),
    'RSA'
  )

const getCardNo = () =>
  getApp().cardinfo ? getApp().cardinfo.cardNO || '' : ''

const goHome = () => wx.reLaunch({ url: '/pages/index/index' })

const needFetch = (item, otherItem, count, loadmore, nomore) => {
  let t = restH => {
    wx.createSelectorQuery()
      .select(item)
      .fields(
        {
          size: true
        },
        function({ height }) {
          if (restH - 50 > count * height) {
            loadmore()
          } else {
            nomore && nomore()
          }
        }
      )
      .exec()
  }

  let sysInfo = wx.getSystemInfoSync()
  if (otherItem) {
    wx.createSelectorQuery()
      .select(otherItem)
      .fields(
        {
          size: true
        },
        function({ height }) {
          t(sysInfo.windowHeight - height)
        }
      )
      .exec()
  } else {
    t(sysInfo.windowHeight)
  }
}

module.exports = {
  formatTime,
  getCardNo,
  goHome,
  needFetch,
  decrypt,
  createQR,
  getTimestamp,
  checkLogin,
  // syncToken: (data = {}, opts) => new Promise((resolve, reject) => genSecretKeys().then(({pubKey, m}) => doNet('/mp/sync', doPost)({...data, publicKey: pubKey, keyId: m}, opts).then(resolve, reject))),
  getMsgCode: doNet('/mp/sc', doPost, false, false),
  Login: doNet('/wx/login', doGet, false, false),
  getCardInfo: doNet('/wx/card', doGet),
  receiveCard: doNet('/wx/apply/card'),
  getQrcode: doNet('/mp/issueQrcode'),
  refundCard: doNet('/wx/revoke/card'),
  getEbusLines: doNet('/wx/lines', doPost, true, false),
  getEbusRecords: doNet('/wx/travel/log'),
  chargeCard: doNet('/wx/charge/card')
}
