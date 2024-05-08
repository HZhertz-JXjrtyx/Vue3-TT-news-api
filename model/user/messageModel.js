import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId
import Conversation from '../../schema/db/conversation.js'
import Message from '../../schema/db/message.js'

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}
class MessageModel {
  async getConversationList(userId) {
    const conversations = await Conversation.find({
      'participants.user': new ObjectId(userId),
      'participants.visible': true,
    })
      .populate({
        path: 'participants.user',
        select: 'user_nickname user_avatar',
      })
      .populate('participants.last_visible_message')
      .sort({ 'participants.last_visible_message.created_at': -1 })

    return conversations.map((conversation) => {
      console.log(conversation)
      const otherSide = conversation.participants.find((p) => String(p.user._id) !== userId)
      const ourSide = conversation.participants.find((p) => String(p.user._id) === userId)
      return {
        _id: conversation._id,
        interlocutor: otherSide.user,
        unread_count: ourSide.unread_count,
        last_message: ourSide.last_visible_message,
      }
    })
  }
  async getNotificationList(userId, type) {
    let notifications = await Message.find({
      receiver: new ObjectId(userId),
      type: type,
    })
      .populate({
        path: 'sender',
        select: 'user_id user_nickname user_avatar',
      })
      .populate('related_entity')
      .sort('created_at')
      .exec()
    if (type === 'follow') {
      notifications = notifications.map((item) => {
        const userInfo = {
          user_id: item.related_entity.user_id,
          user_nickname: item.related_entity.user_nickname,
          user_avatar: item.related_entity.user_avatar,
        }
        item._doc.related_entity = userInfo
        return item
      })
    }

    const unReadCount = await Message.countDocuments({
      receiver: new ObjectId(userId),
      type: type,
      isRead: false,
    })
    return {
      notifications,
      unReadCount,
    }
  }
}
export default new MessageModel()
