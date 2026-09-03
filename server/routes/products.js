import express from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
const router = express.Router()
const isDb = () => mongoose.connection.readyState === 1
const mem = () => global.__MEM_PRODUCTS__ || (global.__MEM_PRODUCTS__ = [])
router.get('/', async (req,res)=>{
  try{
    if(!isDb()){
      const arr=mem()
      const {category}=req.query
      const f=category?arr.filter(p=>p.category===category):arr
      return res.json([...f].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(p=>({id:p.pid||p._id,_id:p._id,pid:p.pid,name:p.name,price:p.price,original:p.original??p.price,image:p.image,hover:p.hover||p.image,badge:p.badge,fabric:p.fabric,color:p.color,category:p.category,createdAt:p.createdAt})))
    }
    const {category}=req.query
    const filter=category?{category}:{}
    const products=await Product.find(filter).sort({createdAt:-1}).lean()
    res.json(products.map(p=>({id:p.pid||p._id,_id:p._id,pid:p.pid,name:p.name,price:p.price,original:p.original??p.price,image:p.image,hover:p.hover||p.image,badge:p.badge,fabric:p.fabric,color:p.color,category:p.category,createdAt:p.createdAt})))
  }catch(e){ console.error(e); res.status(500).json({error:'Failed to fetch products'})}
})
router.post('/', async (req,res)=>{
  try{
    const {name,price,original,image,hover,badge,fabric,color,category,id,pid}=req.body
    if(!name||price==null||!image) return res.status(400).json({error:'name, price, image required'})
    const priceNum=Number(price); if(isNaN(priceNum)) return res.status(400).json({error:'price must be number'})
    const orig=original!=null&&original!==''?Number(original):priceNum
    if(!isDb()){
      const arr=mem()
      const doc={_id:`mem-${Date.now()}`,pid:Number(pid||id||Date.now()),name:String(name).trim(),price:priceNum,original:isNaN(orig)?priceNum:orig,image:String(image).trim(),hover:hover?String(hover).trim():String(image).trim(),badge:badge?String(badge).trim():null,fabric:fabric?String(fabric).trim():'Premium',color:color?String(color).trim():'—',category:category||'tshirt',createdAt:new Date()}
      arr.unshift(doc)
      return res.status(201).json({id:doc.pid||doc._id,_id:doc._id,pid:doc.pid,name:doc.name,price:doc.price,original:doc.original,image:doc.image,hover:doc.hover,badge:doc.badge,fabric:doc.fabric,color:doc.color,category:doc.category})
    }
    const doc=await Product.create({pid:pid||id||Date.now(),name:String(name).trim(),price:priceNum,original:isNaN(orig)?priceNum:orig,image:String(image).trim(),hover:hover?String(hover).trim():String(image).trim(),badge:badge?String(badge).trim():null,fabric:fabric?String(fabric).trim():'Premium',color:color?String(color).trim():'—',category:category||'tshirt'})
    res.status(201).json({id:doc.pid||doc._id,_id:doc._id,pid:doc.pid,name:doc.name,price:doc.price,original:doc.original,image:doc.image,hover:doc.hover,badge:doc.badge,fabric:doc.fabric,color:doc.color,category:doc.category})
  }catch(e){ console.error(e); res.status(500).json({error:'Failed to create product'})}
})
router.delete('/:id', async (req,res)=>{
  try{
    const {id}=req.params
    if(!isDb()){ const arr=mem(); const idx=arr.findIndex(p=>String(p.pid)===String(id)||String(p._id)===String(id)); if(idx===-1) return res.status(404).json({error:'Product not found'}); const d=arr.splice(idx,1)[0]; return res.json({success:true,id:d.pid||d._id})}
    let d=null; const n=Number(id); if(!isNaN(n)) d=await Product.findOneAndDelete({pid:n})
    if(!d) try{ d=await Product.findByIdAndDelete(id)}catch{}
    if(!d) d=await Product.findOneAndDelete({pid:id})
    if(!d) return res.status(404).json({error:'Product not found'})
    res.json({success:true,id:d.pid||d._id})
  }catch(e){ res.status(500).json({error:'Failed to delete'})}
})
export default router
