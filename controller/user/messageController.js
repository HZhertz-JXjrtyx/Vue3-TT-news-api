import MessageModel from '../../model/user/messageModel.js'
import { sendChat, sendChatMessage } from '../../utils/sendMessage.js'
class MessageController {
  // 获取用户通知列表
  async getNotifyList(ctx) {
    const { _id: my_id } = ctx.state.user
    // console.log(my_id)
    const [commentRes, likeRes, followRes] = await Promise.all([
      MessageModel.getNotificationList(my_id, 'comment'),
      MessageModel.getNotificationList(my_id, 'like'),
      MessageModel.getNotificationList(my_id, 'follow'),
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
    const { _id: my_id } = ctx.state.user
    const { type, page, size } = ctx.request.query
    // console.log(my_id, type, page, size)
    const offset = (page - 1) * size
    const data = await MessageModel.getNotificationDetail(my_id, type, offset, parseInt(size))
    ctx.body = {
      type: 'success',
      status: 200,
      message: `获取${type}通知消息成功`,
      data,
    }
  }

  // 获取用户对话列表
  async getChatList(ctx) {
    const { _id: my_id } = ctx.state.user
    const { pre, size } = ctx.request.query
    console.log(my_id, pre, size)
    const data = await MessageModel.getConversationList(my_id, pre, size)
    ctx.body = {
      type: 'success',
      status: 200,
      message: ' 获取用户对话列表成功',
      data,
    }
  }
  // 获取对话消息内容
  async getChatDetail(ctx) {
    const { _id: my_id } = ctx.state.user
    const { conversationId } = ctx.request.query
    // console.log(my_id, conversationId)
    const data = await MessageModel.getConversationDetail(my_id, conversationId)
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
    // console.log(my_id, interlocutor)
    const addRes = await MessageModel.addConversation(my_id, interlocutor)
    // console.log(addRes)
    if (addRes._id) {
      const newConversation = await MessageModel.findConversation(addRes._id)
      await sendChat(my_id, interlocutor, newConversation)
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
    const { _id: my_id } = ctx.state.user
    const { receiverId, conversationId, content, createdAt } = ctx.request.body
    // console.log(my_id, receiverId, conversationId, content, createdAt)
    // 接收者列表中是否存在对话/对话对接受者是否可见
    const info = await MessageModel.findConversation(conversationId)
    const isVisible = info.participants.find((p) => String(p.user._id) === my_id).visible
    // console.log('isVisible:', isVisible)

    const addRes = await MessageModel.addConversationMessage(
      my_id,
      receiverId,
      conversationId,
      content,
      createdAt
    )
    // console.log('addRes', addRes)
    if (addRes._id) {
      const chatMessageInfo = await MessageModel.findMessage(addRes._id)
      if (isVisible) {
        await sendChatMessage(chatMessageInfo)
      } else {
        const conversationInfo = await MessageModel.findConversation(addRes.related_entity)
        await sendChat(my_id, addRes.receiver, conversationInfo)
      }

      ctx.body = {
        type: 'success',
        status: 200,
        message: '发送对话消息成功',
        data: chatMessageInfo,
      }
    }
  }
  // 获取未读消息总数
  async getUnreadTotalCount(ctx) {
    const { _id: my_id } = ctx.state.user
    const result = await MessageModel.getUnreadTotal(my_id)
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
    const { _id: my_id } = ctx.state.user
    const { messageType, conversationId } = ctx.request.body
    if (['comment', 'like', 'follow'].includes(messageType)) {
      const result = await MessageModel.clearUnreadNotify(my_id, messageType)
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
      const result = await MessageModel.clearUnreadChat(my_id, conversationId)
      // console.log('result', result)
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
