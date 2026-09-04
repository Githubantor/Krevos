import express from 'express'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
const router=express.Router()
const isDb=()=>mongoose.connection.readyState===1
const mem=()=>global.__MEM_ORDERS__||(global.__MEM_ORDERS__=[])
router.get('/', async (req,res)=>{
  try{
    const { phone, email, userId } = req.query
    if(!isDb()){
      const arr=mem(); let filtered=[...arr]
      if(phone) filtered=filtered.filter(o=>o.customer.phone===String(phone))
      if(email) filtered=filtered.filter(o=>o.customer.email===String(email).toLowerCase())
      if(userId) filtered=filtered.filter(o=>o.userId===String(userId))
      const s=filtered.sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt))
      return res.json(s.map(o=>({id:o.orderId,orderId:o.orderId,_id:o._id,date:new Date(o.date).toISOString(),customer:o.customer,userId:o.userId||null,items:o.items,total:o.total,status:o.status,paymentMethod:o.paymentMethod||'COD',paymentStatus:o.paymentStatus||'Pending',bkashNumber:o.bkashNumber||null,bkashTrxId:o.bkashTrxId||null,createdAt:o.createdAt})))
    }
    const filter={}
    if(phone) filter['customer.phone']=String(phone)
    if(email) filter['customer.email']=String(email).toLowerCase()
    if(userId) filter.userId=String(userId)
    const orders=await Order.find(filter).sort({createdAt:-1}).lean()
    res.json(orders.map(o=>({id:o.orderId,orderId:o.orderId,_id:o._id,date:o.date?o.date.toISOString():o.createdAt.toISOString(),customer:o.customer,userId:o.userId||null,items:o.items,total:o.total,status:o.status,paymentMethod:o.paymentMethod||'COD',paymentStatus:o.paymentStatus||'Pending',bkashNumber:o.bkashNumber||null,bkashTrxId:o.bkashTrxId||null,createdAt:o.createdAt})))
  }catch(e){ res.status(500).json({error:'Failed to fetch orders'})}
})
router.post('/', async (req,res)=>{
  try{
    const {customer,items,total,status,userId,paymentMethod,bkashNumber,bkashTrxId}=req.body
    if(!customer||!customer.name||!customer.phone) return res.status(400).json({error:'customer.name and customer.phone required'})
    if(!Array.isArray(items)||!items.length) return res.status(400).json({error:'items required'})
    if(total==null) return res.status(400).json({error:'total required'})
    const pm = (paymentMethod==='bKash' || paymentMethod==='Bkash') ? 'bKash' : 'COD'
    const pStatus = pm==='bKash' ? 'Paid' : 'Pending'
    if(pm==='bKash'){
      if(!bkashTrxId || String(bkashTrxId).trim().length < 6) return res.status(400).json({error:'bKash Transaction ID (TrxID) required — at least 6 characters'})
      if(bkashNumber && !/^01[0-9]{9}$/.test(String(bkashNumber))) return res.status(400).json({error:'bKash number must be 01XXXXXXXXX'})
    }
    // enforce login: userId OR customer.email must map to existing user
    const uid = userId || customer.userId || null
    const orderId=req.body.id||req.body.orderId||'CRS-'+Date.now().toString().slice(-6)
    if(!isDb()){
      const arr=mem()
      // if uid provided, validate it exists in memory users
      let validatedUid = null
      let validatedRef = null
      if(uid){
        const users = global.__MEM_USERS__ || []
        const u = users.find(x=> x.userId===String(uid) || String(x._id)===String(uid))
        if(u){ validatedUid = u.userId; validatedRef = u._id }
      } else if(customer.email){
        const users = global.__MEM_USERS__ || []
        const u = users.find(x=> x.email===String(customer.email).toLowerCase())
        if(u){ validatedUid = u.userId; validatedRef = u._id }
      }
      let fid=orderId; let t=0; while(t<3&&arr.find(o=>o.orderId===fid)){ fid='CRS-'+Date.now().toString().slice(-6)+Math.floor(Math.random()*9); t++}
      const doc={orderId:fid,_id:`mem-${Date.now()}`,date:new Date(),createdAt:new Date(),customer:{name:String(customer.name).trim(),phone:String(customer.phone).trim(),email:customer.email?String(customer.email).trim():'',address:customer.address?String(customer.address).trim():''},userId:validatedUid, userRef:validatedRef, items:items.map(it=>({productId:it._id||it.id||it.productId,name:it.name,price:Number(it.price)||0,qty:Number(it.qty)||1,size:it.size||'',image:it.image||''})),total:Number(total)||0,status:status||'Pending',paymentMethod:pm,paymentStatus:pStatus,bkashNumber: pm==='bKash' ? String(bkashNumber||'').trim() : null,bkashTrxId: pm==='bKash' ? String(bkashTrxId||'').trim() : null}
      arr.unshift(doc); return res.status(201).json({id:doc.orderId,orderId:doc.orderId,_id:doc._id,date:doc.date.toISOString(),customer:doc.customer,userId:doc.userId,items:doc.items,total:doc.total,status:doc.status,paymentMethod:doc.paymentMethod,paymentStatus:doc.paymentStatus,bkashNumber:doc.bkashNumber,bkashTrxId:doc.bkashTrxId})
    }
    // Mongo: try to resolve user
    let resolvedUserId = null
    let resolvedRef = null
    if(uid){
      try{
        const User = (await import('../models/User.js')).default
        let u = await User.findOne({ userId: String(uid) }).lean()
        if(!u) try{ u = await User.findById(uid).lean() }catch{}
        if(u){ resolvedUserId = u.userId; resolvedRef = u._id }
      }catch{}
    }
    if(!resolvedUserId && customer.email){
      try{
        const User = (await import('../models/User.js')).default
        const u = await User.findOne({ email: String(customer.email).toLowerCase() }).lean()
        if(u){ resolvedUserId = u.userId; resolvedRef = u._id }
      }catch{}
    }
    let fid=orderId; let t=0; while(t<3){ const ex=await Order.findOne({orderId:fid}).lean(); if(!ex) break; fid='CRS-'+Date.now().toString().slice(-6)+Math.floor(Math.random()*9); t++}
    const doc=await Order.create({orderId:fid,date:new Date(),customer:{name:String(customer.name).trim(),phone:String(customer.phone).trim(),email:customer.email?String(customer.email).trim():'',address:customer.address?String(customer.address).trim():''},userId:resolvedUserId, userRef:resolvedRef, items:items.map(it=>({productId:it._id||it.id||it.productId,name:it.name,price:Number(it.price)||0,qty:Number(it.qty)||1,size:it.size||'',image:it.image||''})),total:Number(total)||0,status:status||'Pending',paymentMethod:pm,paymentStatus:pStatus,bkashNumber: pm==='bKash' ? String(bkashNumber||'').trim() : null,bkashTrxId: pm==='bKash' ? String(bkashTrxId||'').trim() : null})
    res.status(201).json({id:doc.orderId,orderId:doc.orderId,_id:doc._id,date:doc.date.toISOString(),customer:doc.customer,userId:doc.userId,items:doc.items,total:doc.total,status:doc.status,paymentMethod:doc.paymentMethod,paymentStatus:doc.paymentStatus,bkashNumber:doc.bkashNumber,bkashTrxId:doc.bkashTrxId})
  }catch(e){ console.error(e); res.status(500).json({error:'Failed to create order'})}
})
router.patch('/:id', async (req,res)=>{
  try{
    const {id}=req.params; const {status, paymentStatus, paymentMethod, bkashTrxId, bkashNumber}=req.body;
    const updates={}
    if(status){
      const allowed=['Pending','Confirmed','Cancelled','Shipped','Delivered']; if(!allowed.includes(status)) return res.status(400).json({error:'invalid status'})
      updates.status=status
    }
    if(paymentStatus){
      const allowedP=['Pending','Paid','Failed','Unpaid']; if(!allowedP.includes(paymentStatus)) return res.status(400).json({error:'invalid paymentStatus'})
      updates.paymentStatus=paymentStatus
    }
    if(paymentMethod){ updates.paymentMethod = paymentMethod==='bKash' ? 'bKash' : 'COD' }
    if(bkashTrxId!==undefined) updates.bkashTrxId=String(bkashTrxId).trim()
    if(bkashNumber!==undefined) updates.bkashNumber=String(bkashNumber).trim()
    if(Object.keys(updates).length===0) return res.status(400).json({error:'no fields to update'})
    if(!isDb()){ const arr=mem(); const o=arr.find(x=>x.orderId===id||String(x._id)===String(id)); if(!o) return res.status(404).json({error:'Order not found'}); Object.assign(o, updates); return res.json({id:o.orderId,orderId:o.orderId,_id:o._id,date:new Date(o.date).toISOString(),customer:o.customer,userId:o.userId,items:o.items,total:o.total,status:o.status,paymentMethod:o.paymentMethod,paymentStatus:o.paymentStatus,bkashNumber:o.bkashNumber,bkashTrxId:o.bkashTrxId})}
    let o=await Order.findOneAndUpdate({orderId:id},updates,{new:true}); if(!o) try{ o=await Order.findByIdAndUpdate(id,updates,{new:true})}catch{}
    if(!o) return res.status(404).json({error:'Order not found'}); res.json({id:o.orderId,orderId:o.orderId,_id:o._id,date:o.date.toISOString(),customer:o.customer,userId:o.userId,items:o.items,total:o.total,status:o.status,paymentMethod:o.paymentMethod,paymentStatus:o.paymentStatus,bkashNumber:o.bkashNumber,bkashTrxId:o.bkashTrxId})
  }catch(e){ console.error(e); res.status(500).json({error:'Failed to update'})}
})
router.delete('/:id', async (req,res)=>{
  try{
    const {id}=req.params
    if(!isDb()){ const arr=mem(); const idx=arr.findIndex(o=>o.orderId===id||String(o._id)===String(id)); if(idx===-1) return res.status(404).json({error:'Order not found'}); arr.splice(idx,1); return res.json({success:true})}
    let d=await Order.findOneAndDelete({orderId:id}); if(!d) try{ d=await Order.findByIdAndDelete(id)}catch{}
    if(!d) return res.status(404).json({error:'Order not found'}); res.json({success:true})
  }catch(e){ res.status(500).json({error:'Failed to delete'})}
})
router.delete('/', async (req,res)=>{
  try{ if(!isDb()){ global.__MEM_ORDERS__=[]; return res.json({success:true}) } await Order.deleteMany({}); res.json({success:true}) }catch(e){ res.status(500).json({error:'Failed to clear'})}
})
export default router
