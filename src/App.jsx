import { useState, useEffect, useRef } from 'react'
import { api } from './api.js'

// ─── ADMIN ─── (password-only login)
const ADMIN_PASSWORD = "admin123" // ← change this password as needed

// ─── DATA ───
const slides = [
  {
    id: 3,
    image: "https://buri.ltd/cdn/shop/files/1.png?v=1777818940&width=2000",
    subtitle: "SPRING DROP '26",
    title: "Spring\nEssentials",
    desc: "Flat 15% OFF — Minimal, breathable & effortlessly refined.",
    cta: "Shop Spring Drop",
    align: "left",
    targetId: "spring-drop",
  },
  {
    id: 4,
    image: "https://buri.ltd/cdn/shop/files/3.png?v=1777819071&width=2000",
    subtitle: "THREADBARE",
    title: "T-Shirts &\nShackets",
    desc: "Heavyweight essentials built for everyday sophistication.",
    cta: "Shop ThreadBare",
    align: "right",
    targetId: "collections",
  },
  {
    id: 5,
    image: "https://buri.ltd/cdn/shop/files/4.png?v=1777819969&width=2000",
    subtitle: "WINTER DROP",
    title: "Layers of\nLuxury",
    desc: "Sweaters, hoodies & half-zip sweatshirts — warmth without compromise.",
    cta: "Shop Winter",
    align: "center",
    targetId: "collections",
  },
]

const categories = []

const lookbook = []

