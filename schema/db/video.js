import mongoose from 'mongoose'
import db from '../../db/db.js'

const videoSchema = new mongoose.Schema({
  channel_id: String,
  type: {
    type: String,
    default: 'video',
  },
  video_id: String,
  title: String,
  description: {
    type: String,
    default: '',
  },
  duration: Number,
  video_src: String,
  cover_src: String,
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

const Video = db.model('Video', videoSchema, 'videos')
export default Video
