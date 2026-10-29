import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {render} from '../scripts/render.mjs';

const site = JSON.parse(readFileSync(new URL('../content/site.json',import.meta.url),'utf8'));
const works = Array.from({length:30},(_,i)=>({slug:`work-${i}`,title:`Trabalho ${i}`,image:'/test.jpg',alt:'Tatuagem',description:'Descrição do trabalho',category:i<25?'Botânica':'Escrita',featured:i<18}));
const pictures = new Map([site.hero.image,site.about.image,...site.about.team.map(m=>m.image),'/test.jpg'].map(src=>[src,{src,srcset:src+' 480w',social:src,width:480,height:600}]));

test('home limita os destaques a 12 e mantém acesso ao portfólio completo',()=>{
  const html=render(site,works,pictures);
  assert.equal((html.match(/class="gallery-card"/g)||[]).length,12);
  assert.match(html,/href="\/portfolio\/">Ver portfólio completo/);
  assert.ok(!html.includes('href="/portfolio/work-12/"'));
  const selected=render(site,works.map(w=>({...w,featured:w.slug==='work-29'})),pictures);
  assert.equal((selected.match(/class="gallery-card"/g)||[]).length,1);
  assert.ok(selected.includes('href="/portfolio/work-29/"'));
});

test('portfólio completo inclui todos os links estáticos e canonical próprio',()=>{
  const html=render(site,works,pictures,null,true);
  assert.equal((html.match(/class="gallery-card"/g)||[]).length,30);
  assert.match(html,/<link rel="canonical" href="https:\/\/www.rtgtattoo.com.br\/portfolio\/">/);
  assert.match(html,/data-page-size="12"/);
  assert.match(html,/data-load-more[^>]*hidden/);
});

function galleryFixture(count=30) {
  const button = category => ({dataset:{filter:category},events:{},classList:{toggle(){}},setAttribute(){},addEventListener(name,handler){this.events[name]=handler;}});
  const cards=Array.from({length:count},(_,i)=>({dataset:{category:i<25?'Botânica':'Escrita'},hidden:false,focused:false,querySelector(){return {focus:()=>{this.focused=true;}};}}));
  const filters=['all','Botânica','Escrita','Vazia'].map(button);
  const more=button();
  const status={textContent:''};
  const gallery={dataset:{pageSize:'12'},querySelectorAll:s=>s==='[data-filter]'?filters:cards,querySelector:s=>s==='[data-load-more]'?more:status};
  const document={querySelector:()=>null,querySelectorAll:s=>s==='[data-gallery]'?[gallery]:[],addEventListener(){}};
  runInNewContext(readFileSync(new URL('../public/assets/js/site.js',import.meta.url),'utf8'),{document});
  return {cards,filters,more,status,visible:()=>cards.filter(c=>!c.hidden).length};
}

test('carrega 12 por vez, filtra além do primeiro lote e reinicia ao trocar categoria',()=>{
  const g=galleryFixture();
  assert.equal(g.visible(),12); assert.equal(g.more.hidden,false);
  g.more.events.click(); assert.equal(g.visible(),24); assert.equal(g.cards[12].focused,true);
  g.more.events.click(); assert.equal(g.visible(),30); assert.equal(g.more.hidden,true);
  g.filters[2].events.click(); assert.equal(g.visible(),5); assert.equal(g.more.hidden,true);
  assert.ok(g.cards.slice(25).every(c=>!c.hidden));
  g.filters[1].events.click(); assert.equal(g.visible(),12); assert.equal(g.more.hidden,false);
  g.more.events.click(); assert.equal(g.visible(),24);
  g.more.events.click(); assert.equal(g.visible(),25); assert.equal(g.more.hidden,true);
  g.filters[0].events.click(); assert.equal(g.visible(),12);
  g.filters[3].events.click(); assert.equal(g.visible(),0); assert.equal(g.more.hidden,true);
  assert.equal(g.status.textContent,'Nenhum trabalho nesta seleção.');
});

test('acervo menor que 12 não exibe carregar mais',()=>{
  const g=galleryFixture(10);
  assert.equal(g.visible(),10); assert.equal(g.more.hidden,true);
  assert.equal(g.status.textContent,'10 de 10 trabalhos');
});
