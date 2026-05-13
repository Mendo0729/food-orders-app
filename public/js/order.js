const quantityStepButtons = document.querySelectorAll('.quantity-step');

quantityStepButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const form = button.closest('form');
    const input = form.querySelector('.marketplace-quantity');
    const step = Number.parseInt(button.dataset.step, 10) || 0;
    const currentValue = Number.parseInt(input.value, 10) || 1;
    const nextValue = Math.max(1, currentValue + step);

    input.value = nextValue;
  });
});
