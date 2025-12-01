import { token, checkSession } from "./util/checkLogin.js";

checkSession(token, './'); //go to index.html

const form = document.getElementById('loginForm');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;

    if (user && password) {
        try {
            const response = await getJSONData('http://localhost:3004/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user, password })
            });

            // Guardar token JWT y datos del usuario
            localStorage.setItem('jwtToken', response.data.token);

            const response22 = await getJSONData('http://localhost:3004/api/auth/check-session', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': localStorage.getItem('jwtToken')
                },
            });

            if (response22.status === 'ok') {
                localStorage.setItem('usuarioAutenticado', response22.data.user.email);
            }

            // Redirigir al inicio
            window.location.replace('./');
        } catch (error) {
            console.error('Error en login:', error);
            alert('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
        }
    }
});