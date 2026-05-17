const quantityStepButtons = document.querySelectorAll('.quantity-step');
const pricedQuantities = document.querySelectorAll('.priced-quantity');
const orderTotal = document.querySelector('#orderTotal');
const addonToggles = document.querySelectorAll('.addon-toggle');

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

updateOrderTotal();
