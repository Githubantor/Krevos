import mongoose from 'mongoose'
const productSchema = new mongoose.Schema({
  pid: { type: Number, unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  original: { type: Number, min: 0 },
  image: { type: String, required: true },
  hover: { type: String },
  badge: { type: String, default: null },
  fabric: { type: String, default: 'Premium' },
  color: { type: String, default: '—' },
  category: { type: String, required: true, enum: ['polo','tshirt','premium','denim','joggers','hoodies','shacket','sweater','half-zip','spring-drop','collections'], default: 'tshirt' },
}, { timestamps: true })
productSchema.index({ category: 1 })
export default mongoose.model('Product', productSchema)
