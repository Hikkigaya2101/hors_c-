// register.js
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const API_BASE = '/api/';

await axios.post('/api/users/', {
    username: email,   // или email
    email: email,
    password: password,
    first_name: name
}
        // после регистрации автоматически логиним
        const loginResponse = await axios.post(API_BASE + 'users/login/', { username: email, password });
        return loginResponse.data.id ? true : false;
    } catch (error) {
        let msg = 'Ошибка регистрации';
        if (error.response?.data?.username) msg = error.response.data.username[0];
        else if (error.response?.data?.email) msg = error.response.data.email[0];
        alert(msg);
        return false;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('do-register').onclick = async () => {
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const password2 = document.getElementById('reg-password2').value;

        if (!name || !email || !password) {
            alert('Заполните все поля');
            return;
        }
        if (password !== password2) {
            alert('Пароли не совпадают');
            return;
        }
        if (password.length < 3) {
            alert('Пароль должен быть не менее 3 символов');
            return;
        }
        if (await register(name, email, password)) {
            window.location.href = '/dashboard/';
        }
    };
});

async function register(name, email, password) {
    try {
        const response = await axios.post('/api/users/', {
            username: email,
            email: email,
            password: password,
            first_name: name
        });
        if (response.data.id) return true;
    } catch (error) {
        alert('Ошибка регистрации: ' + (error.response?.data?.username?.[0] || 'проверьте данные'));
        return false;
    }
}