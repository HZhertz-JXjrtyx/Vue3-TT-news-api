import User from '../../schema/db/users.js'
import Channel from '../../schema/db/channel.js'

class ChannelModel {
  async getChannels(userId) {
    const { channel } = (await User.find({ user_id: userId }, 'channel'))[0]
    console.log(channel)
    let selectedChannels = []
    for (let id of channel.selected) {
      let channelData = await Channel.findOne({ id: id }, { _id: 0 })
      if (channelData) {
        selectedChannels.push(channelData)
      }
    }

    let unselectedChannels = []
    for (let id of channel.unselected) {
      let channelData = await Channel.findOne({ id: id }, { _id: 0 })
      if (channelData) {
        unselectedChannels.push(channelData)
      }
    }
    return {
      selected: selectedChannels,
      unselected: unselectedChannels
    }
  }
  async patchChannels(userId, newChannels) {
    return await User.findOneAndUpdate({ user_id: userId }, { channel: newChannels }, { new: true })
  }
}
export default new ChannelModel()
