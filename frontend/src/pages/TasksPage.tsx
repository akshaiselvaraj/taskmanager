import React, { useState, useEffect, useRef } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../queries/taskQueries';
import type { Task } from '../queries/taskQueries';
import { useAuth } from '../context/AuthContext';

type FilterType = 'ALL' | 'ACTIVE' | 'COMPLETED';

export default function TasksPage() {
  const { logout } = useAuth();
  const { data: tasks, isLoading, isError } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTaskId]);

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 text-red-600 font-medium flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Error loading tasks. Please try again.
        </div>
      </div>
    );
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    createTask.mutate({
      title: newTaskTitle,
      priority: newTaskPriority,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
    }, {
      onSuccess: () => {
        setNewTaskTitle('');
        setNewTaskPriority('MEDIUM');
        setNewTaskDueDate('');
      }
    });
  };

  const handleToggleComplete = (task: Task) => {
    updateTask.mutate({ id: task.id, completed: !task.completed });
  };

  const handleDelete = (id: number) => {
    deleteTask.mutate(id);
  };

  const handleEditDoubleClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const handleEditSave = (id: number) => {
    if (editTitle.trim() !== '') {
      updateTask.mutate({ id, title: editTitle.trim() });
    }
    setEditingTaskId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') {
      handleEditSave(id);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  const handleChangePriority = (id: number, priority: string) => {
    updateTask.mutate({ id, priority });
  };
  
  const handleChangeDueDate = (id: number, dueDate: string) => {
    updateTask.mutate({ id, dueDate: dueDate ? new Date(dueDate).toISOString() : null });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HIGH': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isOverdue = (dueDate: string | null, completed: boolean) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = (tasks || [])
    .filter(task => {
      if (filter === 'ACTIVE') return !task.completed;
      if (filter === 'COMPLETED') return task.completed;
      return true;
    })
    .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const completedCount = (tasks || []).filter(t => t.completed).length;
  const totalCount = (tasks || []).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Your Tasks</h2>
          {!isLoading && (
            <p className="text-slate-500 mt-1">
              You've completed <span className="font-semibold text-indigo-600">{completedCount}</span> out of <span className="font-semibold text-slate-700">{totalCount}</span> tasks
            </p>
          )}
        </div>

        {/* Create Task Form */}
        <form onSubmit={handleCreateTask} className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 transition-shadow hover:shadow-md">
          <input
            type="text"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={createTask.isPending || isLoading}
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
            disabled={createTask.isPending || isLoading}
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          <input
            type="date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
            disabled={createTask.isPending || isLoading}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-sm"
            disabled={createTask.isPending || isLoading}
          >
            {createTask.isPending ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <>
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </>
            )}
          </button>
        </form>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
            />
          </div>
          
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-auto shadow-inner border border-slate-200/60">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === f
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-500 font-medium">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks found</h3>
            <p className="text-slate-500">
              {searchQuery ? "We couldn't find any tasks matching your search." : "You're all caught up! Add a new task above."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl transition-all duration-200 ${
                  task.completed 
                    ? 'bg-slate-50 border border-slate-200 opacity-75 hover:opacity-100' 
                    : 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      className="peer w-6 h-6 cursor-pointer appearance-none rounded-full border-2 border-slate-300 checked:bg-indigo-500 checked:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    />
                    <svg className="absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  {editingTaskId === task.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleEditSave(task.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                      className="flex-1 px-3 py-1.5 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-indigo-50/50 text-slate-900"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => handleEditDoubleClick(task)}
                      className={`flex-1 text-lg font-medium cursor-text select-none truncate transition-all duration-200 ${
                        task.completed ? 'text-slate-400 line-through decoration-slate-300 decoration-2' : 'text-slate-800'
                      }`}
                      title="Double click to edit"
                    >
                      {task.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pl-10 sm:pl-0 flex-wrap shrink-0">
                  <select
                    value={task.priority}
                    onChange={(e) => handleChangePriority(task.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer tracking-wide uppercase transition-colors appearance-none text-center ${getPriorityColor(task.priority)}`}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Med</option>
                    <option value="HIGH">High</option>
                  </select>

                  <div className="relative">
                    <input
                      type="date"
                      value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                      onChange={(e) => handleChangeDueDate(task.id, e.target.value)}
                      className={`text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        isOverdue(task.dueDate, task.completed)
                          ? 'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100'
                          : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all duration-200 opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none focus:ring-2 focus:ring-rose-500"
                    title="Delete task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}