import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import fetch from '@utils/request'
import { API_QRCODE } from '@constants/api'
import { getStorage,updateStorage } from '@utils/storage'
import { hexCharCodeToStr } from '@utils/genQrcode'
import { createQrCodeImg } from '@utils/wxqrcode'

import './index.less'

const sm3 = require('miniprogram-sm-crypto').sm3
//import { hexToArrayBuffer } from 'hex-to-array-buffer'
//const hexToArrayBuffer = require('hex-to-array-buffer')

const sm2 = require('miniprogram-sm-crypto').sm2

export default class Index extends Component {
  config = {
    navigationBarTitleText: '首页'
  }
  constructor(props) {
    super(props)
    let keypair = sm2.generateKeyPairHex()
    let publicKey = keypair.publicKey // 公钥
    let privateKey = keypair.privateKey // 私钥
    this.state = {
      bizNo: null,
      cardNo: '',
      expiryTime: null,
      qrcodeExpire: null,
      qrcodeContent: null,
      publicKey: publicKey,
      privateKey: privateKey
    }
  }
  componentWillMount() {}

   componentDidMount() {
    console.log('componentDidMount')
    console.log(this.state)
  
  }

  componentWillUnmount() {}

  async componentDidShow() {
    let token = await getStorage('token')
    console.log('token '+token)
    if (!token) {
      console.log('no tkoen navigateTo /pages/login/index')
      Taro.navigateTo({
        url: '/pages/login/index'
      })
      return
    }  
    //let card = await getStorage('card')
    if (!this.state.qrcodeContent) {
      let res = await this.fetchQR()
      if(!res.qrcodeContent){
      Taro.navigateTo({
        url: '/pages/apply/index'
      })
    }else {
      let that = this
      this.setState({ card:true },()=>{
        that.refreshQR()    
      })
      
    }
    }else {
      let that = this
      this.setState({ card:true },()=>{
        that.refreshQR()    
      })
    
    }
  }
  hexToArrayBuffer = function(hexCharCodeStr) {
    var rawStr = hexCharCodeStr.trim()
    var len = rawStr.length
    if (len % 2 !== 0) {
      console.log('Illegal Format ASCII Code!')
      return ''
    }
    var result = []
    for (var i = 0; i < len; i = i + 2) {
      result.push(parseInt(rawStr.substr(i, 2), 16))
    }
    return result
  }
  bnpIsEven(t) {
    return (t > 0 ? t & 1 : t) == 0
  }
  fetchQR = async () => {
    let y = parseInt(this.state.publicKey.substr(128, 2), 16)
    let publicKey = Taro.arrayBufferToBase64(
      this.hexToArrayBuffer(
        (this.bnpIsEven(y) ? '02' : '03') + this.state.publicKey.substr(2, 64)
      )
    )
    console.log('publicKey : ' + this.state.publicKey + ' ' + publicKey)
    let payload = {
      //publicKey
      payAccountUserPublicKey: publicKey
      // 'BOKOX53v7VImVxlxs5SIHLsVai2nhp5/oeXvm785FgHhNAme4vmCZ/HqzNDJWr6pIoPpCEeUWDoFMySrGG2wNmc='
    }
    let res = await fetch({
      url: API_QRCODE,
      payload: payload,
      method: 'POST',
      showToast: true,
      autoLogin: true
    })

    //{"respCode":0,"respDesc":"SUCCESS","data":{"bizNo":"0c0cd380-6592-4b33-b46a-23d0550e8357","cardNo":"10000100000000000001","expiryTime":"600","qrcodeExpire":"1553682037","qrcodeContent":"VQFKJAEBAAAZEoiIiIgSQJAANAQEACEDd+E4wS2/y8Ax+X9iavAu0vKtgWmquZ5BnVBbUn5jmuSSIk5EFQHwDAHRnHgZ/XfeLlY8mR0IKCMjbzyZ1QklwCp590om3/jHyHnZc1YEfAuK0yRm1+Jb71FntaPKT2fHMjA4ODAyMjkwMTU0NzE3MBAAAQAAAAAAAAGIiIiIIRAAAQEAB9AE4o5fne/tUiZXGXGzlIgcuxVqLaeGnn+h5e+bvzkWAeE0CZ7i+YJn8erM0Mlavqkig+kIR5RYOgUzJKsYbbA2Z1ybTnUCWAEAFciUY4YviMYJ+AAQJ//RKf+z+m6EzkW8Y7tRu/I990QjWE4pogTq1XrqsNuRYUVRzfahAN8BjDYqbcKsa3x5EcQ="},"suc":true}
    console.log(res)
    if (res) {
      let { bizNo, cardNo, expiryTime, qrcodeExpire, qrcodeContent } = res
      this.setState({
        bizNo,
        cardNo,
        expiryTime,
        qrcodeExpire,
        qrcodeContent
      })
      return res
    } else {
      //this.setState({})
      console.log('fetch error')
    }
  }
  parseArrayBufferToHex(input) {
    return Array.prototype.map
      .call(new Uint8Array(input), x => ('00' + x.toString(16)).slice(-2))
      .join('')
  }
  componentDidHide() {}

