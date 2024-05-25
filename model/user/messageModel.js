import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId
import Conversation from '../../schema/db/conversation.js'
import Message from '../../schema/db/message.js'
import User from '../../schema/db/users.js'

class MessageModel {
  // 获取通知列表
  async getNotificationList(userId, type) {
    let latestNotification = await Message.findOne({
      receiver: userId,
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
      receiver: userId,
      type: type,
      isRead: false,
    })
    return {
      latestNotification,
      unReadCount,
    }
  }
  // 获取通知消息列表
  async getNotificationDetail(userId, type, offset = 0, size = 10) {
    let notifications = await Message.find({
      receiver: userId,
      type: type,
    })
      .populate({
        path: 'sender',
        select: 'user_id user_nickname user_avatar',
      })
      .populate('related_content')
      .populate('related_entity')
      .sort({ created_at: -1 })
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
  async findMessage(message_id) {
    return await Message.findById(message_id).populate({
      path: 'sender',
      select: 'user_id user_nickname user_avatar',
    })
  }
  // 是否已有通知/点赞与关注不要重复通知
  // 通过发送方,接收方,消息类型,相关项查找
  async findNotifyByUserAndType(sender, receiver, type, related_entity) {
    return Message.findOne({
      sender,
      receiver,
      type,
      related_entity,
    })
  }
  // 新增通知消息
  async addNotifyMessage(
    content,
    sender,
    receiver,
    created_at,
    type,
    related_content,
    related_entity,
    entity_type,
    related_work,
    work_type
  ) {
    const newMessage = {
      content,
      sender,
      receiver,
      created_at,
      type,
      related_content,
      related_entity,
      entity_type,
      related_work,
      work_type,
    }
    return await Message.create(newMessage)
  }
  // 获取对话列表
  async getConversationList(userId, pre, size) {
    const conversations = await Conversation.aggregate([
      {
        $match: {
          'participants.user': new ObjectId(userId),
          'participants.visible': true,
        },
      },
      {
        $unwind: '$participants',
      },
      {
        $lookup: {
          from: 'users',
          let: { user_id: '$participants.user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$user_id'] },
              },
            },
            {
              $project: {
                user_id: 1,
                user_nickname: 1,
                user_avatar: 1,
              },
            },
          ],
          as: 'participants.user',
        },
      },
      {
        $unwind: '$participants.user',
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'participants.last_visible_message',
          foreignField: '_id',
          as: 'participants.last_visible_message',
        },
      },
      {
        $unwind: '$participants.last_visible_message',
      },
      {
        $group: {
          _id: '$_id',
          participants: { $push: '$participants' },
          last_visible_message_created_at: {
            $first: {
              $cond: [
                { $eq: ['$participants.user._id', new ObjectId(userId)] },
                '$participants.last_visible_message.created_at',
                null,
              ],
            },
          },
        },
      },
      {
        $sort: { last_visible_message_created_at: -1 },
      },
    ])
    console.log('conversations', conversations)
    let index = 0
    if (pre) {
      index = conversations.findIndex((conversation) => String(conversation._id) === pre)
      index += 1
    }
    const paginatedConversations = conversations.slice(index, index + size)

    return paginatedConversations.map((conversation) => {
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
  // 获取对话消息列表
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
      // console.error(error)
      throw error
    }
  }

  // 通过发送方与接收方查找对话/是否存在对话
  async findByTwoUser(userA, userB) {
    const conversations = await Conversation.findOne({
      'participants.user': {
        $all: [userA, userB],
      },
    })
    return conversations
  }
  async findConversation(conversationId) {
    return await Conversation.findById(conversationId).populate({
      path: 'participants.user',
      select: 'user_id user_nickname user_avatar',
    })
  }
  // 新增对话项
  async addConversation(userA, userB) {
    return await Conversation.create({
      participants: [{ user: userA }, { user: userB }],
    })
  }

  // 新增对话消息
  async addConversationMessage(sender, receiver, conversation, content, created_at) {
    const newMessage = await Message.create({
      content: content,
      sender: sender,
      receiver: receiver,
      created_at,
      type: 'chat',
      related_entity: conversation,
      entity_type: 'Conversation',
    })
    if (newMessage._id) {
      const udpRes1 = await Conversation.updateOne(
        { _id: conversation, 'participants.user': receiver },
        {
          $inc: { 'participants.$.unread_count': 1 },
        }
      )
      const udpRes2 = await Conversation.updateMany(
        { _id: conversation },
        {
          $push: { messages: newMessage._id },
          $set: { 'participants.$[].last_visible_message': newMessage._id },
        }
      )
      if (udpRes1.modifiedCount === 1 && udpRes2.modifiedCount === 1) {
        return newMessage
      } else {
        return null
      }
    } else {
      return null
    }
  }
  // 清除通知未读
  async clearUnreadNotify(userId, messageType) {
    return await Message.updateMany({ receiver: userId, type: messageType }, { $set: { isRead: true } })
  }
  // 清除对话未读
  async clearUnreadChat(userId, conversationId) {
    const updMessageRes = await Message.updateMany(
      { receiver: userId, related_entity: conversationId },
      { $set: { isRead: true } }
    )
    const updConversationRes = await Conversation.updateOne(
      { _id: conversationId, 'participants.user': userId },
      { $set: { 'participants.$.unread_count': 0 } }
    )
    return {
      updMessageRes,
      updConversationRes,
    }
  }
  // 获取未读消息总数
  async getUnreadTotal(userId) {
    return await Message.countDocuments({
      receiver: userId,
      isRead: false,
    })
  }
}
export default new MessageModel()
