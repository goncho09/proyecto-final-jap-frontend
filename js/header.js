export class Header {

    constructor(profile = '') {
        const btnLogOut = document.getElementById('btnLogOut');
        btnLogOut.addEventListener('click', this.logOut);

        const checkBoxTheme = document.getElementById('switchTheme');
        checkBoxTheme.addEventListener('change', event => this.changeTheme(event));

        const themeActive = JSON.parse(localStorage.getItem('tema')) ?? false;

        if(themeActive) {
            checkBoxTheme.checked = themeActive;
        }

        const _profile = JSON.parse(localStorage.getItem("profiles")) ?? [];

        const user = _profile.find(item => item.user === profile);

        const cart = JSON.parse(localStorage.getItem('carrito'));
        let total = 0;

        if (cart) {
            cart.forEach(element => {
                total += element.cantidad;
            });

            document.getElementById('number-products').textContent = total;
        }

        if (!user) {
            document.getElementById('profile-name').innerHTML = profile;
            return;
        }

        document.getElementById('profile-name').innerHTML = `${user.name} ${user.lastName}`
        document.getElementById('img-profile-menu').src = user.image;
    }

    logOut() {
        localStorage.removeItem('usuarioAutenticado');
        localStorage.removeItem('jwtToken');
    }

    changeTheme(event) {
        const flagChecked = event.target.checked;

        // Condicional para en caso de ser verdadero
        if (flagChecked) {
            localStorage.setItem('tema', flagChecked)
            return;
        }

        localStorage.setItem('tema', flagChecked);
    }
}
