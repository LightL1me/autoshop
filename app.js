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
  serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
  document.querySelector('#booking').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  form.elements.name.focus({ preventScroll: true });
}));

const phoneInput = form.elements.phone;
function cleanPhone() {
  const caret = phoneInput.selectionStart ?? phoneInput.value.length;
  const nextCaret = phoneInput.value.slice(0, caret).replace(/\D/g, '').length;
  phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 15);
  phoneInput.setSelectionRange(Math.min(nextCaret, phoneInput.value.length), Math.min(nextCaret, phoneInput.value.length));
  phoneInput.setCustomValidity('');
}
phoneInput.addEventListener('beforeinput', event => {
  if (event.inputType === 'insertText' && event.data && /\D/.test(event.data) && !event.isComposing) event.preventDefault();
});
phoneInput.addEventListener('input', cleanPhone);
phoneInput.addEventListener('compositionend', cleanPhone);
phoneInput.addEventListener('paste', event => {
  event.preventDefault();
  const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
  phoneInput.setRangeText(pasted, phoneInput.selectionStart ?? 0, phoneInput.selectionEnd ?? phoneInput.value.length, 'end');
  phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const digits = phoneInput.value.replace(/\D/g, '');
  if (!/^[0-9]{10,15}$/.test(phoneInput.value)) {
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

// A consistent listbox replaces OS-specific blue selection menus.
const selectControls = [];
function makeIcon(path) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const stroke = document.createElementNS(svg.namespaceURI, 'path');
  stroke.setAttribute('d', path);
  stroke.setAttribute('stroke', 'currentColor');
  stroke.setAttribute('stroke-width', '1.5');
  stroke.setAttribute('stroke-linecap', 'round');
  stroke.setAttribute('stroke-linejoin', 'round');
  svg.append(stroke);
  return svg;
}
for (const select of [serviceSelect, sizeSelect]) {
  const wrap = select.parentElement;
  const label = document.querySelector(`label[for="${select.id}"]`);
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = select.id + '-choice';
  trigger.className = 'select-trigger';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-labelledby', label.id);
  const value = document.createElement('span');
  value.className = 'select-value';
  trigger.append(value, makeIcon('m6 9 6 6 6-6'));
  const panel = document.createElement('div');
  panel.id = select.id + '-options';
  panel.className = 'select-options';
  panel.setAttribute('role', 'listbox');
  panel.setAttribute('aria-labelledby', label.id);
  panel.hidden = true;
  trigger.setAttribute('aria-controls', panel.id);
  const options = Array.from(select.options);
  let active = select.selectedIndex;
  let search = '';
  let lastKeyTime = 0;
  const items = options.map((option, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.tabIndex = -1;
    item.id = panel.id + '-' + index;
    item.className = 'select-option';
    item.setAttribute('role', 'option');
    const text = document.createElement('span');
    text.textContent = option.text;
    item.append(text, makeIcon('m5 12 4 4L19 6'));
    item.addEventListener('pointerdown', event => event.preventDefault());
    item.addEventListener('click', () => choose(index));
    panel.append(item);
    return item;
  });
  function render() {
    value.textContent = options[select.selectedIndex].text;
    trigger.classList.toggle('has-selection', select.selectedIndex !== 0);
    items.forEach((item, i) => {
      item.setAttribute('aria-selected', String(i === select.selectedIndex));
      item.classList.toggle('is-active', i === active && !panel.hidden);
    });
    if (!panel.hidden) trigger.setAttribute('aria-activedescendant', items[active].id);
    else trigger.removeAttribute('aria-activedescendant');
  }
  function close() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    render();
  }
  function open() {
    selectControls.forEach(control => control.close());
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    active = select.selectedIndex;
    render();
  }
  function choose(index) {
    select.selectedIndex = index;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close();
    trigger.focus({ preventScroll: true });
  }
  trigger.addEventListener('click', () => panel.hidden ? open() : close());
  trigger.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (panel.hidden) open();
      else if (event.key === 'ArrowDown') active = (active + 1) % options.length;
      else if (event.key === 'ArrowUp') active = (active - 1 + options.length) % options.length;
      if (event.key === 'Home') active = 0;
      if (event.key === 'End') active = options.length - 1;
      render();
      items[active].scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      panel.hidden ? open() : choose(active);
    } else if (event.key === 'Escape') {
      event.preventDefault(); close();
    } else if (event.key === 'Tab') close();
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (panel.hidden) open();
      const now = Date.now();
      search = (now - lastKeyTime < 700 ? search : '') + event.key.toLocaleLowerCase('ru');
      lastKeyTime = now;
      const index = options.findIndex(option => option.text.toLocaleLowerCase('ru').startsWith(search));
      if (index >= 0) { active = index; render(); items[index].scrollIntoView({ block: 'nearest' }); }
    }
  });
  document.addEventListener('pointerdown', event => { if (!wrap.contains(event.target)) close(); });
  select.addEventListener('change', () => { active = select.selectedIndex; render(); });
  select.hidden = true;
  label.htmlFor = trigger.id;
  wrap.append(trigger, panel);
  selectControls.push({ close });
  render();
}

for (const input of form.querySelectorAll('input, textarea')) {
  const update = () => input.classList.toggle('is-filled', input.value.trim().length > 0);
  input.addEventListener('input', update);
  input.addEventListener('change', update);
  update();
}

const header = document.querySelector('.header');
window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 16), { passive: true });
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  for (const element of document.querySelectorAll('.approach-body, .services-heading, .service, .detail-photo, .care-story, .questions, .booking-heading, #booking-form')) {
    if (element.getBoundingClientRect().top >= innerHeight) {
      element.classList.add('will-reveal');
      observer.observe(element);
    }
  }
  motionPreference.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      document.querySelectorAll('.will-reveal').forEach(element => element.classList.add('is-visible'));
    }
  });
}
document.querySelector('#credits-open').addEventListener('click', () => document.querySelector('#credits-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
