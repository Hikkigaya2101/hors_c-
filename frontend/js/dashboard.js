// dashboard.js
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const API_BASE = '/api/';
let currentUser = null;
let chatIntervals = {};

// ========== ОБЩИЕ ФУНКЦИИ ==========
async function apiRequest(endpoint, method, data = null) {
    try {
        const response = await axios({ method, url: API_BASE + endpoint, data });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login/';
        } else if (error.response) {
            alert(error.response.data?.error || 'Ошибка запроса');
        }
        throw error;
    }
}

async function checkAuth() {
    try {
        const data = await apiRequest('users/me/', 'get');
        currentUser = data;
        return true;
    } catch {
        return false;
    }
}

async function logout() {
    for (const id in chatIntervals) clearInterval(chatIntervals[id]);
    await apiRequest('users/logout/', 'post');
    window.location.href = '/login/';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== ЛИЧНЫЕ ЗАДАЧИ ==========
async function getMyTasks() {
    return await apiRequest('tasks/tasks/', 'get');
}

async function updateTaskStatus(taskId, status) {
    return await apiRequest(`tasks/tasks/${taskId}/`, 'patch', { status });
}

function renderTasks(tasks) {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div class="top-bar">
            <h2>Мои задачи</h2>
            <select id="filter-status">
                <option value="all">Все</option>
                <option value="todo">К выполнению</option>
                <option value="progress">В работе</option>
                <option value="review">На проверке</option>
                <option value="done">Готово</option>
            </select>
        </div>
        <div class="task-table">
            <table>
                <thead><tr><th>Название</th><th>Проект</th><th>Приоритет</th><th>Статус</th><th>Дедлайн</th></tr></thead>
                <tbody id="tasks-tbody"></tbody>
            </table>
        </div>
    `;
    const filter = document.getElementById('filter-status');
    const tbody = document.getElementById('tasks-tbody');
    const updateTable = () => {
        const filtered = filter.value === 'all' ? tasks : tasks.filter(t => t.status === filter.value);
        tbody.innerHTML = '';
        filtered.forEach(task => {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<strong>${escapeHtml(task.title)}</strong><br><small>${escapeHtml(task.description || '')}</small>`;
            row.insertCell(1).innerText = task.project_name || 'Без проекта';
            row.insertCell(2).innerText = task.priority === 'High' ? '🔴 Высокий' : (task.priority === 'Medium' ? '🟡 Средний' : '🟢 Низкий');
            row.insertCell(3).innerHTML = `<select class="task-status" data-id="${task.id}">
                <option ${task.status === 'todo' ? 'selected' : ''} value="todo">К выполнению</option>
                <option ${task.status === 'progress' ? 'selected' : ''} value="progress">В работе</option>
                <option ${task.status === 'review' ? 'selected' : ''} value="review">На проверке</option>
                <option ${task.status === 'done' ? 'selected' : ''} value="done">Готово</option>
            </select>`;
            row.insertCell(4).innerText = task.deadline || '—';
        });
        document.querySelectorAll('.task-status').forEach(select => {
            select.addEventListener('change', async (e) => {
                const taskId = select.dataset.id;
                const newStatus = select.value;
                await updateTaskStatus(taskId, newStatus);
                const task = tasks.find(t => t.id == taskId);
                if (task) task.status = newStatus;
                updateTable();
            });
        });
    };
    filter.addEventListener('change', updateTable);
    updateTable();
}

// ========== ПРОЕКТЫ И ЗАДАЧИ ВНУТРИ ПРОЕКТОВ ==========
async function getProjects() {
    return await apiRequest('tasks/projects/', 'get');
}

async function getProjectTasks(projectId) {
    return await apiRequest(`tasks/projects/${projectId}/tasks/`, 'get');
}

async function createProject(data) {
    return await apiRequest('tasks/projects/', 'post', data);
}

async function updateProject(id, data) {
    return await apiRequest(`tasks/projects/${id}/`, 'put', data);
}

async function deleteProject(id) {
    return await apiRequest(`tasks/projects/${id}/`, 'delete');
}

async function createProjectTask(projectId, data) {
    return await apiRequest(`tasks/projects/${projectId}/tasks/`, 'post', data);
}

