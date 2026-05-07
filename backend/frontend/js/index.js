// index.js - только переход на страницу логина
document.addEventListener('DOMContentLoaded', () => {
    const goto = (e) => {
        window.location.href = '/login/';
    };
    document.getElementById('goto-login')?.addEventListener('click', goto);
    document.getElementById('start-free')?.addEventListener('click', goto);
    document.getElementById('login-btn')?.addEventListener('click', goto);
});