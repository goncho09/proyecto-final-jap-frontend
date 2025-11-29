import { authorizedUser, checkSession } from "./util/checkLogin.js";

checkSession(authorizedUser, './');

const form = document.getElementById('loginForm');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;

    if (user && password) {
        try {
            const response = await fetch('http://localhost:3004/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user, password })
            });

            const result = await response.json();

            if (result.success) {
                // Guardar token JWT y datos del usuario
                localStorage.setItem('jwtToken', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                localStorage.setItem('usuarioAutenticado', result.user.username);
                
                // Redirigir al inicio
                window.location.replace('./index.html');
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error en login:', error);
            alert('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
        }
    } else {
        alert('Por favor completa ambos campos');
    }
});