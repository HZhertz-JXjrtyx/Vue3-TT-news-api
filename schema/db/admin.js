import mongoose from 'mongoose'
import db from '../../db/db.js' // 导入之前创建的db对象
import Counter from './counter.js'

export const adminSchema = new mongoose.Schema({
  admin_id: {
    type: Number,
    unique: true
  },
  admin_name: {
    type: String,
    required: true,
    unique: true
  },
  admin_password: {
    type: String
  },
  admin_nickname: {
    type: String,
    default: 'nickname'
  },
  admin_avatar: {
    type: String,
    default: 'http://127.0.0.1:3007/admin_avatar/admin.png'
  },
  admin_email: {
    type: String,
    default: 'xxx@XXX.com'
  },
  admin_status: {
    type: Number,
    default: 1
  },
  admin_pveg: {
    type: String,
    default: '1,2,3,4,5,6,10,11,12,13,14'
  }
})

adminSchema.pre('save', async function (next) {
  const admin = this

  if (!admin.isNew || admin.admin_id) {
    return next()
  }
  try {
    if (!admin.admin_id) {
      admin.admin_id = await Counter.getNextAdminId('admin_id') // rid是你需要自增的属性
    }
  } catch (err) {
    next(err)
  }
})

const Admin = db.model('Admin', adminSchema, 'administrators')

export default Admin
