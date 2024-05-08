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
}
export default new MessageModel()
