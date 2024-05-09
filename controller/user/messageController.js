import MessageModel from '../../model/user/messageModel.js'
class MessageController {
  // 获取用户通知列表
  async getNotifyList(ctx) {
    const { userId } = ctx.request.query
    console.log(userId)
    const [commentRes, likeRes, followRes] = await Promise.all([
      MessageModel.getNotificationList(userId, 'comment'),
      MessageModel.getNotificationList(userId, 'like'),
      MessageModel.getNotificationList(userId, 'follow'),
    ])
    // const data = await MessageModel.getNotificationList(userId)
    console.log(commentRes, likeRes, followRes)

    ctx.body = {
      type: 'success',
      status: 200,
      message: '获取用户通知列表成功',
      data: {
        comment: {
          last_message: commentRes.notifications.at(-1),
          unReadCount: commentRes.unReadCount,
        },
        like: {
          last_message: likeRes.notifications.at(-1),
          unReadCount: likeRes.unReadCount,
        },
        follow: {
          last_message: followRes.notifications.at(-1),
          unReadCount: followRes.unReadCount,
        },
      },
    }
  }
  // 获取通知消息内容
  async getNotifyDetail(ctx) {
    const { userId, type } = ctx.request.query
    console.log(userId)
    const data = await MessageModel.getNotificationList(userId, type)
    console.log(data)

    ctx.body = {
      type: 'success',
      status: 200,
      message: `获取${type}通知列表成功`,
      data,
    }
  }
  // 获取用户对话列表
  async getChatList(ctx) {
    const { userId } = ctx.request.query
    console.log(userId)
    const data = await MessageModel.getConversationList(userId)
    console.log(data)
    ctx.body = {
      type: 'success',
      status: 200,
      message: ' 获取用户对话列表成功',
      data,
    }
  }
  // 获取对话消息内容
  async getChatDetail(ctx) {
    const { userId, conversationId } = ctx.request.query
    console.log(userId, conversationId)
    const data = await MessageModel.getConversationDetail(userId, conversationId)
    console.log(data)

    ctx.body = {
      type: 'success',
      status: 200,
      message: '获取对话消息内容',
      data,
    }
  }
}
export default new MessageController()
