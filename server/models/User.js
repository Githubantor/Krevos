import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // e.g. KVS-XXXXXX - visible customer ID
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true }, // hashed with simple method (no native bcrypt to keep Vercel compatible)
  address: { type: String, default: '' },
}, { timestamps: true })

userSchema.index({ email: 1 })
userSchema.index({ phone: 1 })

// hide password in JSON
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}

export default mongoose.model('User', userSchema)
