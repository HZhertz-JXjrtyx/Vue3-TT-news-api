import MessageModel from '../../model/user/messageModel.js'
import { sendChatMessage } from '../../utils/sendMessage.js'
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
    // console.log(my_id, pre, size)
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
      // const newConversation = await MessageModel.findConversation(addRes._id)

      ctx.body = {
        type: 'success',
        status: 200,
        message: '新增对话项成功',
        data: addRes,
      }
    }
  }

  // 新增对话消息
  async addChatMessage(ctx) {
    const { _id: my_id } = ctx.state.user
    const { receiverId, conversationId, content, createdAt } = ctx.request.body
    console.log(my_id, receiverId, conversationId, content, createdAt)

    const addRes = await MessageModel.addConversationMessage(
      my_id,
      receiverId,
      conversationId,
      content,
      createdAt
    )
    console.log('addRes', addRes)
    if (addRes._id) {
      const chatMessageInfo = await MessageModel.findMessage(addRes._id)

      const conversationInfo = await MessageModel.findConversation(addRes.related_entity)
      await sendChatMessage(my_id, String(addRes.receiver), conversationInfo, chatMessageInfo)

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
      ctx.body = {
        type: 'success',
        status: 200,
        message: '清除未读chat通知成功',
        clearCount: result.updMessageRes.modifiedCount,
      }
    }
  }
  // 删除对话项
  async deleteChat(ctx) {
    const { _id: my_id } = ctx.state.user
    const { conversationId } = ctx.request.query
    console.log(my_id, conversationId)
    // 处理未读
    const clearRes = await MessageModel.clearUnreadChat(my_id, conversationId)
    // 更新可见
    const deleteRes = await MessageModel.deleteConversation(my_id, conversationId)
    console.log(clearRes, deleteRes)
    ctx.body = {
      type: 'success',
      status: 200,
      message: '删除对话项成功',
      clearCount: clearRes.updMessageRes.modifiedCount,
    }
  }
}
export default new MessageController()
