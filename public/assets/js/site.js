const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
function closeMenu() { nav?.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false'); }
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });
document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const cards = [...gallery.querySelectorAll('.gallery-card[data-category]')];
  const filters = [...gallery.querySelectorAll('[data-filter]')];
  const more = gallery.querySelector('[data-load-more]');
  const status = gallery.querySelector('[data-gallery-status]');
  const pageSize = Number(gallery.dataset.pageSize) || Infinity;
  let selected = 'all';
  let limit = pageSize;
  function update() {
    const matching = cards.filter(card => selected === 'all' || card.dataset.category === selected);
    const visible = new Set(matching.slice(0,limit));
    cards.forEach(card => { card.hidden = !visible.has(card); });
    if (more) more.hidden = visible.size >= matching.length;
    status.textContent = matching.length ? `${visible.size} de ${matching.length} trabalhos` : 'Nenhum trabalho nesta seleção.';
    return matching;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter;
    limit = pageSize;
    filters.forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    update();
  }));
  more?.addEventListener('click', () => {
    const previousLimit = limit;
    limit += pageSize;
    const matching = update();
    // Leva o foco ao primeiro trabalho revelado, inclusive no último lote.
    matching[previousLimit]?.querySelector('a')?.focus({preventScroll:true});
  });
  update();
});
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
