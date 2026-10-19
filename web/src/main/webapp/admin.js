for (const button of document.querySelectorAll('[data-confirm]')) {
  button.addEventListener('click', (event) => {
    if (!window.confirm(button.dataset.confirm)) event.preventDefault();
  });
}
