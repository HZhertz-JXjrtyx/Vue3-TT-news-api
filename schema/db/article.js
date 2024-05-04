import mongoose from 'mongoose'
import db from '../../db/db.js'

const articleSchema = new mongoose.Schema({
  channel_id: String,
  type: {
    type: String,
    default: 'article',
  },
  article_id: {
    type: String,
    unique: true,
  },
  title: String,
  description: {
    type: String,
    default: '',
  },
  content: String,
  image_list: [String],
  cover_list: [String],
  publish_time: Number,
  keywords: {
    type: String,
    default: '',
  },
  ui_style: String,

  user_id: Number,
  view_count: {
    type: Number,
    default: 0,
  },
  collect_count: {
    type: Number,
    default: 0,
  },
  comment_count: {
    type: Number,
    default: 0,
  },
  like_count: {
    type: Number,
    default: 0,
  },
})

const Article = db.model('Article', articleSchema, 'articles')
export default Article
