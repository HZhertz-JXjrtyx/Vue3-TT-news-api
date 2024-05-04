import mongoose from 'mongoose'

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 1 }
})

counterSchema.statics.getNextSequenceValue = async function (sequenceName) {
  const sequenceDocument = await this.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  )
  return sequenceDocument.sequence_value + 100002
}
counterSchema.statics.getNextAdminId = async function (sequenceName) {
  const sequenceDocument = await this.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  )
  return sequenceDocument.sequence_value + 1000002
}

const Counter = mongoose.model('Counter', counterSchema, 'counters')

export default Counter