async function updateProjectTask(projectId, taskId, data) {
    return await apiRequest(`tasks/projects/${projectId}/tasks/${taskId}/`, 'put', data);
}

async function deleteProjectTask(projectId, taskId) {
    return await apiRequest(`tasks/projects/${projectId}/tasks/${taskId}/`, 'delete');
}

async function getUsers() {
    return await apiRequest('users/', 'get');
}

// ========== ЧАТ ==========
async function getProjectMessages(projectId) {
    return await apiRequest(`tasks/projects/${projectId}/messages/`, 'get');
}
async function sendProjectMessage(projectId, text) {
    return await apiRequest(`tasks/projects/${projectId}/messages/`, 'post', { text });
}
async function getTaskMessages(taskId) {
    return await apiRequest(`tasks/tasks/${taskId}/messages/`, 'get');
}
async function sendTaskMessage(taskId, text) {
    return await apiRequest(`tasks/tasks/${taskId}/messages/`, 'post', { text });
}

function startProjectChat(projectId, containerId) {
    if (chatIntervals[`project_${projectId}`]) clearInterval(chatIntervals[`project_${projectId}`]);
    const loadMessages = async () => {
        try {
            const messages = await getProjectMessages(projectId);
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = messages.map(msg => `
                <div class="chat-message">
                    <strong>${escapeHtml(msg.author_name)}</strong>
                    <small>${new Date(msg.created_at).toLocaleString()}</small>
                    <p>${escapeHtml(msg.text)}</p>
                </div>
            `).join('');
            container.scrollTop = container.scrollHeight;
        } catch(e) { console.error(e); }
    };
    loadMessages();
    chatIntervals[`project_${projectId}`] = setInterval(loadMessages, 3000);
}

function startTaskChat(taskId, containerId) {
    if (chatIntervals[`task_${taskId}`]) clearInterval(chatIntervals[`task_${taskId}`]);
    const loadMessages = async () => {
        try {
            const messages = await getTaskMessages(taskId);
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = messages.map(msg => `
                <div class="chat-message">
                    <strong>${escapeHtml(msg.author_name)}</strong>
                    <small>${new Date(msg.created_at).toLocaleString()}</small>
                    <p>${escapeHtml(msg.text)}</p>
                </div>
            `).join('');
            container.scrollTop = container.scrollHeight;
        } catch(e) { console.error(e); }
    };
    loadMessages();
    chatIntervals[`task_${taskId}`] = setInterval(loadMessages, 3000);
}

// ========== РЕНДЕР ПРОЕКТОВ (с чатом) ==========
async function renderProjects() {
    const projects = await getProjects();
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div class="top-bar">
            <h2>Проекты</h2>
            <button class="btn btn-primary" id="create-project-btn">+ Создать проект</button>
        </div>
        <div id="projects-list" class="projects-grid"></div>
    `;
    const projectsContainer = document.getElementById('projects-list');
    projectsContainer.innerHTML = '';
    for (const project of projects) {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-header">
                <h3>${escapeHtml(project.name)}</h3>
                <div class="project-actions">
                    <button class="btn btn-outline btn-sm edit-project" data-id="${project.id}">✏️</button>
                    <button class="btn btn-outline btn-sm delete-project" data-id="${project.id}">🗑️</button>
                    <button class="btn btn-outline btn-sm view-project" data-id="${project.id}">📋 Задачи</button>
                    <button class="btn btn-outline btn-sm chat-project" data-id="${project.id}">💬 Чат проекта</button>
                </div>
            </div>
            <div class="project-description">${escapeHtml(project.description || '')}</div>
            <div class="project-members">Участники: <span class="members-names"></span></div>
            <div id="project-chat-${project.id}" class="project-chat hidden">
                <div class="chat-messages" id="chat-messages-${project.id}"></div>
                <div class="chat-input">
                    <input type="text" id="chat-input-${project.id}" placeholder="Введите сообщение...">
                    <button class="btn btn-primary btn-sm send-chat" data-id="${project.id}" data-type="project">Отправить</button>
                </div>
            </div>
        `;
        projectsContainer.appendChild(projectCard);
        // Загружаем участников
        const allUsers = await getUsers();
        const projectMembers = project.members || [];
        const memberNames = allUsers.filter(u => projectMembers.includes(u.id)).map(u => u.username).join(', ');
        projectCard.querySelector('.members-names').textContent = memberNames || 'нет';
        // Обработчики
        projectCard.querySelector('.edit-project').addEventListener('click', () => openProjectModal(project.id));
        projectCard.querySelector('.delete-project').addEventListener('click', async () => {
            if (confirm('Удалить проект и все его задачи?')) {
                await deleteProject(project.id);
                renderProjects();
            }
        });
        projectCard.querySelector('.view-project').addEventListener('click', () => showProjectDetails(project.id));
        projectCard.querySelector('.chat-project').addEventListener('click', () => {
            const chatDiv = projectCard.querySelector(`#project-chat-${project.id}`);
            chatDiv.classList.toggle('hidden');
            if (!chatDiv.classList.contains('hidden')) {
                startProjectChat(project.id, `chat-messages-${project.id}`);
                const sendBtn = chatDiv.querySelector('.send-chat');
                const input = chatDiv.querySelector(`#chat-input-${project.id}`);
                sendBtn.onclick = async () => {
                    const text = input.value.trim();
                    if (text) {
                        await sendProjectMessage(project.id, text);
                        input.value = '';
                        await startProjectChat(project.id, `chat-messages-${project.id}`); // обновить
                    }
                };
                input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });
            }
        });
    }
    document.getElementById('create-project-btn').addEventListener('click', () => openProjectModal(null));
}

