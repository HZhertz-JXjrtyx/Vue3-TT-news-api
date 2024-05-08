import mongoose from 'mongoose'
import db from '../../db/db.js'

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Number,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['comment', 'like', 'follow', 'chat'],
    default: 'chat',
  },
  related_entity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel',
    required: true,
  },
  onModel: {
    type: String,
    enum: ['Article', 'Video', 'Comment', 'User', 'Conversation'],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
})

const Message = db.model('Message', messageSchema, 'messages')

export default Message
