import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Priority = 'high' | 'medium' | 'low'
export type Status   = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: number
  text: string
  priority: Priority
  status: Status
  createdAt: string // ISO string for serialisability
}

const LS_KEY = 'flux_tasks'

function loadFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Task[]) : defaultTasks()
  } catch {
    return defaultTasks()
  }
}

function defaultTasks(): Task[] {
  return [
    { id: 1, text: 'Design system architecture', priority: 'high',   status: 'done',        createdAt: new Date().toISOString() },
    { id: 2, text: 'Build authentication flow',  priority: 'high',   status: 'in-progress', createdAt: new Date().toISOString() },
    { id: 3, text: 'Write unit tests',           priority: 'medium', status: 'todo',        createdAt: new Date().toISOString() },
  ]
}

function save(tasks: Task[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks))
}

const STATUS_CYCLE: Status[] = ['todo', 'in-progress', 'done']

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: loadFromStorage(),
  reducers: {
    addTask(state, action: PayloadAction<{ text: string; priority: Priority }>) {
      state.unshift({ id: Date.now(), status: 'todo', createdAt: new Date().toISOString(), ...action.payload })
      save(state)
    },
    removeTask(state, action: PayloadAction<number>) {
      const next = state.filter(t => t.id !== action.payload)
      save(next)
      return next
    },
    updateTask(state, action: PayloadAction<{ id: number; text: string; priority: Priority }>) {
      const t = state.find(t => t.id === action.payload.id)
      if (t) { t.text = action.payload.text; t.priority = action.payload.priority }
      save(state)
    },
    cycleStatus(state, action: PayloadAction<number>) {
      const t = state.find(t => t.id === action.payload)
      if (t) t.status = STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % STATUS_CYCLE.length]
      save(state)
    },
  },
})

export const { addTask, removeTask, updateTask, cycleStatus } = tasksSlice.actions
export default tasksSlice.reducer
