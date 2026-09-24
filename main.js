let tasks = [];
let currentStatus = 'all';
const form = document.getElementById('todo-form');
const nameInput = document.getElementById('task-name');
const priorityInput = document.getElementById('task-priority');
const dueInput = document.getElementById('task-due');
const list = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');

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
    if(currentStatus === 'all') return tasks;
    if (currentStatus ==='active') return tasks.filter(t => !t.completed);
    if (currentStatus === 'completed')return tasks.filter(t => t.completed);
    return tasks;
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
 loadFromStorage();
 renderTasks();