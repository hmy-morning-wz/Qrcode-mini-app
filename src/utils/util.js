const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('-') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const isMergeableObject = val => {
  let s = null
  return (
    val &&
    typeof val === 'object' &&
    !!((s = Object.prototype.toString.call(val)), 'RegExp|Date'.indexOf(s))
  )
}

const deepMerge = (d, s) => {
  let rs = { ...d }
  Object.keys(s).forEach(
    k =>
      (rs[k] =
        isMergeableObject(d[k]) && isMergeableObject(s[k])
          ? deepMerge(d[k], s[k])
          : s[k] || d[k])
  )
  return rs
}

const validateMobileNo = mb => {
  return mb && /^1[0-9]{10}$/.test(mb)
}

const validateMsgCode = code => {
  return code && code.length == 6
}

const validateCertNo = code => {
  return code && code.length >= 18
}

const storage = {
  set(...args) {
    if (args.length > 3) {
      throw new Error('argument length over 3')
    }
  },
  get(...args) {
    return args.reduce((t, k) => {
      try {
        t[k] = wx.getStorageSync(k)
      } catch (e) {
        t[k] = false
      }
    }, {})
  }
}

module.exports = {
  formatTime,
  deepMerge,
  validateMobileNo,
  validateMsgCode,
  validateCertNo
}
