const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
}
menuToggle.addEventListener('click', () => {
  const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
  mobileNav.hidden = !opening;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const services = {
  polish: { name: 'Полировка кузова', price: 22000 },
  film: { name: 'Защитная плёнка', price: 90000 },
  ceramic: { name: 'Керамическое покрытие', price: 18000 },
  interior: { name: 'Химчистка салона', price: 16000 },
  consult: { name: 'Помогите выбрать', price: null }
};
const form = document.querySelector('#booking-form');
const serviceSelect = document.querySelector('#service-select');
const sizeSelect = document.querySelector('#size-select');
const estimate = document.querySelector('#estimate-price');
function estimateText() {
  const price = services[serviceSelect.value].price;
  return price === null ? 'После осмотра' : 'от ' + new Intl.NumberFormat('ru-RU').format(Math.round(price * Number(sizeSelect.value))) + ' ₽';
}
function updateEstimate() { estimate.value = estimateText(); }
serviceSelect.addEventListener('change', updateEstimate);
sizeSelect.addEventListener('change', updateEstimate);
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  serviceSelect.value = button.dataset.service;
  updateEstimate();
  document.querySelector('#booking').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  form.elements.name.focus({ preventScroll: true });
}));

const phoneInput = form.elements.phone;
phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  const digits = phoneInput.value.replace(/\D/g, '');
  if (!/^[+0-9()\s.\-]+$/.test(phoneInput.value) || digits.length < 10 || digits.length > 15) {
    phoneInput.setCustomValidity('Введите телефон: от 10 до 15 цифр.');
    phoneInput.reportValidity();
    return;
  }
  phoneInput.setCustomValidity('');
  const data = new FormData(form);
  const summary = document.querySelector('#request-summary');
  summary.replaceChildren();
  const entries = [
    ['Имя', data.get('name').trim()], ['Телефон', data.get('phone').trim()],
    ['Автомобиль', data.get('car').trim()], ['Услуга', services[serviceSelect.value].name],
    ['Размер', sizeSelect.selectedOptions[0].text], ['Ориентир', estimateText()]
  ];
  const comment = data.get('comment').trim();
  if (comment) entries.push(['Комментарий', comment]);
  for (const [label, value] of entries) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    summary.append(row);
  }
  document.querySelector('#result-dialog').showModal();
});
document.querySelector('#credits-open').addEventListener('click', () => document.querySelector('#credits-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
