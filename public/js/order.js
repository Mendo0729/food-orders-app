const quantityStepButtons = document.querySelectorAll('.quantity-step');
const pricedQuantities = document.querySelectorAll('.priced-quantity');
const orderTotal = document.querySelector('#orderTotal');
const addonToggles = document.querySelectorAll('.addon-toggle');
const orderForm = document.querySelector('#orderForm');
const submitButton = orderForm?.querySelector('button[type="submit"]');
const orderStatusModalElement = document.querySelector('#orderStatusModal');
const orderStatusTitle = document.querySelector('#orderStatusTitle');
const orderStatusMessage = document.querySelector('#orderStatusMessage');
const orderStatusIcon = document.querySelector('#orderStatusIcon');
const orderStatusClose = document.querySelector('#orderStatusClose');
const orderStatusModal = orderStatusModalElement && window.bootstrap
  ? new window.bootstrap.Modal(orderStatusModalElement)
  : null;

function updateOrderTotal() {
  if (!orderTotal) {
    return;
  }

  const total = [...pricedQuantities].reduce((sum, input) => {
    const price = Number.parseFloat(input.dataset.price);
    const quantity = Number.parseInt(input.value, 10) || 0;

    if (Number.isNaN(price)) {
      return sum;
    }

    return sum + price * quantity;
  }, 0);

  orderTotal.textContent = `$${total.toFixed(2)}`;
}

quantityStepButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const container = button.closest('.order-dish-actions');
    const input = container.querySelector('.marketplace-quantity');
    const step = Number.parseInt(button.dataset.step, 10) || 0;
    const minimum = Number.parseInt(input.dataset.min, 10) || 0;
    const currentValue = Number.parseInt(input.value, 10) || 0;
    const nextValue = Math.max(minimum, currentValue + step);

    input.value = nextValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
});

pricedQuantities.forEach((input) => {
  input.addEventListener('input', () => {
    const quantity = Number.parseInt(input.value, 10);
    const minimum = Number.parseInt(input.dataset.min, 10) || 0;
    input.value = Number.isNaN(quantity) || quantity < minimum ? minimum : quantity;

    const toggle = document.querySelector(`.addon-toggle[data-target="${input.id}"]`);

    if (toggle) {
      toggle.checked = Number.parseInt(input.value, 10) > 0;
    }

    updateOrderTotal();
  });
});

addonToggles.forEach((toggle) => {
  toggle.addEventListener('change', () => {
    const input = document.querySelector(`#${toggle.dataset.target}`);

    if (!input) {
      return;
    }

    if (toggle.checked && Number.parseInt(input.value, 10) <= 0) {
      input.value = 1;
    }

    if (!toggle.checked) {
      input.value = 0;
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
});

function setModalState(state, title, message) {
  if (!orderStatusTitle || !orderStatusMessage || !orderStatusIcon || !orderStatusClose) {
    return;
  }

  orderStatusTitle.textContent = title;
  orderStatusMessage.textContent = message;
  orderStatusIcon.className = `order-status-icon order-status-${state}`;
  orderStatusClose.classList.toggle('d-none', state === 'loading');

  if (state === 'loading') {
    orderStatusIcon.innerHTML = '<div class="spinner-border" role="status" aria-hidden="true"></div>';
    return;
  }

  orderStatusIcon.textContent = state === 'success' ? '✓' : '!';
}

function resetFormAfterSuccess() {
  if (!orderForm) {
    return;
  }

  orderForm.reset();

  pricedQuantities.forEach((input) => {
    const minimum = Number.parseInt(input.dataset.min, 10) || 0;
    input.value = minimum;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

orderForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!orderForm.checkValidity()) {
    orderForm.reportValidity();
    return;
  }

  setModalState('loading', 'Guardando pedido', 'Por favor espera mientras confirmamos tu pedido.');
  orderStatusModal?.show();

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const response = await fetch(orderForm.action, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams(new FormData(orderForm))
    });
    const result = await response.json();

    if (!response.ok || result.ok === false) {
      throw new Error(result.message || 'No se pudo guardar el pedido.');
    }

    setModalState(
      'success',
      'Pedido confirmado',
      result.message || 'Pedido confirmado satisfactoriamente.'
    );
    resetFormAfterSuccess();
  } catch (error) {
    setModalState(
      'error',
      'No se pudo confirmar',
      error.message || 'No se pudo guardar el pedido. Intenta nuevamente.'
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});

updateOrderTotal();
