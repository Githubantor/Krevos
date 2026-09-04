import mongoose from 'mongoose'
const orderItemSchema = new mongoose.Schema({ productId: { type: mongoose.Schema.Types.Mixed }, name: { type: String, required: true }, price: { type: Number, required: true }, qty: { type: Number, default: 1 }, size: { type: String }, image: { type: String } }, { _id: false })
const customerSchema = new mongoose.Schema({ name: { type: String, required: true }, phone: { type: String, required: true }, email: { type: String }, address: { type: String } }, { _id: false })
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  customer: { type: customerSchema, required: true },
  userId: { type: String, default: null }, // KVS-XXXXXX linking to User.userId
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending','Confirmed','Cancelled','Shipped','Delivered'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['COD','bKash'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending','Paid','Failed','Unpaid'], default: 'Pending' },
  bkashNumber: { type: String, default: null },
  bkashTrxId: { type: String, default: null },
}, { timestamps: true })
orderSchema.index({ 'customer.phone': 1 })
orderSchema.index({ userId: 1 })
orderSchema.index({ date: -1 })
export default mongoose.model('Order', orderSchema)
