import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'

const defaultSeries = [
  { id: 1, title: '葬送のフリーレン', author: '山田鐘人', emoji: '⚔️', type: 'digital', have_vol: 12, total_vol: 14, next_date: '2025-08-09', next_vol: 13, missing_vols: [11,12] },
  { id: 2, title: 'ダンジョン飯', author: '九井諒子', emoji: '🍳', type: 'paper', have_vol: 14, total_vol: 14, next_date: null, next_vol: null, missing_vols: [] },
]
const defaultWishes = [
  { id: 1, title: '鬼滅の刃 全巻セット', author: '吾峠呼世晴', emoji: '🗡️', current_price: 5980, orig_price: 11440, threshold: 40 },
  { id: 2, title: 'チェンソーマン', author: '藤本タツキ', emoji: '⛓️', current_price: 3200, orig_price: 3520, threshold: 30 },
]

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return `${d.getMonth()+1}月${d.getDate()}日`
}
function calcDiscount(cur, orig) {
  return Math.round((1 - cur / orig) * 100)
}

function SeriesCard({ s, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl mb-2 overflow-hidden" style={{ border: '0.5px solid rgba(0,0,0,0.1)' }}>
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="w-9 h-12 rounded flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: '#f5f5f3', border: '0.5px solid rgba(0,0,0,0.08)' }}>{s.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: '#1a1a1a' }}>{s.title}</div>
          <div className="text-xs mt-0.5" style={{ color: '#999' }}>{s.author}</div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: s.type === 'digital' ? '#E6F1FB' : '#f5f5f3', color: s.type === 'digital' ? '#0C447C' : '#555' }}>
              {s.type === 'digital' ? '電子書籍' : '紙'}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#f5f5f3', color: '#555', border: '0.5px solid rgba(0,0,0,0.1)' }}>
              {s.have_vol}/{s.total_vol}巻
            </span>
            {s.next_date && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#E1F5EE', color: '#085041' }}>
                次巻 {formatDate(s.next_date)}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs flex-shrink-0" style={{ color: '#bbb', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</div>
      </div>
      {open && (
        <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }} className="px-3 py-2">
          {Array.from({ length: s.total_vol }, (_, i) => i+1).map(v => (
            <div key={v} className="flex items-center gap-2 py-1.5" style={{ borderBottom: v < s.total_vol ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
              <span className="text-xs w-8" style={{ color: '#999' }}>{v}巻</span>
              <span className="text-xs flex-1" style={{ color: '#1a1a1a' }}>{s.title} {v}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={
                (s.missing_vols || []).includes(v)
                  ? { background: '#FCEBEB', color: '#791F1F', border: '0.5px solid #F7C1C1' }
                  : { background: '#f5f5f3', color: '#999', border: '0.5px solid rgba(0,0,0,0.08)' }
              }>
                {(s.missing_vols || []).includes(v) ? '未所持' : '所持済'}
              </span>
            </div>
          ))}
          {s.next_date && (
            <div className="mt-2 px-2.5 py-2 rounded-lg text-xs" style={{ background: '#E1F5EE', color: '#085041' }}>
              📅 第{s.next_vol}巻 発売予定: <strong>{formatDate(s.next_date)}</strong>
            </div>
          )}
          <button onClick={() => onDelete(s.id)} className="mt-2 text-xs px-2 py-1 rounded" style={{ color: '#999', border: '0.5px solid rgba(0,0,0,0.1)', background: 'none' }}>
            削除する
          </button>
        </div>
      )}
    </div>
  )
}

