import mongoose from 'mongoose'
import db from '../../db/db.js' // 导入之前创建的db对象

const admin_routeSchema = new mongoose.Schema({
  admin_status: Number,
  admin_pveg: String
})

const AdminRoute = db.model('admin_route', admin_routeSchema, 'admin_route')

export default AdminRoute
