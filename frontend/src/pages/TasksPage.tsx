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
    return <div className="p-4 text-red-500">Error loading tasks.</div>;
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
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tasks</h1>
            {!isLoading && (
              <p className="text-gray-600 font-medium">
                {completedCount} of {totalCount} completed
              </p>
            )}
          </div>
          <button onClick={logout} className="text-sm font-medium text-red-500 hover:text-red-700">Logout</button>
        </div>

        <form onSubmit={handleCreateTask} className="mb-8 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={createTask.isPending || isLoading}
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={createTask.isPending || isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            disabled={createTask.isPending || isLoading}
          >
            {createTask.isPending ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : 'Add Task'}
          </button>
        </form>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/3 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex bg-white shadow-sm border border-gray-200 rounded-lg p-1 w-full md:w-auto">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  filter === f
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg">
              {searchQuery ? "No tasks match your search" : "No tasks yet. Add your first task above!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg shadow-sm transition ${
                  task.completed ? 'bg-gray-50 border border-gray-200' : 'bg-white border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                    className="w-5 h-5 cursor-pointer text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  
                  {editingTaskId === task.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleEditSave(task.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                      className="flex-1 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => handleEditDoubleClick(task)}
                      className={`flex-1 text-lg cursor-text select-none ${
                        task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                      }`}
                      title="Double click to edit"
                    >
                      {task.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 ml-8 sm:ml-0 flex-wrap">
                  <select
                    value={task.priority}
                    onChange={(e) => handleChangePriority(task.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded border ${getPriorityColor(task.priority)} outline-none cursor-pointer`}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MED</option>
                    <option value="HIGH">HIGH</option>
                  </select>

                  <div className="flex items-center">
                    <input
                      type="date"
                      value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                      onChange={(e) => handleChangeDueDate(task.id, e.target.value)}
                      className={`text-sm px-2 py-1 rounded border ${
                        isOverdue(task.dueDate, task.completed)
                          ? 'border-red-300 text-red-600 bg-red-50 font-medium'
                          : 'border-gray-200 text-gray-600 bg-transparent'
                      } focus:outline-none focus:border-blue-400`}
                    />
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
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
      </div>
    </div>
  );
}