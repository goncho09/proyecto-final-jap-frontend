const token = localStorage.getItem('jwtToken');
const userAuthorized = localStorage.getItem('usuarioAutenticado');

async function checkSession(hasSession, path) {
    if (hasSession) {
        goTo(path);
        return;
    }
    showContent();
}

function goTo(path) {
    window.location.replace(path);
}

function showContent() {
    document.querySelector('body').classList.toggle('d-none');
}

export { token, checkSession, userAuthorized };