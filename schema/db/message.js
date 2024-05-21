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
  related_content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  related_entity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entity_type',
    required: true,
  },
  entity_type: {
    type: String,
    enum: ['Article', 'Video', 'Comment', 'User', 'Conversation'],
    required: true,
  },
	related_work: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'work_type',
  },
  work_type: {
    type: String,
    enum: ['Article', 'Video'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
})

const Message = db.model('Message', messageSchema, 'messages')

export default Message
