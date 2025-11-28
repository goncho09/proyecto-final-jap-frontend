import { authorizedUser, checkSession } from "./util/checkLogin.js";
import { Header } from './header.js';
import { warningAlert } from "./util/alerts.js";

checkSession(!authorizedUser, './login.html');
new Header(authorizedUser);

const productID = localStorage.getItem('productID');

getJSONData(`${PRODUCT_INFO_URL}${productID}`)
    .then((response) => {
        const data = response.data;

        loadingProductInfo(data)
        loadingProductsRelated(data.relatedProducts);
    });

function loadingProductInfo({ images, name, category, currency, cost, description, soldCount }) {

    const [mainImage, thumbnailContainer] = document.getElementById('image-container').children
    const [title, categoryElement, price, descriptionElement, soldCountElement] = document.getElementById('product-details').children;

    mainImage.id = 'mainImage';
    mainImage.src = images[0];
    mainImage.alt = name;
    const fragment = document.createDocumentFragment();
    images.forEach(imageUrl => {
        const thumbnail = document.createElement('img');
        thumbnail.src = imageUrl;
        thumbnail.alt = name;
        thumbnail.className = 'thumbnail';
        thumbnail.addEventListener('click', () => {
            mainImage.src = imageUrl;
        });
        fragment.appendChild(thumbnail);
    });

    thumbnailContainer.appendChild(fragment);

    title.textContent = name;
    categoryElement.textContent = category;
    price.textContent = `${currency} ${cost}`;
    descriptionElement.textContent = description;
    soldCountElement.textContent = `${soldCount} vendidos`;
}

function loadingProductsRelated(relatedProducts) {
    const relatedProductsSection = document.getElementById('related-products');
    const fragment = document.createDocumentFragment();
    relatedProducts.forEach(product => {

        const card = document.createElement('div');
        const link = document.createElement('a');
        const image = document.createElement('img');
        const title = document.createElement('span');

        card.className = 'card m-2 related-product text-center';

        card.addEventListener('click', () => localStorage.setItem('productID', product.id));

        link.href = './product-info.html';
        link.className = "related-link"
        image.src = product.image;
        image.className = 'card-img-top related-img';
        image.alt = product.name;

        title.textContent = product.name;

        card.appendChild(link);
        link.appendChild(image);
        link.appendChild(title);
        fragment.appendChild(card);
    });

    relatedProductsSection.appendChild(fragment);
}

// --- Comentarios ---
const commentsContainer = document.getElementById('comments-container')
const commentsSection = document.getElementById('comments-section');

function showStars(rating) {
    let estrellas = '';

    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            estrellas += '<span class="fa fa-star checked"></span>'; // estrella llena
        } else {
            estrellas += '<span class="fa fa-star"></span>'; // estrella vacía
        }
    }
    return estrellas;
}

getJSONData(`${PRODUCT_INFO_COMMENTS_URL}${productID}`).then(
    (response) => {
        if (response.data.length === 0) {
            commentsContainer.classList.add('d-none')
        }

        const fragment = document.createDocumentFragment();
        response.data.forEach(comment => {
            fragment.appendChild(renderComment(comment));
        });

        commentsSection.appendChild(fragment);
    }
);

// Función para renderizar todos los comentarios //
function renderComment(comment) {

    const commentContainer = document.createElement('div');
    commentContainer.className = 'comment-user'

    const header = document.createElement('div');
    header.className = 'd-flex align-items-center justify-content-between';

    const userName = document.createElement('h5');
    userName.className = 'comment-user';
    userName.id = 'comment-user';
    userName.textContent = `${comment.user}:`;

    const dateTime = document.createElement('p');
    dateTime.className = 'comment-date text-muted m-0';
    dateTime.textContent = comment.dateTime;

    header.appendChild(userName);
    header.appendChild(dateTime);

    const content = document.createElement('div');
    content.className = 'd-flex flex-column';

    const rating = document.createElement('p');
    rating.className = 'comment-rating';
    rating.innerHTML = showStars(comment.score);

    const description = document.createElement('p');
    description.className = 'comment-description';
    description.textContent = comment.description;

    content.appendChild(rating);
    content.appendChild(description);

    commentContainer.appendChild(header);
    commentContainer.appendChild(content);

    const divider = document.createElement('hr');
    divider.className = 'comment-divider';

    commentContainer.appendChild(divider);

    return commentContainer;
}

const sendButton = document.querySelector('.btn.btn-primary'); // botón de enviar
sendButton.addEventListener('click', (e) => {
    e.preventDefault(); // prevenir comportamiento por defecto del botón

    const ratingInput = document.querySelector('input[name="rating"]:checked'); // input de calificación
    const commentInput = document.querySelector('#comment'); // textarea de comentario

    if (!ratingInput) {
        warningAlert('Debes selecionar una clasificacion.')
        return;
    }

    const val = parseInt(ratingInput.value, 10);
    const desc = commentInput.value.trim() || 'Comentario simulado';
    const now = new Date();

    const comment = {
        user: authorizedUser,
        description: desc,
        score: val,
        dateTime: now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0]
    }
    // Renderizar todos los comentarios //
    if (commentsContainer.classList.contains('d-none')) {
        commentsContainer.classList.remove('d-none')
    }
    commentsSection.appendChild(renderComment(comment));

    // Limpiar inputs //
    ratingInput.checked = false;
    commentInput.value = '';
});

const btnBuy = document.getElementById('buy-button'); // Obtenemos el boton
btnBuy.addEventListener('click', () => {

    const cart = JSON.parse(localStorage.getItem('carrito')) || [];

    let product = cart.find(product => product.id === localStorage.getItem('productID'))

    if (product) {
        product.cantidad++;
    } else {
        let [title, , price] = document.getElementById('product-details').children
        let [first] = document.querySelectorAll('.thumbnail')
        const urlImage = new URL(first.src);

        cart.push({
            id: localStorage.productID,
            title: title.textContent,
            price: price.textContent,
            image: `./img${urlImage.pathname.split('/img')[1]}` ,
            cantidad: 1,
        });
    }

    localStorage.setItem('carrito', JSON.stringify(cart)); // Guardamos en el localstorage los productos obtenidos de dar click en comprar en un string
    btnBuy.disabled = true;
    btnBuy.textContent = 'Producto agregado al carrito';
    window.location.replace('./cart.html')
});