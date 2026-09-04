import express from 'express'
import mongoose from 'mongoose'
import crypto from 'crypto'
import User from '../models/User.js'

const router = express.Router()
const isDb = () => mongoose.connection.readyState === 1
const memUsers = () => global.__MEM_USERS__ || (global.__MEM_USERS__ = [])

function hashPassword(pw) {
  // SHA256 with salt - lightweight, no native bcrypt needed (Vercel compatible)
  const salt = 'krevos_salt_2026'
  return crypto.createHash('sha256').update(pw + salt).digest('hex')
}

function genUserId() {
  return 'KVS-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900)
}

function sanitize(user) {
  if (!user) return null
  const { password, __v, ...rest } = user
  return rest
}

// POST /api/auth/register { name, phone, email, password, address }
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, address } = req.body
    if (!name || !phone || !email || !password) return res.status(400).json({ error: 'name, phone, email, password required' })
    if (!/^01[0-9]{9}$/.test(String(phone).trim())) return res.status(400).json({ error: 'Phone must be 01XXXXXXXXX (11 digits)' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) return res.status(400).json({ error: 'Invalid email' })
    if (String(password).length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' })

    const emailNorm = String(email).trim().toLowerCase()

    if (!isDb()) {
      const arr = memUsers()
      if (arr.find(u => u.email === emailNorm)) return res.status(409).json({ error: 'Email already registered — please login' })
      if (arr.find(u => u.phone === String(phone).trim())) return res.status(409).json({ error: 'Phone already registered' })
      const user = {
        _id: `mem-${Date.now()}`,
        userId: genUserId(),
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: emailNorm,
        password: hashPassword(String(password)),
        address: address ? String(address).trim() : '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      arr.push(user)
      return res.status(201).json({ ok: true, user: sanitize(user), token: `mem-${user.userId}` })
    }

    const existsEmail = await User.findOne({ email: emailNorm }).lean()
    if (existsEmail) return res.status(409).json({ error: 'Email already registered — please login' })
    const existsPhone = await User.findOne({ phone: String(phone).trim() }).lean()
    if (existsPhone) return res.status(409).json({ error: 'Phone already registered' })

    let userId = genUserId()
    // ensure unique
    for (let i = 0; i < 3; i++) {
      const found = await User.findOne({ userId }).lean()
      if (!found) break
      userId = genUserId()
    }

    const doc = await User.create({
      userId,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: emailNorm,
      password: hashPassword(String(password)),
      address: address ? String(address).trim() : '',
    })
    res.status(201).json({ ok: true, user: { _id: doc._id, userId: doc.userId, name: doc.name, phone: doc.phone, email: doc.email, address: doc.address, createdAt: doc.createdAt }, token: `mongo-${doc.userId}` })
  } catch (e) {
    console.error('register error', e)
    res.status(500).json({ error: 'Failed to register: ' + e.message })
  }
})

// POST /api/auth/login { emailOrPhone, password }  or { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, phone, emailOrPhone, password } = req.body
    const identifier = (emailOrPhone || email || phone || '').toString().trim().toLowerCase()
    if (!identifier || !password) return res.status(400).json({ error: 'email/phone and password required' })
    const hashed = hashPassword(String(password))

    if (!isDb()) {
      const arr = memUsers()
      const user = arr.find(u => u.email === identifier || u.phone === identifier || u.email === identifier.toLowerCase())
      if (!user) return res.status(401).json({ error: 'Account not found — please register' })
      if (user.password !== hashed) return res.status(401).json({ error: 'Incorrect password' })
      return res.json({ ok: true, user: sanitize(user), token: `mem-${user.userId}` })
    }

    // try email first then phone
    let user = await User.findOne({ email: identifier }).lean()
    if (!user) user = await User.findOne({ phone: identifier }).lean()
    // also try case where identifier is phone with different case (already lower)
    if (!user) return res.status(401).json({ error: 'Account not found — please register' })
    if (user.password !== hashed) return res.status(401).json({ error: 'Incorrect password' })
    const safe = { _id: user._id, userId: user.userId, name: user.name, phone: user.phone, email: user.email, address: user.address, createdAt: user.createdAt }
    res.json({ ok: true, user: safe, token: `mongo-${user.userId}` })
  } catch (e) {
    console.error('login error', e)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// GET /api/auth/users - list users (for admin cluster view) + GET /api/auth/me?email=
router.get('/users', async (_req, res) => {
  try {
    if (!isDb()) {
      const arr = memUsers()
      return res.json(arr.map(sanitize).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    }
    const users = await User.find().sort({ createdAt: -1 }).lean()
    res.json(users.map(u => ({ _id: u._id, userId: u.userId, name: u.name, phone: u.phone, email: u.email, address: u.address, createdAt: u.createdAt })))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/me', async (req, res) => {
  try {
    const { email, phone, userId } = req.query
    if (!email && !phone && !userId) return res.status(400).json({ error: 'email or phone or userId required' })
    if (!isDb()) {
      const arr = memUsers()
      let u = null
      if (email) u = arr.find(x => x.email === String(email).toLowerCase())
      if (!u && phone) u = arr.find(x => x.phone === String(phone))
      if (!u && userId) u = arr.find(x => x.userId === String(userId))
      if (!u) return res.status(404).json({ error: 'User not found' })
      return res.json({ ok: true, user: sanitize(u) })
    }
    let u = null
    if (email) u = await User.findOne({ email: String(email).toLowerCase() }).lean()
    if (!u && phone) u = await User.findOne({ phone: String(phone) }).lean()
    if (!u && userId) u = await User.findOne({ userId: String(userId) }).lean()
    if (!u) return res.status(404).json({ error: 'User not found' })
    res.json({ ok: true, user: { _id: u._id, userId: u.userId, name: u.name, phone: u.phone, email: u.email, address: u.address, createdAt: u.createdAt } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
