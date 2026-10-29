fetch('/admin/config.json').then(response => {
  if (!response.ok) throw Error('Configuração indisponível');
  return response.json();
}).then(config => {
  if (!window.CMS) throw Error('Não foi possível carregar o painel. Verifique sua conexão e tente novamente.');
  // Autenticação apenas na origem configurada; não direcionar prévias para a produção.
  if (window.location.origin !== config.backend.base_url) {
    document.querySelector('#admin-loading p').textContent = 'Esta é uma prévia. A edição com GitHub ficará disponível no domínio definitivo após configurar a conexão. Para ver o painel sem acessar o repositório, abra a demonstração abaixo.';
    const demo = document.createElement('a');
    demo.href = '/admin/demo.html'; demo.textContent = 'Abrir demonstração do painel';
    document.querySelector('#admin-loading').appendChild(document.createElement('br'));
    document.querySelector('#admin-loading').appendChild(demo);
    return;
  }
  document.querySelector('#admin-loading').remove();
  window.CMS.init({config:{...config,load_config_file:false}});
}).catch(error => {
  document.querySelector('#admin-loading p').textContent = error.message;
});
