const ROOT_PATH = 'http://localhost:3004/api';

const CATEGORIES_URL = `${ROOT_PATH}/categories/`;
const PUBLISH_PRODUCT_URL = `${ROOT_PATH}/publish/`;
const PRODUCTS_URL = `${ROOT_PATH}/categories/`;
const PRODUCT_INFO_URL = `${ROOT_PATH}/products/`;
const PRODUCT_INFO_COMMENTS_URL =`${ROOT_PATH}/products/comments/`
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = `${ROOT_PATH}/cart/`;

let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function(url, method = {}){
    let result = {};
    showSpinner();
    return fetch(url, method)
    .then(response => {
      if (response.ok) {
        return response.json();
      }else{
        throw Error(response.statusText);
      }
    })
    .then(function(response) {
          result.status = 'ok';
          result.data = response;
          hideSpinner();
          return result;
    })
    .catch(function(error) {
        result.status = 'error';
        result.data = error;
        hideSpinner();
        return result;
    });
}

// Función para obtener el token JWT (para futuras peticiones)
function getJWTToken() {
    return localStorage.getItem('jwtToken');
}

// Función para verificar si el usuario está autenticado con JWT
function isAuthenticated() {
    return !!localStorage.getItem('jwtToken');
}
