const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
function closeMenu() { nav?.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false'); }
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.classList.toggle('active', b === button);
    b.setAttribute('aria-pressed', String(b === button));
  });
  let count = 0;
  document.querySelectorAll('.gallery-card[data-category]').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if(!card.hidden) count++;
  });
  document.querySelector('#gallery-status').textContent = `${count} trabalhos exibidos.`;
}));
document.querySelector('#form-orcamento')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const read = key => String(data.get(key) || '').trim();
  if (!read('nome') || !read('descricao')) {
    document.querySelector('#form-status').textContent = 'Preencha seu nome e conte sua ideia antes de continuar.';
    return;
  }
  const message = [
    'Olá, RTG Tattoo! Gostaria de um orçamento.',
    `Nome: ${read('nome')}`,
    `Local do corpo: ${read('local') || 'A combinar'}`,
    `Tamanho: ${read('tamanho') || 'A combinar'}`,
    `Minha ideia: ${read('descricao')}`,
    read('referencia') ? `Referência: ${read('referencia')}` : ''
  ].filter(Boolean).join('\n\n');
  const url = `https://wa.me/${form.dataset.phone}?text=${encodeURIComponent(message)}`;
  // Navegação direta evita bloqueadores de pop-up e nunca indica envio antes da confirmação no WhatsApp.
  window.location.assign(url);
});
