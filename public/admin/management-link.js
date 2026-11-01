// Decap renders its header after authentication and recreates it on navigation.
// Keep the external shortcut alongside the native links without using its generated CSS classes.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .rtg-management-link {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 16px 20px; color: #7b8290;
      font-family: inherit; font-size: 16px; font-weight: 500; line-height: 1;
      text-decoration: none; white-space: nowrap;
    }
    .rtg-management-link:hover, .rtg-management-link:focus-visible { color: #3a69c7; }
    .rtg-management-link:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
    .rtg-management-link svg { width: 18px; height: 18px; }
    @media (max-width: 499px) {
      .rtg-management-link { padding: 0 10px 10px; font-size: 13px; gap: 2px; }
    }
    @media (max-width: 399px) { .rtg-management-link { flex-direction: column; } }
  `;
  document.head.appendChild(style);

  function attachLink() {
    const navigation = document.querySelector('header nav ul');
    if (!navigation || navigation.querySelector('[data-rtg-management]')) return;
    const item = document.createElement('li');
    item.dataset.rtgManagement = '';
    const link = document.createElement('a');
    link.className = 'rtg-management-link';
    link.href = 'https://gestao.rtgtattoo.com.br';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Gestão (abre em nova aba)');
    link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3h7v7M21 3l-9 9"/><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></svg>';
    link.appendChild(document.createTextNode('Gestão'));
    item.appendChild(link);
    navigation.appendChild(item);
  }

  attachLink();
  new MutationObserver(attachLink).observe(document.body, { childList: true, subtree: true });
})();
