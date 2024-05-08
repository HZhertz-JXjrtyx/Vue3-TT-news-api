import MessageModel from '../../model/user/messageModel.js'
class MessageController {
  // 获取对话列表
  async getChatList(ctx) {
    const { userId } = ctx.request.query
    console.log(userId)
    const data = await MessageModel.getConversationList(userId)
    console.log(data)
    ctx.body = {
      type: 'success',
      status: 200,
      message: ' 获取对话列表成功',
      data,
    }
  }
}
export default new MessageController()
