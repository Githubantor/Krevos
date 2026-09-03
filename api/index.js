import dns from 'dns'
if (!process.env.VERCEL) { try { dns.setServers(['8.8.8.8','1.1.1.1','8.8.4.4']) } catch {} }
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import Product from '../server/models/Product.js'
import Order from '../server/models/Order.js'
import productRoutes from '../server/routes/products.js'
import orderRoutes from '../server/routes/orders.js'
import clusterRoutes from '../server/routes/cluster.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// health + cluster + stats
app.get('/api/health', (_req,res)=>{
  const st=mongoose.connection.readyState
  const m=['disconnected','connected','connecting','disconnecting']
  res.json({ok:true,db:m[st]||st,host:mongoose.connection.host||null,name:mongoose.connection.name||null,time:new Date().toISOString()})
})
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/cluster', clusterRoutes)
app.get('/api/stats', async (_req,res)=>{
  try{
    if(mongoose.connection.readyState!==1){
      const tp=global.__MEM_PRODUCTS__?.length||0
      const ord=global.__MEM_ORDERS__||[]
      return res.json({totalProducts:tp,totalOrders:ord.length,totalSell:ord.reduce((s,o)=>s+(o.total||0),0),mode:'memory'})
    }
    const tp=await Product.countDocuments()
    const ord=await Order.find().lean()
    res.json({totalProducts:tp,totalOrders:ord.length,totalSell:ord.reduce((s,o)=>s+(o.total||0),0),mode:'mongo',db:mongoose.connection.name})
  }catch(e){ res.status(500).json({error:e.message})}
})

// Mongo connect (cached for serverless)
global.__MEM_PRODUCTS__ = global.__MEM_PRODUCTS__ || []
global.__MEM_ORDERS__ = global.__MEM_ORDERS__ || []
let isConnecting=false
const URIS=[process.env.MONGODB_URI,process.env.MONGODB_URI_FALLBACK,'mongodb://antor1234:gLtCjLFlziknQ5vC@ac-qfqjcqh-shard-00-00.ify2tzs.mongodb.net:27017,ac-qfqjcqh-shard-00-01.ify2tzs.mongodb.net:27017,ac-qfqjcqh-shard-00-02.ify2tzs.mongodb.net:27017/crevos?ssl=true&replicaSet=atlas-egobpd-shard-0&authSource=admin&retryWrites=true&w=majority'].filter(Boolean)
async function connect(){
  if(mongoose.connection.readyState===1) return true
  if(isConnecting) return false
  isConnecting=true
  const dbName=process.env.MONGODB_DB||'crevos'
  for(const uri of URIS){
    try{
      console.log(`🔌 Vercel trying Mongo ${uri.replace(/:.*@/,':***@').slice(0,70)}...`)
      await mongoose.connect(uri,{dbName,appName:'Crevos.Store',serverSelectionTimeoutMS:5000})
      console.log('✅ Vercel Mongo connected',mongoose.connection.name)
      if((await Product.countDocuments())===0){
        await Product.create({pid:9001,name:'Drop Shoulder T-Shirt — White',price:1299,original:1599,image:'https://buri.ltd/cdn/shop/files/SM10925_10_6d267aef-b9a9-49d5-86bc-f682536db4ee.png?v=1772606974&width=600',hover:'https://buri.ltd/cdn/shop/files/SM10925_7_faaf733f-ff5a-4c7b-adc8-00bd634b25c8.png?v=1772606974&width=600',badge:'-19%',fabric:'Cotton Blend 220GSM',color:'White',category:'tshirt'})
      }
      isConnecting=false
      return true
    }catch(e){ console.warn('Vercel Mongo failed',e.message.slice(0,300)); try{await mongoose.connection.close()}catch{} }
  }
  console.warn('⚠️ Vercel all Mongo failed — memory fallback')
  isConnecting=false
  return false
}
connect().catch(()=>{})
// ensure every request tries to connect if disconnected
app.use(async (_req,_res,next)=>{ if(mongoose.connection.readyState!==1 && !isConnecting) await connect(); next() })

export default app
