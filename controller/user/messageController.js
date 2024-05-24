import MessageModel from '../../model/user/messageModel.js'
import WebSocketServer from '../../utils/WebSocketServer.js'
class MessageController {
  // 获取用户通知列表
  async getNotifyList(ctx) {
    const { _id: userId } = ctx.state.user
    // console.log(userId)
    const [commentRes, likeRes, followRes] = await Promise.all([
      MessageModel.getNotificationList(userId, 'comment'),
      MessageModel.getNotificationList(userId, 'like'),
      MessageModel.getNotificationList(userId, 'follow'),
    ])
    ctx.body = {
      type: 'success',
      status: 200,
      message: '获取用户通知列表成功',
      data: {
        comment: {
          last_message: commentRes.latestNotification,
          unReadCount: commentRes.unReadCount,
        },
        like: {
          last_message: likeRes.latestNotification,
          unReadCount: likeRes.unReadCount,
        },
        follow: {
          last_message: followRes.latestNotification,
          unReadCount: followRes.unReadCount,
        },
      },
    }
  }
  // 获取通知消息内容
  async getNotifyDetail(ctx) {
    const { _id: userId } = ctx.state.user
    const { type, page, size } = ctx.request.query
    // console.log(userId, type, page, size)
    const offset = (page - 1) * size
    const data = await MessageModel.getNotificationDetail(userId, type, offset, parseInt(size))
    ctx.body = {
      type: 'success',
      status: 200,
      message: `获取${type}通知消息成功`,
      data,
    }
  }

  // 获取用户对话列表
  async getChatList(ctx) {
    const { _id: userId } = ctx.state.user
    // console.log(userId)
    const data = await MessageModel.getConversationList(userId)
    ctx.body = {
      type: 'success',
      status: 200,
      message: ' 获取用户对话列表成功',
      data,
    }
  }
  // 获取对话消息内容
  async getChatDetail(ctx) {
    const { _id: userId } = ctx.state.user
    const { conversationId } = ctx.request.query
    // console.log(userId, conversationId)
    const data = await MessageModel.getConversationDetail(userId, conversationId)
    ctx.body = {
      type: 'success',
      status: 200,
      message: '获取对话消息内容成功',
      data,
    }
  }
  // 是否已有对话
  async isHasChat(ctx) {
    const { _id: my_id } = ctx.state.user
    const { interlocutor } = ctx.request.query
    // console.log(my_id, interlocutor)
    const conversation = await MessageModel.findByTwoUser(my_id, interlocutor)
    // console.log(conversation)
    const isHas = Boolean(conversation)
    // console.log(isHas)
    ctx.body = {
      type: 'success',
      status: isHas ? 200 : 204,
      message: isHas ? '已存在对话项' : '未存在对话项',
      data: isHas ? conversation : null,
    }
  }
  // 新增对话
  async addChat(ctx) {
    const { _id: my_id } = ctx.state.user
    const { interlocutor } = ctx.request.body
    console.log(my_id, interlocutor)
    const newConversation = await MessageModel.addConversation(my_id, interlocutor)
    console.log(newConversation)
    if (newConversation._id) {
      const ourSide = newConversation.participants.find((p) => String(p.user._id) === my_id)
      const otherSide = newConversation.participants.find((p) => String(p.user._id) === interlocutor)

      new WebSocketServer().sendBySocketToUser('chat', interlocutor, {
        type: 'success',
        status: 200,
        message: '新的对话',
        data: {
          _id: newConversation._id,
          interlocutor: ourSide.user,
          last_message: otherSide.last_visible_message,
          unread_count: otherSide.unread_count,
        },
      })
      ctx.body = {
        type: 'success',
        status: 200,
        message: '新增对话项成功',
        data: newConversation,
      }
    }
  }

  // 新增对话消息
  async addChatMessage(ctx) {
    const { _id: userId } = ctx.state.user
    const { receiverId, conversationId, content, createdAt } = ctx.request.body
    // console.log(userId, receiverId, conversationId, content, createdAt)
    const result = await MessageModel.addConversationMessage(
      userId,
      receiverId,
      conversationId,
      content,
      createdAt
    )
    if (result.newMessage._id) {
      // 接收者列表中是否存在对话/对话对接受者是否可见
      const conversationInfo = await MessageModel.findConversation(conversationId)
      // console.log(conversationInfo)
      const ourSide = conversationInfo.participants.find((p) => String(p.user._id) === receiverId)
      const otherSide = conversationInfo.participants.find((p) => String(p.user._id) === userId)

      console.log(ourSide, otherSide)
      if (otherSide.visible) {
        // 是：发送消息
        new WebSocketServer().sendBySocketToUser('chat_message', receiverId, {
          type: 'success',
          status: 200,
          message: '新的对话消息',
          data: result.populatedMessage,
        })
      } else {
        // 否：发送对话
        new WebSocketServer().sendBySocketToUser('chat', receiverId, {
          type: 'success',
          status: 200,
          message: '新的对话',
          data: {
            _id: conversationInfo._id,
            interlocutor: ourSide.user,
            last_message: otherSide.last_visible_message,
            unread_count: otherSide.unread_count,
          },
        })
      }

      ctx.body = {
        type: 'success',
        status: 200,
        message: '发送对话消息成功',
        data: result.populatedMessage,
      }
    }
  }
  // 获取未读消息总数
  async getUnreadTotalCount(ctx) {
    const { _id: userId } = ctx.state.user
    const result = await MessageModel.getUnreadTotal(userId)
    // console.log(result)
    ctx.body = {
      type: 'success',
      status: 200,
      message: `${result}条未读消息`,
      unreadTotalCount: result,
    }
  }
  // 清除未读
  async clearUnreadMessage(ctx) {
    const { _id: userId } = ctx.state.user
    const { messageType, conversationId } = ctx.request.body
    if (['comment', 'like', 'follow'].includes(messageType)) {
      const result = await MessageModel.clearUnreadNotify(userId, messageType)
      // console.log(result)
      if (result.acknowledged) {
        ctx.body = {
          type: 'success',
          status: 200,
          message: `清除未读${messageType}通知成功`,
          clearCount: result.modifiedCount,
        }
      }
    } else if (messageType === 'chat') {
      const result = await MessageModel.clearUnreadChat(userId, conversationId)
      // console.log(result)
      if (result.updMessageRes.acknowledged && result.updConversationRes.acknowledged) {
        ctx.body = {
          type: 'success',
          status: 200,
          message: '清除未读chat通知成功',
          clearCount: result.updMessageRes.modifiedCount,
        }
      }
    }
  }
}
export default new MessageController()
