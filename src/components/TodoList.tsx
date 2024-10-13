import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { CheckCircle, Circle, Clock, AlertTriangle, AlertCircle, Plus } from 'lucide-react';

interface Todo {
  id: number;
  task: string;
  urgency: string;
  is_completed: boolean;
  in_progress: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newUrgency, setNewUrgency] = useState('low');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)
        .order('urgency', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to fetch todos. Please try again later.');
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTask, urgency: newUrgency, user_id: user?.id }])
        .select();

      if (error) throw error;
      setTodos([...todos, data[0]]);
      setNewTask('');
      setNewUrgency('low');
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo. Please try again.');
    }
  };

  const updateTodoStatus = async (id: number, is_completed: boolean, in_progress: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed, in_progress })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_completed, in_progress } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo. Please try again.');
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertCircle className="text-red-500" />;
      case 'medium': return <AlertTriangle className="text-yellow-500" />;
      case 'low': return <Clock className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Todo List</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={addTodo} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={newUrgency}
            onChange={(e) => setNewUrgency(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
          >
            <Plus size={20} className="mr-2" />
            Add Task
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {todos.map((todo) => (
          <div key={todo.id} className={`flex items-center justify-between p-4 bg-white rounded-lg shadow ${todo.is_completed ? 'opacity-50' : ''}`}>
            <div className="flex items-center space-x-4">
              <button onClick={() => updateTodoStatus(todo.id, !todo.is_completed, false)}>
                {todo.is_completed ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <Circle className="text-gray-400" size={24} />
                )}
              </button>
              <span className={`text-lg ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {todo.task}
              </span>
              {getUrgencyIcon(todo.urgency)}
            </div>
            {!todo.is_completed && (
              <button
                onClick={() => updateTodoStatus(todo.id, false, !todo.in_progress)}
                className={`px-3 py-1 rounded-full text-sm ${
                  todo.in_progress
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {todo.in_progress ? 'In Progress' : 'Start'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;