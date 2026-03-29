import { useState } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { addTask, removeTask, updateTask, cycleStatus } from './store/tasksSlice'
import type { Priority, Status, Task } from './store/tasksSlice'

type Filter = 'all' | Status

const PRIORITY_LABEL: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' }
const STATUS_LABEL:   Record<Status,   string> = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' }
const STATUS_ICON:    Record<Status,   string> = { todo: '○', 'in-progress': '◑', done: '✓' }

/* ─── Reusable class strings (avoids repeating long Tailwind chains) ─── */

// Glass card: backdrop-filter written as arbitrary property so -webkit- is preserved
const GLASS = [
  'bg-white/[0.06]',
  '[backdrop-filter:blur(20px)_saturate(160%)]',
  '[-webkit-backdrop-filter:blur(20px)_saturate(160%)]',
  'border border-white/[0.12] rounded-[20px]',
  'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
  'transition-all duration-200',
  'hover:bg-white/[0.09]',
  'hover:shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]',
].join(' ')

// Text input
const INPUT = [
  'bg-white/[0.07]',
  '[backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)]',
  'border border-white/[0.13] rounded-xl',
  'text-[0.92rem] text-white outline-none',
  'placeholder:text-white/25',
  'transition-all duration-200',
  'focus:bg-white/[0.11] focus:border-violet-400/[0.65] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]',
].join(' ')

/* ─── Conditional class maps (replaces compound CSS selectors) ─── */

const priorityBtnActive: Record<Priority, string> = {
  high:   'border border-red-500/50   bg-red-500/[0.22]   text-[#fca5a5]',
  medium: 'border border-amber-400/50 bg-amber-400/[0.22] text-[#fcd34d]',
  low:    'border border-green-500/[0.45] bg-green-500/[0.18] text-[#86efac]',
}

const priorityBtnIdle = 'border border-white/[0.09] bg-white/[0.06] text-white/40 hover:text-white/75 hover:bg-white/[0.09]'

const statusToggleCn: Record<Status, string> = {
  todo:          'border-2 border-slate-400/40 text-slate-400/60 hover:border-slate-400 hover:text-slate-400',
  'in-progress': 'border-2 border-blue-400/55 text-blue-400 bg-blue-400/10',
  done:          'border-2 border-emerald-400/55 text-emerald-400 bg-emerald-400/10 shadow-[0_0_12px_rgba(74,222,128,0.2)]',
}

const priorityTagCn: Record<Priority, string> = {
  high:   'bg-red-500/[0.18]   text-[#fca5a5] border border-red-500/30',
  medium: 'bg-amber-400/[0.18] text-[#fcd34d] border border-amber-400/30',
  low:    'bg-green-500/[0.14] text-[#86efac] border border-green-500/25',
}

const statusTagCn: Record<Status, string> = {
  todo:          'bg-slate-400/10        text-slate-400 border border-slate-400/20',
  'in-progress': 'bg-blue-400/[0.12]    text-blue-400  border border-blue-400/25',
  done:          'bg-emerald-400/[0.12] text-emerald-400 border border-emerald-400/20',
}

const statCountCn: Record<Status, string> = {
  todo: 'text-slate-400', 'in-progress': 'text-blue-400', done: 'text-emerald-400',
}

/* ─── Component ─── */

