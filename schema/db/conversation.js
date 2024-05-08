import mongoose from 'mongoose'
import db from '../../db/db.js'

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
      },
      visible: {
        type: Boolean,
        default: true,
      },
      unread_count: {
        type: Number,
        default: 0,
      },
      last_invisible_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
      last_visible_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    },
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  ],
})

const Conversation = db.model('Conversation', conversationSchema, 'conversations')

export default Conversation