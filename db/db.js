import mongoose from 'mongoose'

mongoose.connect('mongodb://127.0.0.1:27017/TT_news', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', function () {
  console.log('Successfully connected to MongoDB database.')
})

export default db