import dns from 'dns'
try { dns.setServers(['8.8.8.8','1.1.1.1','8.8.4.4']) } catch {}
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
async function connect(){
  if(mongoose.connection.readyState===1) return
  if(isConnecting) return
  isConnecting=true
  const uri=process.env.MONGODB_URI
  if(!uri){ console.warn('MONGODB_URI missing'); isConnecting=false; return }
  try{
    await mongoose.connect(uri,{dbName:process.env.MONGODB_DB||'crevos', appName:'Crevos.Store', serverSelectionTimeoutMS:5000})
    console.log('✅ Mongo connected',mongoose.connection.name)
    if((await Product.countDocuments())===0){
      await Product.create({pid:9001,name:'Drop Shoulder T-Shirt — White',price:1299,original:1599,image:'https://buri.ltd/cdn/shop/files/SM10925_10_6d267aef-b9a9-49d5-86bc-f682536db4ee.png?v=1772606974&width=600',hover:'https://buri.ltd/cdn/shop/files/SM10925_7_faaf733f-ff5a-4c7b-adc8-00bd634b25c8.png?v=1772606974&width=600',badge:'-19%',fabric:'Cotton Blend 220GSM',color:'White',category:'tshirt'})
    }
  }catch(e){ console.warn('Mongo connect failed',e.message)}
  isConnecting=false
}
connect().catch(()=>{})

export default app
