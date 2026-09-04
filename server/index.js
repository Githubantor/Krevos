import dns from 'dns'
if (!process.env.VERCEL) { try { dns.setServers(['8.8.8.8','1.1.1.1','8.8.4.4']) } catch {} }
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import clusterRoutes from './routes/cluster.js'
import authRoutes from './routes/auth.js'
import Product from './models/Product.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) { console.error('❌ MONGODB_URI missing in .env'); process.exit(1) }
global.__MEM_PRODUCTS__ = global.__MEM_PRODUCTS__ || []
global.__MEM_ORDERS__ = global.__MEM_ORDERS__ || []
global.__MEM_USERS__ = global.__MEM_USERS__ || []
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use((req,_res,next)=>{ console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); next() })
app.get('/api/health', (_req,res)=>{
  const st=mongoose.connection.readyState
  const m=['disconnected','connected','connecting','disconnecting']
  res.json({ok:true,db:m[st]||st,host:mongoose.connection.host||null,name:mongoose.connection.name||null,uptime:process.uptime(),time:new Date().toISOString()})
})
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/cluster', clusterRoutes)
app.use('/api/auth', authRoutes)
app.get('/api/stats', async (_req,res)=>{
  try{
    if(mongoose.connection.readyState!==1){
      const tp=global.__MEM_PRODUCTS__.length
      const ord=global.__MEM_ORDERS__
      return res.json({totalProducts:tp,totalOrders:ord.length,totalSell:ord.reduce((s,o)=>s+(o.total||0),0),mode:'memory'})
    }
    const tp=await Product.countDocuments()
    const Order=(await import('./models/Order.js')).default
    const ord=await Order.find().lean()
    res.json({totalProducts:tp,totalOrders:ord.length,totalSell:ord.reduce((s,o)=>s+(o.total||0),0),mode:'mongo',db:mongoose.connection.name})
  }catch(e){ res.status(500).json({error:e.message})}
})
const distPath=path.join(__dirname,'../dist')
app.use(express.static(distPath))
app.get(/^\/(?!api).*/, (_req,res)=> res.sendFile(path.join(distPath,'index.html')))

async function seedIfEmpty(){
  if(mongoose.connection.readyState!==1){
    if(global.__MEM_PRODUCTS__.length===0){
      global.__MEM_PRODUCTS__.push({_id:'mem-9001',pid:9001,name:'Drop Shoulder T-Shirt — White',price:1299,original:1599,image:'https://buri.ltd/cdn/shop/files/SM10925_10_6d267aef-b9a9-49d5-86bc-f682536db4ee.png?v=1772606974&width=600',hover:'https://buri.ltd/cdn/shop/files/SM10925_7_faaf733f-ff5a-4c7b-adc8-00bd634b25c8.png?v=1772606974&width=600',badge:'-19%',fabric:'Cotton Blend 220GSM',color:'White',category:'tshirt',createdAt:new Date()})
    }
    return
  }
  try{
    const c=await Product.countDocuments()
    if(c===0){
      console.log('🌱 Seeding initial product...')
      await Product.create({pid:9001,name:'Drop Shoulder T-Shirt — White',price:1299,original:1599,image:'https://buri.ltd/cdn/shop/files/SM10925_10_6d267aef-b9a9-49d5-86bc-f682536db4ee.png?v=1772606974&width=600',hover:'https://buri.ltd/cdn/shop/files/SM10925_7_faaf733f-ff5a-4c7b-adc8-00bd634b25c8.png?v=1772606974&width=600',badge:'-19%',fabric:'Cotton Blend 220GSM',color:'White',category:'tshirt'})
      console.log('✅ Seeded 1 product')
    } else console.log(`📦 Products exist: ${c}`)
  }catch(e){ console.error('Seed failed',e)}
}
const URIS=[process.env.MONGODB_URI,process.env.MONGODB_URI_FALLBACK,'mongodb://antor1234:gLtCjLFlziknQ5vC@ac-qfqjcqh-shard-00-00.ify2tzs.mongodb.net:27017,ac-qfqjcqh-shard-00-01.ify2tzs.mongodb.net:27017,ac-qfqjcqh-shard-00-02.ify2tzs.mongodb.net:27017/krevos?ssl=true&replicaSet=atlas-egobpd-shard-0&authSource=admin&retryWrites=true&w=majority'].filter(Boolean)
async function connectWithFallback(){
  const dbName=process.env.MONGODB_DB||'krevos'
  for(const uri of URIS){
    try{
      console.log(`🔌 Trying MongoDB... ${uri.replace(/:.*@/,':***@').slice(0,80)}...`)
      await mongoose.connect(uri,{dbName,appName:'KREVOS.Store',serverSelectionTimeoutMS:8000})
      console.log(`✅ MongoDB connected [${mongoose.connection.host}] db=${mongoose.connection.name}`)
      return true
    }catch(err){
      console.warn(`⚠️ Mongo attempt failed: ${err.message.slice(0,200)}`)
      try{ await mongoose.connection.close()}catch{}
    }
  }
  console.warn('⚠️ All Mongo URIs failed — MEMORY fallback (site still functional). Fix: correct MONGODB_URI and 0.0.0.0/0')
  return false
}
async function start(){
  app.listen(PORT,'0.0.0.0',()=>{ console.log(`🚀 KREVOS.Store API + Frontend http://localhost:${PORT}`); console.log(`   - Health: http://localhost:${PORT}/api/health`); console.log(`   - Cluster (every data): http://localhost:${PORT}/api/cluster`); console.log(`   - Products: http://localhost:${PORT}/api/products`)})
  console.log('🔌 Connecting to MongoDB (with fallback)...')
  const ok=await connectWithFallback()
  await seedIfEmpty()
  if(!ok) setInterval(async()=>{ if(mongoose.connection.readyState===1) return; console.log('🔄 Retrying Mongo...'); const r=await connectWithFallback(); if(r) await seedIfEmpty()},30000)
}
process.on('SIGINT', async()=>{ await mongoose.connection.close(); process.exit(0)})
process.on('SIGTERM', async()=>{ await mongoose.connection.close(); process.exit(0)})
mongoose.connection.on('error',e=>console.error('Mongo error',e))
mongoose.connection.on('disconnected',()=>console.warn('Mongo disconnected'))
start()
