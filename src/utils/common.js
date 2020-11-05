const url2tile = {
  default: '交通卡',
  'pages/login/login': '登录/注册',
  'pages/index/index': '交通卡',
  'pages/logs/logs': '日志',
  'pages/account/account': '我的账号',
  'pages/ebus-card/ebus-card': '详情',
  'pages/bus-lines/bus-lines': '乘车线路',
  'pages/bus-record/bus-record': '乘车记录',
  'pages/pay/pay': '支付',
  'pages/refund-card/refund-card': '退卡',
  'pages/faq/faq': '常见问题',
  'pages/bus-record-page/bus-record-page': '乘车记录详情',
  'pages/argument/argument': '用户协议',
  'pages/receive-card/receive-card': '领取卡片',
  'pages/receive-card/step-two/step-two': '领取卡片',
  'pages/receive-card/step-complete/step-complete': '领取卡片',
  'pages/balance/balance': '余额查询'
}

const title = () => {
  const pages = getCurrentPages()
  const curPage = pages[pages.length - 1].route || 'default'
  wx.setNavigationBarTitle({
    title: url2tile[curPage]
  })
}

const noop = err =>
  wx.showToast({
    title: typeof err === 'string' ? err : (err && err.message) || '程序出错了',
    icon: 'none',
    duration: 1000
  })

module.exports = {
  title,
  noop
}
