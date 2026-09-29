let tasks = [];
let currentStatus = 'all';
const form = document.getElementById('todo-form');
const nameInput = document.getElementById('task-name');
const priorityInput = document.getElementById('task-priority');
const dueInput = document.getElementById('task-due');
const list = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');

const STORAGE_KEY = 'to-do-app-data';
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

}
function loadFromStorage(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            tasks = JSON.parse(raw);
        } catch {
        tasks = [];
        }
    }
}
 function isOverdue(task) {
    if (task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    return due < today;
 }
function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
function getFilteredTasks() {
    let result = tasks;
    if (currentStatus === 'active') {
        result = result.filter(t => !t.completed);
    } else if (currentStatus === 'completed') {
        result = result.filter(t => t.completed);
    
    }
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        result = result.filter(t => t.name.toLowerCase().includes(query));
        
    }
    return result;
}
 function addTask(name, priority, dueDate) {
    const task = {
        id: Date.now(),
        name: name.trim(),
        priority: priority,
        dueDate: dueDate,
        completed: false,
    };
    tasks.push(task);
    saveToStorage();
    renderTasks();

 }
 function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if(task) {
        task.completed = !task.completed;
        saveToStorage();
        renderTasks();
    }
 }
 function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveToStorage();
    renderTasks();

 }
 function startEditTask(id, nameEl) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    nameEl.classList.add('editing');
    nameEl.contentEditable = 'true';
    nameEl.focus();
    const range = document.createRange();
    range.selectNodeContents(nameEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    function finish() {
        const newName = nameEl.textContent.trim();
        nameEl.classList.remove('editing');
        nameEl.contentEditable = 'false';
        if (newName && newName !== task.name) {
            task.name = newName;
            saveToStorage();
        }
        renderTasks();
    }
    nameEl.addEventListener('blur', finish, { once: true});
    nameEl.addEventListener('keydown', e=> {
        if (e.key === 'Enter') {
            e.preventDefault();
            nameEl.blur();

        }
    });
 }
 function renderTasks(){
    const filtered= getFilteredTasks();
    list.innerHTML='';
    if (filtered.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
    }
    filtered.forEach(task => {
        const li = document.createElement('li');
        const classes = ['list-group-item'];
        if (task.completed) classes.push('task-completed');
        if (isOverdue(task)) classes.push('task-overdue');

        li.className = classes.join(' ');

        li.innerHTML = `
        <div class="task-left">
        <input type="checkbox"
         class="task-checkbox"
          data-id="${task.id}"
           ${task.completed ? 'checked' : ''}>
        <div class ="task-info">
        <span class="task-name">${escapeHtml(task.name)}</span>
        <span class="task-due">Due ${task.dueDate}</span>
        </div>
        </div>
        <div class="task-right">
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        <button class="delete-btn" data-id="${task.id}">X</button>
        </div> 
        `;
        list.appendChild(li);
    });
 }
function saveTheme(theme) {
    localStorage.setItem('todo-theme', theme);
}
function loadTheme() {
    const saved = localStorage.getItem('todo-theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent =  '☀️';
    }
}
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀️' : '🌙'; 
    saveTheme(isDark ? 'dark' : 'light');
}

 form.addEventListener('submit', e =>{
    e.preventDefault();
    const name = nameInput.value;
    const priority = priorityInput.value;
    const dueDate = dueInput.value;
    if (!name.trim() || !priority || !dueDate) return;
addTask(name, priority,dueDate);
form.reset();
nameInput.focus();
 });
 list.addEventListener('click', e => {
  const checkbox = e.target.closest('.task-checkbox');
  if (checkbox) {
    toggleTask(Number(checkbox.dataset.id));
    return;
  }

  const deleteBtn = e.target.closest('.delete-btn');
  if (deleteBtn) {
    deleteTask(Number(deleteBtn.dataset.id));
    return;
  }
  const taskName = e.target.closest('.task-name');
  if (taskName) {
    const li = taskName.closest('li');
    const checkboxEl = li.querySelector('.task-checkbox');
    const id = Number(checkboxEl.dataset.id);
    startEditTask(id, taskName);
  }
});

// Filter buttons — separate listener, NOT inside the above
const filterButtons = document.querySelectorAll('.status-filters .filter-btn');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStatus = btn.dataset.status;
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});
themeToggle.addEventListener('click', toggleTheme);
searchInput.addEventListener('input', () => { 
    renderTasks();
});
 loadFromStorage();
 loadTheme();
 renderTasks();