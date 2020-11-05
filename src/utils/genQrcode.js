const { KJUR } = require('./jsrsasign-all-min')
const based64 = require('./based64')
const { createQrCodeImg } = require('./wxqrcode')

const getTimestamp = () => parseInt(new Date().valueOf() / 1000)

export const hexCharCodeToStr = function(hexCharCodeStr) {
  var rawStr = hexCharCodeStr.trim()
  var len = rawStr.length
  if (len % 2 !== 0) {
    console.log('Illegal Format ASCII Code!')
    return ''
  }
  var resultStr = []
  for (var i = 0; i < len; i = i + 2) {
    resultStr.push(String.fromCharCode(parseInt(rawStr.substr(i, 2), 16)))
  }
  return resultStr.join('')
}

const hexToBytes = hex => {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16))
  }
  return bytes
}

const bytesToHex = bytes => {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16))
    hex.push((bytes[i] & 0xf).toString(16))
  }
  return hex.join('')
}

const getQRSize = () => {
  let size = 0
  try {
    let scale = 750 / 650 //不同屏幕下QRcode的适配比例；设计稿是750宽
    size = wx.getSystemInfoSync().windowWidth / scale
  } catch (e) {
    console.log('获取设备信息失败' + e)
  }
  return size
}

function sign(token, secret, prefix) {
  let pad = s => (s.length > 48 ? '0219' : '0218') + s

  var signData = token + '04' + getTimestamp().toString(16)
  var sig = new KJUR.crypto.Signature({ alg: 'SHA1withECDSA' })
  sig.initSign({ ecprvhex: secret, eccurvename: 'secp192k1' })
  sig.updateHex(signData)
  var sigValueHex = hexToBytes(sig.sign())
  var sigValueHexr = pad(bytesToHex(based64.decode1(sigValueHex).r))
  var sigValueHexs = pad(bytesToHex(based64.decode1(sigValueHex).s))
  var sign_Data1 =
    '30' +
    ((sigValueHexr + sigValueHexs).length / 2).toString(16) +
    sigValueHexr +
    sigValueHexs
  return hexCharCodeToStr(
    prefix + signData + (sign_Data1.length / 2).toString(16) + sign_Data1
  )
}

export const createQR = (token, secret, prefix, size = getQRSize()) => {
  let ret = sign(token, secret, prefix)
  return ret ? createQrCodeImg(ret, { size: parseInt(size) }) : ret
}
