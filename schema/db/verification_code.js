import mongoose from 'mongoose'
import db from '../../db/db.js' // 导入之前创建的db对象

const codeSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  verification_code: {
    type: Number,
    required: true
  },
  createdAt: { type: Date, default: Date.now }
})
codeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 })
const Code = db.model('Code', codeSchema, 'verification_code')
export default Code
