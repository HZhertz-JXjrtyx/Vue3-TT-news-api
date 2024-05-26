import mongoose from 'mongoose'
import db from '../../db/db.js'

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      _id: false,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
      },
      visible: {
        type: Boolean,
        default: false,
      },
      unread_count: {
        type: Number,
        default: 0,
      },
      last_invisible_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
      },
      last_visible_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
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
