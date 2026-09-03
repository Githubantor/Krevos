import express from 'express'
import mongoose from 'mongoose'
const router = express.Router()

// GET /api/cluster - list every database, collections and document counts + sample data
router.get('/', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ok: false, error: 'Mongo not connected', dbState: mongoose.connection.readyState, hint: 'Check MONGODB_URI and Atlas Network Access 0.0.0.0/0 + user password' })
    }
    const admin = mongoose.connection.db.admin()
    const { databases } = await admin.listDatabases()
    const result = []
    for (const dbInfo of databases) {
      const dbName = dbInfo.name
      if (['admin','local','config'].includes(dbName)) continue
      const db = mongoose.connection.client.db(dbName)
      const cols = await db.listCollections().toArray()
      const collections = []
      for (const c of cols) {
        const name = c.name
        if (name.startsWith('system.')) continue
        const count = await db.collection(name).countDocuments()
        const sample = await db.collection(name).find().limit(5).toArray()
        collections.push({ name, count, sample })
      }
      result.push({ database: dbName, sizeOnDisk: dbInfo.sizeOnDisk, empty: dbInfo.empty, collections })
    }
    res.json({ ok: true, cluster: mongoose.connection.host, databases: result, totalDatabases: result.length })
  } catch (e) {
    console.error('cluster all data error', e)
    res.status(500).json({ ok: false, error: e.message })
  }
})

// GET /api/cluster/:db/:collection - dump all docs (limit 100) for quick view
router.get('/:db/:collection', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'Mongo not connected' })
    const { db, collection } = req.params
    const limit = Math.min(parseInt(req.query.limit) || 50, 500)
    const docs = await mongoose.connection.client.db(db).collection(collection).find().limit(limit).toArray()
    const count = await mongoose.connection.client.db(db).collection(collection).countDocuments()
    res.json({ ok: true, db, collection, count, docs })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
