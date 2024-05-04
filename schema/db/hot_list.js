import mongoose from 'mongoose'
import db from '../../db/db.js'
const hotListSchema = new mongoose.Schema({
  ClusterId: Number,
  Title: String,
  LabelUrl: String,
  Label: String,
  Url: String,
  HotValue: String,
  ImageUrl: String,
  LabelDesc: String,
  Type: String,
  VideoId: String,
  AuthorInfo: {
    user_id: Number,
    source_id: String,
  },
})

const HotList = db.model('HotList', hotListSchema, 'hot_list')

export default HotList
