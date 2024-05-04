import mongoose from 'mongoose'
import db from '../../db/db.js' // 导入之前创建的db对象

const channelSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  channel_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  }
})

const Channel = db.model('Channel', channelSchema, 'channels')

export default Channel
