import mongoose from 'mongoose'
import db from '../../db/db.js' // 导入之前创建的db对象

const checkCountSchema = new mongoose.Schema({
  name: String,
  count: Number
})

const CheckCount = db.model('checkCount', checkCountSchema, 'check_count')

export default CheckCount
