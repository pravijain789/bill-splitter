'use client'

import { useState } from 'react'

const TIP_OPTIONS = [0, 5, 10, 15, 18, 20]
let idCounter = 3
const createPerson = (n) => ({ id: n, name: `Person ${n}`, customAmount: '', addonAmount: '' })
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const AVATAR_COLORS = ['#7c3aed','#4f46e5','#db2777','#0891b2','#059669','#d97706','#dc2626','#0f766e']

const ANIMATIONS = `
  @keyframes blob1 {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(60px,-80px) scale(1.2); }
    66%      { transform:translate(-50px,40px) scale(0.85); }
  }
  @keyframes blob2 {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(-70px,50px) scale(1.15); }
    66%      { transform:translate(60px,-60px) scale(0.88); }
  }
  @keyframes blob3 {
    0%,100% { transform:translate(0,0) scale(1); }
    50%      { transform:translate(50px,70px) scale(1.1); }
  }
  @keyframes pulseGlow {
    0%,100% { box-shadow:0 0 24px rgba(245,158,11,.6), 0 4px 14px rgba(0,0,0,.3); }
    50%      { box-shadow:0 0 55px rgba(245,158,11,1),  0 6px 26px rgba(0,0,0,.4); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rowIn {
    from { opacity:0; transform:translateX(-14px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .glass-card {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: none;
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .glass-card:hover { transform:translateY(-4px); box-shadow:0 20px 60px rgba(109,40,217,.2) !important; }
  .tip-btn { transition:all .18s ease; border:none; cursor:pointer; }
  .tip-btn:hover { transform:scale(1.06); }
  .result-in { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
  .row-in    { animation:rowIn  .32s cubic-bezier(.22,1,.36,1) both; }
  .badge-glow { animation:pulseGlow 2.2s ease-in-out infinite; }
  .input-field { transition:border-color .2s ease,box-shadow .2s ease; outline:none; box-sizing:border-box; }
  .input-field:focus { border-color:#7c3aed !important; box-shadow:0 0 0 4px rgba(124,58,237,.14) !important; }
  .add-btn { transition:background .2s,border-color .2s,transform .15s; }
  .add-btn:hover { background:rgba(124,58,237,.07) !important; border-color:#7c3aed !important; transform:scale(1.01); }
  .mode-btn { transition:all .2s; border:none; cursor:pointer; }
`

