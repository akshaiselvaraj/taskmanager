import { useState } from 'react';
import { useTasks, useCreateTask, useToggleTask, useDeleteTask } from '../queries/taskQueries';
import { useAuth } from '../context/AuthContext';

export default function TasksPage() {
  const [title, setTitle] = useState('');
  const { logout } = useAuth();
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate(title);
    setTitle('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <button onClick={logout} className="text-sm text-red-500">Logout</button>
        </div>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input className="flex-1 border p-2 rounded" placeholder="New task..." value={title} onChange={e => setTitle(e.target.value)} />
          <button className="bg-blue-500 text-white px-4 rounded">Add</button>
        </form>
        {isLoading ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {tasks?.map((task: any) => (
              <li key={task.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask.mutate({ id: task.id, completed: !task.completed })} />
                  <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.title}</span>
                </div>
                <button onClick={() => deleteTask.mutate(task.id)} className="text-red-400 text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}