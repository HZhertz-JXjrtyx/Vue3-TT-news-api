import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId
import Conversation from '../../schema/db/conversation.js'
import Message from '../../schema/db/message.js'
import User from '../../schema/db/users.js'

class MessageModel {
  async getNotificationList(userId, type) {
    let latestNotification = await Message.findOne({
      receiver: new mongoose.Types.ObjectId(userId),
      type: type,
    })
      .populate({
        path: 'sender',
        select: 'user_id user_nickname user_avatar',
      })
      .populate('related_content')
      .populate('related_entity')
      .sort({ created_at: -1 })
      .limit(1)
    if (latestNotification && type === 'follow') {
      const userInfo = {
        user_id: latestNotification.related_entity.user_id,
        user_nickname: latestNotification.related_entity.user_nickname,
        user_avatar: latestNotification.related_entity.user_avatar,
      }
      latestNotification._doc.related_entity = userInfo
    }

    const unReadCount = await Message.countDocuments({
      receiver: new ObjectId(userId),
      type: type,
      isRead: false,
    })
    return {
      latestNotification,
      unReadCount,
    }
  }
  async getNotificationDetail(userId, type, offset = 0, size = 10) {
    let notifications = await Message.find({
      receiver: new ObjectId(userId),
      type: type,
    })
      .populate({
        path: 'sender',
        select: 'user_id user_nickname user_avatar',
      })
      .populate('related_content')
      .populate('related_entity')
      .sort('created_at')
      .skip(offset)
      .limit(size)
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

    return notifications
  }
  async getConversationList(userId) {
    const conversations = await Conversation.find({
      'participants.user': new ObjectId(userId),
      'participants.visible': true,
    })
      .populate({
        path: 'participants.user',
        select: 'user_id user_nickname user_avatar',
      })
      .populate('participants.last_visible_message')
      .sort({ 'participants.last_visible_message.created_at': -1 })

    return conversations.map((conversation) => {
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
      const conversation = await Conversation.findById(conversationId)
        .populate({
          path: 'participants.user',
          select: 'user_id user_nickname user_avatar',
        })
        .populate({
          path: 'messages',
          model: Message,
          options: { sort: { created_at: 1 } },
          populate: {
            path: 'sender',
            model: User,
            select: 'user_id user_nickname user_avatar',
          },
        })

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const otherSide = conversation.participants.find((p) => String(p.user._id) !== userId)
      const ourSide = conversation.participants.find((p) => String(p.user._id) === userId)

      if (!ourSide) {
        throw new Error('ourSide not in the conversation')
      }

      let messages
      if (ourSide.last_invisible_message) {
        const lastInvisibleMessageIndex = conversation.messages.findIndex(
          (message) => message._id.toString() === ourSide.last_invisible_message.toString()
        )

        messages =
          lastInvisibleMessageIndex !== -1
            ? conversation.messages.slice(lastInvisibleMessageIndex + 1)
            : conversation.messages
      } else {
        messages = conversation.messages
      }

      return {
        interlocutor: otherSide.user,
        messages,
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  async addConversationMessage(sender, receiver, conversation, content, created_at) {
    const newMessage = await Message.create({
      content: content,
      sender: sender,
      receiver: receiver,
      created_at,
      type: 'chat',
      related_entity: conversation,
      onModel: 'Conversation',
    })

    const udpRes = await Conversation.updateOne(
      { _id: conversation, 'participants.user': sender },
      {
        $push: { messages: newMessage._id },
        $set: { 'participants.$[].last_visible_message': newMessage._id },
      }
    )
    const populatedMessage = await Message.findById(newMessage._id).populate({
      path: 'sender',
      select: 'user_id user_nickname user_avatar',
    })
    // console.log(newMessage, udpRes, populatedMessage)
    return {
      newMessage,
      udpRes,
      populatedMessage,
    }
  }
}
export default new MessageModel()