export default function App() {
  const dispatch = useAppDispatch()
  const tasks    = useAppSelector(s => s.tasks)

  const [input,        setInput]        = useState('')
  const [newPriority,  setNewPriority]  = useState<Priority>('medium')
  const [filter,       setFilter]       = useState<Filter>('all')
  const [editId,       setEditId]       = useState<number | null>(null)
  const [editText,     setEditText]     = useState('')
  const [editPriority, setEditPriority] = useState<Priority>('medium')

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    dispatch(addTask({ text, priority: newPriority }))
    setInput('')
    setNewPriority('medium')
  }

  const startEdit = (t: Task) => { setEditId(t.id); setEditText(t.text); setEditPriority(t.priority) }

  const saveEdit = () => {
    const text = editText.trim()
    if (!text || editId === null) return
    dispatch(updateTask({ id: editId, text, priority: editPriority }))
    setEditId(null)
  }

  const counts = {
    all:           tasks.length,
    todo:          tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done:          tasks.filter(t => t.status === 'done').length,
  }

  const donePercent = tasks.length ? Math.round((counts.done / tasks.length) * 100) : 0
  const filtered    = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <div className="relative min-h-screen font-sans">

      {/* ── Animated blobs ── */}
      <div className="fixed w-[520px] h-[520px] -top-[140px] -left-[140px] rounded-full blur-[80px] opacity-[0.35] pointer-events-none bg-[radial-gradient(circle,#7c3aed,#4f46e5)] animate-drift-1" />
      <div className="fixed w-[420px] h-[420px] -bottom-[100px] -right-[100px] rounded-full blur-[80px] opacity-[0.35] pointer-events-none bg-[radial-gradient(circle,#ec4899,#f43f5e)] animate-drift-2" />
      <div className="fixed w-[300px] h-[300px] top-[45%] left-[55%] rounded-full blur-[80px] opacity-[0.35] pointer-events-none bg-[radial-gradient(circle,#06b6d4,#3b82f6)] animate-drift-3" />

      <div className="relative z-10 max-w-[680px] mx-auto px-5 py-14 pb-20">

        {/* ── Header ── */}
        <header className={[
          'mb-7 p-7',
          'bg-white/[0.05]',
          '[backdrop-filter:blur(24px)_saturate(160%)] [-webkit-backdrop-filter:blur(24px)_saturate(160%)]',
          'border border-white/10 rounded-[24px]',
          'shadow-[0_8px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]',
        ].join(' ')}>

          {/* Title row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[2.5px] uppercase text-white/35 mb-1">
                Workspace
              </p>
              <h1 className="text-[2rem] font-extrabold tracking-tight bg-[linear-gradient(135deg,#fff_30%,#c4b5fd)] bg-clip-text text-transparent">
                Flux Tasks Test
              </h1>
            </div>
            <div className="flex items-center gap-[7px] bg-white/[0.07] border border-white/[0.13] rounded-full px-[14px] py-[6px] text-[0.78rem] text-white/60">
              <span className="inline-block w-[7px] h-[7px] rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80] shrink-0 animate-blink" />
              <span>{counts.all} tasks</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between text-[0.75rem] text-white/40 mb-2">
              <span>Overall Progress</span>
              <span className="text-violet-300 font-bold">{donePercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#ec4899)] shadow-[0_0_10px_rgba(124,58,237,0.6)] transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ width: `${donePercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {(['todo', 'in-progress', 'done'] as Status[]).map(s => (
              <div key={s} className="bg-white/[0.05] border border-white/[0.08] rounded-[14px] py-3.5 px-4 text-center">
                <span className={`block text-[1.6rem] font-extrabold leading-none mb-1 ${statCountCn[s]}`}>
                  {counts[s]}
                </span>
                <span className="text-[0.65rem] tracking-wide text-white/35 uppercase">
                  {STATUS_LABEL[s]}
                </span>
              </div>
            ))}
          </div>
        </header>

        {/* ── Add task ── */}
        <div className={`${GLASS} p-[22px] mb-5`}>
          <p className="text-[0.62rem] font-semibold tracking-[2.5px] uppercase text-white/30 mb-[14px]">
            New Task
          </p>
          <div className="flex flex-wrap gap-2.5 items-center">
            <input
              className={`${INPUT} flex-1 min-w-[160px] px-4 py-[11px]`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="What needs to be done?"
            />
            <PriorityPicker value={newPriority} onChange={setNewPriority} />
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-5 py-[11px] rounded-xl text-[0.88rem] font-bold text-white cursor-pointer whitespace-nowrap border-0 bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] shadow-[0_4px_16px_rgba(124,58,237,0.4)] transition-all duration-200 hover:bg-[linear-gradient(135deg,#6d28d9,#4338ca)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.55)] hover:-translate-y-px active:translate-y-0"
            >
              ＋ Add
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(['all', 'todo', 'in-progress', 'done'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'flex items-center gap-1.5 px-4 py-[7px] rounded-full text-[0.78rem] font-medium cursor-pointer',
                '[backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]',
                'transition-all duration-150',
                filter === f
                  ? 'bg-violet-600/[0.22] border border-violet-400/[0.42] text-violet-300'
                  : 'bg-white/[0.05] border border-white/[0.09] text-white/[0.42] hover:text-white/80 hover:bg-white/[0.09]',
              ].join(' ')}
            >
              {f === 'all' ? 'All' : STATUS_LABEL[f as Status]}
              <span className="bg-white/10 rounded-full px-[7px] py-px text-[0.65rem] font-bold">
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Task list ── */}
        <div className="flex flex-col gap-2.5">
          {filtered.length === 0 && (
            <div className={`${GLASS} text-center py-14 px-6 text-white/25`}>
              <p className="text-[2.2rem] mb-3 opacity-35">✦</p>
              <p>No tasks here. Add one above.</p>
            </div>
          )}

          {filtered.map(task => (
            <div key={task.id} className={`${GLASS} p-4 ${task.status === 'done' ? 'opacity-60' : ''}`}>
              {editId === task.id ? (
                /* Edit mode */
                <div className="flex flex-wrap gap-2.5 items-center">
                  <input
                    className={`${INPUT} flex-1 min-w-[140px] px-4 py-[11px]`}
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null) }}
                    autoFocus
                  />
                  <PriorityPicker value={editPriority} onChange={setEditPriority} />
                  <div className="flex gap-1.5">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 rounded-[10px] text-[0.8rem] font-semibold cursor-pointer text-white border-0 bg-[linear-gradient(135deg,#059669,#10b981)] shadow-[0_2px_10px_rgba(16,185,129,0.35)] transition-all hover:brightness-110"
                    >Save</button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-4 py-2 rounded-[10px] text-[0.8rem] font-semibold cursor-pointer bg-white/[0.06] border border-white/[0.11] text-white/45 hover:bg-white/[0.11] hover:text-white/75 transition-all"
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => dispatch(cycleStatus(task.id))}
                    title="Click to advance status"
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base cursor-pointer shrink-0 transition-all duration-200 bg-transparent ${statusToggleCn[task.status]}`}
                  >
                    {STATUS_ICON[task.status]}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[0.92rem] font-medium mb-1.5 truncate ${task.status === 'done' ? 'line-through text-white/[0.28]' : 'text-white/[0.88]'}`}>
                      {task.text}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-[0.6rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${priorityTagCn[task.priority]}`}>
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      <span className={`text-[0.6rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${statusTagCn[task.status]}`}>
                        {STATUS_LABEL[task.status]}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(task)}
                      title="Edit"
                      className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[0.88rem] cursor-pointer bg-transparent border border-white/[0.09] text-white/[0.42] transition-all duration-150 hover:bg-white/10 hover:text-white hover:border-white/[0.18]"
                    >✎</button>
                    <button
                      onClick={() => dispatch(removeTask(task.id))}
                      title="Delete"
                      className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[0.88rem] cursor-pointer bg-red-500/[0.08] border border-red-500/[0.18] text-red-500/55 transition-all duration-150 hover:bg-red-500/20 hover:text-[#fca5a5] hover:border-red-500/[0.38]"
                    >✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

/* ── Priority picker ── */
function PriorityPicker({ value, onChange }: { value: Priority; onChange: (p: Priority) => void }) {
  return (
    <div className="flex gap-1.5">
      {(['high', 'medium', 'low'] as Priority[]).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-[13px] py-2 rounded-[10px] text-[0.72rem] font-semibold cursor-pointer transition-all duration-150 ${
            value === p ? priorityBtnActive[p] : priorityBtnIdle
          }`}
        >
          {PRIORITY_LABEL[p]}
        </button>
      ))}
    </div>
  )
}
