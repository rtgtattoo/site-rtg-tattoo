Promise.all([fetch('/admin/config.json').then(r=>r.json()),fetch('/admin/demo-content.json').then(r=>r.json())]).then(([config,content])=>{
  window.repoFiles = {content:{'site.json':{path:'content/site.json',content:JSON.stringify(content.site)},portfolio:{}}};
  for (const work of content.works) {
    const name=work.slug+'.json';
    window.repoFiles.content.portfolio[name]={path:'content/portfolio/'+name,content:JSON.stringify(work)};
  }
  // Backend oficial em memória: nenhum token, API de escrita ou repositório conectado.
  window.CMS.init({config:{...config,backend:{name:'test-repo'},publish_mode:'simple',load_config_file:false}});
});
