import mongoose from 'mongoose'
import db from '../../db/db.js' // 导入之前创建的db对象

const routeSchema = new mongoose.Schema({
  id: Number,
  parentId: Number,
  level: Number,
  path: String,
  name: String,
  component: String,
  icon: String,
  link: String
})

const Route = db.model('Route', routeSchema, 'routes')

export default Route