// ========== ДЕТАЛЬНЫЙ ПРОСМОТР ПРОЕКТА (задачи + чат задачи) ==========
async function showProjectDetails(projectId) {
    const project = (await getProjects()).find(p => p.id === projectId);
    if (!project) return;
    const tasks = await getProjectTasks(projectId);
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div class="top-bar">
            <button class="btn btn-outline" id="back-to-projects">← Назад к проектам</button>
            <h2>${escapeHtml(project.name)}</h2>
            <button class="btn btn-primary" id="add-project-task-btn">+ Добавить задачу</button>
        </div>
        <div class="project-description">${escapeHtml(project.description || '')}</div>
        <div class="tasks-list-header">Задачи проекта</div>
        <div id="project-tasks-list"></div>
        <div class="project-chat-section">
            <h3>Чат проекта</h3>
            <div id="project-chat-messages" class="chat-messages"></div>
            <div class="chat-input">
                <input type="text" id="project-chat-input" placeholder="Сообщение в общий чат проекта...">
                <button class="btn btn-primary btn-sm" id="send-project-chat">Отправить</button>
            </div>
        </div>
    `;
    // Задачи
    const tasksContainer = document.getElementById('project-tasks-list');
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p>Нет задач</p>';
    } else {
        const tasksTable = document.createElement('table');
        tasksTable.className = 'task-table-small';
        tasksTable.innerHTML = `<thead><tr><th>Название</th><th>Исполнитель</th><th>Приоритет</th><th>Статус</th><th>Дедлайн</th><th></th></tr></thead><tbody></tbody>`;
        const tbody = tasksTable.querySelector('tbody');
        tasks.forEach(task => {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<strong>${escapeHtml(task.title)}</strong><br><small>${escapeHtml(task.description || '')}</small>`;
            row.insertCell(1).innerText = task.assignee_name || 'Не назначен';
            row.insertCell(2).innerText = task.priority === 'High' ? '🔴 Выс.' : (task.priority === 'Medium' ? '🟡 Сред.' : '🟢 Низ.');
            row.insertCell(3).innerHTML = `<select class="task-status-select" data-task-id="${task.id}">
                <option ${task.status === 'todo' ? 'selected' : ''} value="todo">К выполнению</option>
                <option ${task.status === 'progress' ? 'selected' : ''} value="progress">В работе</option>
                <option ${task.status === 'review' ? 'selected' : ''} value="review">На проверке</option>
                <option ${task.status === 'done' ? 'selected' : ''} value="done">Готово</option>
            </select>`;
            row.insertCell(4).innerText = task.deadline || '—';
            row.insertCell(5).innerHTML = `
                <button class="btn btn-outline btn-sm edit-task" data-task-id="${task.id}">✏️</button>
                <button class="btn btn-outline btn-sm delete-task" data-task-id="${task.id}">🗑️</button>
                <button class="btn btn-outline btn-sm chat-task" data-task-id="${task.id}">💬 Чат задачи</button>
            `;
        });
        tasksContainer.appendChild(tasksTable);
        // Обработчики статусов, редактирования, удаления, чата задачи
        tasksContainer.querySelectorAll('.task-status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                await updateProjectTask(projectId, select.dataset.taskId, { status: select.value });
                showProjectDetails(projectId);
            });
        });
        tasksContainer.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', () => openProjectTaskModal(projectId, btn.dataset.taskId));
        });
        tasksContainer.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Удалить задачу?')) {
                    await deleteProjectTask(projectId, btn.dataset.taskId);
                    showProjectDetails(projectId);
                }
            });
        });
        tasksContainer.querySelectorAll('.chat-task').forEach(btn => {
            btn.addEventListener('click', () => openTaskChatModal(projectId, btn.dataset.taskId));
        });
    }
    // Чат проекта
    startProjectChat(projectId, 'project-chat-messages');
    document.getElementById('send-project-chat').onclick = async () => {
        const input = document.getElementById('project-chat-input');
        const text = input.value.trim();
        if (text) {
            await sendProjectMessage(projectId, text);
            input.value = '';
            await startProjectChat(projectId, 'project-chat-messages');
        }
    };
    document.getElementById('add-project-task-btn').addEventListener('click', () => openProjectTaskModal(projectId, null));
    document.getElementById('back-to-projects').addEventListener('click', () => renderProjects());
}

