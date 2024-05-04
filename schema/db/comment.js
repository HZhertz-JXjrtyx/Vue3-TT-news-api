import mongoose from 'mongoose'
import db from '../../db/db.js'

const commentSchema = new mongoose.Schema({
  comment_id: {
    type: String,
    unique: true,
  },
  user_id: Number,
  content: String,
  publish_time: Number,
  type: Number,
  source_id: String,
  reply_user: Number,
  like_count: {
    type: Number,
    default: 0,
  },
  reply_count: {
    type: Number,
    default: 0,
  },
})

const Comment = db.model('Comment', commentSchema, 'comments')

export default Comment
