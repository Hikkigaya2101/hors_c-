// frontend/js/app.js
const API_BASE = '/api/';
let currentUser = null;

// Настройка axios
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

// Общая функция запроса
async function apiRequest(endpoint, method, data = null) {
    try {
        const response = await axios({
            method,
            url: API_BASE + endpoint,
            data,
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Авторизация
async function login(username, password) {
    const data = await apiRequest('users/login/', 'post', { username, password });
    if (data.id) {
        currentUser = data;
        return true;
    }
    return false;
}

async function logout() {
    await apiRequest('users/logout/', 'post');
    currentUser = null;
    window.location.href = '/login/';
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

// Получение задач пользователя
async function getMyTasks() {
    return apiRequest('tasks/tasks/', 'get');
}

async function updateTaskStatus(taskId, status) {
    return apiRequest(`tasks/tasks/${taskId}/`, 'patch', { status });
}

// Рендеры
async function renderPersonalTasks() {
    const tasks = await getMyTasks();
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <h2>Мои задачи</h2>
        <table class="task-table">
            <thead><tr><th>Название</th><th>Проект</th><th>Приоритет</th><th>Статус</th><th>Дедлайн</th></tr></thead>
            <tbody id="tasks-tbody"></tbody>
        </table>
    `;
    const tbody = document.getElementById('tasks-tbody');
    tasks.forEach(task => {
        const row = tbody.insertRow();
        row.insertCell(0).innerHTML = `<strong>${escapeHtml(task.title)}</strong><br><small>${escapeHtml(task.description)}</small>`;
        row.insertCell(1).innerText = task.project_name;
        row.insertCell(2).innerText = task.priority;
        row.insertCell(3).innerHTML = `<select class="task-status" data-id="${task.id}">
            <option ${task.status==='todo'?'selected':''} value="todo">К выполнению</option>
            <option ${task.status==='progress'?'selected':''} value="progress">В работе</option>
            <option ${task.status==='review'?'selected':''} value="review">На проверке</option>
            <option ${task.status==='done'?'selected':''} value="done">Готово</option>
        </select>`;
        row.insertCell(4).innerText = task.deadline || '—';
    });
    document.querySelectorAll('.task-status').forEach(select => {
        select.addEventListener('change', async (e) => {
            await updateTaskStatus(select.dataset.id, select.value);
            renderPersonalTasks();
        });
    });
}

// Инициализация страницы
async function initDashboard() {
    const ok = await checkAuth();
    if (!ok) {
        window.location.href = '/login/';
        return;
    }
    document.getElementById('dashboard-user-name').innerText = currentUser.username;
    document.getElementById('dashboard-user-email').innerText = currentUser.email;
    document.getElementById('logout-btn').onclick = logout;
    // Навигация
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', async () => {
            const section = item.dataset.section;
            if (section === 'tasks') await renderPersonalTasks();
            else if (section === 'projects') await renderProjects();
            else if (section === 'team') await renderTeam();
        });
    });
    await renderPersonalTasks();
}

async function renderProjects() { /* заглушка */ }
async function renderTeam() { /* заглушка */ }

function escapeHtml(str) { return String(str).replace(/[&<>]/g, function(m){...}); }

// Страница входа
function initLogin() {
    document.getElementById('do-login').onclick = async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const success = await login(username, password);
        if (success) window.location.href = '/dashboard/';
        else alert('Ошибка входа');
    };
    // регистрация (упрощённо)
    document.getElementById('do-register').onclick = async () => {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        await apiRequest('users/', 'post', { username: email, email, password, first_name: name });
        await login(email, password);
        window.location.href = '/dashboard/';
    };
}

// Главный запуск
if (window.location.pathname.includes('/dashboard/')) initDashboard();
else if (window.location.pathname.includes('/login/')) initLogin();
else {
    // index.html
    document.getElementById('goto-login').onclick = () => window.location.href = '/login/';
    document.getElementById('start-free').onclick = () => window.location.href = '/login/';
    document.getElementById('login-btn').onclick = () => window.location.href = '/login/';
}
