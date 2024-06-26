import mongoose from 'mongoose'
import db from '../../db/db.js'

const commentSchema = new mongoose.Schema({
  // 1:文章评论 2:视频评论 3:评论回复 4:回复回复
  comment_type: {
    type: Number,
    require: true,
  },
  user_info: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  reply_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: {
    type: String,
    require: true,
  },
  created_time: {
    type: Number,
    require: true,
  },
  parent_comment: {
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
    enum: ['Article', 'Video', 'Comment'],
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
  status: {
    type: Number,
    default: 0,
  },
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
