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
    <div className="bg-white rounded-xl mb-2 overflow-hidden border border-gray-100">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="w-9 h-12 rounded flex items-center justify-center text-xl flex-shrink-0 bg-gray-50 border border-gray-100">{s.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate text-gray-900">{s.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">{s.author}</div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded ${s.type === 'digital' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
              {s.type === 'digital' ? '電子書籍' : '紙'}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
              {s.have_vol}/{s.total_vol}巻
            </span>
            {s.next_date && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-800">
                次巻 {formatDate(s.next_date)}
              </span>
            )}
          </div>
        </div>
        <div className="text-gray-300 text-xs flex-shrink-0 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</div>
      </div>
      {open && (
        <div className="border-t border-gray-50 px-3 py-2">
          {Array.from({ length: s.total_vol }, (_, i) => i+1).map(v => (
            <div key={v} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400 w-8">{v}巻</span>
              <span className="text-xs text-gray-900 flex-1">{s.title} {v}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${(s.missing_vols||[]).includes(v) ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                {(s.missing_vols||[]).includes(v) ? '未所持' : '所持済'}
              </span>
            </div>
          ))}
          {s.next_date && (
            <div className="mt-2 px-2.5 py-2 rounded-lg text-xs bg-green-50 text-green-800">
              📅 第{s.next_vol}巻 発売予定: <strong>{formatDate(s.next_date)}</strong>
            </div>
          )}
          <button onClick={() => onDelete(s.id)} className="mt-2 text-xs px-2 py-1 rounded border border-gray-100 text-gray-400 bg-transparent">
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
    <div className={`bg-white rounded-xl mb-2 p-3 border ${matched ? 'border-green-500' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-12 rounded flex items-center justify-center text-xl flex-shrink-0 bg-gray-50 border border-gray-100">{w.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">{w.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">{w.author}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        <span className="text-xl font-semibold text-gray-900">¥{w.current_price.toLocaleString()}</span>
        <span className="text-xs line-through text-gray-300">¥{w.orig_price.toLocaleString()}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${matched ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
          {disc}%OFF
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-400">{disc}%</span>
        <div className="flex-1 h-1 rounded-full bg-gray-100">
          <div className="h-1 rounded-full transition-all" style={{ width: `${barW}%`, background: matched ? '#1D9E75' : '#d1d5db' }} />
        </div>
        <span className="text-xs text-gray-400">目標 {w.threshold}%</span>
      </div>
      {matched && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white" style={{ background: '#1D9E75' }}>
          ✓ 条件達成中 — 購入タイミングです
        </div>
      )}
      <button onClick={() => onDelete(w.id)} className="mt-2 block text-xs px-2 py-1 rounded border border-gray-100 text-gray-400 bg-transparent">
        削除する
      </button>
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-30" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 pb-10 border-t border-gray-100">
        <div className="w-9 h-1 rounded-full mx-auto mb-4 bg-gray-200" />
        <h2 className="text-base font-semibold mb-4 text-gray-900">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:border-green-400"

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

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const addSeries = () => {
    if (!form.title) return
    setSeries(p => [...p, {
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
    setWishes(p => [...p, {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-sm text-gray-400">読み込み中...</div>
    </div>
  )

  if (!session) return <Login />

  return (
    <div className="max-w-lg mx-auto min-h-screen pb-20 bg-gray-50">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-gray-900">本棚</span>
            <span className="text-xs text-gray-300">あなただけのKindle管理</span>
          </div>
          <div className="flex items-center gap-2">
            {session.user.user_metadata?.avatar_url && (
              <img src={session.user.user_metadata.avatar_url} alt="" className="w-7 h-7 rounded-full" />
            )}
            <button onClick={() => supabase.auth.signOut()} className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 bg-transparent">
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white sticky top-0 z-10 border-b border-gray-100">
        {[['mylist', 'マイリスト', series.length, false], ['wish', 'ウィッシュ', matchCount || wishes.length, matchCount > 0]].map(([key, label, count, warn]) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 py-3 text-xs flex items-center justify-center gap-1.5 bg-transparent border-0"
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
            <div className="text-xs uppercase tracking-widest py-4 px-1 text-gray-300">シリーズ</div>
            {series.map(s => <SeriesCard key={s.id} s={s} onDelete={id => setSeries(p => p.filter(x => x.id !== id))} />)}
            <button onClick={() => { setModal('series'); setForm({}) }}
              className="flex items-center gap-2 w-full px-3 py-3 rounded-xl text-xs mb-2 bg-transparent text-gray-400"
              style={{ border: '0.5px dashed rgba(0,0,0,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              シリーズを追加
            </button>
          </>
        )}
        {tab === 'wish' && (
          <>
            <div className="text-xs uppercase tracking-widest py-4 px-1 text-gray-300">監視中</div>
            {wishes.map(w => <WishCard key={w.id} w={w} onDelete={id => setWishes(p => p.filter(x => x.id !== id))} />)}
            <button onClick={() => { setModal('wish'); setForm({}) }}
              className="flex items-center gap-2 w-full px-3 py-3 rounded-xl text-xs mb-2 bg-transparent text-gray-400"
              style={{ border: '0.5px dashed rgba(0,0,0,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              作品を追加
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      {modal === 'series' && (
        <Modal title="シリーズを追加" onClose={() => setModal(null)}>
          <Field label="タイトル"><input className={inputCls} placeholder="葬送のフリーレン" value={form.title||''} onChange={set('title')} /></Field>
          <Field label="作者"><input className={inputCls} placeholder="山田鐘人" value={form.author||''} onChange={set('author')} /></Field>
          <Field label="形式">
            <select className={inputCls} value={form.type||'digital'} onChange={set('type')}>
              <option value="digital">電子書籍</option>
              <option value="paper">紙</option>
            </select>
          </Field>
          <Field label="所持巻数"><input className={inputCls} type="number" placeholder="12" value={form.have_vol||''} onChange={set('have_vol')} /></Field>
          <Field label="全巻数"><input className={inputCls} type="number" placeholder="14" value={form.total_vol||''} onChange={set('total_vol')} /></Field>
          <Field label="次巻発売日（任意）"><input className={inputCls} type="date" value={form.next_date||''} onChange={set('next_date')} /></Field>
          <Field label="次巻番号（任意）"><input className={inputCls} type="number" placeholder="13" value={form.next_vol||''} onChange={set('next_vol')} /></Field>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-500 bg-transparent">キャンセル</button>
            <button onClick={addSeries} className="py-3 px-8 rounded-xl text-sm font-semibold text-white border-0" style={{ background: '#1a1a1a' }}>追加する</button>
          </div>
        </Modal>
      )}
      {modal === 'wish' && (
        <Modal title="ウィッシュリストに追加" onClose={() => setModal(null)}>
          <Field label="タイトル"><input className={inputCls} placeholder="ワンピース 全巻セット" value={form.title||''} onChange={set('title')} /></Field>
          <Field label="作者"><input className={inputCls} placeholder="尾田栄一郎" value={form.author||''} onChange={set('author')} /></Field>
          <Field label="現在の価格（円）"><input className={inputCls} type="number" placeholder="5980" value={form.current_price||''} onChange={set('current_price')} /></Field>
          <Field label="定価（円）"><input className={inputCls} type="number" placeholder="11440" value={form.orig_price||''} onChange={set('orig_price')} /></Field>
          <Field label="通知する割引率（%）"><input className={inputCls} type="number" placeholder="40" value={form.threshold||''} onChange={set('threshold')} /></Field>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-500 bg-transparent">キャンセル</button>
            <button onClick={addWish} className="py-3 px-8 rounded-xl text-sm font-semibold text-white border-0" style={{ background: '#1a1a1a' }}>追加する</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
