document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const dateInput = document.getElementById('date-input');
  const priorityInput = document.getElementById('priority-input');
  const listEl = document.getElementById('todo-list');
  const filterBtn = document.getElementById('filter-btn');
  const deleteAllBtn = document.getElementById('delete-all-btn');
  const searchInput = document.getElementById('search-input');

  let todos = [];
  const filters = ['all', 'today', 'upcoming'];
  let filterIdx = 0;
  let searchQuery = "";
  let editId = null;

  const todayStr = () => new Date().toISOString().split('T')[0];

  function updateStats() {
    const total = todos.length;
    const done = todos.filter(t => t.done).length;
    const pending = total - done;
    document.getElementById('task-stats').textContent =
      `Total: ${total} | Done: ${done} | Pending: ${pending}`;
  }

  function render(items) {
    listEl.innerHTML = '';
    if (items.length === 0) {
      listEl.innerHTML = `<div class="text-center text-[#64748b] py-6">No task found</div>`;
      updateStats();
      return;
    }

    items.forEach(t => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-t border-[#334155] text-sm';

      row.innerHTML = `
        <div class="px-4 py-3">${t.task}</div>
        <div class="px-4 py-3">${t.date}</div>
        <div class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs font-semibold ${
            t.priority === 'high'
              ? 'bg-red-900/30 text-red-300 border border-red-500/40'
              : t.priority === 'medium'
              ? 'bg-yellow-900/30 text-yellow-200 border border-yellow-500/40'
              : 'bg-green-900/30 text-green-300 border border-green-500/40'
          }">
            ${t.priority}
          </span>
        </div>
        <div class="px-4 py-3">
          <span class="px-3 py-1 rounded-full text-xs font-semibold border ${
            t.done
              ? 'bg-green-900/30 text-green-300 border-green-500/40'
              : 'bg-yellow-900/30 text-yellow-200 border-yellow-500/40'
          }">
            ${t.done ? 'Done' : 'Pending'}
          </span>
        </div>
        <div class="px-4 py-3 flex gap-2 flex-wrap justify-center">
          <button class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-semibold toggle-btn" data-id="${t.id}">
            ${t.done ? 'Undo' : 'Mark Done'}
          </button>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-semibold edit-btn" data-id="${t.id}">
            Edit
          </button>
          <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold delete-btn" data-id="${t.id}">
            Delete
          </button>
        </div>
      `;
      listEl.appendChild(row);
    });
    updateStats();
  }

  function applyFilter() {
    const mode = filters[filterIdx];
    const today = todayStr();
    let items = todos.slice();
    if (mode === 'today') items = items.filter(t => t.date === today);
    if (mode === 'upcoming') items = items.filter(t => t.date > today);
    if (searchQuery) items = items.filter(t =>
      t.task.toLowerCase().includes(searchQuery.toLowerCase())
    );
    render(items);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const task = todoInput.value.trim();
    const date = dateInput.value;
    const priority = priorityInput.value;
    if (!task || !date) return;

    if (editId) {
      todos = todos.map(t => t.id === editId ? { ...t, task, date, priority } : t);
      editId = null;
    } else {
      todos.push({ id: Date.now(), task, date, priority, done: false });
    }

    todoInput.value = '';
    dateInput.value = '';
    priorityInput.value = 'low';
    applyFilter();
  });

  listEl.addEventListener('click', (e) => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;

    if (e.target.classList.contains('delete-btn')) {
      todos = todos.filter(t => t.id != id);
      applyFilter();
    }
    if (e.target.classList.contains('toggle-btn')) {
      todos = todos.map(t => t.id == id ? { ...t, done: !t.done } : t);
      applyFilter();
    }
    if (e.target.classList.contains('edit-btn')) {
      const todo = todos.find(t => t.id == id);
      todoInput.value = todo.task;
      dateInput.value = todo.date;
      priorityInput.value = todo.priority;
      editId = todo.id;
    }
  });

  filterBtn.addEventListener('click', () => {
    filterIdx = (filterIdx + 1) % filters.length;
    applyFilter();
  });

  deleteAllBtn.addEventListener('click', () => {
    if (todos.length && confirm('Delete all tasks?')) {
      todos = [];
      applyFilter();
    }
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    applyFilter();
  });

  render([]);
});
