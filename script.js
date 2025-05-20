import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';
const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOi...qvhPHqnEqIU'
);

const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

async function fetchTasks() {
  const { data, error } = await supabase.from('tasks').select('*').order('id', { ascending: false });
  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  taskList.innerHTML = '';
  data.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.name;
    taskList.appendChild(li);
  });
}

window.addTask = async function () {
  const taskName = taskInput.value.trim();
  if (!taskName) return;

  const { error } = await supabase.from('tasks').insert([{ name: taskName }]);
  if (error) {
    console.error('Error adding task:', error);
  } else {
    taskInput.value = '';
    fetchTasks();
  }
};
fetchTasks();