import Channel from '../../model/user/channelModel.js'

class ChannelController {
  async getUserChannels(ctx) {
    console.log(ctx.state.user)
    let userId = ctx.state.user.id
    if (userId) {
      const rows = await Channel.getChannels(userId)
      console.log(rows)
      if (rows.selected.length === 0) {
        ctx.body = { type: 'error', message: '获取用户频道信息失败！' }
      } else {
        ctx.body = {
          type: 'success',
          status: 200,
          message: '获取用户频道信息成功！',
          data: rows
        }
      }
    } else {
      const data = {
        selected: [
          { id: 0, channel_id: '0', name: '推荐' },
          { id: 1, channel_id: '3189399007', name: '财经' },
          { id: 2, channel_id: '3189398999', name: '科技' },
          { id: 3, channel_id: '3189398996', name: '热点' },
          { id: 4, channel_id: '3189398968', name: '国际' },
          { id: 5, channel_id: '3189398960', name: '军事' },
          { id: 6, channel_id: '3189398957', name: '体育' },
          { id: 7, channel_id: '3189398972', name: '娱乐' }
        ],
        unselected: [
          { id: 8, channel_id: '3189398981', name: '数码' },
          { id: 9, channel_id: '3189398965', name: '历史' },
          { id: 10, channel_id: '3189399002', name: '美食' },
          { id: 11, channel_id: '3189398995', name: '游戏' },
          { id: 12, channel_id: '3189398983', name: '旅游' },
          { id: 13, channel_id: '3189398959', name: '养生' },
          { id: 14, channel_id: '3189398984', name: '时尚' },
          { id: 15, channel_id: '3189399004', name: '育儿' }
        ]
      }
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取游客频道信息成功！',
        data: data
      }
    }
  }
  async patchUserChannels(ctx) {
    const userId = ctx.state.user.id
    const newChannels = ctx.request.body
    console.log(userId, newChannels)
    try {
      const result = await Channel.patchChannels(userId, newChannels)
      if (result) {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 200,
          message: '更新用户频道信息成功'
        }
      } else {
        ctx.status = 404
        ctx.body = {
          type: 'error',
          status: 404,
          message: '更新用户频道信息失败'
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: error
      }
    }
  }
  //获取所有频道信息
  async getAllChannels(ctx) {
    const rows = await Channel.getAllChannels()
    // console.log(rows);
    if (rows.length === 0) {
      ctx.body = { type: 'error', message: '获取所有频道信息失败！' }
    } else {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取所有频道信息成功！',
        data: rows
      }
    }
  }
  //添加用户频道
  async updateUserChannels(ctx) {
    let myid = ctx.state.user.id
    let channelInfo = ctx.request.body
    console.log(myid, channelInfo)
    const rows = await Channel.addChannel(myid, channelInfo.channelId)
    console.log(rows)
    if (rows.modifiedCount !== 1) {
      ctx.body = { type: 'error', message: '添加用户频道失败！' }
    } else {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '添加用户频道成功！'
      }
    }
  }
  //删除用户频道
  async deleteUserChannels(ctx) {
    let myid = ctx.state.user.id
    let channelInfo = ctx.request.query
    console.log(myid, channelInfo)
    const rows = await Channel.deleteChannel(myid, channelInfo.channelId)
    console.log(rows)
    if (rows.modifiedCount !== 1) {
      ctx.body = { type: 'error', message: '删除用户频道失败！' }
    } else {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '删除用户频道成功！'
      }
    }
  }
}
export default new ChannelController()
