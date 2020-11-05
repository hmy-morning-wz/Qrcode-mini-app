import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import fetch from '@utils/request'
import { API_OPEN_CARD } from '@constants/api'
import { updateStorage } from '@utils/storage'
import './index.less'

export default class Index extends Component {
  config = {
    navigationBarTitleText: '领卡'
  }
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  applyCard = () => {
    let payload = {
      name: 'aaa',
      mobile: '13735733344',
      certNo: 'aaa',
      certType: 2
    }
    fetch({
      url: API_OPEN_CARD,
      payload: payload,
      method: 'POST',
      showToast: true,
      autoLogin: true
    }).then(res => {
      console.log(res)
      updateStorage({ key: 'card', data: payload })
      Taro.navigateTo({
        url: '/pages/index/index'
      })
    })
  }

  render() {
    return (
      <View className='index'>
        <View className='box'>
          <Text>领卡</Text>

          <Button className='btn-max-w' plain onClick={this.applyCard}>
            领卡
          </Button>
        </View>
      </View>
    )
  }
}
