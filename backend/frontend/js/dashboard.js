// dashboard.js
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const API_BASE = '/api/';
let currentUser = null;

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

// ========== ЗАДАЧИ (ЛИЧНЫЕ) ==========
async function getMyTasks() {
    return await apiRequest('tasks/tasks/', 'get');
}

async function updateTaskStatus(taskId, status) {
    return await apiRequest(`tasks/tasks/${taskId}/`, 'patch', { status });
}

function renderTasks(tasks) {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div class="top-bar"><h2>Мои задачи</h2><select id="filter-status"><option value="all">Все</option><option value="todo">К выполнению</option><option value="progress">В работе</option><option value="review">На проверке</option><option value="done">Готово</option></select></div>
        <div class="task-table"><table><thead><tr><th>Название</th><th>Проект</th><th>Приоритет</th><th>Статус</th><th>Дедлайн</th></tr></thead><tbody id="tasks-tbody"></tbody></table></div>
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

// Задачи внутри проекта
async function createProjectTask(projectId, data) {
    return await apiRequest(`tasks/projects/${projectId}/tasks/`, 'post', data);
}

async function updateProjectTask(projectId, taskId, data) {
    return await apiRequest(`tasks/projects/${projectId}/tasks/${taskId}/`, 'put', data);
}

async function deleteProjectTask(projectId, taskId) {
    return await apiRequest(`tasks/projects/${projectId}/tasks/${taskId}/`, 'delete');
}

// Получение списка пользователей (для команды и назначения исполнителей)
async function getUsers() {
    return await apiRequest('users/', 'get');
}

// Рендер списка проектов с карточками и задачами
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
                </div>
            </div>
            <div class="project-description">${escapeHtml(project.description || '')}</div>
            <div class="project-members">Участники: <span class="members-names"></span></div>
            <div class="project-tasks">
                <h4>Задачи проекта</h4>
                <div class="tasks-list" data-project-id="${project.id}"></div>
                <button class="btn btn-primary btn-sm add-task-btn" data-project-id="${project.id}">+ Добавить задачу</button>
            </div>
        `;
        projectsContainer.appendChild(projectCard);
        // Загружаем имена участников
        const membersSpan = projectCard.querySelector('.members-names');
        if (project.members && project.members.length) {
            const allUsers = await getUsers();
            const memberNames = allUsers.filter(u => project.members.includes(u.id)).map(u => u.username).join(', ');
            membersSpan.textContent = memberNames || 'нет';
        } else {
            membersSpan.textContent = 'нет';
        }
        // Загружаем задачи проекта
        const tasksContainer = projectCard.querySelector('.tasks-list');
        const tasks = await getProjectTasks(project.id);
        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<p class="no-tasks">Нет задач</p>';
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
                row.insertCell(3).innerHTML = `<select class="task-status-select" data-task-id="${task.id}" data-project-id="${project.id}">
                    <option ${task.status === 'todo' ? 'selected' : ''} value="todo">К выполнению</option>
                    <option ${task.status === 'progress' ? 'selected' : ''} value="progress">В работе</option>
                    <option ${task.status === 'review' ? 'selected' : ''} value="review">На проверке</option>
                    <option ${task.status === 'done' ? 'selected' : ''} value="done">Готово</option>
                </select>`;
                row.insertCell(4).innerText = task.deadline || '—';
                row.insertCell(5).innerHTML = `<button class="btn btn-outline btn-sm edit-task" data-task-id="${task.id}" data-project-id="${project.id}">✏️</button>
                                               <button class="btn btn-outline btn-sm delete-task" data-task-id="${task.id}" data-project-id="${project.id}">🗑️</button>`;
            });
            tasksContainer.appendChild(tasksTable);
        }
        // Обработчики кнопок внутри карточки
        projectCard.querySelector('.edit-project').addEventListener('click', () => openProjectModal(project.id));
        projectCard.querySelector('.delete-project').addEventListener('click', async () => {
            if (confirm('Удалить проект и все его задачи?')) {
                await deleteProject(project.id);
                renderProjects();
            }
        });
        projectCard.querySelector('.add-task-btn').addEventListener('click', () => openProjectTaskModal(project.id, null));
        projectCard.querySelectorAll('.task-status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const taskId = select.dataset.taskId;
                const projectId = select.dataset.projectId;
                const newStatus = select.value;
                await updateProjectTask(projectId, taskId, { status: newStatus });
                renderProjects(); // обновить весь список проектов, чтобы статус обновился
            });
        });
        projectCard.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.dataset.taskId;
                const projectId = btn.dataset.projectId;
                openProjectTaskModal(projectId, taskId);
            });
        });
        projectCard.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', async () => {
                const taskId = btn.dataset.taskId;
                const projectId = btn.dataset.projectId;
                if (confirm('Удалить задачу?')) {
                    await deleteProjectTask(projectId, taskId);
                    renderProjects();
                }
            });
        });
    }
    document.getElementById('create-project-btn').addEventListener('click', () => openProjectModal(null));
}

// Открыть модальное окно проекта (создание/редактирование)
async function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const titleInput = document.getElementById('project-name');
    const descInput = document.getElementById('project-desc');
    const membersSelect = document.getElementById('project-members');
    // Загружаем всех пользователей для выбора участников
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
            // Выбираем участников
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
    modal.style.display = 'flex';
}

// Сохранить проект (создание/обновление)
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

// Открыть модальное окно задачи проекта
async function openProjectTaskModal(projectId, taskId = null) {
    const modal = document.getElementById('projectTaskModal');
    document.getElementById('current-project-id').value = projectId;
    const assigneeSelect = document.getElementById('project-task-assignee');
    // Загружаем участников проекта
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

// Сохранить задачу проекта
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
    renderProjects(); // обновить список проектов
}

// ========== КОМАНДА (ГРУППЫ ПОЛЬЗОВАТЕЛЕЙ) ==========
async function getTeams() {
    return await apiRequest('teams/', 'get');
}

async function addTeamMember(teamId, userId) {
    return await apiRequest(`teams/${teamId}/add_member/`, 'post', { user_id: userId });
}

async function removeTeamMember(teamId, userId) {
    return await apiRequest(`teams/${teamId}/remove_member/`, 'post', { user_id: userId });
}

function renderTeams() {
    // Упрощённая заглушка, при необходимости реализовать полноценно
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