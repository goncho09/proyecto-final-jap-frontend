import { authorizedUser, checkSession } from './util/checkLogin.js';
import { Header } from './header.js';

checkSession(!authorizedUser, './login.html');
new Header(authorizedUser);

const numberProducts = document.getElementById('number-products');

// Validar todos los campos antes de finalizar compra
function validatePurchase() {
  const errors = [];

  // 1. Dirección
  const departamento = document.getElementById('departamento');
  const ciudad = document.getElementById('ciudad');
  const calle = document.getElementById('calle');
  const numero = document.getElementById('numero');
  const esquina = document.getElementById('esquina');

  if (!departamento.value.trim())
    errors.push('El departamento no puede estar vacío');
  if (!ciudad.value.trim()) errors.push('La ciudad no puede estar vacía');
  if (!calle.value.trim()) errors.push('La calle no puede estar vacía');
  if (!numero.value.trim())
    errors.push('El número de calle no puede estar vacío');
  if (!esquina.value.trim()) errors.push('La esquina no puede estar vacía');

  // 2. Forma de envío seleccionada
  const shippingSelect = document.getElementById('shipping-method');
  if (!shippingSelect.value) {
    errors.push('Debe seleccionar una forma de envío');
  }

  // 3. Productos con cantidad mayor a 0
  const productsInCart = JSON.parse(localStorage.getItem('carrito')) || [];
  if (productsInCart.length === 0) {
    errors.push('El carrito está vacío');
  } else {
    productsInCart.forEach((product) => {
      if (product.cantidad <= 0) {
        errors.push(
          `La cantidad del producto "${product.title}" debe ser mayor a 0`
        );
      }
    });
  }

  // 4. Forma de pago
  const paymentSelect = document.getElementById('payment-method');
  if (!paymentSelect.value) {
    errors.push('Debe seleccionar una forma de pago');
  } else {
    // 5. Campos específicos de cada método de pago
    if (
      paymentSelect.value === 'credit-card' ||
      paymentSelect.value === 'debit-card'
    ) {
      const cardHolderName = document.getElementById('card-holder-name');
      const cardNumber = document.getElementById('card-number');
      const cardExpiration = document.getElementById('card-expiration');
      const cardCvv = document.getElementById('card-cvv');

      if (!cardHolderName.value.trim())
        errors.push('El nombre del titular es obligatorio');
      if (!cardNumber.value.trim())
        errors.push('El número de tarjeta es obligatorio');
      if (!cardExpiration.value.trim())
        errors.push('La fecha de expiración es obligatoria');
      if (!cardCvv.value.trim()) errors.push('El CVV es obligatorio');

      // Cuotas para tarjeta de crédito
      if (paymentSelect.value === 'credit-card') {
        const installments = document.getElementById('installments');
        if (!installments.value)
          errors.push('Debe seleccionar cantidad de cuotas');
      }
    }
  }

  return errors;
}