// ========== МОДАЛКА ЧАТА ЗАДАЧИ ==========
function openTaskChatModal(projectId, taskId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px;">
            <h3>Чат задачи</h3>
            <div id="task-chat-messages" class="chat-messages" style="height:300px; overflow-y:auto;"></div>
            <div class="chat-input">
                <input type="text" id="task-chat-input" placeholder="Ваше сообщение...">
                <button class="btn btn-primary btn-sm" id="send-task-chat">Отправить</button>
            </div>
            <button class="btn btn-outline" id="close-task-chat">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);
    startTaskChat(taskId, 'task-chat-messages');
    document.getElementById('send-task-chat').onclick = async () => {
        const input = document.getElementById('task-chat-input');
        const text = input.value.trim();
        if (text) {
            await sendTaskMessage(taskId, text);
            input.value = '';
            await startTaskChat(taskId, 'task-chat-messages');
        }
    };
    document.getElementById('close-task-chat').onclick = () => modal.remove();
}

// ========== ПРОЕКТНЫЕ МОДАЛКИ ==========
async function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const titleInput = document.getElementById('project-name');
    const descInput = document.getElementById('project-desc');
    const membersSelect = document.getElementById('project-members');
    const users = await getUsers();
    membersSelect.innerHTML = '';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.username} (${user.email})`;
        membersSelect.appendChild(option);
    });
    if (projectId) {
        const projects = await getProjects();
        const project = projects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('projectModalTitle').innerText = 'Редактировать проект';
            document.getElementById('edit-project-id').value = project.id;
            titleInput.value = project.name;
            descInput.value = project.description || '';
            Array.from(membersSelect.options).forEach(opt => {
                if (project.members && project.members.includes(parseInt(opt.value))) opt.selected = true;
            });
        }
    } else {
        document.getElementById('projectModalTitle').innerText = 'Создать проект';
        document.getElementById('edit-project-id').value = '';
        titleInput.value = '';
        descInput.value = '';
        Array.from(membersSelect.options).forEach(opt => opt.selected = false);
    }
    document.getElementById('projectModal').style.display = 'flex';
}

async function saveProjectFromModal() {
    const id = document.getElementById('edit-project-id').value;
    const name = document.getElementById('project-name').value.trim();
    if (!name) return alert('Введите название проекта');
    const description = document.getElementById('project-desc').value;
    const membersSelect = document.getElementById('project-members');
    const members = Array.from(membersSelect.selectedOptions).map(opt => parseInt(opt.value));
    const data = { name, description, members };
    if (id) {
        await updateProject(id, data);
    } else {
        await createProject(data);
    }
    document.getElementById('projectModal').style.display = 'none';
    renderProjects();
}

async function openProjectTaskModal(projectId, taskId = null) {
    const modal = document.getElementById('projectTaskModal');
    document.getElementById('current-project-id').value = projectId;
    const assigneeSelect = document.getElementById('project-task-assignee');
    const allUsers = await getUsers();
    const projects = await getProjects();
    const project = projects.find(p => p.id == projectId);
    const projectMembers = project ? project.members : [];
    const availableUsers = allUsers.filter(u => projectMembers.includes(u.id));
    assigneeSelect.innerHTML = '<option value="">Не назначен</option>';
    availableUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.username} (${user.email})`;
        assigneeSelect.appendChild(option);
    });
    if (taskId) {
        const tasks = await getProjectTasks(projectId);
        const task = tasks.find(t => t.id == taskId);
        if (task) {
            document.getElementById('projectTaskModalTitle').innerText = 'Редактировать задачу';
            document.getElementById('edit-project-task-id').value = task.id;
            document.getElementById('project-task-title').value = task.title;
            document.getElementById('project-task-desc').value = task.description || '';
            document.getElementById('project-task-assignee').value = task.assignee || '';
            document.getElementById('project-task-priority').value = task.priority;
            document.getElementById('project-task-deadline').value = task.deadline || '';
        }
    } else {
        document.getElementById('projectTaskModalTitle').innerText = 'Новая задача';
        document.getElementById('edit-project-task-id').value = '';
        document.getElementById('project-task-title').value = '';
        document.getElementById('project-task-desc').value = '';
        document.getElementById('project-task-assignee').value = '';
        document.getElementById('project-task-priority').value = 'Medium';
        document.getElementById('project-task-deadline').value = '';
    }
    modal.style.display = 'flex';
}

