// login.js
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const API_BASE = '/api/';

async function login(username, password) {
    try {
        const response = await axios.post(API_BASE + 'users/login/', { username, password });
        if (response.data.id) return true;
        return false;
    } catch (error) {
        if (error.response) alert(error.response.data?.error || 'Ошибка входа');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('do-login').onclick = async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        if (await login(username, password)) {
            window.location.href = '/dashboard/';
        } else {
            alert('Неверный логин или пароль');
        }
    };

    document.getElementById('google-login').onclick = async () => {
        // Для демо: создаём/логиним пользователя user@gmail.com
        try {
            await axios.post(API_BASE + 'users/', { username: 'user@gmail.com', email: 'user@gmail.com', password: '123', first_name: 'GoogleUser' });
            await login('user@gmail.com', '123');
            window.location.href = '/dashboard/';
        } catch {
            alert('Ошибка демо-входа');
        }
    };
});