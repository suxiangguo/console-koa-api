import moment from 'dayjs'

import SignRecord from '../model/signRecord'
import { getJWTPayload } from '../common/utils'
import User from '../model/user'

class SignController {
  /**
   * 用户签到
   * @param {*} ctx 
   */
  async userSign (ctx) {
    // 通过token获取payload中的用户id
    const payload = await getJWTPayload(ctx.header.authorization)
    // console.log(payload)

    // 通过用户id获取用户的最后一次签到
    const lastSignRecord = await SignRecord.findByUid(payload._id)
    console.log('-------------------------------------------')
    console.log(lastSignRecord)
    // 获取用户信息
    const userInfo = await User.findByUid(payload._id)

    // 返回数据
    let data
    let code
    let message
    if (lastSignRecord !== null)
    {
      // 有最后一次签到数据
      // 最后一次签到的时间是否和今天相同？
      // 如果相同，表示用户今天已结签到过了
      if (moment(lastSignRecord.created).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
      {
        code = 9001
        message = '您今天已经签到过了'
        data = {
          count: userInfo.count,
          favs: userInfo.favs
        }
      } else
      {
        // 如果不同，表示用户今天没签到
        // 判断用户是否在连续签到？
        // 如果当前时间减去一天等于最后一次的签到时间，表示用户在连续签到
        code = 10000
        message = '签到成功'
        let count = userInfo.count + 1
        let favs
        if (moment(lastSignRecord.created).format('YYYY-MM-DD') === moment().subtract(1, 'days').format('YYYY-MM-DD'))
        {
          if (count < 5)
          {
            favs = 5
          } else if (count >= 5 && count < 15)
          {
            favs = 10
          } else if (count >= 15 && count < 30)
          {
            favs = 15
          } else if (count >= 30 && count < 100)
          {
            favs = 20
          } else if (count >= 100 && count < 365)
          {
            favs = 30
          } else {
            favs = 50
          }
          // 更新用户信息的连续签到次数和总积分
          await User.updateOne({
            _id: payload._id
          }, {
            $inc: { favs: favs, count: 1 }
          })
          data = {
            count: count,
            favs: userInfo.favs + favs
          }
        } else {
          // 表示用户中断了连续签到
          count = 1
          favs = 5
          await User.updateOne({
            _id: payload._id
          }, {
            $set: { count: 1 },
            $inc: { favs: favs }
          })
          data = {
            count: count,
            favs: userInfo.favs + favs
          }
        }
        const newSignRecord = new SignRecord({
          uid: payload._id,
          favs: favs
        })
        await newSignRecord.save()
      }
    } else {
      // 没有最后一次签到数据，则为第一次签到
      // 更新用户信息中的签到次数和积分数
      await User.updateOne(
        { _id: payload._id },
        {
          $set: { favs: 105, count: 1 }
        })

      // 保存用户的此次签到记录到签到记录表中
      const firstSignRecord = new SignRecord({
        uid: payload._id,
        favs: 5
      })
      await firstSignRecord.save()
      code = 10000
      message = '签到成功'
      data = {
        count: 1,
        favs: 105
      }
    }
    ctx.body = {
      code: code,
      data: data,
      message: message
    }
  }
}

export default new SignController()