const categoryConfigs = {
  "polo": { title:"Polo T-Shirts", subtitle:"SPRING DROP '26 • Flat 15% OFF", desc:"From heavyweight pique to mini waffle & striped polos — refined essentials at KREVOS.Store.", hero:"https://buri.ltd/cdn/shop/files/SM10535_3.png?v=1772034358&width=800" },
  "tshirt": { title:"Solid T-Shirts", subtitle:"THREADBARE • Everyday Essentials", desc:"Drop shoulder, relaxed fit & premium solids — 220–350 GSM heavyweight tees.", hero:"https://buri.ltd/cdn/shop/files/SM10925_18_12864b4f-e8f2-463c-a548-86b8e10a303a.png?v=1772606795&width=800" },
  "premium": { title:"Premium T-Shirts", subtitle:"THREADBARE • Graphic Collection", desc:"Garment dye & interlock graphics — statement tees with KREVOS craftsmanship.", hero:"https://buri.ltd/cdn/shop/files/SM10923_16_45f12e8a-a321-4220-9226-307e0f55ea28.png?v=1772802366&width=800" },
  "denim": { title:"Denim", subtitle:"THREADBARE • Bottoms", desc:"Slim, relaxed & tapered denim — stretch & 100% cotton washes. Built for everyday KREVOS style.", hero:"https://buri.ltd/cdn/shop/files/SM10922_20_23c63c0d-5397-4f70-81c5-30ef3967455a.png?v=1772259625&width=800" },
  "joggers": { title:"Joggers", subtitle:"THREADBARE • Loungewear", desc:"Fleece, French terry & cargo joggers — comfort without compromising luxury.", hero:"https://buri.ltd/cdn/shop/files/SM10925_13_5c928473-fa1e-4475-83e1-c4c058065b1c.png?v=1772343146&width=800" },
  "hoodies": { title:"Hoodies", subtitle:"WINTER DROP • Warm & Refined", desc:"Pullover, zip & oversized hoodies — brushed fleece & heavyweight cotton for winter luxury.", hero:"https://images.unsplash.com/photo-1770686307114-d343925f512e?auto=format&fit=crop&w=800&q=80" },
  "shacket": { title:"Shacket & Shirts", subtitle:"THREADBARE • Layering", desc:"Overshirts, flannel & wool shackets — layering essentials for Dhaka winters.", hero:"https://buri.ltd/cdn/shop/files/SM10533_3.png?v=1772036030&width=800" },
  "sweater": { title:"Sweaters", subtitle:"WINTER DROP • Knitwear", desc:"Crew, half-zip & turtleneck sweaters — merino wool & cotton knits.", hero:"https://buri.ltd/cdn/shop/files/SM10537_26.png?v=1772027959&width=800" },
  "half-zip": { title:"Half Zip Sweatshirts", subtitle:"WINTER DROP", desc:"Half-zip sweatshirts — effortless layering with KREVOS refinement.", hero:"https://buri.ltd/cdn/shop/files/SM10527_7.png?v=1772036121&width=800" },
  "spring-drop": { title:"Spring Drop '26", subtitle:"FLAT 15% OFF", desc:"All spring essentials — polos, tees & more. Order 4 get 30% OFF.", hero:"https://buri.ltd/cdn/shop/files/1.png?v=1777818940&width=800" },
  "collections": { title:"All Collections", subtitle:"KREVOS.STORE", desc:"Explore all KREVOS.Store collections — winter, spring & threadbare essentials.", hero:"https://buri.ltd/cdn/shop/files/Stone_2Mid.png?v=1778929974&width=800" },
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState(new Set())
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeLook, setActiveLook] = useState(0)
  const [activeCategory, setActiveCategory] = useState(null)
  const [orderProduct, setOrderProduct] = useState(null)
  const [orderSize, setOrderSize] = useState('M')
  const [orderQty, setOrderQty] = useState(1)
  const heroRef = useRef(null)

  // ── Products (MongoDB primary, localStorage fallback) ──
  const [springProducts, setSpringProducts] = useState(() => { try { const v = localStorage.getItem('krevos_spring'); if (v) { const arr = JSON.parse(v); if (arr.length) return arr } } catch {} return [{ id: 9001, name: "Drop Shoulder T-Shirt — White", price: 1299, original: 1599, image: "https://buri.ltd/cdn/shop/files/SM10925_10_6d267aef-b9a9-49d5-86bc-f682536db4ee.png?v=1772606974&width=600", hover: "https://buri.ltd/cdn/shop/files/SM10925_7_faaf733f-ff5a-4c7b-adc8-00bd634b25c8.png?v=1772606974&width=600", badge: "-19%", fabric: "Cotton Blend 220GSM", color: "White", category: "tshirt" }] })
  const [denimProducts, setDenimProducts] = useState(() => { try { const v = localStorage.getItem('krevos_denim'); return v ? JSON.parse(v) : [] } catch { return [] } })
  const [joggersProducts, setJoggersProducts] = useState(() => { try { const v = localStorage.getItem('krevos_joggers'); return v ? JSON.parse(v) : [] } catch { return [] } })
  const [hoodiesProducts, setHoodiesProducts] = useState(() => { try { const v = localStorage.getItem('krevos_hoodies'); return v ? JSON.parse(v) : [] } catch { return [] } })
  const [shacketProducts, setShacketProducts] = useState(() => { try { const v = localStorage.getItem('krevos_shacket'); return v ? JSON.parse(v) : [] } catch { return [] } })
  const [sweaterProducts, setSweaterProducts] = useState(() => { try { const v = localStorage.getItem('krevos_sweater'); return v ? JSON.parse(v) : [] } catch { return [] } })

  // ── Orders (MongoDB primary, localStorage fallback) ──
  const [orders, setOrders] = useState(() => { try { const v = localStorage.getItem('krevos_orders'); return v ? JSON.parse(v) : [] } catch { return [] } })
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [dbSync, setDbSync] = useState({ loading: true, lastSync: null, mode: 'loading', error: null, dbName: null, health: null })

  const applyProductsToBuckets = (products) => {
    const buckets = { spring: [], denim: [], joggers: [], hoodies: [], shacket: [], sweater: [] }
    products.forEach(p => {
      const cat = p.category
      if (['polo','tshirt','premium','spring-drop'].includes(cat)) buckets.spring.push(p)
      else if (cat === 'denim') buckets.denim.push(p)
      else if (cat === 'joggers') buckets.joggers.push(p)
      else if (cat === 'hoodies') buckets.hoodies.push(p)
      else if (cat === 'shacket') buckets.shacket.push(p)
      else if (cat === 'sweater' || cat === 'half-zip') buckets.sweater.push(p)
      else buckets.spring.push(p)
    })
    if (products.length > 0) {
      setSpringProducts(buckets.spring.length ? buckets.spring : products)
      setDenimProducts(buckets.denim)
      setJoggersProducts(buckets.joggers)
      setHoodiesProducts(buckets.hoodies)
      setShacketProducts(buckets.shacket)
      setSweaterProducts(buckets.sweater)
    } else if (products.length === 0) {
      // DB empty — keep fallback but clear if DB says 0
      // don't overwrite with empty to avoid flicker on cold start, but allow explicit clear via admin
    }
  }

  const syncFromDB = async (opts = {}) => {
    const { silent = false } = opts
    if (!silent) setDbSync(s => ({ ...s, loading: true, error: null }))
    try {
      const [products, ordersData, health, stats] = await Promise.all([
        api.getProducts().catch(err => { console.warn('getProducts failed', err.message); return null }),
        api.getOrders().catch(err => { console.warn('getOrders failed', err.message); return null }),
        api.health().catch(()=> null),
        api.stats().catch(()=> null),
      ])
      if (products && Array.isArray(products)) {
        applyProductsToBuckets(products)
      }
      if (ordersData && Array.isArray(ordersData)) {
        setOrders(ordersData)
      }
      const rawMode = health?.db === 'connected' ? 'mongo' : (stats?.mode || (health?.db || 'unknown'))
      const mode = rawMode === 'connected' ? 'mongo' : rawMode
      setDbSync({
        loading: false,
        lastSync: new Date(),
        mode,
        dbName: health?.name || stats?.db || null,
        error: null,
        health,
        stats
      })
      return { products, ordersData, health, stats }
    } catch (e) {
      console.warn('Mongo sync failed', e)
      setDbSync(s => ({ ...s, loading: false, error: e.message || 'Sync failed' }))
      return null
    }
  }

  // ── MongoDB sync: fetch every data on mount + background refresh ──
  useEffect(() => {
    let cancelled = false
    syncFromDB()
    // fast retry 3 times if first fails (Vercel cold start — DB connecting)
    let retries = 0
    const retryTimer = setInterval(() => {
      if (cancelled) return
      setDbSync(s => {
        if (s.error || s.mode !== 'mongo') {
          if (retries < 3) { retries++; setTimeout(()=> syncFromDB({ silent: true }), 100) }
        } else clearInterval(retryTimer)
        return s
      })
    }, 3000)
    // background refresh for storefront (any device) every 20s — ensures cross-device auto-sync
    const storePoll = setInterval(() => {
      if (cancelled) return
      syncFromDB({ silent: true })
    }, 20000)
    // also re-sync when tab becomes visible (user switches device tab)
    const onVis = () => { if (document.visibilityState === 'visible') syncFromDB({ silent: true }) }
    const onFocus = () => syncFromDB({ silent: true })
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; clearInterval(retryTimer); clearInterval(storePoll); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', onFocus) }
  }, [])

  useEffect(() => { localStorage.setItem('krevos_spring', JSON.stringify(springProducts)) }, [springProducts])
  useEffect(() => { localStorage.setItem('krevos_denim', JSON.stringify(denimProducts)) }, [denimProducts])
  useEffect(() => { localStorage.setItem('krevos_joggers', JSON.stringify(joggersProducts)) }, [joggersProducts])
  useEffect(() => { localStorage.setItem('krevos_hoodies', JSON.stringify(hoodiesProducts)) }, [hoodiesProducts])
  useEffect(() => { localStorage.setItem('krevos_shacket', JSON.stringify(shacketProducts)) }, [shacketProducts])
  useEffect(() => { localStorage.setItem('krevos_sweater', JSON.stringify(sweaterProducts)) }, [sweaterProducts])
  useEffect(() => { localStorage.setItem('krevos_orders', JSON.stringify(orders)) }, [orders])

  const totalSell = orders.reduce((s,o)=> s + (o.total || 0), 0)

  const createOrder = async (customer, items, total) => {
    const userId = authUser?.userId || customer.userId || null
    const customerWithId = { ...customer, userId, email: customer.email || authUser?.email || '' }
    const localOrder = { id: 'CRS-' + Date.now().toString().slice(-6), date: new Date().toISOString(), customer: customerWithId, userId, items, total, status: 'Pending' }
    setOrders(prev => [localOrder, ...prev])
    try {
      const saved = await api.createOrder({ customer: customerWithId, items, total, status: 'Pending', id: localOrder.id, userId })
      if (saved && saved.id) { setOrders(prev => prev.map(o => o.id === localOrder.id ? { ...saved } : o)); setTimeout(()=> syncFromDB({silent:true}), 500); return saved }
      setTimeout(()=> syncFromDB({silent:true}), 500)
    } catch (e) { console.warn('createOrder Mongo failed', e.message); showToast('Order saved locally — will sync when online') }
    return localOrder
  }
  const confirmOrder = async (id) => {
    setOrders(prev => prev.map(o => o.id===id ? { ...o, status: 'Confirmed' } : o))
    showToast("Order confirmed — customer will be notified")
    try { await api.updateOrderStatus(id, 'Confirmed'); setTimeout(()=> syncFromDB({silent:true}), 400) } catch (e) { console.warn('confirmOrder Mongo failed', e.message) }
  }
  const pendingCount = orders.filter(o=>o.status==='Pending').length

  function getCategoryProducts(catId) {
    switch(catId) {
      case "polo": return springProducts.filter(p => (p.category ? p.category==="polo" : p.name.toLowerCase().includes("polo")))
      case "tshirt": return springProducts.filter(p => (p.category ? p.category==="tshirt" : /t-shirt|tee|tshirt/i.test(p.name))).slice(0,6)
      case "premium": return springProducts.filter(p => (p.category ? p.category==="premium" : /graphic|premium|relaxed|garment/i.test(p.name))).slice(0,6)
      case "denim": return denimProducts
      case "joggers": return joggersProducts
      case "hoodies": return hoodiesProducts
      case "shacket": return shacketProducts
      case "sweater": return sweaterProducts
      case "half-zip": return sweaterProducts.slice(0,3)
      case "spring-drop": return springProducts
      case "collections": return [...springProducts.slice(0,2), ...denimProducts.slice(0,2)]
      default: return [...springProducts].slice(0,8)
    }
  }

  // ── Admin add-product modal ──
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProd, setNewProd] = useState({ name:"", price:"", original:"", image:"", hover:"", badge:"", fabric:"", color:"", category:"tshirt" })

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProd.name || !newProd.price || !newProd.image) { showToast("Please fill name, price and image"); return }
    const price = parseInt(newProd.price)
    const original = newProd.original ? parseInt(newProd.original) : price
    if (isNaN(price)) { showToast("Price must be a number"); return }
    const cat = newProd.category
    const payload = { name: newProd.name.trim(), price, original, image: newProd.image.trim(), hover: (newProd.hover.trim() || newProd.image.trim()), badge: newProd.badge.trim() || null, fabric: newProd.fabric.trim() || "Premium", color: newProd.color.trim() || "—", category: cat }
    try {
      const saved = await api.createProduct(payload)
      const base = saved || { id: Date.now(), ...payload }
      if (["polo","tshirt","premium","spring-drop"].includes(cat)) setSpringProducts(prev => [base, ...prev])
      else if (cat === "denim") setDenimProducts(prev => [base, ...prev])
      else if (cat === "joggers") setJoggersProducts(prev => [base, ...prev])
      else if (cat === "hoodies") setHoodiesProducts(prev => [base, ...prev])
      else if (cat === "shacket") setShacketProducts(prev => [base, ...prev])
      else if (["sweater","half-zip"].includes(cat)) setSweaterProducts(prev => [base, ...prev])
      else setSpringProducts(prev => [base, ...prev])
      showToast(`${base.name} — added to ${cat} (MongoDB)`)
      setTimeout(()=> syncFromDB({silent:true}), 600)
    } catch (err) {
      console.warn('addProduct Mongo failed', err.message)
      const base = { id: Date.now(), ...payload }
      if (["polo","tshirt","premium","spring-drop"].includes(cat)) setSpringProducts(prev => [base, ...prev])
      else if (cat === "denim") setDenimProducts(prev => [base, ...prev])
      else if (cat === "joggers") setJoggersProducts(prev => [base, ...prev])
      else if (cat === "hoodies") setHoodiesProducts(prev => [base, ...prev])
      else if (cat === "shacket") setShacketProducts(prev => [base, ...prev])
      else if (["sweater","half-zip"].includes(cat)) setSweaterProducts(prev => [base, ...prev])
      else setSpringProducts(prev => [base, ...prev])
      showToast(`${base.name} — added locally (offline)`)
    }
    setNewProd({ name:"", price:"", original:"", image:"", hover:"", badge:"", fabric:"", color:"", category:"tshirt" })
    setShowAddModal(false)
  }

  const handleDeleteProduct = async (id) => {
    setSpringProducts(prev=>prev.filter(p=>p.id!==id && p._id!==id && p.pid!==id))
    setDenimProducts(prev=>prev.filter(p=>p.id!==id && p._id!==id && p.pid!==id))
    setJoggersProducts(prev=>prev.filter(p=>p.id!==id && p._id!==id && p.pid!==id))
    setHoodiesProducts(prev=>prev.filter(p=>p.id!==id && p._id!==id && p.pid!==id))
    setShacketProducts(prev=>prev.filter(p=>p.id!==id && p._id!==id && p.pid!==id))
    setSweaterProducts(prev=>prev.filter(p=>p.id!==id && p._id!==id && p.pid!==id))
    showToast("Product removed")
    try { await api.deleteProduct(id); setTimeout(()=> syncFromDB({silent:true}), 500) } catch (e) { console.warn('deleteProduct failed', e.message) }
  }

  // ── Admin (password-only) ──
  // Sync init from URL so #admin / /admin / ?admin= shows password IMMEDIATELY without extra refresh
  const [adminView, setAdminView] = useState(() => {
    try {
      const h = window.location.hash
      const p = new URLSearchParams(window.location.search)
      return h === '#admin' || window.location.pathname.endsWith('/admin') || p.has('admin')
    } catch { return false }
  })
  const [adminAuthed, setAdminAuthed] = useState(false)
  const [adminPw, setAdminPw] = useState("")
  const [adminError, setAdminError] = useState("")

  useEffect(() => {
    const checkAdmin = () => {
      const hash = window.location.hash
      const params = new URLSearchParams(window.location.search)
      if (hash === '#admin' || window.location.pathname.endsWith('/admin') || params.has('admin')) {
        setAdminView(true)
      }
    }
    window.addEventListener('hashchange', checkAdmin)
    window.addEventListener('popstate', checkAdmin)
    return () => {
      window.removeEventListener('hashchange', checkAdmin)
      window.removeEventListener('popstate', checkAdmin)
    }
  }, [])

  useEffect(() => {
    if (adminView && window.location.hash !== '#admin') {
      window.location.hash = '#admin'
    }
    if (adminView) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [adminView])

  // ── Admin auto-sync: every device loads from DB automatically ──
  useEffect(() => {
    if (adminView) {
      // instant sync when admin opens (any device/browser)
      syncFromDB({ silent: false })
    }
  }, [adminView])
  useEffect(() => {
    if (adminView && adminAuthed) {
      syncFromDB({ silent: false })
    }
  }, [adminAuthed])
  useEffect(() => {
    if (!adminView) return
    const id = setInterval(() => syncFromDB({ silent: true }), 8000) // live: admin sees new orders within 8s on any device
    return () => clearInterval(id)
  }, [adminView])

  const [infoPage, setInfoPage] = useState(null)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [customerMode, setCustomerMode] = useState("login") // login | register
  const [registerPage, setRegisterPage] = useState(false)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const v = localStorage.getItem('krevos_user')
      if (v) return JSON.parse(v)
      const legacy = localStorage.getItem('krevos_first_customer')
      if (legacy) {
        const j = JSON.parse(legacy)
        if (j && j.name && j.phone) return { name: j.name, phone: j.phone, email: j.email || '', userId: j.userId || 'KVS-LEGACY', address: j.address || '' }
      }
    } catch {}
    return null
  })
  const [pendingOrderProduct, setPendingOrderProduct] = useState(null)

  useEffect(() => {
    if (authUser) localStorage.setItem('krevos_user', JSON.stringify(authUser))
    else localStorage.removeItem('krevos_user')
  }, [authUser])

  useEffect(() => {
    const h = window.location.hash
    const p = new URLSearchParams(window.location.search)
    if (h === "#register" || p.has("register") || window.location.pathname.endsWith("/register")) setRegisterPage(true)
  }, [])

  const requireAuthForOrder = (product) => {
    if (!authUser) {
      if (product) setPendingOrderProduct(product)
      setCustomerOpen(true)
      setCustomerMode("login")
      showToast("Please login or create an ID to order — data required")
      return false
    }
    return true
  }
  const handleLogout = () => {
    setAuthUser(null)
    localStorage.removeItem('krevos_user')
    localStorage.removeItem('krevos_customer')
    showToast("Logged out — see you again at KREVOS.Store")
  }
  const handleAuthSuccess = (user) => {
    setAuthUser(user)
    localStorage.setItem('krevos_user', JSON.stringify(user))
    showToast(`Welcome ${user.name} — ID ${user.userId} • logged in`)
    setCustomerOpen(false)
    if (pendingOrderProduct) {
      setOrderProduct(pendingOrderProduct)
      setPendingOrderProduct(null)
    }
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (adminPw === ADMIN_PASSWORD) {
      setAdminAuthed(true)
      setAdminError("")
      showToast("Admin login successful — Welcome to KREVOS.Store Admin")
    } else {
      setAdminError("Incorrect password — try again")
    }
  }
  const exitAdmin = () => {
    setAdminView(false)
    setAdminAuthed(false)
    setAdminPw("")
    setAdminError("")
    try {
      const url = new URL(window.location.href)
      url.hash = ""
      url.searchParams.delete("admin")
      if (url.pathname.endsWith("/admin")) {
        url.pathname = url.pathname.replace(/\/admin\/?$/, "") || "/"
      }
      window.history.replaceState(null, "", url.pathname + url.search + url.hash)
    } catch {
      window.history.replaceState(null, "", window.location.pathname.replace(/\/admin\/?$/, "") || "/")
    }
  }

  // auto slider
  useEffect(() => {
    const id = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 4500)
    return () => clearInterval(id)
  }, [])
  // scroll header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // lock body when drawer open
  useEffect(() => {
    document.body.style.overflow = (cartOpen || searchOpen || mobileOpen) ? 'hidden' : ''
  }, [cartOpen, searchOpen, mobileOpen])

  // toast auto hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500)
      return () => clearTimeout(t)
    }
  }, [toast])

  useEffect(() => {
    if (activeCategory) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeCategory])

  const showToast = (msg) => setToast(msg)
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const headerOffset = 80
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
      window.scrollTo({ top, behavior: 'smooth' })
      showToast(`KREVOS.Store — Viewing ${id.replace('-', ' ')} collection`)
    }
  }
  const openCategory = (catId) => {
    if (categoryConfigs[catId]) {
      setActiveCategory(catId)
      setMobileOpen(false)
      setSearchOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      showToast(`KREVOS.Store — ${catId} collection coming soon`)
      scrollToSection('collections')
    }
  }
  const closeCategory = () => {
    setActiveCategory(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const n = new Set(prev)
      if (n.has(id)) { n.delete(id); showToast("Removed from wishlist") }
      else { n.add(id); showToast("Added to wishlist — KREVOS.Store") }
      return n
    })
  }
  const addToCart = (product) => {
    const qtyToAdd = product.qty || 1
    setCart(prev => {
      const found = prev.find(p => p.id === product.id && p.size === product.size)
      if (found) return prev.map(p => p.id === product.id && p.size === product.size ? { ...p, qty: p.qty + qtyToAdd } : p)
      return [...prev, { ...product, qty: qtyToAdd }]
    })
    showToast(`${product.name}${product.size ? ` (${product.size})` : ''} — Added to cart`)
    setCartOpen(true)
  }
  const cartCount = cart.reduce((a, b) => a + b.qty, 0)
  const cartTotal = cart.reduce((a, b) => a + b.price * b.qty, 0)

  // ── Admin view (password-only) takes over whole page when triggered
  if (adminView) {
    return (
      <div className="min-h-screen bg-[#F6F8F7] text-zinc-900 selection:bg-[#003D32] selection:text-white">
        {/* Admin Announcement */}
        <div className="bg-[#003D32] text-white text-[11px] tracking-[0.18em] uppercase font-medium py-3 text-center">KREVOS.Store — Admin Access • Secure</div>
        {!adminAuthed ? (
          <div className="max-w-[420px] mx-auto px-4 pt-12 md:pt-20">
            <div className="bg-white rounded-[24px] border border-[#E6F0EE] shadow-xl p-8 md:p-10">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#003D32] text-white grid place-items-center mx-auto"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg></div>
                <h1 className="font-brand font-bold tracking-[0.18em] text-xl mt-4 text-[#003D32]">KREVOS<span className="font-light">.STORE</span></h1>
                <p className="text-sm font-semibold mt-2">Admin Login</p>
                <p className="text-xs text-zinc-500 mt-1">Enter password only — no username required</p>
              </div>
              <form onSubmit={handleAdminLogin} className="mt-8 space-y-4">
                <div>
                  <label className="text-xs font-semibold tracking-widest uppercase text-zinc-500">Password</label>
                  <input
                    type="password"
                    value={adminPw}
                    onChange={e => setAdminPw(e.target.value)}
                    placeholder="Enter admin password"
                    className="mt-2 w-full border border-[#DDE8E6] rounded-full px-5 py-3.5 text-sm outline-none focus:border-[#003D32] focus:ring-2 focus:ring-[#003D32]/10"
                    autoFocus
                  />
                </div>
                {adminError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-4 py-2 text-center">{adminError}</p>}
                <button type="submit" className="w-full bg-[#003D32] text-white rounded-full py-3.5 text-sm font-bold hover:bg-[#004D40] transition">Unlock Admin</button>
                <button type="button" onClick={exitAdmin} className="w-full border border-[#DDE8E6] rounded-full py-3 text-sm font-medium hover:bg-white transition">← Back to Store</button>
              </form>
              <p className="text-[11px] text-center text-zinc-400 mt-6">Secure admin area • KREVOS.Store • #003D32</p>
            </div>
          </div>
        ) : (
          <div className="max-w-[1480px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl leading-none">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 sm:mt-2">Password-authenticated • KREVOS.Store</p>
              </div>
              <button onClick={exitAdmin} className="self-start sm:self-auto border border-[#DDE8E6] rounded-full px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium hover:bg-white transition whitespace-nowrap">Exit Admin → Store</button>
            </div>
            {/* ── DB Sync Status — auto-loads on any device/browser ── */}
            <div className={`rounded-2xl border p-4 mb-6 flex flex-wrap items-center gap-3 text-xs ${dbSync.mode==='mongo' ? 'bg-green-50 border-green-200' : dbSync.mode==='memory' ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#E6F0EE]'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${dbSync.loading ? 'bg-amber-500 animate-pulse' : dbSync.mode==='mongo' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="font-bold tracking-widest uppercase text-[11px]">{dbSync.loading ? 'Syncing…' : dbSync.mode==='mongo' ? `Live • MongoDB ${dbSync.dbName || 'krevos'}` : dbSync.mode==='memory' ? 'Memory fallback — check MONGODB_URI' : `DB: ${dbSync.mode}`}</span>
              </div>
              <span className="text-zinc-500 hidden md:inline">•</span>
              <span className="text-zinc-600">{dbSync.lastSync ? `Last sync ${dbSync.lastSync.toLocaleTimeString()} • auto-sync every 8s (any device/browser)` : 'Waiting for first sync…'}</span>
              {dbSync.error && <span className="text-red-600 font-medium">• Error: {dbSync.error}</span>}
              <button onClick={()=> syncFromDB()} disabled={dbSync.loading} className="ml-auto bg-[#003D32] text-white rounded-full px-4 py-2 text-xs font-bold hover:bg-[#004D40] disabled:opacity-50 transition">{dbSync.loading ? 'Syncing…' : '↻ Refresh Now'}</button>
              <span className="text-[11px] text-zinc-500 w-full md:w-auto">{orders.length} orders • {springProducts.length + denimProducts.length + joggersProducts.length + hoodiesProducts.length + shacketProducts.length + sweaterProducts.length} products • Every device loads from DB automatically • Try incognito to verify</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white rounded-2xl border border-[#E6F0EE] p-4 sm:p-6"><p className="text-xs tracking-widest uppercase font-semibold text-zinc-500">Total Products</p><p className="text-2xl sm:text-3xl font-bold mt-2 text-[#003D32]">{springProducts.length + denimProducts.length + joggersProducts.length + hoodiesProducts.length + shacketProducts.length + sweaterProducts.length}</p><p className="text-xs text-zinc-500 mt-1">Live in storefront</p></div>
              <div className="bg-[#003D32] text-white rounded-2xl border border-[#003D32] p-4 sm:p-6"><p className="text-xs tracking-widest uppercase font-semibold text-white/60">Total Sell Amount</p><p className="text-2xl sm:text-3xl font-bold mt-2">Tk {totalSell.toLocaleString()}</p><p className="text-xs text-white/60 mt-1">{orders.length} orders • Lifetime</p></div>
              <div className="bg-white rounded-2xl border border-[#E6F0EE] p-4 sm:p-6"><p className="text-xs tracking-widest uppercase font-semibold text-zinc-500">Total Orders</p><p className="text-3xl font-bold mt-2 text-[#003D32]">{orders.length}</p><p className="text-xs mt-1">{pendingCount>0 ? <span className="text-amber-600 font-semibold">{pendingCount} pending • Tap to confirm</span> : <span className="text-zinc-500">No pending — all confirmed</span>}</p></div>
              <div className="bg-white rounded-2xl border border-[#E6F0EE] p-4 sm:p-6"><p className="text-xs tracking-widest uppercase font-semibold text-zinc-500">Customers</p><p className="text-3xl font-bold mt-2 text-[#003D32]">{new Set(orders.map(o=>o.customer.phone||o.customer.name)).size}</p><p className="text-xs text-zinc-500 mt-1">Unique buyers • Click row → history</p></div>
            </div>

            {/* ── Sales Chart ── */}
            <div className="bg-white rounded-[24px] border border-[#E6F0EE] p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sales Overview</h3>
                <span className="text-xs bg-[#E6F0EE] text-[#003D32] px-3 py-1 rounded-full font-semibold">Chart — Tk {totalSell.toLocaleString()} total</span>
              </div>
              {orders.length===0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#E6F0EE] p-8 text-center text-sm text-zinc-500">No sales yet — chart will appear after first order. Place a test order via storefront Quick Order.</div>
              ) : (
                <div className="mt-6">
                  {/* simple bar chart by customer */}
                  <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">Sales by Customer (top)</p>
                  <div className="space-y-3">
                    {(() => {
                      const byCust = {}
                      orders.forEach(o => {
                        const key = o.customer.name + " • " + o.customer.phone
                        byCust[key] = (byCust[key]||0) + o.total
                      })
                      const entries = Object.entries(byCust).sort((a,b)=>b[1]-a[1]).slice(0,5)
                      const max = Math.max(...entries.map(e=>e[1]), 1)
                      return entries.map(([name, amt]) => (
                        <div key={name} className="flex items-center gap-3">
                          <div className="w-36 text-xs font-medium truncate" title={name}>{name.split(" • ")[0]}</div>
                          <div className="flex-1 h-3 bg-[#F6F8F7] rounded-full overflow-hidden border border-[#E6F0EE]">
                            <div className="h-full bg-[#003D32] rounded-full" style={{ width: `${Math.round((amt/max)*100)}%` }} />
                          </div>
                          <div className="w-24 text-xs font-bold text-right">Tk {amt.toLocaleString()}</div>
                        </div>
                      ))
                    })()}
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#E6F0EE]">
                    <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">Last 7 Days Sales</p>
                    <div className="flex items-end gap-2 h-[80px]">
                      {(() => {
                        const days = []
                        for(let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); const key=d.toISOString().slice(0,10); days.push(key) }
                        const byDay = {}; days.forEach(d=>byDay[d]=0); orders.forEach(o=>{ const k=o.date.slice(0,10); if(byDay[k]!==undefined) byDay[k]+=o.total })
                        const maxDay = Math.max(...Object.values(byDay), 1)
                        return days.map(d => {
                          const amt = byDay[d]
                          const h = Math.round((amt/maxDay)*64) + 8
                          const label = new Date(d).toLocaleDateString('en-GB', {weekday:'short'})
                          return <div key={d} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-[#003D32] rounded-t-lg transition-all" style={{ height: `${h}px`, opacity: amt?1:0.15 }} title={`${d}: Tk ${amt}`} /><span className="text-[10px] text-zinc-500">{label}</span></div>
                        })
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Customers — click to see order history ── */}
            <div className="bg-white rounded-[24px] border border-[#E6F0EE] p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Customers & Order History</h3>
                <button onClick={async () => { if(confirm("Clear all orders & customers?")) { setOrders([]); setSelectedCustomer(null); localStorage.removeItem('krevos_orders'); try { await api.clearOrders() } catch(e){} showToast("All orders cleared (MongoDB)") } }} className="text-xs text-red-600 hover:underline">Clear Orders</button>
              </div>
              <p className="text-sm text-zinc-500 mt-1">Click a customer row to see all orders — date & price & items.</p>
              {orders.length===0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[#E6F0EE] p-8 text-center text-sm text-zinc-500">No customers yet — no orders placed.</div>
              ) : (
                <div className="mt-4 space-y-2">
                  {(() => {
                      const map = {}
                      orders.forEach(o=>{
                        const uid = o.userId || o.customer.userId || o.customer.email || ""
                        const key = (uid ? uid+"|" : "") + o.customer.phone+"|"+o.customer.name
                        if(!map[key]) map[key]={ customer:o.customer, userId: o.userId || o.customer.userId || null, orders:[], total:0 }
                        map[key].orders.push(o)
                        map[key].total+=o.total
                        if(!map[key].userId && (o.userId || o.customer.userId)) map[key].userId = o.userId || o.customer.userId
                      })
                      const list = Object.values(map).sort((a,b)=>b.total-a.total)
                      return list.map(({customer, userId, orders: custOrders, total}) => {
                        const uid = userId || custOrders[0]?.userId || customer.userId || ""
                        const key = (uid?uid+"|":"")+customer.phone+"|"+customer.name
                        const isOpen = selectedCustomer===key
                        const pendingHere = custOrders.filter(o=>o.status==='Pending').length
                        return (
                          <div key={key} className="border border-[#E6F0EE] rounded-2xl overflow-hidden">
                            <button onClick={()=> setSelectedCustomer(isOpen ? null : key)} className="w-full flex items-center gap-3 p-4 hover:bg-[#F6F8F7] transition text-left">
                              <div className="w-10 h-10 rounded-full bg-[#003D32] text-white grid place-items-center shrink-0 text-sm font-bold">{customer.name.slice(0,1).toUpperCase()}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate flex items-center gap-2">{customer.name} {uid && <span className="font-mono text-[10px] bg-[#003D32] text-white px-1.5 py-0.5 rounded-full">{uid}</span>} <span className="text-zinc-400 font-normal">• {customer.phone}</span> {customer.email && <span className="text-zinc-400 font-normal hidden md:inline">• {customer.email}</span>}</p>
                                <p className="text-xs text-zinc-500 truncate">{customer.address || "—"} • {custOrders.length} order{custOrders.length>1?"s":""} {pendingHere>0 && <span className="ml-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">● {pendingHere} pending</span>} • clustered by ID</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-[#003D32]">Tk {total.toLocaleString()}</p>
                                <p className="text-[11px] text-zinc-500">{new Date(custOrders[0].date).toLocaleDateString()} • {uid||"no-ID"}</p>
                              </div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={`shrink-0 transition ${isOpen?"rotate-180":""}`}><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                          {isOpen && (
                            <div className="border-t border-[#E6F0EE] bg-[#F6F8F7]/50 p-3 space-y-2">
                              {custOrders.slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).map(o=>(
                                <div key={o.id} className="bg-white rounded-xl border border-[#E6F0EE] p-3">
                                  <div className="flex items-center justify-between text-xs gap-2">
                                    <span className="font-mono font-semibold bg-[#E6F0EE] text-[#003D32] px-2 py-1 rounded-full">{o.id}</span>
                                    <span className="font-mono text-[10px] bg-[#003D32] text-white px-2 py-1 rounded-full">{o.userId || o.customer.userId || 'no-ID'}</span>
                                    <span className={`ml-auto px-2 py-1 rounded-full font-bold text-[10px] tracking-widest uppercase ${o.status==='Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>{o.status || 'Pending'}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs mt-2">
                                    <span className="text-zinc-500">{new Date(o.date).toLocaleString()} • {o.customer.name} • {o.customer.email || 'no-email'}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-[#003D32]">Tk {o.total.toLocaleString()}</span>
                                      {o.status==='Pending' && <button onClick={() => confirmOrder(o.id)} className="bg-[#003D32] text-white px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-[#004D40] transition">Confirm Order</button>}
                                      {o.status==='Confirmed' && <span className="text-green-600 text-[11px] font-semibold">✓ Confirmed</span>}
                                    </div>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    {o.items.map((it, idx)=>(
                                      <div key={idx} className="flex items-center gap-2 text-xs">
                                        <img src={it.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-[#F6F8F7]" onError={e=>e.currentTarget.style.display='none'} />
                                        <span className="flex-1 truncate">{it.name} {it.size ? `(${it.size})` : ""} × {it.qty || 1}</span>
                                        <span className="font-semibold">Tk {(it.price * (it.qty||1)).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
              )}
            </div>

            {/* ── Cluster — Every Name with Orders (DB view) ── */}
            <div className="bg-white rounded-[24px] border border-[#E6F0EE] p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Cluster — Every Name with Orders</h3>
                <a href="/api/cluster" target="_blank" rel="noopener noreferrer" className="text-xs bg-[#003D32] text-white px-3 py-1.5 rounded-full font-semibold hover:bg-[#004D40] transition">Open /api/cluster →</a>
              </div>
              <p className="text-sm text-zinc-500 mt-1">Each order is tied to a Customer ID (<span className="font-mono">KVS-xxxxxx</span>) • This is the “cluster” — grouped by name + ID • Data lives in MongoDB <span className="font-mono">krevos</span> → <span className="font-mono">users</span> & <span className="font-mono">orders</span> collections (see /api/cluster).</p>
              {orders.length===0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-[#E6F0EE] p-6 text-center text-sm text-zinc-500">No clustered orders yet — place a logged-in order and it will appear here grouped by your ID.</div>
              ) : (
                <div className="mt-4 overflow-auto rounded-xl border border-[#E6F0EE]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#003D32] text-white"><tr><th className="px-3 py-2">Cluster ID</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Orders</th><th className="px-3 py-2">Total</th></tr></thead>
                    <tbody className="divide-y divide-[#E6F0EE]">
                      {(() => {
                        const m = {}
                        orders.forEach(o=>{
                          const uid = o.userId || o.customer.userId || o.customer.email || 'no-ID'
                          const key = uid+"|"+o.customer.name+"|"+o.customer.phone
                          if(!m[key]) m[key] = { uid, name: o.customer.name, phone: o.customer.phone, email: o.customer.email||'—', count:0, total:0 }
                          m[key].count+=1; m[key].total+=o.total
                        })
                        return Object.values(m).sort((a,b)=>b.total-a.total).map(r=>(
                          <tr key={r.uid+r.name} className="hover:bg-[#F6F8F7]"><td className="px-3 py-2 font-mono font-bold text-[#003D32]">{r.uid}</td><td className="px-3 py-2 font-medium">{r.name}</td><td className="px-3 py-2">{r.phone}</td><td className="px-3 py-2 truncate max-w-[160px]">{r.email}</td><td className="px-3 py-2 text-center">{r.count}</td><td className="px-3 py-2 font-bold">Tk {r.total.toLocaleString()}</td></tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-[11px] text-zinc-500 mt-3">API: <span className="font-mono">GET /api/cluster</span> shows every database & collection • <span className="font-mono">GET /api/auth/users</span> lists all IDs • <span className="font-mono">GET /api/orders</span> with customer & userId.</p>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E6F0EE] p-6 md:p-8">
              <h3 className="font-semibold">Quick Actions</h3>
              <p className="text-sm text-zinc-500 mt-1">Add products from here — they appear instantly on storefront (saved in localStorage).</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={() => setShowAddModal(true)} className="bg-[#003D32] text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-[#004D40] transition">+ Add Product</button>
                <button onClick={() => showToast(`Total ${springProducts.length + denimProducts.length + joggersProducts.length + hoodiesProducts.length + shacketProducts.length + sweaterProducts.length} products live`)} className="border border-[#DDE8E6] rounded-full px-6 py-2.5 text-sm font-medium hover:border-[#003D32] transition">View Products</button>
                <button onClick={() => { setAdminAuthed(false); setAdminPw(""); showToast("Logged out of admin") }} className="border border-[#DDE8E6] rounded-full px-6 py-2.5 text-sm font-medium hover:bg-zinc-50 transition">Lock Admin</button>
                <button onClick={async () => { if(confirm("Clear all products?")) { const all=[...springProducts,...denimProducts,...joggersProducts,...hoodiesProducts,...shacketProducts,...sweaterProducts]; for(const p of all){ try{ await api.deleteProduct(p.id||p._id||p.pid)}catch(e){} } setSpringProducts([]); setDenimProducts([]); setJoggersProducts([]); setHoodiesProducts([]); setShacketProducts([]); setSweaterProducts([]); localStorage.clear(); showToast("All products cleared (MongoDB)") } }} className="ml-auto text-xs text-red-600 hover:underline">Clear All</button>
              </div>
            </div>

            {/* ── Manage Products ── */}
            <div className="mt-6 bg-white rounded-[24px] border border-[#E6F0EE] p-6 md:p-8">
              <h3 className="font-semibold">Manage Products</h3>
              <p className="text-sm text-zinc-500 mt-1">{springProducts.length + denimProducts.length + joggersProducts.length + hoodiesProducts.length + shacketProducts.length + sweaterProducts.length} products — click delete to remove. Images use URL; if you have local files, paste hosted URL (e.g. buri.ltd CDN).</p>
              {(() => {
                const all = [
                  ...springProducts.map(p=>({ ...p, _cat:"spring" })),
                  ...denimProducts.map(p=>({ ...p, _cat:"denim" })),
                  ...joggersProducts.map(p=>({ ...p, _cat:"joggers" })),
                  ...hoodiesProducts.map(p=>({ ...p, _cat:"hoodies" })),
                  ...shacketProducts.map(p=>({ ...p, _cat:"shacket" })),
                  ...sweaterProducts.map(p=>({ ...p, _cat:"sweater" })),
                ]
                if (all.length===0) return <div className="mt-4 rounded-2xl border border-dashed border-[#E6F0EE] p-8 text-center text-sm text-zinc-500">No products yet — click “+ Add Product” to create your first item.</div>
                return (
                  <div className="mt-4 grid md:grid-cols-2 gap-3 max-h-[420px] overflow-auto pr-1">
                    {all.map(p => (
                      <div key={p.id} className="flex gap-3 border border-[#E6F0EE] rounded-2xl p-3">
                        <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-[#F6F8F7] shrink-0" onError={e=>e.currentTarget.src='https://via.placeholder.com/150?text=No+Image'} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight line-clamp-1">{p.name}</p>
                          <p className="text-xs text-zinc-500">Tk {p.price.toLocaleString()} • {p._cat} {p.badge ? `• ${p.badge}` : ""}</p>
                          <p className="text-[11px] text-zinc-400 truncate">{p.image}</p>
                        </div>
                        <button onClick={() => handleDeleteProduct(p.id)} className="self-center text-xs text-red-600 hover:underline shrink-0">Delete</button>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* ── Add Product Modal ── */}
            {showAddModal && (
              <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
                <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-[#003D32]/60 backdrop-blur-sm" />
                <div className="relative bg-white rounded-[24px] max-w-[560px] w-full max-h-[90vh] overflow-auto shadow-2xl">
                  <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-[24px]">
                    <div>
                      <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-zinc-500">KREVOS.Store • Admin</p>
                      <h3 className="font-display text-xl leading-none mt-1">Add Product</h3>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center hover:bg-zinc-200 transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                  </div>
                  <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                    <div>
                      <label className="text-xs font-semibold">Product Name *</label>
                      <input value={newProd.name} onChange={e=>setNewProd({...newProd, name:e.target.value})} required placeholder="e.g. Heavyweight Hoodie — Black" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-semibold">Price (Tk) *</label><input type="number" value={newProd.price} onChange={e=>setNewProd({...newProd, price:e.target.value})} required placeholder="2999" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                      <div><label className="text-xs font-semibold">Original Price</label><input type="number" value={newProd.original} onChange={e=>setNewProd({...newProd, original:e.target.value})} placeholder="3499" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Category *</label>
                      <select value={newProd.category} onChange={e=>setNewProd({...newProd, category:e.target.value})} className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm bg-white outline-none focus:border-[#003D32]">
                        <option value="tshirt">Solid T-Shirts (Spring)</option>
                        <option value="polo">Polo T-Shirts</option>
                        <option value="premium">Premium T-Shirts</option>
                        <option value="hoodies">Hoodies (Winter)</option>
                        <option value="sweater">Sweaters</option>
                        <option value="half-zip">Half-Zip</option>
                        <option value="shacket">Shacket & Shirts</option>
                        <option value="denim">Denim</option>
                        <option value="joggers">Joggers</option>
                      </select>
                    </div>
                    <div><label className="text-xs font-semibold">Image URL *</label><input value={newProd.image} onChange={e=>setNewProd({...newProd, image:e.target.value})} required placeholder="https://..." className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                    <div><label className="text-xs font-semibold">Hover Image URL (optional)</label><input value={newProd.hover} onChange={e=>setNewProd({...newProd, hover:e.target.value})} placeholder="https://... (fallback to image)" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><label className="text-xs font-semibold">Badge</label><input value={newProd.badge} onChange={e=>setNewProd({...newProd, badge:e.target.value})} placeholder="-15%" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                      <div><label className="text-xs font-semibold">Fabric</label><input value={newProd.fabric} onChange={e=>setNewProd({...newProd, fabric:e.target.value})} placeholder="Cotton Fleece" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                      <div><label className="text-xs font-semibold">Color</label><input value={newProd.color} onChange={e=>setNewProd({...newProd, color:e.target.value})} placeholder="Black" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                    </div>
                    {newProd.image && <div className="rounded-xl overflow-hidden border border-[#E6F0EE] bg-[#F6F8F7] p-3 flex gap-3"><img src={newProd.image} alt="preview" className="w-16 h-16 rounded-lg object-cover bg-white" onError={e=>e.currentTarget.style.display='none'} /><div className="text-xs"><p className="font-semibold">{newProd.name || 'Preview'}</p><p className="text-zinc-500">Tk {newProd.price || '—'} {newProd.badge && `• ${newProd.badge}`}</p></div></div>}
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-[#DDE8E6] rounded-full py-3 text-sm font-semibold hover:bg-zinc-50 transition">Cancel</button>
                      <button type="submit" className="flex-[1.6] bg-[#003D32] text-white rounded-full py-3 text-sm font-bold hover:bg-[#004D40] transition">Add Product</button>
                    </div>
                    <p className="text-[11px] text-center text-zinc-400">Shows instantly in storefront • Saved in browser localStorage</p>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-[#003D32] text-white text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fadeInUp">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {toast}
          </div>
        )}
      </div>
    )
  }

  if (registerPage) {
    return (
      <div className="min-h-screen bg-[#F6F8F7] selection:bg-[#003D32] selection:text-white">
        <div className="bg-[#003D32] text-white text-center py-3 text-[11px] tracking-[0.18em] uppercase font-medium">KREVOS.Store — First Order Exclusive • 15% OFF</div>
        <header className="max-w-[1480px] mx-auto px-4 md:px-6 lg:px-8 py-6 flex items-center justify-between">
          <button onClick={() => { setRegisterPage(false); window.history.replaceState(null,"",window.location.pathname) }} className="font-brand font-bold tracking-[0.22em] text-[#003D32] text-xl">KREVOS<span className="font-light text-[#004D40]">.STORE</span></button>
          <button onClick={() => { setRegisterPage(false); window.history.replaceState(null,"",window.location.pathname) }} className="text-sm border border-[#DDE8E6] rounded-full px-5 py-2 hover:border-[#003D32] transition">← Back to Store</button>
        </header>
        <div className="max-w-[960px] mx-auto px-4 pb-12 pt-2">
          <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-8">
            <div className="bg-[#003D32] text-white rounded-[24px] p-8 md:p-10 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent" />
              <p className="text-[11px] tracking-[0.24em] uppercase font-semibold text-white/60">Welcome Offer</p>
              <h1 className="font-display text-[32px] md:text-[40px] leading-[0.95] mt-3">First Order<br/>Registration</h1>
              <p className="text-sm text-white/70 mt-3">Join KREVOS.Store on your 1st order and unlock luxury benefits — made for you.</p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 border border-white/10"><div className="w-9 h-9 rounded-full bg-white text-[#003D32] grid place-items-center shrink-0">%</div><div><p className="text-sm font-semibold">15% OFF First Order</p><p className="text-xs text-white/60">Code: <span className="font-mono font-bold text-white">WELCOME15</span> auto-applied</p></div></div>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 border border-white/10"><div className="w-9 h-9 rounded-full bg-white text-[#003D32] grid place-items-center shrink-0">✓</div><div><p className="text-sm font-semibold">Free Delivery</p><p className="text-xs text-white/60">Free on first order — no minimum</p></div></div>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 border border-white/10"><div className="w-9 h-9 rounded-full bg-white text-[#003D32] grid place-items-center shrink-0">✉</div><div><p className="text-sm font-semibold">Stay in Touch</p><p className="text-xs text-white/60">krevos.store@gmail.com • 01951250125</p></div></div>
              </div>
              <p className="text-[11px] text-white/50 mt-6">Secure • One-time offer for 1st order • Bottle Green #003D32</p>
            </div>
            <div className="bg-white rounded-[24px] border border-[#E6F0EE] p-6 md:p-8 shadow-xl">
              <h3 className="font-semibold">Create your account</h3>
              <p className="text-sm text-zinc-500 mt-1">For your 1st order — be part of KREVOS Town.</p>
              <form onSubmit={async e=>{
                e.preventDefault();
                const fd=new FormData(e.currentTarget);
                const name=fd.get('name')?.toString().trim()||'';
                const phone=fd.get('phone')?.toString().trim()||'';
                const email=fd.get('email')?.toString().trim()||'';
                const pw=fd.get('pw')?.toString()||'';
                const cpw=fd.get('cpw')?.toString()||'';
                if(!name||!phone||!email||!pw||!cpw){showToast("Please fill all fields"); return}
                if(pw!==cpw){showToast("Passwords do not match"); return}
                if(!/^01[0-9]{9}$/.test(phone)){showToast("Phone must be 01XXXXXXXXX (11 digits)"); return}
                const btn=e.currentTarget.querySelector('button[type="submit"]');
                const orig=btn?.textContent;
                if(btn){btn.disabled=true; btn.textContent="Creating ID..."}
                try{
                  const res=await api.register({ name, phone, email, password: pw });
                  if(res && res.user){
                    handleAuthSuccess(res.user);
                    showToast(`Welcome ${name} — ID ${res.user.userId} • 15% OFF code WELCOME15`);
                    setRegisterPage(false);
                    window.history.replaceState(null,"",window.location.pathname);
                    if(pendingOrderProduct){ setOrderProduct(pendingOrderProduct); setPendingOrderProduct(null) }
                  }
                }catch(err){ showToast(err.message||"Registration failed") }
                finally{ if(btn){btn.disabled=false; btn.textContent=orig}}
              }} className="mt-6 space-y-4">
                <div><label className="text-xs font-semibold">Full Name *</label><input name="name" required placeholder="Rahim Ahmed" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="text-xs font-semibold">Phone *</label><input name="phone" required pattern="01[0-9]{9}" placeholder="01951250125" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div><div><label className="text-xs font-semibold">Email *</label><input name="email" required type="email" placeholder="you@gmail.com" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div></div>
                <div><label className="text-xs font-semibold">Password *</label><input name="pw" required type="password" placeholder="Create password" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                <div><label className="text-xs font-semibold">Confirm Password *</label><input name="cpw" required type="password" placeholder="Confirm password" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                <label className="flex items-start gap-2 text-xs text-zinc-600"><input type="checkbox" required className="mt-0.5 accent-[#003D32]" /> I agree to KREVOS.Store Terms & Privacy — 1st order offer 15% OFF.</label>
                <button type="submit" className="w-full bg-[#003D32] text-white rounded-full py-3.5 text-sm font-bold hover:bg-[#004D40] transition">Register & Claim 15% OFF</button>
                <div className="text-center text-xs text-zinc-500">Already registered? <button type="button" onClick={()=>{setRegisterPage(false); setCustomerOpen(true); setCustomerMode("login")}} className="text-[#003D32] font-semibold hover:underline">Login here</button></div>
              </form>
            </div>
          </div>
        </div>
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-[#003D32] text-white text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fadeInUp">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {toast}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-zinc-900 selection:bg-[#003D32] selection:text-white">

      {/* ── Announcement Bar ── */}
      <div className="relative bg-[#003D32] text-white text-[11px] md:text-xs tracking-[0.14em] uppercase font-medium overflow-hidden z-50">
        <div className="flex animate-marquee whitespace-nowrap will-change-transform">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              <span className="px-6 md:px-10 py-2.5 flex items-center gap-6 md:gap-10">
                <span>Flat 15% on Spring Drop ’26</span><span className="w-1 h-1 bg-white/40 rounded-full" />
                <span>Order any 4 items &amp; get 30% OFF instantly</span><span className="w-1 h-1 bg-white/40 rounded-full" />
                <span>Free delivery above Tk 1999</span><span className="w-1 h-1 bg-white/40 rounded-full" />
                <span>krevos.store — Luxury menswear redefined</span><span className="w-1 h-1 bg-white/40 rounded-full" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <header className={`sticky top-0 z-40 bg-[#F6F8F7]/95 backdrop-blur-xl border-b transition-all duration-300 ${scrolled ? 'border-[#DDE8E6] shadow-sm' : 'border-transparent'}`}>
        {/* top row */}
        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[56px] sm:h-[64px] md:h-[72px] gap-2 sm:gap-4">
            {/* left: mobile menu + nav desktop */}
            <div className="flex items-center gap-3 sm:gap-6 flex-1">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 touch-manipulation">
                <div className="w-6 flex flex-col gap-1.5">
                  <span className="h-[1.5px] bg-[#003D32] w-full block" />
                  <span className="h-[1.5px] bg-[#003D32] w-4 block" />
                  <span className="h-[1.5px] bg-[#003D32] w-full block" />
                </div>
              </button>

              <nav className="hidden md:flex items-center gap-4 lg:gap-7 text-[13px] tracking-wide font-medium">
                <button onClick={() => activeCategory ? closeCategory() : window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-zinc-500 transition relative group cursor-pointer">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#003D32] group-hover:w-full transition-all duration-300" />
                </button>
                <div className="relative group">
                  <button className="flex items-center gap-1.5 hover:text-[#003D32] transition cursor-pointer py-6">
                    Men&apos;s Wear <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform duration-200 group-hover:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  {/* mega menu */}
                  <div className="absolute top-full left-0 pt-4 opacity-0 invisible translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-200 ease-out z-50">
                    <div className="bg-white shadow-2xl border border-[#E6F0EE] rounded-2xl p-6 flex gap-8 min-w-[520px]">
                      {[
                        { title:"ThreadBare", target:"collections", links:[{name:"T-shirt", id:"tshirt"}, {name:"Shacket & Shirt", id:"shacket"}, {name:"Denim", id:"denim"}, {name:"Joggers", id:"joggers"}] },
                        { title:"Winter Drop", target:"sweater", links:[{name:"Men's Sweater", id:"sweater"}, {name:"L/S Polo", id:"polo"}, {name:"Hoodies", id:"hoodies"}, {name:"Half Zip", id:"half-zip"}] },
                        { title:"Spring Drop '26", target:"spring-drop", links:[{name:"Spring Polo", id:"polo"}, {name:"Spring Tee", id:"tshirt"}] },
                      ].map(col => (
                        <div key={col.title} className="min-w-[140px]">
                          <button onClick={() => openCategory(col.target)} className="font-semibold text-xs tracking-widest uppercase mb-3 hover:text-[#003D32] transition text-left cursor-pointer">{col.title}</button>
                          <ul className="space-y-2 text-[13px] text-zinc-600">
                            {col.links.map(l => <li key={l.name}><button onClick={() => openCategory(l.id)} className="hover:text-[#003D32] hover:translate-x-1 inline-block transition text-left cursor-pointer">{l.name}</button></li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => openCategory('spring-drop')} className="hover:text-zinc-500 transition cursor-pointer">Spring Drop</button>
                <button onClick={() => { setRegisterPage(true); window.location.hash="#register" }} className="bg-[#003D32] text-white rounded-full px-5 py-2 text-[13px] font-semibold hover:bg-[#004D40] transition">First Order</button>
              </nav>
            </div>

            {/* center logo - Bottle Green */}
            <button onClick={() => activeCategory ? closeCategory() : window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center leading-none shrink-0 cursor-pointer px-1">
              <span className="font-brand font-bold tracking-[0.18em] sm:tracking-[0.22em] text-[18px] sm:text-[22px] md:text-[26px] text-[#003D32]">KREVOS<span className="font-light text-[#004D40]">.STORE</span></span>
            </button>

            {/* right icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-1 justify-end">
              <button onClick={() => setSearchOpen(true)} className="hidden md:flex items-center gap-2 text-sm text-zinc-500 border border-[#DDE8E6] rounded-full pl-4 pr-3 py-2 hover:border-zinc-300 hover:bg-white transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span className="hidden lg:inline">Search</span>
              </button>
              <button onClick={() => setSearchOpen(true)} className="md:hidden p-2 touch-manipulation">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
              {authUser ? (
                <button onClick={() => setCustomerOpen(true)} title={`${authUser.name} • ${authUser.userId}`} className="hidden md:flex items-center gap-2 bg-[#003D32] text-white rounded-full pl-2 pr-3 py-1.5 text-xs font-semibold hover:bg-[#004D40] transition">
                  <span className="w-7 h-7 rounded-full bg-white text-[#003D32] grid place-items-center font-bold text-xs">{authUser.name.slice(0,1).toUpperCase()}</span>
                  <span className="hidden lg:inline max-w-[90px] truncate">{authUser.name.split(' ')[0]}</span>
                  <span className="hidden lg:inline font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{authUser.userId}</span>
                </button>
              ) : (
                <button onClick={() => setCustomerOpen(true)} title="Customer Login" className="hidden md:grid place-items-center w-10 h-10 rounded-full hover:bg-white border border-transparent hover:border-[#DDE8E6] transition cursor-pointer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
              )}
              <button onClick={() => showToast(wishlist.size ? `Wishlist — ${wishlist.size} items at KREVOS.Store` : "Wishlist is empty — Save your favorites")} className="relative grid place-items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-white border border-transparent hover:border-[#DDE8E6] transition cursor-pointer touch-manipulation">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M19 14c1.5-1.6 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 1-4.5 2.5C10.5 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 3.9 3 5.5l7 7Z"/></svg>
                {wishlist.size > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#003D32] text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 grid place-items-center rounded-full">{wishlist.size}</span>}
              </button>
              <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-1 sm:gap-2 bg-[#003D32] text-white rounded-full pl-2.5 pr-2.5 sm:pl-3 sm:pr-3 md:pl-4 md:pr-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium hover:bg-[#004D40] transition touch-manipulation">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span className="hidden md:inline">Cart</span>
                <span className="bg-white text-[#003D32] rounded-full w-5 h-5 grid place-items-center text-xs font-bold">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {activeCategory ? (
        <section className="max-w-[1480px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 mb-6">
            <button onClick={closeCategory} className="hover:text-[#003D32] transition cursor-pointer">Home</button>
            <span className="text-zinc-300">/</span>
            <button onClick={() => openCategory('collections')} className="hover:text-[#003D32] transition cursor-pointer">Collections</button>
            <span className="text-zinc-300">/</span>
            <span className="text-[#003D32] font-medium">{categoryConfigs[activeCategory]?.title}</span>
            <span className="ml-auto hidden md:inline-flex items-center gap-2 text-xs bg-[#003D32] text-white px-3 py-1 rounded-full">{getCategoryProducts(activeCategory).length} Products</span>
          </div>

          {/* category hero */}
          <div className="rounded-[20px] sm:rounded-[24px] md:rounded-[32px] overflow-hidden bg-white border border-[#E6F0EE] grid md:grid-cols-[1.15fr_0.85fr] mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 md:p-10 lg:p-12 flex flex-col justify-center">
              <p className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-semibold text-zinc-500">{categoryConfigs[activeCategory]?.subtitle}</p>
              <h1 className="font-display text-[26px] sm:text-[32px] md:text-[44px] leading-none mt-2">{categoryConfigs[activeCategory]?.title}</h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-3 leading-relaxed max-w-[520px]">{categoryConfigs[activeCategory]?.desc}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-2 bg-[#E6F0EE] text-[#003D32] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#DDE8E6]">✓ In Stock & Ready to Ship</span>
                <span className="text-zinc-500 text-xs">Free delivery over Tk 1999</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                <button onClick={closeCategory} className="inline-flex items-center justify-center gap-2 border border-[#DDE8E6] rounded-full px-6 py-3 text-sm font-medium hover:bg-[#002A22] hover:text-white hover:border-[#003D32] transition cursor-pointer">← Back to Home</button>
                <button onClick={() => document.getElementById('category-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-[#003D32] text-white rounded-full px-8 py-3 text-sm font-semibold hover:bg-[#004D40] transition cursor-pointer text-center justify-center inline-flex">Shop Now</button>
              </div>
            </div>
            <div className="relative h-[220px] sm:h-[280px] md:h-auto md:min-h-[380px] bg-[#f5f1ec] overflow-hidden">
              <img src={categoryConfigs[activeCategory]?.hero} alt={categoryConfigs[activeCategory]?.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-full px-4 py-2 text-xs font-semibold">krevos.store • Authentic</div>
            </div>
          </div>

          {/* filter bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <p className="text-sm text-zinc-600"><span className="font-semibold text-[#003D32]">{getCategoryProducts(activeCategory).length}</span> products • Order online at <span className="font-medium text-[#003D32]">krevos.store</span></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 hidden md:inline">Sort:</span>
              <select onChange={(e)=>showToast(`Sorted by ${e.target.value} — KREVOS.Store`)} className="border border-[#DDE8E6] rounded-full px-4 py-2.5 text-sm bg-white outline-none focus:border-[#003D32] cursor-pointer">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
              <button onClick={()=>showToast('Filters — Coming soon')} className="hidden md:inline-flex items-center gap-2 border border-[#DDE8E6] rounded-full px-5 py-2.5 text-sm font-medium hover:border-[#003D32] transition">Filters <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h18M7 12h10M10 18h4"/></svg></button>
            </div>
          </div>

          {/* product grid */}
          {getCategoryProducts(activeCategory).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6F0EE] bg-white p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#E6F0EE] text-[#003D32] grid place-items-center mx-auto"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg></div>
              <p className="mt-4 text-sm font-semibold text-[#003D32]">No products in this collection</p>
              <p className="text-sm text-zinc-500 mt-1">This collection is currently empty — new arrivals coming soon</p>
              <button onClick={closeCategory} className="mt-4 bg-[#003D32] text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-[#004D40] transition">Back to Home</button>
            </div>
          ) : (
          <div id="category-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
            {getCategoryProducts(activeCategory).map((p) => (
              <article key={p.id} className="group bg-white rounded-2xl overflow-hidden border border-[#E6F0EE] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f1ec]">
                  <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:opacity-0 transition duration-500" />
                  <img src={p.hover || p.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition duration-700" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 rounded-full">{categoryConfigs[activeCategory]?.title.split(' ')[0]}</span>
                    {p.badge && <span className="bg-[#003D32] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{p.badge}</span>}
                  </div>
                  <button onClick={() => toggleWishlist(p.id)} className={`absolute top-3 right-3 w-8 h-8 rounded-full grid place-items-center backdrop-blur border transition cursor-pointer ${wishlist.has(p.id) ? 'bg-[#003D32] text-white border-[#003D32]' : 'bg-white/90 border-white hover:bg-white'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlist.has(p.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6"><path d="M19 14c1.5-1.6 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 1-4.5 2.5C10.5 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 3.9 3 5.5l7 7Z"/></svg>
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-2.5 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition duration-300 flex gap-2">
                    <button onClick={() => addToCart({...p, size: orderSize})} className="flex-1 bg-white text-[#003D32] text-xs font-semibold py-2.5 rounded-full hover:bg-zinc-100 transition shadow">Add to Cart</button>
                    <button onClick={() => setOrderProduct(p)} className="flex-1 bg-[#003D32] text-white text-xs font-semibold py-2.5 rounded-full hover:bg-[#004D40] transition shadow">Order Now</button>
                  </div>
                </div>
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <h3 className="text-[13px] md:text-sm font-medium leading-tight line-clamp-2 flex-1">{p.name}</h3>
                  {p.fabric && <p className="text-[11px] text-zinc-500 mt-1">{p.fabric} • {p.color}</p>}
                  {p.color && !p.fabric && <p className="text-[11px] text-zinc-500 mt-1">{p.color}</p>}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold">Tk {p.price.toLocaleString()}</span>
                    {p.original && p.original !== p.price && <span className="text-xs text-zinc-400 line-through">Tk {p.original.toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    {['S','M','L','XL'].map(s => (
                      <button key={s} onClick={() => setOrderSize(s)} className={`flex-1 py-1.5 rounded-full text-[11px] font-medium border transition cursor-pointer ${orderSize===s ? 'bg-[#003D32] text-white border-[#003D32]' : 'bg-white border-[#DDE8E6] hover:border-[#003D32]'}`}>{s}</button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setOrderProduct(p)} className="flex-1 bg-[#003D32] text-white rounded-full py-2.5 text-xs font-bold hover:bg-[#004D40] transition">Order — Tk {p.price.toLocaleString()}</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          )}

          {/* related collections */}
          <div className="mt-12 border-t border-[#E6F0EE] pt-8">
            <h3 className="font-display text-xl md:text-2xl mb-2">Explore More Collections</h3>
            <p className="text-sm text-zinc-500 mb-4">Every collection has its own order page at krevos.store</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryConfigs).slice(0,12).map(([key, cfg]) => (
                <button key={key} onClick={() => openCategory(key)} className={`px-5 py-2.5 rounded-full text-sm font-medium border transition cursor-pointer ${key===activeCategory ? 'bg-[#003D32] text-white border-[#003D32]' : 'bg-white border-[#DDE8E6] hover:border-[#003D32] hover:bg-[#002A22] hover:text-white'}`}>{cfg.title}</button>
              ))}
            </div>
          </div>

          {/* trust bar */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-[#E6F0EE]/60 rounded-2xl p-4 flex items-center gap-3 border border-[#E6F0EE]">
              <div className="w-10 h-10 rounded-full bg-[#003D32] text-white grid place-items-center">✓</div>
              <div><p className="text-sm font-semibold">Cash on Delivery</p><p className="text-xs text-zinc-500">Pay when you receive at krevos.store</p></div>
            </div>
            <div className="bg-[#E6F0EE]/60 rounded-2xl p-4 flex items-center gap-3 border border-[#E6F0EE]">
              <div className="w-10 h-10 rounded-full bg-[#003D32] text-white grid place-items-center">↩</div>
              <div><p className="text-sm font-semibold">Easy Exchange</p><p className="text-xs text-zinc-500">7 days replacement guarantee</p></div>
            </div>
            <div className="bg-[#E6F0EE]/60 rounded-2xl p-4 flex items-center gap-3 border border-[#E6F0EE]">
              <div className="w-10 h-10 rounded-full bg-[#003D32] text-white grid place-items-center">✆</div>
              <div><p className="text-sm font-semibold">Order via Phone</p><p className="text-xs text-zinc-500"><a href="tel:+8801951250125" className="hover:text-[#003D32] underline decoration-[#003D32]/20">01951250125</a> • 10AM-8PM</p></div>
            </div>
          </div>
        </section>
      ) : (
        <>
      {/* ── Hero Slider ── */}
      <section ref={heroRef} className="relative overflow-hidden bg-[#efe9e3]">
        <div className="relative h-[52vh] sm:h-[58vh] md:h-[70vh] lg:h-[84vh] min-h-[380px] sm:min-h-[440px] md:min-h-[520px] max-h-[880px]">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-all duration-[900ms] ${idx === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
              <img
                src={s.image}
                alt={s.title}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[8000ms] ${idx === currentSlide ? 'scale-105' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className={`absolute inset-0 flex items-center ${s.align === 'center' ? 'justify-center text-center' : s.align === 'right' ? 'justify-end text-right' : 'justify-start text-left'} px-4 sm:px-6 md:px-12 lg:px-20`}>
                <div className={`max-w-[560px] text-white ${idx === currentSlide ? 'animate-fadeInUp' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '200ms' }}>
                  <p className="text-[11px] md:text-xs tracking-[0.28em] uppercase font-semibold mb-3 md:mb-4 bg-white/15 backdrop-blur inline-flex px-3 py-1.5 rounded-full border border-white/20">
                    {s.subtitle} • krevos.store
                  </p>
                  <h1 className="font-display font-medium leading-[0.9] text-[30px] sm:text-[36px] md:text-[48px] lg:text-[64px] whitespace-pre-line drop-shadow-lg">
                    {s.title}
                  </h1>
                  <p className="mt-3 md:mt-4 text-xs sm:text-sm md:text-[15px] leading-relaxed text-white/90 max-w-[320px] sm:max-w-[420px] mx-auto md:mx-0">
                    {s.desc}
                  </p>
                  <button onClick={() => openCategory(s.targetId)} className="inline-flex items-center gap-2 mt-5 sm:mt-6 md:mt-8 bg-white text-[#003D32] px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-full text-xs sm:text-sm font-semibold hover:bg-zinc-100 transition group cursor-pointer">
                    {s.cta}
                    <span className="w-7 h-7 rounded-full bg-[#003D32] text-white grid place-items-center group-hover:translate-x-0.5 transition-transform">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* controls */}
          <button onClick={() => setCurrentSlide(s => (s - 1 + slides.length) % slides.length)} className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur grid place-items-center hover:bg-white transition shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={() => setCurrentSlide(s => (s + 1) % slides.length)} className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur grid place-items-center hover:bg-white transition shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          {/* dots + progress */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/90'}`}
                />
              ))}
            </div>
            <div className="hidden md:block w-[220px] h-px bg-white/30 rounded-full overflow-hidden">
              <div
                key={currentSlide}
                className="h-full bg-white rounded-full"
                style={{ animation: 'shimmer 4.5s linear forwards', width: '100%', transformOrigin: 'left', animationName: 'marquee' }}
              />
            </div>
          </div>

          {/* slide count */}
          <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-3 text-white text-xs tracking-widest font-medium">
            <span className="opacity-60">{String(currentSlide + 1).padStart(2,'0')}</span>
            <span className="w-12 h-px bg-white/40" />
            <span>{String(slides.length).padStart(2,'0')}</span>
          </div>
        </div>
      </section>

      {/* ── Exclusive Selection ── */}
      <section id="collections" className="max-w-[1480px] mx-auto px-4 md:px-6 lg:px-8 pt-14 md:pt-20 scroll-mt-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-[28px] md:text-[36px] leading-none">Exclusive Selection</h2>
          <button onClick={() => openCategory('collections')} className="text-sm font-medium underline underline-offset-4 decoration-zinc-300 hover:decoration-[#003D32] transition cursor-pointer">View All</button>
        </div>
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6F0EE] bg-white p-12 text-center">
            <p className="text-sm font-semibold text-[#003D32]">No collections available</p>
            <p className="text-sm text-zinc-500 mt-1">Exclusive selections will appear here — krevos.store</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {categories.map((c) => (
            <button key={c.id} onClick={() => openCategory(c.id)} className="group relative rounded-[20px] overflow-hidden aspect-[4/5] sm:aspect-[3/4] md:aspect-[3/4] bg-zinc-100 text-left w-full cursor-pointer touch-manipulation">
              <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-4 md:p-6 text-white">
                <p className="text-[11px] tracking-[0.18em] uppercase opacity-80">{c.count}</p>
                <h3 className="font-display text-lg md:text-xl font-medium leading-tight mt-1">{c.name}</h3>
                <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-white text-[#003D32] px-4 py-2 rounded-full group-hover:gap-2 transition-all">
                  Shop Now <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
              </div>
            </button>
          ))}
        </div>
        )}
      </section>

      {/* ── Just Dropped / Spring ── */}
      <section id="spring-drop" className="max-w-[1480px] mx-auto px-4 md:px-6 lg:px-8 pt-14 md:pt-20 scroll-mt-20">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h2 className="font-display text-[26px] md:text-[32px]">Just Dropped — Spring ’26</h2>
          <span className="ml-auto hidden md:inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase bg-[#003D32] text-white px-3 py-1.5 rounded-full">Flat 15% OFF</span>
        </div>
        {springProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6F0EE] bg-white p-12 text-center">
            <p className="text-sm font-semibold text-[#003D32]">No products available</p>
            <p className="text-sm text-zinc-500 mt-1">Spring ’26 drop is being prepared — stay tuned at krevos.store</p>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {springProducts.map((p) => (
            <article key={p.id} className="group bg-white rounded-2xl overflow-hidden border border-[#E6F0EE] hover:shadow-lg transition flex flex-col">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f6f6f6]">
                <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:opacity-0 transition duration-500" />
                <img src={p.hover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500" />
                <span className="absolute top-3 left-3 bg-[#ff3b30] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">{p.badge}</span>
                <button onClick={() => toggleWishlist(p.id)} className={`absolute top-3 right-3 w-8 h-8 rounded-full grid place-items-center backdrop-blur border ${wishlist.has(p.id) ? 'bg-[#003D32] text-white border-[#003D32]' : 'bg-white/90 border-white'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlist.has(p.id)?"currentColor":"none"} stroke="currentColor" strokeWidth="1.6"><path d="M19 14c1.5-1.6 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 1-4.5 2.5C10.5 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 3.9 3 5.5l7 7Z"/></svg>
                </button>
                <button onClick={() => addToCart(p)} className="absolute bottom-3 left-3 right-3 bg-white text-[#003D32] text-xs font-semibold py-2.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300 shadow-lg hover:bg-[#002A22] hover:text-white hidden sm:block">
                  Quick Add — Tk {p.price.toLocaleString()}
                </button>
                <button onClick={() => addToCart(p)} className="sm:hidden absolute bottom-3 left-3 right-3 bg-white/95 text-[#003D32] text-[11px] font-bold py-2 rounded-full shadow-lg border border-white">
                  Add — Tk {p.price.toLocaleString()}
                </button>
              </div>
              <div className="p-3 md:p-4">
                <h3 className="text-[13px] font-medium line-clamp-1">{p.name}</h3>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-sm font-bold">Tk {p.price.toLocaleString()}</span>
                  <span className="text-xs text-zinc-400 line-through">Tk {p.original.toLocaleString()}</span>
                  <span className="ml-auto text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Save Tk {(p.original - p.price).toLocaleString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <button onClick={() => openCategory('spring-drop')} className="inline-flex items-center gap-2 border border-[#003D32] rounded-full px-8 py-3 text-sm font-semibold hover:bg-[#002A22] hover:text-white transition cursor-pointer">View All Spring — Order Now</button>
        </div>
        </>
        )}
      </section>

      {/* ── Own the Look ── - hidden when no products */}
      {lookbook.length > 0 && (
      <section className="max-w-[1480px] mx-auto px-4 md:px-6 lg:px-8 pt-14 md:pt-20">
        <div className="rounded-[24px] md:rounded-[32px] overflow-hidden bg-[#003D32] text-white grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[640px] overflow-hidden">
            <img src={lookbook[activeLook]?.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
            <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-6 flex gap-2">
              {lookbook.map((_, i) => (
                <button key={i} onClick={() => setActiveLook(i)} className={`h-1.5 rounded-full transition-all ${i===activeLook ? 'flex-1 bg-white' : 'w-8 bg-white/40'}`} />
              ))}
            </div>
            <span className="absolute top-4 left-4 md:top-6 md:left-6 bg-white text-[#003D32] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">Own The Look</span>
          </div>
          <div className="p-6 md:p-10 lg:p-12 flex flex-col">
            <p className="text-[11px] tracking-[0.24em] uppercase text-zinc-400">KREVOS.Store Lookbook</p>
            <h2 className="font-display text-[30px] md:text-[40px] leading-[0.95] mt-3">Shop the<br/>Complete Look</h2>
            <p className="text-sm text-zinc-400 mt-3">Curated head-to-toe outfits — tap to shop each piece. Free styling consultation at krevos.store</p>

            <div className="mt-8 space-y-3">
              {[0,1,2].map(i => {
                const it = lookbook[(activeLook + i) % lookbook.length]
                return (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border transition ${i===0 ? 'bg-white text-[#003D32] border-white' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}>
                    <img src={it.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">{it.title}</h4>
                      <p className={`text-sm ${i===0 ? 'text-zinc-600' : 'text-zinc-400'}`}>{it.price}</p>
                    </div>
                    <button onClick={() => addToCart({ id: 900+i, name: it.title, price: parseInt(it.price.replace(/\D/g,'')), image: it.image, hover: it.image })} className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${i===0 ? 'bg-[#003D32] text-white' : 'bg-white text-[#003D32]'}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                  </div>
                )
              })}
            </div>

            <a href="#" className="mt-auto pt-8 inline-flex items-center justify-center gap-2 bg-white text-[#003D32] rounded-full py-4 text-sm font-semibold hover:bg-zinc-100 transition">
              Shop This Look — Tk 8,999
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>
      )}

      {/* ── Features ── */}
      <section className="max-w-[1480px] mx-auto px-4 md:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {[
            { title:"Delivering All Over Bangladesh", desc:"Free delivery above Tk 1,999 • Same day in Dhaka", icon:"M5 8h14M5 8a2 2 0 1 1 0 4h14a2 2 0 1 0 0-4H5Z" },
            { title:"100% Safe & Secure Checkout", desc:"SSL encrypted • bKash, Nagad, Cards & COD", icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" },
            { title:"24/7 Online Support", desc:"Chat with KREVOS experts — krevos.store/help", icon:"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-4 bg-white rounded-2xl border border-[#E6F0EE] p-5">
              <div className="w-12 h-12 rounded-full bg-[#003D32] text-white grid place-items-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={f.icon} /></svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold leading-tight">{f.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ── Deep Bottle Green */}
      <section className="max-w-[1480px] mx-auto px-4 md:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-14">
        <div className="rounded-[24px] sm:rounded-[28px] bg-[#003D32] text-white p-5 sm:p-6 md:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] relative overflow-hidden">
          {/* subtle gold accent line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent" />
          <div className="text-center lg:text-left">
            <h3 className="font-display text-[24px] sm:text-[28px] md:text-[32px] leading-none">Join KREVOS Town</h3>
            <p className="text-xs sm:text-sm text-white/70 mt-2 max-w-[480px] mx-auto lg:mx-0">Get 15% off your first order + early access to Eid, Spring & Winter drops. No spam — only luxury updates from krevos.store</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); showToast("Welcome to KREVOS Town — check your email!"); e.currentTarget.reset() }} className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 max-w-[520px] lg:grow">
            <input required type="email" placeholder="Enter your email" className="flex-1 min-w-0 bg-white text-[#003D32] rounded-full px-5 sm:px-6 py-3.5 sm:py-4 text-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#C5A880]/40" />
            <button className="bg-white text-[#003D32] hover:bg-[#E6F0EE] transition rounded-full px-6 sm:px-7 py-3.5 sm:py-4 text-sm font-semibold shrink-0 shadow-lg whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </section>
        </>
      )}

      {/* ── Footer ── Deep Bottle Green */}
      <footer className="mt-10 md:mt-14 bg-[#003D32] text-white/70 border-t border-white/5 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/20 to-transparent" />
        <div className="max-w-[1480px] mx-auto px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-8 lg:gap-12">
            <div className="md:col-span-4">
              <p className="font-brand font-bold tracking-[0.22em] text-white text-xl">KREVOS<span className="font-light">.STORE</span></p>
              <p className="text-sm leading-relaxed mt-4 max-w-[360px]">Luxury menswear redefined in Bangladesh. From ThreadBare essentials to ornate Eid panjabis — KREVOS.Store crafts timeless pieces for the modern gentleman.</p>
              <div className="flex gap-3 mt-6">
                <a href="https://www.facebook.com/profile.php?id=61550245897755" target="_blank" rel="noopener noreferrer" aria-label="KREVOS.Store on Facebook" className="w-10 h-10 rounded-full bg-white/10 grid place-items-center hover:bg-white hover:text-[#003D32] transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                <a href="https://www.instagram.com/krevos.store" target="_blank" rel="noopener noreferrer" aria-label="KREVOS.Store on Instagram" className="w-10 h-10 rounded-full bg-white/10 grid place-items-center hover:bg-white hover:text-[#003D32] transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 grid place-items-center hover:bg-white hover:text-[#003D32] transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M23 3a10.9 10.9 0 0 1-3.1 1 4.48 4.48 0 0 0-7.9 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.1-.9A7.72 7.72 0 0 0 23 3Z"/></svg></a>
              </div>
              <div className="mt-8">
                <img src="https://buri.ltd/cdn/shop/files/Payment_Banner_2_-_Copy.png?v=1767675257&width=600" alt="Payments" className="h-8 object-contain opacity-80 invert" />
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-white font-semibold text-sm mb-4">Help & Info</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  {label:"Help Center", id:"help"},
                  {label:"Delivery & Collection", id:"delivery"},
                  {label:"Returns & Refunds", id:"returns"},
                  {label:"Track Your Order", id:"track"},
                  {label:"Size Guide", id:"size"},
                  {label:"Contact Us", id:"contact"},
                ].map(l => <li key={l.id}><button onClick={() => setInfoPage(l.id)} className="hover:text-white transition text-left">{l.label}</button></li>)}
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-white font-semibold text-sm mb-4">Shop at KREVOS.Store</h4>
              <ul className="space-y-2.5 text-sm">
                {["ThreadBare — T-shirts & Denim","Winter Drop — Hoodies & Sweaters","Spring Drop '26 — Polos & Tees","New Arrivals","Best Sellers"].map(l => <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>)}
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-white font-semibold text-sm mb-4">Contact Us</h4>
              <p className="text-sm leading-relaxed">Online Store Only — No Physical Outlet<br/><a href="mailto:krevos.store@gmail.com" className="hover:text-white underline underline-offset-4 decoration-white/20">krevos.store@gmail.com</a><br/><a href="mailto:support@krevos.store" className="hover:text-white underline underline-offset-4 decoration-white/20">support@krevos.store</a><br/><a href="tel:+8801951250125" className="hover:text-white underline underline-offset-4 decoration-white/20">01951250125</a><br/><span className="text-white/50">Sat–Thu: 10AM – 8PM (BST)</span></p>
              <p className="text-sm mt-3"><a href="mailto:krevos.store@gmail.com?subject=Inquiry%20from%20krevos.store%20website&body=Hello%20KREVOS.Store%20team%2C%0A" onClick={() => { navigator.clipboard?.writeText("krevos.store@gmail.com"); showToast("krevos.store@gmail.com — opening email & copied") }} className="underline underline-offset-4 decoration-white/30 hover:decoration-white">Email us</a> <span className="mx-1">•</span> <button onClick={() => setInfoPage("contact")} className="underline underline-offset-4 decoration-white/30 hover:decoration-white">Live Chat</button> <span className="mx-1">•</span> <button onClick={() => { setInfoPage("contact"); showToast("Contact form opened") }} className="underline underline-offset-4 decoration-white/30 hover:decoration-white">Contact Form</button></p>
              <p className="text-xs mt-4 text-white/50">© 2026 KREVOS.Store. All rights reserved.<br/>We deliver all over Bangladesh.</p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 text-xs justify-between items-center">
            <p>© 2026 KREVOS.Store — krevos.store • Privacy • Terms • Sitemap</p>
            <div className="flex items-center gap-4">
              <p className="text-white/50 hidden md:block">This is a demo frontend inspired by Buri.ltd • Built with React + Tailwind CSS</p>
              <a href="#admin" onClick={() => setAdminView(true)} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white transition"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Admin</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Help & Info Modal — usable pages ── */}
      {infoPage && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setInfoPage(null)} className="fixed inset-0 bg-[#003D32]/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[24px] w-full max-w-[640px] max-h-[90vh] overflow-auto shadow-2xl animate-scaleIn">
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between rounded-t-[24px] z-10">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-zinc-500">KREVOS.Store • Help & Info</p>
                <h3 className="font-display text-xl leading-none mt-1">
                  {infoPage==="help" && "Help Center"}
                  {infoPage==="delivery" && "Delivery & Collection"}
                  {infoPage==="returns" && "Returns & Refunds"}
                  {infoPage==="track" && "Track Your Order"}
                  {infoPage==="size" && "Size Guide"}
                  {infoPage==="contact" && "Contact Us"}
                </h3>
              </div>
              <button onClick={() => setInfoPage(null)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center hover:bg-zinc-200 transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div className="p-6 space-y-4 text-sm leading-relaxed">
              {infoPage==="help" && (
                <div className="space-y-4">
                  <p className="text-zinc-600">Welcome to <b className="text-[#003D32]">KREVOS.Store Help Center</b>. Find answers or contact us directly.</p>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#E6F0EE] p-4"><p className="font-semibold">How do I place an order?</p><p className="text-zinc-600 text-xs mt-1">Browse products → Select size → Add to Cart → Checkout with Cash on Delivery. You’ll get a confirmation call at <a href="tel:+8801951250125" className="text-[#003D32] underline">01951250125</a>.</p></div>
                    <div className="rounded-2xl border border-[#E6F0EE] p-4"><p className="font-semibold">Payment options?</p><p className="text-zinc-600 text-xs mt-1">Cash on Delivery, bKash, Nagad, Cards — 100% SSL secure at checkout.</p></div>
                    <div className="rounded-2xl border border-[#E6F0EE] p-4"><p className="font-semibold">Need more help?</p><p className="text-zinc-600 text-xs mt-1">Email <a href="mailto:krevos.store@gmail.com" className="text-[#003D32] underline">krevos.store@gmail.com</a> or call 01951250125 (Sat–Thu 10AM–8PM).</p></div>
                  </div>
                  <button onClick={() => setInfoPage("contact")} className="w-full bg-[#003D32] text-white rounded-full py-3 text-sm font-bold hover:bg-[#004D40] transition">Contact Support</button>
                </div>
              )}
              {infoPage==="delivery" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#E6F0EE]/50 border border-[#E6F0EE] p-4"><p className="font-semibold text-[#003D32]">Free delivery above Tk 1,999 • Same day in Dhaka</p><p className="text-xs text-zinc-600 mt-1">We deliver all over Bangladesh.</p></div>
                  <ul className="space-y-2 text-zinc-600 text-xs list-disc pl-5">
                    <li><b>Dhaka:</b> 1–2 days (Same day if ordered before 2PM)</li>
                    <li><b>Outside Dhaka:</b> 2–4 days via Pathao / Sundarban / SA Paribahan</li>
                    <li><b>Fee:</b> Tk 80 (Dhaka), Tk 120 (outside) — <b>Free</b> over Tk 1,999</li>
                    <li><b>Collection:</b> Online only — no physical outlet. Courier collection available.</li>
                  </ul>
                  <p className="text-xs text-zinc-500">You’ll receive SMS + call from 01951250125 before delivery.</p>
                </div>
              )}
              {infoPage==="returns" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#E6F0EE]/50 border border-[#E6F0EE] p-4"><p className="font-semibold text-[#003D32]">7-Day Easy Exchange • No return, only exchange for size/defect</p></div>
                  <ul className="space-y-2 text-zinc-600 text-xs list-disc pl-5">
                    <li>Notify within 7 days via <a href="mailto:krevos.store@gmail.com" className="text-[#003D32] underline">krevos.store@gmail.com</a> or 01951250125.</li>
                    <li>Item must be unused, unwashed, with tags intact.</li>
                    <li>Exchange available for same product / size only — subject to stock.</li>
                    <li>Delivery fee for exchange: Customer bears cost unless defect from our side.</li>
                  </ul>
                  <button onClick={() => setInfoPage("contact")} className="w-full border border-[#DDE8E6] rounded-full py-3 text-sm font-semibold hover:border-[#003D32] transition">Request Exchange</button>
                </div>
              )}
              {infoPage==="track" && (
                <div className="space-y-4">
                  <p className="text-zinc-600">Enter your Order ID (e.g. from checkout SMS) to see status. Demo — any ID works.</p>
                  <form onSubmit={e => { e.preventDefault(); const id = new FormData(e.currentTarget).get('oid'); if(!id) return; showToast(`Order ${id} — In Transit • Call 01951250125`); setInfoPage(null) }} className="flex gap-2">
                    <input name="oid" required placeholder="Order ID e.g. CRS-1234" className="flex-1 border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" />
                    <button className="bg-[#003D32] text-white rounded-full px-6 py-3 text-sm font-bold hover:bg-[#004D40] transition">Track</button>
                  </form>
                  <div className="rounded-xl bg-[#F6F8F7] border border-[#E6F0EE] p-4 text-xs">
                    <p className="font-semibold">Example timeline</p>
                    <p className="mt-1 text-zinc-600">Ordered → Confirmed (call) → Shipped (SMS) → Out for Delivery → Delivered &amp; COD collected.</p>
                  </div>
                </div>
              )}
              {infoPage==="size" && (
                <div className="space-y-4">
                  <p className="text-zinc-600 text-xs">Chest = pit-to-pit. Length = shoulder to hem. All in inches. Model is 5'11" wearing M.</p>
                  <div className="overflow-auto rounded-xl border border-[#E6F0EE]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#003D32] text-white"><tr><th className="px-4 py-2">Size</th><th className="px-4 py-2">Chest</th><th className="px-4 py-2">Length</th><th className="px-4 py-2">Sleeve</th><th className="px-4 py-2">Fits</th></tr></thead>
                      <tbody className="divide-y divide-[#E6F0EE]">
                        <tr><td className="px-4 py-2 font-semibold">S</td><td className="px-4 py-2">38"</td><td className="px-4 py-2">27"</td><td className="px-4 py-2">8"</td><td className="px-4 py-2">36-38"</td></tr>
                        <tr><td className="px-4 py-2 font-semibold">M</td><td className="px-4 py-2">40"</td><td className="px-4 py-2">28"</td><td className="px-4 py-2">8.5"</td><td className="px-4 py-2">38-40"</td></tr>
                        <tr><td className="px-4 py-2 font-semibold">L</td><td className="px-4 py-2">42"</td><td className="px-4 py-2">29"</td><td className="px-4 py-2">9"</td><td className="px-4 py-2">40-42"</td></tr>
                        <tr><td className="px-4 py-2 font-semibold">XL</td><td className="px-4 py-2">44"</td><td className="px-4 py-2">30"</td><td className="px-4 py-2">9.5"</td><td className="px-4 py-2">42-44"</td></tr>
                        <tr><td className="px-4 py-2 font-semibold">XXL</td><td className="px-4 py-2">46"</td><td className="px-4 py-2">31"</td><td className="px-4 py-2">10"</td><td className="px-4 py-2">44-46"</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-zinc-500">Tip: If between sizes, size up for relaxed fit. For hoodies/sweaters add 1" chest.</p>
                </div>
              )}
              {infoPage==="contact" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#003D32] text-white p-5">
                    <p className="text-sm font-semibold">Contact KREVOS.Store</p>
                    <p className="text-xs text-white/70 mt-1">Online Store Only — No Physical Outlet</p>
                    <div className="mt-3 space-y-1 text-sm"><p><a href="mailto:krevos.store@gmail.com" className="underline decoration-white/30">krevos.store@gmail.com</a> • <a href="mailto:support@krevos.store" className="underline decoration-white/30">support@krevos.store</a></p><p><a href="tel:+8801951250125" className="underline decoration-white/30">01951250125</a> • Sat–Thu 10AM–8PM (BST)</p></div>
                  </div>
                  <div className="flex gap-3">
                    <a href="https://www.facebook.com/profile.php?id=61550245897755" target="_blank" rel="noopener noreferrer" className="flex-1 border border-[#DDE8E6] rounded-full py-2.5 text-center text-sm font-medium hover:border-[#003D32] transition">Facebook</a>
                    <a href="https://www.instagram.com/krevos.store" target="_blank" rel="noopener noreferrer" className="flex-1 border border-[#DDE8E6] rounded-full py-2.5 text-center text-sm font-medium hover:border-[#003D32] transition">Instagram</a>
                    <a href="tel:+8801951250125" className="flex-1 bg-[#003D32] text-white rounded-full py-2.5 text-center text-sm font-bold hover:bg-[#004D40] transition">Call Now</a>
                  </div>
                  <form onSubmit={e=>{e.preventDefault(); showToast("Message sent — we’ll reply at krevos.store@gmail.com"); setInfoPage(null)}} className="space-y-3">
                    <input required placeholder="Your Name" className="w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" />
                    <input required type="email" placeholder="Your Email" className="w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" />
                    <textarea required placeholder="How can we help?" rows="3" className="w-full border border-[#DDE8E6] rounded-2xl px-5 py-3 text-sm outline-none focus:border-[#003D32] resize-none"></textarea>
                    <button className="w-full bg-[#003D32] text-white rounded-full py-3 text-sm font-bold hover:bg-[#004D40] transition">Send Message</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      {/* ── Customer Login (user icon) ── */}
      {customerOpen && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setCustomerOpen(false)} className="fixed inset-0 bg-[#003D32]/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[24px] w-full max-w-[420px] max-h-[90vh] overflow-auto shadow-2xl animate-scaleIn">
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b flex items-center justify-between rounded-t-[24px] z-10">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-zinc-500">KREVOS.Store</p>
                <h3 className="font-display text-xl leading-none mt-1">{customerMode === "login" ? "Customer Login" : "Create Account"}</h3>
              </div>
              <button onClick={() => setCustomerOpen(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center hover:bg-zinc-200 transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div className="p-4 sm:p-6">
              {authUser ? (
                <div className="space-y-4">
                  <div className="bg-[#F6F8F7] rounded-2xl p-5 border border-[#E6F0EE] text-center">
                    <div className="w-14 h-14 rounded-full bg-[#003D32] text-white grid place-items-center mx-auto text-xl font-bold">{authUser.name.slice(0,1).toUpperCase()}</div>
                    <p className="font-semibold mt-3">{authUser.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{authUser.email} • {authUser.phone}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 bg-[#003D32] text-white text-xs font-mono px-3 py-1 rounded-full">ID: {authUser.userId}</p>
                    {authUser.address && <p className="text-xs text-zinc-500 mt-2">{authUser.address}</p>}
                    <p className="text-[11px] text-[#003D32] font-semibold mt-2 bg-white rounded-full px-3 py-1 border border-[#DDE8E6] inline-block">{orders.filter(o=> o.userId===authUser.userId || o.customer.phone===authUser.phone).length} orders • Tk {orders.filter(o=> o.userId===authUser.userId || o.customer.phone===authUser.phone).reduce((s,o)=>s+o.total,0).toLocaleString()} total</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs">
                    <p className="font-semibold text-amber-800">Your orders are clustered by name & ID in admin</p>
                    <p className="text-amber-700 mt-1">Every order you place with <b>{authUser.userId}</b> will appear grouped under <b>{authUser.name}</b> in Admin → Customers & Order History and in /api/cluster.</p>
                  </div>
                  <button onClick={handleLogout} className="w-full border border-red-200 text-red-600 bg-red-50 rounded-full py-3 text-sm font-semibold hover:bg-red-100 transition">Logout — {authUser.userId}</button>
                  <button onClick={()=>setCustomerOpen(false)} className="w-full bg-[#003D32] text-white rounded-full py-3 text-sm font-bold hover:bg-[#004D40] transition">Continue Shopping</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-6 bg-[#F6F8F7] rounded-full p-1">
                    <button onClick={() => setCustomerMode("login")} className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${customerMode==="login" ? "bg-[#003D32] text-white" : "text-zinc-600"}`}>Login</button>
                    <button onClick={() => setCustomerMode("register")} className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${customerMode==="register" ? "bg-[#003D32] text-white" : "text-zinc-600"}`}>Register (Create ID)</button>
                  </div>
                  <form onSubmit={async e=>{
                    e.preventDefault();
                    const fd=new FormData(e.currentTarget);
                    const btn=e.currentTarget.querySelector('button[type="submit"]');
                    const origText=btn?.textContent;
                    if(btn){ btn.disabled=true; btn.textContent="Please wait..." }
                    try{
                      if(customerMode==="login"){
                        const emailOrPhone=(fd.get("emailOrPhone")||fd.get("email")||"").toString().trim();
                        const pw=fd.get("password")?.toString()||"";
                        if(!emailOrPhone||!pw){ showToast("Please fill email/phone & password"); return }
                        const res=await api.login({ emailOrPhone, email: emailOrPhone, phone: emailOrPhone, password: pw });
                        if(res && res.user){ handleAuthSuccess(res.user) }
                      } else {
                        const name=fd.get("name")?.toString().trim()||"";
                        const phone=fd.get("phone")?.toString().trim()||"";
                        const email=fd.get("email")?.toString().trim()||"";
                        const pw=fd.get("password")?.toString()||"";
                        const cpw=fd.get("cpassword")?.toString()||"";
                        const address=fd.get("address")?.toString().trim()||"";
                        if(!name||!phone||!email||!pw){ showToast("Please fill name, phone, email, password"); return }
                        if(pw!==cpw){ showToast("Passwords do not match"); return }
                        const res=await api.register({ name, phone, email, password: pw, address });
                        if(res && res.user){ handleAuthSuccess(res.user); showToast(`ID ${res.user.userId} created — you can now order`) }
                      }
                    }catch(err){ showToast(err.message||"Auth failed") }
                    finally{ if(btn){ btn.disabled=false; btn.textContent=origText } }
                  }} className="space-y-3">
                    {customerMode==="login" ? (
                      <>
                        <div><label className="text-xs font-semibold">Email or Phone *</label><input name="emailOrPhone" required placeholder="you@gmail.com or 01XXXXXXXXX" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                        <div><label className="text-xs font-semibold">Password *</label><input name="password" type="password" required placeholder="Password" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                      </>
                    ) : (
                      <>
                        <div><label className="text-xs font-semibold">Full Name *</label><input name="name" required placeholder="Rahim Ahmed" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="text-xs font-semibold">Phone *</label><input name="phone" required pattern="01[0-9]{9}" placeholder="01951250125" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div><div><label className="text-xs font-semibold">Email *</label><input name="email" required type="email" placeholder="you@gmail.com" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div></div>
                        <div><label className="text-xs font-semibold">Address</label><input name="address" placeholder="Road, Area, District" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="text-xs font-semibold">Password *</label><input name="password" type="password" required placeholder="Create password" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div><div><label className="text-xs font-semibold">Confirm *</label><input name="cpassword" type="password" required placeholder="Confirm" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32]" /></div></div>
                        <label className="flex items-start gap-2 text-xs text-zinc-600"><input type="checkbox" required className="mt-0.5 accent-[#003D32]" /> I agree to KREVOS.Store Terms & Privacy.</label>
                      </>
                    )}
                    <button type="submit" className="w-full bg-[#003D32] text-white rounded-full py-3.5 text-sm font-bold hover:bg-[#004D40] transition">{customerMode==="login" ? "Login & Order" : "Create ID & Login"}</button>
                    <div className="text-center text-xs text-zinc-500">
                      {customerMode==="login" ? (
                        <>Don’t have an ID? <button type="button" onClick={()=>setCustomerMode("register")} className="text-[#003D32] font-semibold hover:underline">Create ID</button></>
                      ) : (
                        <>Already have an ID? <button type="button" onClick={()=>setCustomerMode("login")} className="text-[#003D32] font-semibold hover:underline">Login</button></>
                      )}
                    </div>
                    <button type="button" onClick={()=>{setCustomerOpen(false); setRegisterPage(true); window.location.hash="#register"}} className="w-full mt-1 border border-[#C5A880]/30 bg-[#C5A880]/10 text-[#003D32] rounded-full py-2.5 text-xs font-semibold hover:bg-[#C5A880]/20 transition">First Order? Full Registration — Get 15% OFF →</button>
                    <p className="text-[11px] text-center text-zinc-400">ID (e.g. KVS-123456) is generated on register • Required to cluster orders by name in admin & /api/cluster</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div onClick={() => setCartOpen(false)} className="fixed inset-0 bg-[#003D32]/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-[420px] h-[100dvh] bg-white shadow-2xl flex flex-col animate-slideInRight overflow-hidden">
            <div className="shrink-0 p-6 border-b flex items-center justify-between bg-white">
              <h3 className="font-semibold">Shopping Cart — {cartCount} {cartCount===1?'item':'items'}</h3>
              <button onClick={() => setCartOpen(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center hover:bg-zinc-200 transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
              {cart.length===0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-zinc-100 grid place-items-center mx-auto"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg></div>
                  <p className="mt-4 font-medium">Your cart is empty</p>
                  <p className="text-sm text-zinc-500">Add KREVOS pieces to get started</p>
                  <button onClick={() => setCartOpen(false)} className="mt-6 bg-[#003D32] text-white rounded-full px-7 py-3 text-sm font-semibold">Continue Shopping</button>
                </div>
              ) : cart.map(item => (
                <div key={`${item.id}-${item.size || ''}`} className="flex gap-4 border border-[#E6F0EE] rounded-2xl p-3">
                  <img src={item.image} alt="" className="w-20 h-20 rounded-xl object-cover bg-[#E6F0EE]/60" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium leading-tight line-clamp-2">{item.name}</h4>
                    {item.size && <p className="text-xs text-zinc-500 mt-0.5">Size: {item.size}</p>}
                    <p className="text-sm font-semibold mt-1">Tk {item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setCart(c => c.map(p => p.id===item.id && p.size===item.size ? {...p, qty: Math.max(1, p.qty-1)}:p))} className="w-7 h-7 rounded-full border grid place-items-center hover:bg-zinc-100">−</button>
                      <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                      <button onClick={() => setCart(c => c.map(p => p.id===item.id && p.size===item.size ? {...p, qty: p.qty+1}:p))} className="w-7 h-7 rounded-full border grid place-items-center hover:bg-zinc-100">+</button>
                      <button onClick={() => setCart(c => c.filter(p=> !(p.id===item.id && p.size===item.size)))} className="ml-auto text-xs text-red-600 hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length>0 && (
              <div className="shrink-0 p-6 border-t bg-[#E6F0EE]/60 space-y-4 max-h-[58vh] overflow-y-auto overscroll-contain">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">Tk {cartTotal.toLocaleString()}.00</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span className="text-green-600 font-medium">Free over Tk 1,999</span></div>
                {!authUser ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const name = fd.get('c_name')?.toString().trim() || ''
                    const phone = fd.get('c_phone')?.toString().trim() || ''
                    const address = fd.get('c_address')?.toString().trim() || ''
                    const email = fd.get('c_email')?.toString().trim() || ''
                    if (!name) { showToast('Please enter your full name'); return }
                    if (!phone) { showToast('Please enter your phone number'); return }
                    if (!/^01[0-9]{9}$/.test(phone)) { showToast('Phone must be 01XXXXXXXXX (11 digits)'); return }
                    if (!address) { showToast('Please enter delivery address'); return }
                    const customer = { name, phone, email, address }
                    try {
                      const order = await createOrder(customer, [...cart], cartTotal)
                      showToast(`Order ${order.id} placed — Tk ${cartTotal.toLocaleString()} • Guest • delivering to ${address}`)
                      setCart([]); setCartOpen(false)
                    } catch(err) { showToast(err.message || 'Order failed') }
                  }} className="space-y-3 bg-white rounded-2xl p-4 border border-[#E6F0EE]">
                    <p className="text-xs font-bold text-[#003D32]">First Order — Your Information Required <span className="text-red-500">*</span></p>
                    <p className="text-[11px] text-zinc-500">Name, Phone & Address needed to deliver • Already have an ID? <button type="button" onClick={()=>{setCartOpen(false); setTimeout(()=>{setCustomerOpen(true); setCustomerMode("login")},150)}} className="text-[#003D32] underline font-semibold">Login</button> • or order as guest</p>
                    <input name="c_name" required placeholder="Full Name *" className="w-full border border-[#DDE8E6] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#003D32]" />
                    <input name="c_phone" required pattern="01[0-9]{9}" placeholder="Phone 01XXXXXXXXX *" className="w-full border border-[#DDE8E6] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#003D32]" />
                    <input name="c_email" type="email" placeholder="Email (optional)" className="w-full border border-[#DDE8E6] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#003D32]" />
                    <input name="c_address" required placeholder="Delivery Address — Road, Area, District *" className="w-full border border-[#DDE8E6] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#003D32]" />
                    <button type="submit" className="w-full bg-[#003D32] text-white rounded-full py-3 font-semibold hover:bg-[#004D40] transition">Place Order • Tk {cartTotal.toLocaleString()}.00 — Guest</button>
                    <p className="text-[11px] text-center text-zinc-500">Cash on Delivery • Free delivery over Tk 1999 • No login needed</p>
                    <p className="text-[11px] text-center text-zinc-400">Want 15% OFF? <button type="button" onClick={()=>{setCartOpen(false); setTimeout(()=>{setCustomerOpen(true); setCustomerMode("register")},150)}} className="text-[#003D32] font-semibold underline">Create ID</button></p>
                  </form>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const address = fd.get('address')?.toString().trim() || ''
                    if (!address) { showToast('Please fill delivery address'); return }
                    const customer = { name: authUser.name, phone: authUser.phone, email: authUser.email, address, userId: authUser.userId }
                    try {
                      const order = await createOrder(customer, [...cart], cartTotal)
                      showToast(`Order ${order.id} placed — Tk ${cartTotal.toLocaleString()} • ID ${authUser.userId} • will cluster in orders`)
                      setCart([]); setCartOpen(false)
                    } catch(err) { showToast(err.message || 'Order failed') }
                  }} className="space-y-3">
                    <div className="bg-white rounded-2xl p-3 border border-[#E6F0EE] text-xs">
                      <p className="font-semibold">{authUser.name} <span className="font-mono bg-[#003D32] text-white px-1.5 py-0.5 rounded-full">{authUser.userId}</span></p>
                      <p className="text-zinc-500">{authUser.phone} • {authUser.email}</p>
                    </div>
                    <label className="text-xs font-semibold">Delivery Address <span className="text-red-500">*</span></label>
                    <input name="address" required defaultValue={authUser.address||''} placeholder="Delivery Address — Road, Area, District *" className="w-full border border-[#DDE8E6] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#003D32] bg-white" />
                    <button type="submit" className="w-full bg-[#003D32] text-white rounded-full py-4 font-semibold hover:bg-[#004D40] transition">Checkout • Tk {cartTotal.toLocaleString()}.00 — {authUser?.userId}</button>
                    <p className="text-[11px] text-center text-zinc-500">Cash on Delivery • Free delivery over Tk 1999 • ID {authUser.userId}</p>
                  </form>
                )}
                <button onClick={() => setCartOpen(false)} className="w-full text-sm font-medium text-center hover:underline">Continue Shopping</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Search Drawer ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70]">
          <div onClick={() => setSearchOpen(false)} className="fixed inset-0 bg-[#003D32]/40 backdrop-blur-sm" />
          <div className="fixed top-0 inset-x-0 bg-white shadow-2xl animate-scaleIn origin-top">
            <div className="max-w-[760px] mx-auto p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 border border-[#DDE8E6] rounded-full px-5 py-3 focus-within:border-[#003D32] focus-within:ring-2 focus-within:ring-black/5 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input autoFocus placeholder="Search KREVOS.Store — e.g. Polo, Kurta" className="flex-1 outline-none text-sm placeholder:text-zinc-400" />
                </div>
                <button onClick={() => setSearchOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 grid place-items-center shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
              </div>
              <div className="mt-6">
                <p className="text-xs tracking-widest uppercase font-semibold text-zinc-500 mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {["Polo Shirt","T-Shirt","Spring Drop","Hoodie"].map(t => (
                    <button key={t} onClick={() => showToast(`Searching for "${t}" — KREVOS.Store`)} className="px-4 py-2 rounded-full border border-[#DDE8E6] text-sm hover:bg-[#002A22] hover:text-white hover:border-[#003D32] transition">{t}</button>
                  ))}
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-[#E6F0EE] bg-[#E6F0EE]/30 p-8 text-center">
                <p className="text-sm font-medium text-[#003D32]">Catalog is empty</p>
                <p className="text-xs text-zinc-500 mt-1">No products to display — we’ll be back with new arrivals soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Order Modal — Individual Collection Order Page ── */}
      {orderProduct && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setOrderProduct(null)} className="fixed inset-0 bg-[#003D32]/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[24px] w-full max-w-[560px] max-h-[90vh] overflow-auto shadow-2xl animate-scaleIn">
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between rounded-t-[24px] z-10">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-zinc-500">KREVOS.Store • Order Now</p>
                <h3 className="font-display text-xl leading-none mt-1">Quick Order</h3>
              </div>
              <button onClick={() => setOrderProduct(null)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center hover:bg-zinc-200 transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex gap-3 sm:gap-4 bg-[#E6F0EE]/60 rounded-2xl p-3 sm:p-4 border border-[#E6F0EE]">
                <img src={orderProduct.image} alt={orderProduct.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-white shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold leading-tight">{orderProduct.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">{orderProduct.fabric || orderProduct.color} • krevos.store</p>
                  <p className="text-sm font-bold mt-2">Tk {orderProduct.price.toLocaleString()} {orderProduct.original && orderProduct.original !== orderProduct.price && <span className="text-xs font-normal text-zinc-400 line-through ml-2">Tk {orderProduct.original.toLocaleString()}</span>}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold mb-2">Select Size</p>
                <div className="flex gap-2">
                  {['S','M','L','XL','XXL'].map(s => (
                    <button key={s} onClick={() => setOrderSize(s)} className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition ${orderSize===s ? 'bg-[#003D32] text-white border-[#003D32]' : 'bg-white border-[#DDE8E6] hover:border-[#003D32]'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm font-semibold">Quantity</p>
                <div className="flex items-center gap-3 border border-[#DDE8E6] rounded-full px-2 py-1">
                  <button onClick={() => setOrderQty(q => Math.max(1, q-1))} className="w-8 h-8 rounded-full bg-zinc-100 grid place-items-center hover:bg-zinc-200">−</button>
                  <span className="w-8 text-center font-semibold">{orderQty}</span>
                  <button onClick={() => setOrderQty(q => q+1)} className="w-8 h-8 rounded-full bg-zinc-100 grid place-items-center hover:bg-zinc-200">+</button>
                </div>
                <span className="text-sm font-bold">Total: Tk {(orderProduct.price * orderQty).toLocaleString()}</span>
              </div>

              <form onSubmit={async (e) => {
                  e.preventDefault()
                  const form = new FormData(e.currentTarget)
                  let customer
                  let address = form.get('address')?.toString().trim() || ''
                  // Guest checkout: collect name/phone/address if not logged in
                  if (authUser) {
                    if (!address) { showToast('Please fill delivery address'); return }
                    customer = { name: authUser.name, phone: authUser.phone, email: authUser.email, address, userId: authUser.userId }
                  } else {
                    const name = form.get('c_name')?.toString().trim() || ''
                    const phone = form.get('c_phone')?.toString().trim() || ''
                    const guestAddr = form.get('c_address')?.toString().trim() || address
                    const email = form.get('c_email')?.toString().trim() || ''
                    if (!name) { showToast('Please enter your full name'); return }
                    if (!phone) { showToast('Please enter your phone number'); return }
                    if (!/^01[0-9]{9}$/.test(phone)) { showToast('Phone must be 01XXXXXXXXX (11 digits)'); return }
                    if (!guestAddr) { showToast('Please enter delivery address'); return }
                    customer = { name, phone, email, address: guestAddr }
                    address = guestAddr
                  }
                  const total = orderProduct.price * orderQty
                  try {
                    await createOrder(customer, [{ ...orderProduct, size: orderSize, qty: orderQty }], total)
                    addToCart({...orderProduct, size: orderSize, qty: orderQty})
                    setOrderProduct(null)
                    setOrderQty(1)
                    if (authUser) {
                      showToast(`Order placed — ${orderProduct.name} (${orderSize} × ${orderQty}) • ID ${authUser.userId} • clustered under ${authUser.name}`)
                    } else {
                      showToast(`Order placed — ${orderProduct.name} (${orderSize} × ${orderQty}) • Delivering to ${address}`)
                    }
                    setCartOpen(true)
                  } catch(err) { showToast(err.message || 'Order failed') }
                }} className="mt-6 space-y-3">
                  {authUser ? (
                    <>
                      <div className="rounded-2xl bg-[#F6F8F7] border border-[#E6F0EE] p-4">
                        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">Ordering as</p>
                        <p className="text-sm font-bold mt-1">{authUser.name} <span className="font-mono text-xs bg-[#003D32] text-white px-2 py-0.5 rounded-full ml-1">{authUser.userId}</span></p>
                        <p className="text-xs text-zinc-500 mt-1">{authUser.phone} • {authUser.email}</p>
                        {authUser.address && <p className="text-xs text-zinc-500">{authUser.address}</p>}
                        <p className="text-[11px] text-[#003D32] font-medium mt-2">Order will be clustered by your name in admin &amp; cluster DB.</p>
                      </div>
                      <p className="text-sm font-semibold">Delivery Address — {authUser.name} <span className="text-red-500">*</span></p>
                      <input name="address" required defaultValue={authUser.address || ''} placeholder="Delivery Address — Road, Area, District *" className="w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32] focus:ring-2 focus:ring-[#003D32]/10" />
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                        <p className="text-xs font-bold text-amber-800">First order — please provide Name, Phone & Address <span className="text-red-500">*</span></p>
                        <p className="text-[11px] text-amber-700 mt-1">Required to deliver your order. Already have an ID? <button type="button" onClick={() => { setOrderProduct(null); setPendingOrderProduct(orderProduct); setCustomerOpen(true); setCustomerMode("login") }} className="underline font-bold text-[#003D32]">Login here</button> — or order as guest below.</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Full Name <span className="text-red-500">*</span></label>
                        <input name="c_name" required placeholder="e.g. Rahim Ahmed" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32] focus:ring-2 focus:ring-[#003D32]/10" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold">Phone <span className="text-red-500">*</span></label>
                          <input name="c_phone" required pattern="01[0-9]{9}" placeholder="01XXXXXXXXX" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32] focus:ring-2 focus:ring-[#003D32]/10" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold">Email <span className="text-zinc-400 font-normal">(optional)</span></label>
                          <input name="c_email" type="email" placeholder="you@gmail.com" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-4 sm:px-5 py-3 text-sm outline-none focus:border-[#003D32] focus:ring-2 focus:ring-[#003D32]/10" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Delivery Address <span className="text-red-500">*</span></label>
                        <input name="c_address" required placeholder="Road, Area, District — full address" className="mt-1 w-full border border-[#DDE8E6] rounded-full px-5 py-3 text-sm outline-none focus:border-[#003D32] focus:ring-2 focus:ring-[#003D32]/10" />
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setOrderProduct(null)} className="flex-1 border border-[#DDE8E6] rounded-full py-3.5 text-sm font-semibold hover:bg-[#E6F0EE]/60 transition">Cancel</button>
                    <button type="submit" className="flex-[1.6] bg-[#003D32] text-white rounded-full py-3.5 text-sm font-bold hover:bg-[#004D40] transition">{authUser ? `Confirm Order — Tk ${(orderProduct.price * orderQty).toLocaleString()} — ${authUser.userId}` : `Confirm Order — Tk ${(orderProduct.price * orderQty).toLocaleString()} — Guest`}</button>
                  </div>
                  <p className="text-xs text-center text-zinc-500 pt-2">Cash on Delivery • Free delivery over Tk 1999 • 7-day exchange {authUser ? `• ID ${authUser.userId}` : `• No login needed`}</p>
                  {!authUser && <p className="text-[11px] text-center text-zinc-400">Want to track orders? <button type="button" onClick={() => { setOrderProduct(null); setPendingOrderProduct(orderProduct); setCustomerOpen(true); setCustomerMode("register") }} className="text-[#003D32] font-semibold underline">Create ID — Get 15% OFF</button></p>}
                </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden flex justify-start">
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-[#003D32]/40 backdrop-blur-sm" />
          <div className="relative h-[100dvh] w-[86%] max-w-[360px] bg-white shadow-2xl overflow-auto animate-slideInLeft">
            <div className="p-6 border-b flex items-center justify-between">
              <span className="font-brand font-bold tracking-[0.18em]">KREVOS.STORE</span>
              <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <nav className="p-6 space-y-1">
              <button onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="block w-full text-left py-3 font-medium border-b border-[#E6F0EE]">Home</button>
              <details open className="group border-b border-[#E6F0EE]">
                <summary className="flex items-center justify-between py-3 font-medium list-none cursor-pointer">Men&apos;s Wear <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="group-open:rotate-180 transition"><path d="m6 9 6 6 6-6"/></svg></summary>
                <div className="pb-4 space-y-3 text-sm text-zinc-600">
                  <div><p className="font-semibold text-[#003D32]">ThreadBare</p><p className="mt-1 flex flex-wrap gap-2">{[{n:"T-shirt",id:"tshirt"}, {n:"Shacket",id:"shacket"}, {n:"Denim",id:"denim"}, {n:"Joggers",id:"joggers"}].map(x=> <button key={x.n} onClick={() => { setMobileOpen(false); setTimeout(() => openCategory(x.id), 150)}} className="underline decoration-zinc-200 hover:text-[#003D32]">{x.n}</button>)}</p></div>
                  <div><p className="font-semibold text-[#003D32]">Spring Drop ’26</p><p className="mt-1 flex gap-2">{[{n:"Polo",id:"polo"}, {n:"Tee",id:"tshirt"}].map(x=> <button key={x.n} onClick={() => { setMobileOpen(false); setTimeout(() => openCategory(x.id), 150)}} className="underline decoration-zinc-200 hover:text-[#003D32]">{x.n}</button>)}</p></div>
                </div>
              </details>
              <button onClick={() => { setMobileOpen(false); setTimeout(() => openCategory('spring-drop'), 150)}} className="block w-full text-left py-3 font-medium border-b border-[#E6F0EE]">Spring Drop <span className="ml-2 text-xs bg-[#003D32] text-white px-2 py-0.5 rounded-full">-15%</span></button>
              <button onClick={() => { setMobileOpen(false); setTimeout(() => { setRegisterPage(true); window.location.hash="#register" }, 100)}} className="block w-full text-left py-3 font-medium text-[#003D32] border-b border-[#E6F0EE]">First Order — Register & Get 15% OFF</button>
              <div className="pt-4 flex gap-2">
                <button onClick={() => { setMobileOpen(false); setTimeout(() => setSearchOpen(true), 100)}} className="flex-1 flex items-center justify-center gap-2 border border-[#DDE8E6] rounded-full py-2.5 text-sm font-medium hover:bg-[#002A22] hover:text-white hover:border-[#003D32] transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Search</button>
                <button onClick={() => { setMobileOpen(false); setCartOpen(true)}} className="flex-1 bg-[#003D32] text-white rounded-full py-2.5 text-sm font-medium">View Cart ({cartCount})</button>
              </div>
              {authUser ? (
                <div className="border-t border-[#E6F0EE] mt-2 pt-3">
                  <div className="flex items-center gap-3 bg-[#F6F8F7] rounded-2xl p-3 border border-[#E6F0EE]">
                    <div className="w-10 h-10 rounded-full bg-[#003D32] text-white grid place-items-center font-bold">{authUser.name.slice(0,1).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{authUser.name} <span className="font-mono text-[10px] bg-[#003D32] text-white px-1.5 py-0.5 rounded-full">{authUser.userId}</span></p>
                      <p className="text-xs text-zinc-500 truncate">{authUser.phone} • {authUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { setMobileOpen(false); setTimeout(() => setCustomerOpen(true), 100)}} className="block w-full text-left py-2 text-sm text-[#003D32] font-medium mt-2">View ID & Orders ({orders.filter(o=> o.userId===authUser.userId || o.customer.phone===authUser.phone).length}) →</button>
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="block w-full text-left py-2 text-sm text-red-600">Logout</button>
                </div>
              ) : (
                <button onClick={() => { setMobileOpen(false); setTimeout(() => setCustomerOpen(true), 100)}} className="block w-full text-left py-3 text-sm text-zinc-600 hover:text-[#003D32] border-t border-[#E6F0EE] mt-2">My Account — Login / Register (ID required to order)</button>
              )}
            </nav>
            <div className="p-6 bg-[#E6F0EE]/60 m-6 rounded-2xl">
              <p className="text-xs tracking-widest uppercase font-semibold">Need Help?</p>
              <p className="text-sm mt-2"><a href="mailto:krevos.store@gmail.com" className="hover:text-[#003D32]">krevos.store@gmail.com</a><br/><a href="tel:+8801951250125" className="hover:text-[#003D32]">01951250125</a></p>
              <p className="text-xs text-zinc-500 mt-2">Delivering all over Bangladesh</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-[#003D32] text-white text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fadeInUp">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {toast}
        </div>
      )}

      {/* cookie */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-[420px] bg-white border border-[#DDE8E6] rounded-2xl p-4 shadow-2xl flex gap-3 items-center text-sm z-40">
        <span className="w-8 h-8 rounded-full bg-zinc-100 grid place-items-center shrink-0">🍪</span>
        <p className="text-xs leading-relaxed flex-1">We use cookies to ensure you get the best experience at <b>krevos.store</b>. <a href="#" className="underline">Learn more</a></p>
        <button onClick={(e)=> e.currentTarget.closest('div').remove()} className="bg-[#003D32] text-white rounded-full px-4 py-2 text-xs font-semibold shrink-0">Allow</button>
      </div>
    </div>
  )
}