function WishCard({ w, onDelete }) {
  const disc = calcDiscount(w.current_price, w.orig_price)
  const matched = disc >= w.threshold
  const barW = Math.min(100, Math.round(disc / w.threshold * 100))
  return (
    <div className="bg-white rounded-xl mb-2 p-3" style={{ border: `0.5px solid ${matched ? '#1D9E75' : 'rgba(0,0,0,0.1)'}` }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-12 rounded flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: '#f5f5f3', border: '0.5px solid rgba(0,0,0,0.08)' }}>{w.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>{w.title}</div>
          <div className="text-xs mt-0.5" style={{ color: '#999' }}>{w.author}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        <span className="text-xl font-semibold" style={{ color: '#1a1a1a' }}>¥{w.current_price.toLocaleString()}</span>
        <span className="text-xs line-through" style={{ color: '#bbb' }}>¥{w.orig_price.toLocaleString()}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded" style={matched ? { background: '#E1F5EE', color: '#085041' } : { background: '#f5f5f3', color: '#999', border: '0.5px solid rgba(0,0,0,0.1)' }}>
          {disc}%OFF
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs" style={{ color: '#999' }}>{disc}%</span>
        <div className="flex-1 h-1 rounded-full" style={{ background: '#f5f5f3' }}>
          <div className="h-1 rounded-full transition-all" style={{ width: `${barW}%`, background: matched ? '#1D9E75' : 'rgba(0,0,0,0.15)' }} />
        </div>
        <span className="text-xs" style={{ color: '#999' }}>目標 {w.threshold}%</span>
      </div>
      {matched && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: '#1D9E75', color: '#fff' }}>
          ✓ 条件達成中 — 購入タイミングです
        </div>
      )}
      <button onClick={() => onDelete(w.id)} className="mt-2 block text-xs px-2 py-1 rounded" style={{ color: '#999', border: '0.5px solid rgba(0,0,0,0.1)', background: 'none' }}>
        削除する
      </button>
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 pb-10" style={{ border: '0.5px solid rgba(0,0,0,0.1)' }}>
        <div className="w-9 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(0,0,0,0.2)' }} />
        <h2 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      <label className="block text-xs mb-1" style={{ color: '#999' }}>{label}</label>
      <input className="w-full px-3 py-2.5 rounded-lg text-sm" style={{ border: '0.5px solid rgba(0,0,0,0.2)', background: '#f5f5f3', color: '#1a1a1a' }} {...props} />
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mylist')
  const [series, setSeries] = useState(defaultSeries)
  const [wishes, setWishes] = useState(defaultWishes)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = () => supabase.auth.signOut()

  const addSeries = () => {
    if (!form.title) return
    setSeries(prev => [...prev, {
      id: Date.now(), title: form.title, author: form.author || '',
      emoji: '📚', type: form.type || 'digital',
      have_vol: parseInt(form.have_vol) || 0,
      total_vol: parseInt(form.total_vol) || 1,
      next_date: form.next_date || null,
      next_vol: parseInt(form.next_vol) || null,
      missing_vols: []
    }])
    setModal(null); setForm({})
  }

  const addWish = () => {
    if (!form.title) return
    setWishes(prev => [...prev, {
      id: Date.now(), title: form.title, author: form.author || '',
      emoji: '📖',
      current_price: parseInt(form.current_price) || 0,
      orig_price: parseInt(form.orig_price) || 1,
      threshold: parseInt(form.threshold) || 30
    }])
    setModal(null); setForm({})
  }

  const matchCount = wishes.filter(w => calcDiscount(w.current_price, w.orig_price) >= w.threshold).length

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm" style={{ color: '#999' }}>読み込み中...</div>
    </div>
  )

  if (!session) return <Login />

  return (
    <div className="max-w-lg mx-auto min-h-screen pb-20" style={{ background: '#f5f5f3' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-3 bg-white" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold" style={{ color: '#1a1a1a' }}>本棚</span>
            <span className="text-xs" style={{ color: '#bbb' }}>あなただけのKindle管理</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={session.user.user_metadata?.avatar_url} alt="" className="w-7 h-7 rounded-full" />
            <button onClick={handleSignOut} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#999', border: '0.5px solid rgba(0,0,0,0.1)' }}>
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white sticky top-0 z-10" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}>
        {[['mylist', `マイリスト`, series.length, false], ['wish', 'ウィッシュ', matchCount || wishes.length, matchCount > 0]].map(([key, label, count, warn]) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 py-3 text-xs flex items-center justify-center gap-1.5"
            style={{ borderBottom: tab === key ? '2px solid #1D9E75' : '2px solid transparent', color: tab === key ? '#085041' : '#999', fontWeight: tab === key ? 600 : 400 }}>
            {label}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: warn ? '#FAEEDA' : '#E1F5EE', color: warn ? '#633806' : '#085041' }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-3 pt-1">
        {tab === 'mylist' && (
          <>
            <div className="text-xs uppercase tracking-widest py-4 px-1" style={{ color: '#bbb' }}>シリーズ</div>
            {series.map(s => <SeriesCard key={s.id} s={s} onDelete={id => setSeries(prev => prev.filter(x => x.id !== id))} />)}
            <button onClick={() => { setModal('series'); setForm({}) }}
              className="flex items-center gap-2 w-full px-3 py-3 rounded-xl text-xs mb-2"
              style={{ border: '0.5px dashed rgba(0,0,0,0.2)', color: '#999', background: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              シリーズを追加
            </button>
          </>
        )}
        {tab === 'wish' && (
          <>
            <div className="text-xs uppercase tracking-widest py-4 px-1" style={{ color: '#bbb' }}>監視中</div>
            {wishes.map(w => <WishCard key={w.id} w={w} onDelete={id => setWishes(prev => prev.filter(x => x.id !== id))} />)}
            <button onClick={() => { setModal('wish'); setForm({}) }}
              className="flex items-center gap-2 w-full px-3 py-3 rounded-xl text-xs mb-2"
              style={{ border: '0.5px dashed rgba(0,0,0,0.2)', color: '#999', background: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              作品を追加
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      {modal === 'series' && (
        <Modal title="シリーズを追加" onClose={() => setModal(null)}>
          <Input label="タイトル" placeholder="葬送のフリーレン" value={form.title||''} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
          <Input label="作者" placeholder="山田鐘人" value={form.author||''} onChange={e => setForm(p => ({...p, author: e.target.value}))} />
          <div className="mb-3">
            <label className="block text-xs mb-1" style={{ color: '#999' }}>形式</label>
            <select className="w-full px-3 py-2.5 rounded-lg text-sm" style={{ border: '0.5px solid rgba(0,0,0,0.2)', background: '#f5f5f3', color: '#1a1a1a' }}
              value={form.type||'digital'} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
              <option value="digital">電子書籍</option>
              <option value="paper">紙</option>
            </select>
          </div>
          <Input label="所持巻数" type="number" placeholder="12" value={form.have_vol||''} onChange={e => setForm(p => ({...p, have_vol: e.target.value}))} />
          <Input label="全巻数" type="number" placeholder="14" value={form.total_vol||''} onChange={e => setForm(p => ({...p, total_vol: e.target.value}))} />
          <Input label="次巻発売日（任意）" type="date" value={form.next_date||''} onChange={e => setForm(p => ({...p, next_date: e.target.value}))} />
          <Input label="次巻番号（任意）" type="number" placeholder="13" value={form.next_vol||''} onChange={e => setForm(p => ({...p, next_vol: e.target.value}))} />
          <div className="flex gap-2 mt-4">
            <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-sm" style={{ border: '0.5px solid rgba(0,0,0,0.15)', color: '#555' }}>キャンセル</button>
            <button onClick={addSeries} className="flex-2 py-3 px-6 rounded-xl text-sm font-semibold" style={{ background: '#1a1a1a', color: '#fff' }}>追加する</button>
          </div>
        </Modal>
      )}
      {modal === 'wish' && (
        <Modal title="ウィッシュリストに追加" onClose={() => setModal(null)}>
          <Input label="タイトル" placeholder="ワンピース 全巻セット" value={form.title||''} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
          <Input label="作者" placeholder="尾田栄一郎" value={form.author||''} onChange={e => setForm(p => ({...p, author: e.target.value}))} />
          <Input label="現在の価格（円）" type="number" placeholder="5980" value={form.current_price||''} onChange={e => setForm(p => ({...p, current_price: e.target.value}))} />
          <Input label="定価（円）" type="number" placeholder="11440" value={form.orig_price||''} onChange={e => setForm(p => ({...p, orig_price: e.target.value}))} />
          <Input label="通知する割引率（%）" type="number" placeholder="40" value={form.threshold||''} onChange={e => setForm(p => ({...p, threshold: e.target.value}))} />
          <div className="flex gap-2 mt-4">
            <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-sm" style={{ border: '0.5px solid rgba(0,0,0,0.15)', color: '#555' }}>キャンセル</button>
            <button onClick={addWish} className="flex-2 py-3 px-6 rounded-xl text-sm font-semibold" style={{ background: '#1a1a1a', color: '#fff' }}>追加する</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
