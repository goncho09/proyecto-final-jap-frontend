import { token, checkSession, userAuthorized } from "./util/checkLogin.js";
import { Header } from "./header.js";

checkSession(!token, './login.html');
new Header(userAuthorized);

document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("autos").addEventListener("click", function () {
        localStorage.setItem("catID", 101);
        window.location = "products.html"
    });
    document.getElementById("juguetes").addEventListener("click", function () {
        localStorage.setItem("catID", 102);
        window.location = "products.html"
    });
    document.getElementById("muebles").addEventListener("click", function () {
        localStorage.setItem("catID", 103);
        window.location = "products.html"
    });
});