// Alerta de error
function showErrorMessages(errors) {
  const existingErrors = document.querySelectorAll('.error-message');
  existingErrors.forEach((error) => error.remove());

  if (errors.length === 0) return;

  const errorContainer = document.createElement('div');
  errorContainer.className =
    'alert alert-danger error-message alert-dismissible fade show';
  errorContainer.innerHTML = `
        <strong>Errores en el formulario:</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        <ul>
            ${errors.map((error) => `<li>${error}</li>`).join('')}
        </ul>
    `;

  const buyButton = document.getElementById('buy-button');
  buyButton.parentNode.insertBefore(errorContainer, buyButton);

  errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Compra exitosa
function showSuccessMessage() {
  const successMessage = document.createElement('div');
  successMessage.className = 'alert alert-success text-center';
  successMessage.innerHTML = `
        <h4>¡Compra realizada con éxito!</h4>
        <p>Gracias por elegirnos.</p>
        <p>Número de orden: #${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}</p>
        <button class="btn btn-primary mt-3" onclick="window.location.href='./'">Volver al inicio</button>
    `;

  // Reemplazar el contenido del carrito con el mensaje de éxito
  const mainContainer = document.getElementById('main-container');
  mainContainer.innerHTML = '';
  mainContainer.appendChild(successMessage);

  // Limpiar el carrito del localStorage
  localStorage.removeItem('carrito');

  // Actualizar el contador del carrito
  const numberProducts = document.getElementById('number-products');
  numberProducts.textContent = '0';
}

// Función para manejar el finalizar compra
async function handlePurchase() {
  const errors = validatePurchase();

  if (errors.length > 0) {
    showErrorMessages(errors);
    return;
  }

  const data = {
    userId: authorizedUser,
    cart: JSON.parse(localStorage.getItem('carrito')),
  };

  console.log('Compra realizada.Enviando datos al servidor...');

  const response = await fetch('http://127.0.0.1:3004/api/cart', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Error al enviar los datos al servidor.');
    showErrorMessages([
      'Hubo un error al procesar su compra. Por favor, intente nuevamente más tarde.',
    ]);
    return;
  }

  console.log('Datos enviados al servidor correctamente.');

  // Si no hay errores, mostrar éxito
  showSuccessMessage();
}

function calculateSubtotal() {
  const productsInCart = JSON.parse(localStorage.getItem('carrito'));

  if (!productsInCart || productsInCart.length === 0) {
    return 0;
  }

  let total = 0;

  productsInCart.forEach((product) => {
    total += product.price.split(' ')[1] * product.cantidad;
  });

  return total;
}

// Función para actualizar el subtotal
function updateSubtotal() {
  const subtotalElement = document.getElementById('subtotal');
  const totalElement = document.getElementById('total');

  // Calcular nuevo subtotal
  let subtotal = +calculateSubtotal();
  // total incluyendo costo de envío
  let total = updatePayment(subtotal) + subtotal;

  // Actualizar los elementos en el DOM
  subtotalElement.textContent = `Subtotal: $${subtotal.toLocaleString()}`;
  totalElement.textContent = `Total: $${
    total > 0 ? total.toLocaleString() : subtotal.toLocaleString()
  }`; // actualizar total en pantalla
}

function updatePayment(subtotal) {
  const shippingSelect = document.getElementById('shipping-method');
  const paymentMethodLabel = document.getElementById('payment-method-label');
  const paymentMethodHr = document.getElementById('payment-method-hr');
  let result = 0;
  if (shippingSelect.value) {
    paymentMethodLabel.classList.remove('d-none');
    paymentMethodHr.classList.remove('d-none');
  }

  if (shippingSelect.value === 'standard') {
    result = subtotal * 0.05;
    paymentMethodLabel.textContent = `Envio ${
      shippingSelect.querySelector(`#${shippingSelect.value}`).textContent
    } $${result.toLocaleString()}`;

    return result;
  }

  if (shippingSelect.value === 'express') {
    result = subtotal * 0.07;
    paymentMethodLabel.textContent = `Envio ${
      shippingSelect.querySelector(`#${shippingSelect.value}`).textContent
    } $${result.toLocaleString()}`;

    return result;
  }

  if (shippingSelect.value === 'premium') {
    result = subtotal * 0.15;
    paymentMethodLabel.textContent = `Envio ${
      shippingSelect.querySelector(`#${shippingSelect.value}`).textContent
    } $${result.toLocaleString()}`;

    return result;
  }
}

function increaseUnit(id, quantityInput) {
  const productsInCart = JSON.parse(localStorage.getItem('carrito'));
  let numberProducstTotal = parseInt(numberProducts.textContent);
  const product = productsInCart.find((p) => parseInt(p.id) === id);
  if (product) {
    quantityInput.textContent = parseInt(quantityInput.textContent) + 1;
    product.cantidad++;
    numberProducstTotal++;
    localStorage.setItem('carrito', JSON.stringify(productsInCart));
    updateSubtotal();
  }

  numberProducts.textContent = numberProducstTotal;
}

function decreaseUnit(id, quantityInput) {
  let quantityNumber = parseInt(quantityInput.textContent);
  let numberProducstTotal = parseInt(numberProducts.textContent);
  if (quantityNumber === 1) {
    return;
  }

  const productsInCart = JSON.parse(localStorage.getItem('carrito'));

  const product = productsInCart.find((p) => parseInt(p.id) === id);

  if (product) {
    quantityInput.textContent = quantityNumber - 1;
    product.cantidad--;
    numberProducstTotal--;
    localStorage.setItem('carrito', JSON.stringify(productsInCart));
    updateSubtotal();
  }

  numberProducts.textContent = numberProducstTotal;
}

function paymentsOptions() {
  const shippingButton = document.getElementById('shipping-method-button');
  const directionButton = document.getElementById('direction-button');
  const paymentButton = document.getElementById('payment-method-button');

  const shippingSelect = document.getElementById('shipping-method');
  const paymentSelect = document.getElementById('payment-method');

  const directionContainer = document.querySelector('.direction-container');
  const cardDetails = document.getElementById('card-details');
  const installments = document.getElementById('installments');
  const bankDetails = document.getElementById('bank-details');

  shippingButton.addEventListener('click', function () {
    if (shippingSelect.style.display === 'none') {
      shippingSelect.style.display = 'flex';
    } else {
      shippingSelect.style.display = 'none';
    }
  });

  directionButton.addEventListener('click', function () {
    if (directionContainer.style.display === 'none') {
      directionContainer.style.display = 'flex';
    } else {
      directionContainer.style.display = 'none';
    }
  });

  paymentButton.addEventListener('click', function () {
    if (paymentSelect.style.display === 'none') {
      paymentSelect.style.display = 'flex';
    } else {
      cardDetails.classList.add('d-none');
      installments.classList.add('d-none');
      bankDetails.classList.add('d-none');
      paymentSelect.style.display = 'none';
    }
  });

  paymentSelect.addEventListener('change', function () {
    if (this.value === 'credit-card') {
      cardDetails.classList.remove('d-none');
      installments.classList.remove('d-none');
      bankDetails.classList.add('d-none');
    } else if (this.value === 'bank-transfer') {
      bankDetails.classList.remove('d-none');
      cardDetails.classList.add('d-none');
      installments.classList.add('d-none');
    } else if (this.value === 'debit-card') {
      cardDetails.classList.remove('d-none');
      installments.classList.add('d-none');
      bankDetails.classList.add('d-none');
    } else {
      cardDetails.classList.add('d-none');
      installments.classList.add('d-none');
      bankDetails.classList.add('d-none');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const noProductsMessage = document.getElementById('no-products');
  const cartTableBody = document.getElementById('cart-products-body');
  const productsInCart = JSON.parse(localStorage.getItem('carrito'));
  const buyButton = document.getElementById('buy-button');
  if (buyButton) {
    buyButton.addEventListener('click', handlePurchase);
  }

  paymentsOptions();

  // Listener nuevo para cambio envio
  const shippingSelect = document.getElementById('shipping-method');
  shippingSelect.addEventListener('change', () => {
    updateSubtotal();
  });

  if (!productsInCart || productsInCart.length === 0) {
    noProductsMessage.classList.remove('d-none');
    return;
  } else {
    cartTableBody.style.display = 'table-row-group';
  }

  const productsTableBody = document.getElementById('cart-products-body');

  // Renderizar los productos
  productsInCart.forEach((product) => {
    const row = document.createElement('tr');
    row.classList.add('cart-item');
    row.id = 'cart-item';
    row.innerHTML = `
          <td>
            <div class="product-info">
              <img src="${product.image}" alt="${product.title}" class="product-image" />
              <p class="product-name">${product.title}</p>
            </div>
          </td>
          <td>
            <p class="product-price">${product.price}</p>
          </td>
          <td id="quantity-controls" class="quantity-container">
            <div class="quantity-controls">
              <button class="quantity-button decrease" data-id="${product.id}">-</button>
              <span class="quantity-input" data-id="${product.id}">${product.cantidad}</span>
              <button class="quantity-button increase" data-id="${product.id}">+</button>
            </div>

          </td>
        `;
    productsTableBody.appendChild(row);
  });

  productsTableBody.addEventListener('click', function (e) {
    const quantityInputs = document.querySelectorAll('.quantity-input');

    const qualityInput = Array.from(quantityInputs).find(
      (item) => item.dataset.id === e.target.dataset.id
    );

    if (e.target.classList.contains('decrease')) {
      const id = parseInt(e.target.dataset.id);
      decreaseUnit(id, qualityInput);
      updateSubtotal();
    }

    if (e.target.classList.contains('increase')) {
      const id = parseInt(e.target.dataset.id);
      increaseUnit(id, qualityInput);
      updateSubtotal();
    }
  });

  const items = document.querySelectorAll('#cart-item');
  items.forEach((item) => {
    const btnDelete = document.createElement('button');
    btnDelete.innerHTML = `
            <img src="./img/bin.png">
        `;
    btnDelete.className = 'btn-delete';
    btnDelete.addEventListener('click', (event) => {
      //Se obtiene el id del producto que esta en los controles quantity controls
      const idProduct =
        event.target.parentNode.querySelector('.decrease').dataset.id;
      const quantity = event.target.parentNode.querySelector('.quantity-input');
      const quantityTotal =
        parseInt(numberProducts.textContent) - parseInt(quantity.textContent);
      const carrito = JSON.parse(localStorage.getItem('carrito'));
      const newCarrito = carrito.filter((item) => item.id !== idProduct);

      localStorage.setItem('carrito', JSON.stringify(newCarrito));
      productsTableBody.removeChild(event.target.parentNode);
      updateSubtotal();

      if (productsTableBody.children.length === 1) {
        noProductsMessage.classList.remove('d-none');
      }
      numberProducts.textContent = quantityTotal;
    });
    item.append(btnDelete);
  });
});

// Inicializar subtotal y total
updateSubtotal();
