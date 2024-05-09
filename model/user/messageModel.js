import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId
import Conversation from '../../schema/db/conversation.js'
import Message from '../../schema/db/message.js'

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}
class MessageModel {
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
  
  async getConversationDetail(userId, conversationId) {
    try {
      const conversation = await Conversation.findById(conversationId).populate({
        path: 'messages',
        model: Message,
        options: { sort: { created_at: 1 } },
      })

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const participant = conversation.participants.find((p) => p.user.toString() === userId)

      if (!participant) {
        throw new Error('User not a participant in the conversation')
      }

      let messages
      if (participant.last_invisible_message) {
        const lastInvisibleMessageIndex = conversation.messages.findIndex(
          (message) => message._id.toString() === participant.last_invisible_message.toString()
        )

        messages =
          lastInvisibleMessageIndex !== -1
            ? conversation.messages.slice(lastInvisibleMessageIndex + 1)
            : conversation.messages
      } else {
        messages = conversation.messages
      }

      return messages
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
export default new MessageModel()
