import Taro, { Component } from '@tarojs/taro'
import { View, Text, Input, Button } from '@tarojs/components'
import fetch from '@utils/request'
import { API_USER_LOGIN } from '@constants/api'
import './index.less'

export default class Index extends Component {
  config = {
    navigationBarTitleText: '登录'
  }
  constructor(props) {
    super(props)
    this.state = { userName: null, password: null, login: false }
  }
  componentWillMount() {}

  componentDidMount() {
    if (this.state.login) {
      Taro.navigateTo({
        url: '/pages/index/index'
      })
    }
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  login = () => {
    //console.log(this.state)
    //"userName":"test","password":"123456"
    let payload = {
      userName: this.state.userName,
      password: this.state.password
    }
    fetch({
      url: API_USER_LOGIN,
      payload: payload,
      method: 'POST',
      showToast: true,
      autoLogin: false
    }).then(res => {
      if (res) {
        this.setState({ login: true })
        Taro.navigateTo({
          url: '/pages/index/index'
        })
      } else {
        this.setState({ login: false })
      }
    })
  }

  handleInput = (key, value) => {
    // console.log(this.state)
    //console.log(key, value)
    this.setState({ [key]: value.detail.value })
  }

  render() {
    return (
      <View className='index'>
        <View className='box'>
          <Text>账号</Text>
          <Input
            type='text'
            placeholder='手机号'
            onInput={this.handleInput.bind(this, 'userName')}
          />
          <Text>密码</Text>
          <Input
            type='password'
            password
            placeholder='密码'
            onInput={this.handleInput.bind(this, 'password')}
          />

          <Button className='btn-max-w' plain onClick={this.login}>
            登录
          </Button>
        </View>
      </View>
    )
  }
}
