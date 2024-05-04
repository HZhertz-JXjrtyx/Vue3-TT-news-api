import mongoose from 'mongoose'
import db from '../../db/db.js' // 导入之前创建的db对象

const access_recordSchema = new mongoose.Schema({
  user_id: Number,
  access_date: String
})

const AccessRecord = db.model('access_record', access_recordSchema, 'access_record')

export default AccessRecord