async function saveProjectTaskFromModal() {
    const projectId = parseInt(document.getElementById('current-project-id').value);
    const taskId = document.getElementById('edit-project-task-id').value;
    const title = document.getElementById('project-task-title').value.trim();
    if (!title) return alert('Введите название задачи');
    const description = document.getElementById('project-task-desc').value;
    const assignee = document.getElementById('project-task-assignee').value ? parseInt(document.getElementById('project-task-assignee').value) : null;
    const priority = document.getElementById('project-task-priority').value;
    const deadline = document.getElementById('project-task-deadline').value;
    const data = { title, description, assignee, priority, deadline, status: 'todo' };
    if (taskId) {
        await updateProjectTask(projectId, taskId, data);
    } else {
        await createProjectTask(projectId, data);
    }
    document.getElementById('projectTaskModal').style.display = 'none';
    showProjectDetails(projectId);
}

// ========== КОМАНДА (ГРУППЫ ПОЛЬЗОВАТЕЛЕЙ) ==========
async function getTeams() {
    return await apiRequest('teams/', 'get');
}

function renderTeams() {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `<h2>Команды (в разработке)</h2><p>Здесь будет управление группами пользователей.</p>`;
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAuth()) {
        window.location.href = '/login/';
        return;
    }
    document.getElementById('dashboard-user-name').innerText = currentUser.username;
    document.getElementById('dashboard-user-email').innerText = currentUser.email;
    document.getElementById('logout-btn').onclick = logout;

    let currentSection = 'tasks';
    const navItems = document.querySelectorAll('.nav-item');
    const loadSection = async (section) => {
        currentSection = section;
        if (section === 'tasks') {
            const tasks = await getMyTasks();
            renderTasks(tasks);
        } else if (section === 'projects') {
            await renderProjects();
        } else if (section === 'team') {
            renderTeams();
        }
    };
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            loadSection(item.dataset.section);
        });
    });
    await loadSection('tasks');

    // Обработчики модальных окон
    document.getElementById('projectModalCancel').addEventListener('click', () => document.getElementById('projectModal').style.display = 'none');
    document.getElementById('projectModalSave').addEventListener('click', saveProjectFromModal);
    document.getElementById('projectTaskModalCancel').addEventListener('click', () => document.getElementById('projectTaskModal').style.display = 'none');
    document.getElementById('projectTaskModalSave').addEventListener('click', saveProjectTaskFromModal);
    window.onclick = function(e) {
        const modals = ['projectModal', 'projectTaskModal'];
        modals.forEach(id => {
            const modal = document.getElementById(id);
            if (e.target === modal) modal.style.display = 'none';
        });
    };
});