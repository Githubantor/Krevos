const API_BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')
async function request(path, opts={}){
  const url=`${API_BASE}${path}`
  const res=await fetch(url,{headers:{'Content-Type':'application/json',...(opts.headers||{})},cache:'no-store',...opts})
  if(!res.ok){ const t=await res.text(); let e=t; try{e=JSON.parse(t).error||t}catch{}; throw new Error(e||`HTTP ${res.status}`)}
  if(res.status===204) return null
  const ct=res.headers.get('content-type')||''
  if(ct.includes('application/json')) return res.json()
  return res.text()
}
export const api={
  getProducts:(c)=>request(`/api/products${c?`?category=${encodeURIComponent(c)}`:''}`),
  createProduct:(d)=>request('/api/products',{method:'POST',body:JSON.stringify(d)}),
  deleteProduct:(id)=>request(`/api/products/${encodeURIComponent(id)}`,{method:'DELETE'}),
  getOrders:(params)=>request(`/api/orders${params?`?${new URLSearchParams(params).toString()}`:''}`),
  createOrder:(d)=>request('/api/orders',{method:'POST',body:JSON.stringify(d)}),
  updateOrderStatus:(id,s)=>request(`/api/orders/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({status:s})}),
  clearOrders:()=>request('/api/orders',{method:'DELETE'}),
  register:(d)=>request('/api/auth/register',{method:'POST',body:JSON.stringify(d)}),
  login:(d)=>request('/api/auth/login',{method:'POST',body:JSON.stringify(d)}),
  getUsers:()=>request('/api/auth/users'),
  getMe:(params)=>request(`/api/auth/me?${new URLSearchParams(params).toString()}`),
  getCluster:()=>request('/api/cluster'),
  getClusterCollection:(db,coll,limit=50)=>request(`/api/cluster/${encodeURIComponent(db)}/${encodeURIComponent(coll)}?limit=${limit}`),
  health:()=>request('/api/health'),
  stats:()=>request('/api/stats'),
}
export const API_BASE_URL=API_BASE
