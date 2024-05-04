import mongoose from 'mongoose'
import db from '../../db/db.js'
import Counter from './counter.js'

export const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true,
  },
  source_id: {
    type: String,
    default: '',
  },
  user_name: {
    type: String,
    required: true,
    unique: true,
  },
  user_nickname: {
    type: String,
    default: '@nickname',
  },
  user_avatar: {
    type: String,
    default: 'http://127.0.0.1:3007/other/image/user.png',
  },
  user_gender: {
    type: Number,
    default: 2,
  },
  user_intro: {
    type: String,
    default: '',
  },
  user_verified: {
    type: Boolean,
    default: false,
  },
  verified_content: {
    type: String,
    default: '',
  },
  user_password: {
    type: String,
    default: '$2a$10$NESWQAk4mCgU1WqNLtX0Gu6w1tSrFDEQY68LxHi2A1.m/R.vIe4/u',
  },
  user_email: {
    type: String,
    default: '',
  },
  user_phone: {
    type: String,
    default: '',
  },
  user_state: {
    type: Number,
    default: 0,
  },
  browse: {
    article: [String],
    video: [String],
  },
  like: {
    article: [String],
    video: [String],
    comment: [String],
  },
  collect: {
    article: [String],
    video: [String],
  },
  fans: [Number],
  followers: [Number],
  comment: [String],
  message: [String],
  works_count: {
    type: Number,
    default: 0,
  },
  fans_count: {
    type: Number,
    default: 0,
  },
  followers_count: {
    type: Number,
    default: 0,
  },
  comment_count: {
    type: Number,
    default: 0,
  },
  likes_count: {
    type: Number,
    default: 0,
  },
  channel: {
    selected: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    unselected: {
      type: [Number],
      default: [8, 9, 10, 11, 12, 13, 14, 15],
    },
  },
})

userSchema.pre('save', async function (next) {
  const user = this

  if (!user.isNew || user.user_id) {
    return next()
  }
  try {
    if (!user.user_id) {
      user.user_id = await Counter.getNextSequenceValue('user_id') // rid是你需要自增的属性
    }
  } catch (err) {
    next(err)
  }
})

const User = db.model('User', userSchema, 'users')

export default User