  leftPad(input, num) {
    if (input.length >= num) return input

    return new Array(num - input.length + 1).join('0') + input
  }
  hexToArray(hexStr) {
    const words = []
    let hexStrLength = hexStr.length

    if (hexStrLength % 2 !== 0) {
      hexStr = this.leftPad(hexStr, hexStrLength + 1)
    }

    hexStrLength = hexStr.length

    for (let i = 0; i < hexStrLength; i += 2) {
      words.push(parseInt(hexStr.substr(i, 2), 16))
    }
    return words
  }
  goApplyCard = () => {
    Taro.navigateTo({
      url: '/pages/apply/index'
    })
  }

  goLogout = async () => {   
    await updateStorage({ key: 'token', data: false })
    await updateStorage({ key: 'uid', data: false })
    this.setState({ card:false },()=>{
      Taro.navigateTo({
        url: '/pages/index/index'
      }) 
    }) 
  
  }

  refreshQR = async () => {
    this.state.timerId && clearTimeout(this.state.timerId)
    let haveQrcode = false
    if (this.state.qrcodeExpire && this.state.qrcodeContent) {
      let date = new Date(this.state.qrcodeExpire * 1000)
      let now = Date.now()
      if (date <= now) {
        haveQrcode = false
        console.log('haveQrcode: date > now '+date + " "+ now)
      } else {
        haveQrcode = true
      }
    }else {
      console.log('state:'+ JSON.stringify(this.state))
    }
    console.log('haveQrcode:'+haveQrcode)
    let qrcodeContent = this.state.qrcodeContent
    if (!haveQrcode) {
      qrcodeContent = await this.fetchQR().qrcodeContent
    }
    qrcodeContent = this.parseArrayBufferToHex(
      Taro.base64ToArrayBuffer(qrcodeContent)
    )

    console.log('qrcodeContent : ' + qrcodeContent)
    let privateKey = this.state.privateKey
    let publicKey = this.state.publicKey

    let now = parseInt(Date.now() / 1000).toString(16)
    console.log('now = ' + now)
    let msg = qrcodeContent + now
    let msgStr = hexCharCodeToStr(msg)
    let sigValueHex = sm2.doSignature(this.hexToArray(msg), privateKey, {
      hash: true,
      publicKey: publicKey
    }) // 签名
    console.log(sigValueHex)
    let verifyResult = sm2.doVerifySignature(
      this.hexToArray(msg),
      sigValueHex,
      publicKey,
      {
        hash: true
      }
    ) // 验签结果
    console.log(verifyResult)
    let hashData = sm3(msgStr) // 杂凑
    console.log('msg:' + msg)
    console.log('hashData:' + hashData)
    var size = 200
    msg = msg + '15' + sigValueHex
    let qrimg = createQrCodeImg(hexCharCodeToStr(msg), { size: parseInt(size) })
    console.log(msg)
    this.setState({ qrimg: qrimg })
    /*      drawQrcode({
           width: 200,
           height: 200,
           canvasId: 'myQrcode',
           text: 'https://github.com/yingye'
         }); */

    let that = this
    let id =   setTimeout(() => {
           that.refreshQR()
         }, 60000)
         this.setState({ timerId: id })    
  }
  render() {
    return (
      <View className='index'>
      <View className='box'>
        <Text>乘车二维码 </Text>
        <Text>卡号:{this.state.cardNo}</Text>
        <View  className='qrcode-box'>
          <Image
            className='qrcode-box'
            src={this.state.qrimg}
            mode='widthFix'
          />
        </View>
        <View  className='button-box' >
        <Button className='btn-max-w' plain onClick={this.refreshQR}>
          刷新二维码
        </Button>
        </View>
        <View  className='button-box'>
          <Button className='btn-max-w' plain onClick={this.goApplyCard}>
          去领卡
        </Button>
        </View>
        <View  className='button-box'>
        <Button className='btn-max-w' plain onClick={this.goLogout}>
          退出登陆
        </Button>
        </View>
        </View>
      </View>
    )
  }
}
