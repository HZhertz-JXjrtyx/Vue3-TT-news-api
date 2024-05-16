import MessageModel from '../../model/user/messageModel.js'
class MessageController {
  // 获取用户通知列表
  async getNotifyList(ctx) {
    const { _id: userId } = ctx.state.user
    console.log(userId)
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
    console.log(userId, type, page, size)
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
    console.log(userId)
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
    console.log(userId, conversationId)
    const data = await MessageModel.getConversationDetail(userId, conversationId)
    ctx.body = {
      type: 'success',
      status: 200,
      message: '获取对话消息内容成功',
      data,
    }
  }
  // 新增对话/查找对话
  async addChat(ctx) {
    const { _id: userId } = ctx.state.user
    const { receiverId, conversationId, content, createdAt } = ctx.request.body
  }
  // 发送对话消息
  async addChatMessage(ctx) {
    const { _id: userId } = ctx.state.user
    const { receiverId, conversationId, content, createdAt } = ctx.request.body
    console.log(userId, receiverId, conversationId, content, createdAt)
    const result = await MessageModel.addConversationMessage(
      userId,
      receiverId,
      conversationId,
      content,
      createdAt
    )
    if (result.newMessage._id) {
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
    console.log(result)
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
      console.log(result)
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
      console.log(result)
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