export default function BillSplitter() {
  const [billAmount, setBillAmount]         = useState('')
  const [tipPercent, setTipPercent]         = useState(10)
  const [isCustomTip, setIsCustomTip]       = useState(false)
  const [customTipValue, setCustomTipValue] = useState('')
  const [people, setPeople]                 = useState([createPerson(1), createPerson(2)])
  const [splitMode, setSplitMode]           = useState('equal')   // 'equal' | 'addons' | 'custom'
  const [baseAmount, setBaseAmount]         = useState('')        // for addons mode

  // ── Core numbers ──────────────────────────────────────────────────────────
  const bill         = parseFloat(billAmount) || 0
  const activeTip    = isCustomTip ? (parseFloat(customTipValue) || 0) : tipPercent
  const tipAmount    = (bill * activeTip) / 100
  const grandTotal   = bill + tipAmount
  const tipPerPerson = people.length > 0 ? tipAmount / people.length : 0

  // Equal mode
  const equalShare = people.length > 0 ? grandTotal / people.length : 0

  // Add-ons mode
  const base          = parseFloat(baseAmount) || 0
  const basePerPerson = people.length > 0 ? base / people.length : 0
  const addonsTotal   = people.reduce((s,p) => s + (parseFloat(p.addonAmount)||0), 0)
  const addonsDiff    = bill - base - addonsTotal   // should be 0 when filled correctly

  // Custom mode
  const customTotal = people.reduce((s,p) => s + (parseFloat(p.customAmount)||0), 0)
  const customDiff  = bill - customTotal

  // ── Share calculator ──────────────────────────────────────────────────────
  const getShare = (person) => {
    if (splitMode === 'equal')  return equalShare
    if (splitMode === 'addons') return basePerPerson + (parseFloat(person.addonAmount)||0) + tipPerPerson
    /* custom */                return (parseFloat(person.customAmount)||0) + tipPerPerson
  }

  // ── People helpers ────────────────────────────────────────────────────────
  const addPerson    = () => setPeople(p=>[...p, createPerson(idCounter++)])
  const removePerson = (id) => { if(people.length>1) setPeople(p=>p.filter(x=>x.id!==id)) }
  const updatePerson = (id,f,v) => setPeople(p=>p.map(x=>x.id===id?{...x,[f]:v}:x))

  // ── Style helpers ─────────────────────────────────────────────────────────
  const card      = { borderRadius:'24px', overflow:'hidden', boxShadow:'0 4px 24px rgba(109,40,217,.12)' }
  const stepBadge = { width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:900, flexShrink:0 }
  const pill = (active) => ({
    flex:1, padding:'10px 6px', borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer',
    background: active ? 'white' : 'transparent',
    color:      active ? '#7c3aed' : '#9ca3af',
    boxShadow:  active ? '0 2px 10px rgba(0,0,0,.1)' : 'none',
  })
  const amtInput = (w='110px') => ({
    width:'100%', paddingLeft:'26px', paddingRight:'6px', paddingTop:'10px', paddingBottom:'10px',
    border:'2px solid rgba(167,139,250,.25)', borderRadius:'12px', fontSize:'13px', background:'rgba(255,255,255,.65)',
  })
  const hint = (color='#6d28d9', bg='rgba(245,243,255,.9)', border='rgba(167,139,250,.3)') => ({
    marginTop:'10px', padding:'10px 14px', borderRadius:'12px', fontSize:'12px',
    background:bg, color, border:`1px solid ${border}`, display:'flex', alignItems:'flex-start', gap:'8px',
  })

  return (
    <>
      <style>{ANIMATIONS}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#ede9fe 0%,#ddd6fe 35%,#c7d2fe 70%,#bfdbfe 100%)', position:'relative', overflow:'hidden' }}>

        {/* Blobs */}
        <div style={{ position:'fixed', top:'-250px', left:'-200px', width:'700px', height:'700px', borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.55) 0%,transparent 65%)', animation:'blob1 13s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'fixed', bottom:'-300px', right:'-250px', width:'800px', height:'800px', borderRadius:'50%', background:'radial-gradient(circle,rgba(79,70,229,.45) 0%,transparent 65%)', animation:'blob2 17s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'fixed', top:'35%', left:'20%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(167,139,250,.3) 0%,transparent 65%)', animation:'blob3 21s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />

        {/* Header */}
        <header style={{ background:'linear-gradient(135deg,#1e0a5e 0%,#4c1d95 45%,#312e81 100%)', padding:'22px 20px 28px', position:'relative', zIndex:10, overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, opacity:.07, backgroundImage:'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }} />
          <div style={{ maxWidth:'640px', margin:'0 auto', position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:'rgba(255,255,255,.13)', border:'1px solid rgba(255,255,255,.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0 }}>💸</div>
              <div>
                <h1 style={{ color:'white', fontSize:'26px', fontWeight:900, lineHeight:1, margin:0, letterSpacing:'-0.5px' }}>Bill Splitter</h1>
                <p style={{ color:'rgba(196,181,253,.9)', fontSize:'12px', margin:'3px 0 0' }}>Split bills fairly, instantly</p>
              </div>
            </div>
            <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" style={{ flexShrink:0, textDecoration:'none' }}>
              <div className="badge-glow" style={{ background:'linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)', border:'2px solid rgba(253,230,138,.75)', borderRadius:'20px', padding:'10px 16px', minWidth:'128px', textAlign:'center', cursor:'pointer', transition:'transform .2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
              >
                <div style={{ fontSize:'22px', lineHeight:1, marginBottom:'4px' }}>🏆</div>
                <div style={{ fontWeight:900, fontSize:'11px', lineHeight:1.35, color:'#1c1917' }}>Built for<br/>Digital Heroes</div>
              </div>
            </a>
          </div>
        </header>

        {/* Creator bar */}
        <div style={{ background:'rgba(30,10,94,.88)', textAlign:'center', fontSize:'12px', padding:'8px 16px', color:'rgba(221,214,254,.85)', position:'relative', zIndex:10 }}>
          Built by <strong style={{ color:'#fff' }}>PRAVI JAIN</strong>{' · '}
          <a href="mailto:jainpari3105@gmail.com" style={{ color:'#c4b5fd', textDecoration:'underline' }}>jainpari3105@gmail.com</a>
        </div>

        <main style={{ maxWidth:'640px', margin:'0 auto', padding:'28px 16px 40px', display:'flex', flexDirection:'column', gap:'16px', position:'relative', zIndex:10 }}>

          {/* Step 1 — Bill Amount */}
          <div className="glass-card" style={card}>
            <div style={{ padding:'16px 24px 14px', display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={stepBadge}>1</span>
              <h2 style={{ margin:0, fontWeight:700, color:'#3b0764', fontSize:'14px' }}>Total Bill Amount</h2>
            </div>
            <div style={{ padding:'0 24px 20px' }}>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'18px', top:'50%', transform:'translateY(-50%)', color:'#a78bfa', fontSize:'26px', fontWeight:900 }}>₹</span>
                <input type="number" min="0" step="0.01" placeholder="0.00"
                  value={billAmount} onChange={e=>setBillAmount(e.target.value)}
                  className="input-field"
                  style={{ width:'100%', paddingLeft:'52px', paddingRight:'16px', paddingTop:'18px', paddingBottom:'18px', fontSize:'40px', fontWeight:900, color:'#1e0a5e', border:'2px solid rgba(167,139,250,.3)', borderRadius:'16px', background:'rgba(255,255,255,.6)' }}
                />
              </div>
            </div>
          </div>

          {/* Step 2 — Tip */}
          <div className="glass-card" style={card}>
            <div style={{ padding:'16px 24px 14px', display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={stepBadge}>2</span>
              <h2 style={{ margin:0, fontWeight:700, color:'#3b0764', fontSize:'14px' }}>Add Tip</h2>
            </div>
            <div style={{ padding:'0 24px 20px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'12px' }}>
                {TIP_OPTIONS.map(t => {
                  const active = !isCustomTip && tipPercent===t
                  return (
                    <button key={t} className="tip-btn"
                      onClick={()=>{ setTipPercent(t); setIsCustomTip(false); setCustomTipValue('') }}
                      style={{ padding:'12px', borderRadius:'14px', fontSize:'13px', fontWeight:700,
                        background: active ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,.6)',
                        color:      active ? 'white' : '#6b7280',
                        boxShadow:  active ? '0 4px 18px rgba(124,58,237,.4)' : '0 2px 8px rgba(0,0,0,.06)',
                        transform:  active ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >{t===0?'No Tip':`${t}%`}</button>
                  )
                })}
              </div>
              <input type="number" min="0" max="100" placeholder="Custom tip %"
                value={customTipValue}
                onFocus={()=>setIsCustomTip(true)}
                onChange={e=>{ setCustomTipValue(e.target.value); setIsCustomTip(true) }}
                className="input-field"
                style={{ width:'100%', padding:'12px 16px', border:`2px solid ${isCustomTip?'#7c3aed':'rgba(167,139,250,.3)'}`, borderRadius:'14px', fontSize:'13px', background: isCustomTip?'rgba(245,243,255,.9)':'rgba(255,255,255,.6)' }}
              />
              {bill>0 && (
                <div className="result-in" style={{ marginTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(135deg,rgba(255,251,235,.9),rgba(254,243,199,.9))', border:'1px solid #fde68a', borderRadius:'14px', padding:'12px 16px', fontSize:'13px' }}>
                  <span style={{ color:'#78716c' }}>Tip ({activeTip}%): <strong style={{ color:'#b45309' }}>{fmt(tipAmount)}</strong></span>
                  <span style={{ fontWeight:900, fontSize:'16px', color:'#1e0a5e' }}>{fmt(grandTotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 3 — Who's Splitting */}
          <div className="glass-card" style={card}>
            <div style={{ padding:'16px 24px 14px', display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={stepBadge}>3</span>
              <h2 style={{ margin:0, fontWeight:700, color:'#3b0764', fontSize:'14px' }}>Who&apos;s Splitting?</h2>
              <span style={{ marginLeft:'auto', fontSize:'12px', color:'#7c3aed', fontWeight:700 }}>{people.length} people</span>
            </div>
            <div style={{ padding:'0 24px 20px' }}>

              {/* ── 3-way mode toggle ── */}
              <div style={{ display:'flex', gap:'4px', background:'rgba(0,0,0,.06)', borderRadius:'14px', padding:'4px', marginBottom:'18px' }}>
                {[
                  ['equal',  '⚖️ Equal'],
                  ['addons', '➕ Base+Add-ons'],
                  ['custom', '✏️ Custom'],
                ].map(([mode,label])=>(
                  <button key={mode} className="mode-btn" onClick={()=>setSplitMode(mode)} style={pill(splitMode===mode)}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Addons mode: shared base input ── */}
              {splitMode==='addons' && (
                <div className="result-in" style={{ marginBottom:'14px', padding:'14px 16px', background:'rgba(245,243,255,.85)', borderRadius:'16px' }}>
                  <p style={{ margin:'0 0 8px', fontSize:'12px', fontWeight:700, color:'#6d28d9' }}>🍽️ Shared Base Amount <span style={{ fontWeight:400, color:'#9ca3af' }}>(everyone shares equally)</span></p>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'14px', fontWeight:700 }}>₹</span>
                    <input type="number" min="0" placeholder="e.g. 500" value={baseAmount}
                      onChange={e=>setBaseAmount(e.target.value)}
                      className="input-field"
                      style={{ width:'100%', paddingLeft:'28px', paddingRight:'12px', paddingTop:'10px', paddingBottom:'10px', border:'2px solid rgba(124,58,237,.3)', borderRadius:'12px', fontSize:'15px', fontWeight:700, color:'#1e0a5e', background:'rgba(255,255,255,.8)' }}
                    />
                  </div>
                  {base>0 && <p style={{ margin:'6px 0 0', fontSize:'11px', color:'#7c3aed' }}>= {fmt(basePerPerson)} each (base share)</p>}
                </div>
              )}

              {/* ── People rows ── */}
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {people.map((person,index)=>(
                  <div key={person.id} className="row-in" style={{ display:'flex', alignItems:'center', gap:'8px', animationDelay:`${index*0.06}s` }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:AVATAR_COLORS[index%AVATAR_COLORS.length], color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:900, flexShrink:0, boxShadow:`0 4px 12px ${AVATAR_COLORS[index%AVATAR_COLORS.length]}55` }}>
                      {(person.name||`P${index+1}`)[0].toUpperCase()}
                    </div>
                    <input type="text" placeholder={`Person ${index+1}`} value={person.name}
                      onChange={e=>updatePerson(person.id,'name',e.target.value)}
                      className="input-field"
                      style={{ flex:1, padding:'10px 14px', border:'2px solid rgba(167,139,250,.25)', borderRadius:'12px', fontSize:'13px', background:'rgba(255,255,255,.65)' }}
                    />

                    {/* Add-ons amount input */}
                    {splitMode==='addons' && (
                      <div style={{ position:'relative', width:'110px' }}>
                        <span style={{ position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'11px', fontWeight:700 }}>+₹</span>
                        <input type="number" min="0" placeholder="Add-ons" value={person.addonAmount}
                          onChange={e=>updatePerson(person.id,'addonAmount',e.target.value)}
                          className="input-field"
                          style={{ ...amtInput('110px'), paddingLeft:'28px' }}
                        />
                      </div>
                    )}

                    {/* Custom amount input */}
                    {splitMode==='custom' && (
                      <div style={{ position:'relative', width:'110px' }}>
                        <span style={{ position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'13px', fontWeight:700 }}>₹</span>
                        <input type="number" min="0" placeholder="Food only" value={person.customAmount}
                          onChange={e=>updatePerson(person.id,'customAmount',e.target.value)}
                          className="input-field"
                          style={{ ...amtInput(), paddingLeft:'24px' }}
                        />
                      </div>
                    )}

                    <button onClick={()=>removePerson(person.id)} disabled={people.length===1}
                      style={{ width:'36px', height:'36px', borderRadius:'50%', border:'none', background:'transparent', cursor:people.length===1?'default':'pointer', color:'#c4b5fd', fontSize:'20px', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', opacity:people.length===1?0:1, transition:'all .2s', flexShrink:0 }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='#fee2e2'; e.currentTarget.style.color='#ef4444' }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#c4b5fd' }}
                    >×</button>
                  </div>
                ))}
              </div>

              <button onClick={addPerson} className="add-btn"
                style={{ marginTop:'12px', width:'100%', padding:'12px', borderRadius:'14px', border:'2px dashed rgba(167,139,250,.6)', background:'transparent', color:'#7c3aed', fontSize:'13px', fontWeight:700, cursor:'pointer' }}
              >+ Add Person</button>

              {/* Mode hints */}
              {splitMode==='addons' && bill>0 && (
                <div style={hint()}>
                  <span style={{ flexShrink:0 }}>➕</span>
                  <span>Enter the <strong>shared base</strong> above (split equally), then each person&apos;s personal add-ons here. Tip ({activeTip}% = {fmt(tipPerPerson)} each) is added automatically.</span>
                </div>
              )}
              {splitMode==='custom' && activeTip>0 && bill>0 && (
                <div style={hint()}>
                  <span style={{ flexShrink:0 }}>✨</span>
                  <span>Enter each person&apos;s <strong>food amount only</strong> — tip (+{fmt(tipPerPerson)} each) is added automatically.</span>
                </div>
              )}

              {/* Validation warnings */}
              {splitMode==='addons' && bill>0 && Math.abs(addonsDiff)>0.01 && (
                <div style={{ ...hint(addonsDiff>0?'#dc2626':'#ea580c', addonsDiff>0?'rgba(254,242,242,.9)':'rgba(255,247,237,.9)', addonsDiff>0?'#fecaca':'#fed7aa'), marginTop:'10px' }}>
                  <span>{addonsDiff>0 ? `⚠️ ${fmt(addonsDiff)} of the bill still unaccounted for` : `⚠️ Base + add-ons exceed bill by ${fmt(Math.abs(addonsDiff))}`}</span>
                </div>
              )}
              {splitMode==='custom' && bill>0 && Math.abs(customDiff)>0.01 && (
                <div style={{ ...hint(customDiff>0?'#dc2626':'#ea580c', customDiff>0?'rgba(254,242,242,.9)':'rgba(255,247,237,.9)', customDiff>0?'#fecaca':'#fed7aa'), marginTop:'10px' }}>
                  <span>{customDiff>0 ? `⚠️ ${fmt(customDiff)} of the bill still unassigned` : `⚠️ Food amounts exceed bill by ${fmt(Math.abs(customDiff))}`}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {bill>0 && (
            <div className="result-in" style={{ borderRadius:'28px', padding:'24px', color:'white', background:'linear-gradient(135deg,#1e0a5e 0%,#4c1d95 50%,#312e81 100%)', boxShadow:'0 16px 60px rgba(76,29,149,.5)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-100px', right:'-100px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(167,139,250,.2) 0%,transparent 70%)', pointerEvents:'none' }} />
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
                <span style={{ fontSize:'20px' }}>🎯</span>
                <p style={{ margin:0, color:'rgba(196,181,253,.85)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'2px', fontWeight:700 }}>Split Summary</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'20px' }}>
                {[
                  { label:'Bill',               value:fmt(bill),      emoji:'🧾', hi:false },
                  { label:`Tip (${activeTip}%)`, value:fmt(tipAmount), emoji:'✨', hi:true  },
                  { label:'Grand Total',          value:fmt(grandTotal),emoji:'💰', hi:false },
                ].map(({label,value,emoji,hi})=>(
                  <div key={label} style={{ background:'rgba(255,255,255,.1)', borderRadius:'16px', padding:'12px', textAlign:'center' }}>
                    <div style={{ fontSize:'18px', marginBottom:'4px' }}>{emoji}</div>
                    <p style={{ margin:'0 0 4px', color:'rgba(196,181,253,.8)', fontSize:'10px' }}>{label}</p>
                    <p style={{ margin:0, fontWeight:900, fontSize:'11px', color:hi?'#fcd34d':'white' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Per-person breakdown */}
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {people.map((person,index)=>(
                  <div key={person.id} className="row-in" style={{ background:'rgba(255,255,255,.09)', borderRadius:'16px', padding:'12px 16px', animationDelay:`${index*0.07}s` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:AVATAR_COLORS[index%AVATAR_COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:900 }}>
                          {(person.name||`P${index+1}`)[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, fontSize:'14px' }}>{person.name||`Person ${index+1}`}</span>
                      </div>
                      <span style={{ fontSize:'20px', fontWeight:900, color:'#fcd34d' }}>{fmt(getShare(person))}</span>
                    </div>

                    {/* Addons mode: show the breakdown under each person */}
                    {splitMode==='addons' && base>0 && (
                      <div style={{ marginTop:'6px', paddingLeft:'48px', display:'flex', gap:'12px', fontSize:'11px', color:'rgba(196,181,253,.7)' }}>
                        <span>Base {fmt(basePerPerson)}</span>
                        {parseFloat(person.addonAmount)>0 && <span>+ Add-ons {fmt(parseFloat(person.addonAmount))}</span>}
                        {activeTip>0 && <span>+ Tip {fmt(tipPerPerson)}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p style={{ marginTop:'16px', textAlign:'center', color:'rgba(167,139,250,.7)', fontSize:'11px', margin:'16px 0 0' }}>
                {splitMode==='equal'  && `${people.length} ${people.length===1?'person':'people'} · equal share each`}
                {splitMode==='addons' && `Base ${fmt(base)} shared equally · personal add-ons charged individually`}
                {splitMode==='custom' && activeTip>0 && `Includes ${fmt(tipPerPerson)} tip per person`}
              </p>
            </div>
          )}

          {/* <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(109,40,217,.5)', paddingBottom:'8px', margin:0 }}>
            Free forever · No ads · No sign-up · 100% runs in your browser
          </p> */}
        </main>
      </div>
    </>
  )
}