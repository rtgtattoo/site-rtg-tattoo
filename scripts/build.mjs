import { readFile, writeFile, mkdir, readdir, cp, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { render, privacy } from './render.mjs';
import { adminConfig } from './admin-config.mjs';
import { ORIGIN, escape as e, validateSite, validateWork } from './lib.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const output = path.join(root,'dist');
const publicRoot = path.join(root,'public');
export async function readContent() {
  const site = JSON.parse(await readFile(path.join(root,'content/site.json'),'utf8'));
  validateSite(site);
  const files = (await readdir(path.join(root,'content/portfolio'))).filter(f=>f.endsWith('.json'));
  const allWorks = await Promise.all(files.map(async f=>JSON.parse(await readFile(path.join(root,'content/portfolio',f),'utf8'))));
  allWorks.forEach(validateWork);
  const slugs = new Set();
  for (const work of allWorks) {
    if(slugs.has(work.slug)) throw Error(`Endereço duplicado: ${work.slug}`);
    slugs.add(work.slug);
  }
  const works = allWorks.filter(w=>w.published).sort((a,b)=>a.order-b.order || a.slug.localeCompare(b.slug));
  return {site, works, allWorks};
}
export async function build() {
  const {site,works,allWorks} = await readContent();
  // Exclusão limitada à pasta de saída fixa deste projeto.
  if(output !== path.join(root,'dist')) throw Error('Diretório de saída inválido.');
  await rm(output,{recursive:true,force:true});
  await mkdir(output,{recursive:true});
  await cp(publicRoot,output,{recursive:true});
  const pictures = new Map();
  const portfolioSources = new Set(works.map(w=>w.image));
  const sources = new Set([site.hero.image,site.about.image,...site.about.team.map(m=>m.image),...works.map(w=>w.image)]);
  const mediaDir = path.join(output,'media');
  await mkdir(mediaDir,{recursive:true});
  for(const source of sources) {
    if(typeof source !== 'string' || !source.startsWith('/') || source.startsWith('//') || source.includes('\\') || source.includes('?') || source.includes('#')) throw Error(`Imagem deve ser um arquivo local: ${source}`);
    const sourceFile = path.resolve(publicRoot, '.'+decodeURIComponent(source));
    if(!sourceFile.startsWith(publicRoot+path.sep)) throw Error(`Caminho de imagem inválido: ${source}`);
    // Windows aceita diferenças de caixa; a hospedagem não. Confere todos os segmentos.
    let current = publicRoot;
    for(const segment of path.relative(publicRoot,sourceFile).split(path.sep)) {
      if(!(await readdir(current)).includes(segment)) throw Error(`Nome de arquivo incorreto: ${source}`);
      current=path.join(current,segment);
    }
    const bytes = await readFile(sourceFile);
    const id = createHash('sha256').update(bytes).digest('hex').slice(0,16);
    const meta = await sharp(bytes).rotate().metadata();
    const dimensions = meta.autoOrient || {width:meta.width,height:meta.height};
    const variants = [];
    for(const width of [480,960,1440]) {
      const filename=`${id}-${width}.webp`;
      const info=await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality:82}).toFile(path.join(mediaDir,filename));
      variants.push({src:'/media/'+filename,width:info.width,height:info.height});
    }
    // Evita descritores de largura repetidos em arquivos de origem pequenos.
    const unique = [...new Map(variants.map(v=>[v.width,v])).values()];
    // O Perfil da Empresa documenta JPG/PNG; WebP continua sendo usado no site.
    let google;
    if(portfolioSources.has(source)) {
      const filename=`${id}-google.jpg`;
      await sharp(bytes).rotate().resize({width:1440,height:1440,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:90}).toFile(path.join(mediaDir,filename));
      google='/media/'+filename;
    }
    pictures.set(source,{src:variants[1].src,srcset:unique.map(v=>`${v.src} ${v.width}w`).join(', '),width:dimensions.width,height:dimensions.height,social:variants[2].src,google});
  }
  await writeFile(path.join(output,'index.html'),render(site,works,pictures));
  await mkdir(path.join(output,'portfolio'),{recursive:true});
  await writeFile(path.join(output,'portfolio/index.html'),render(site,works,pictures,null,true));
  for(const work of works) {
    const dir=path.join(output,'portfolio',work.slug);
    await mkdir(dir,{recursive:true});
    await writeFile(path.join(dir,'index.html'),render(site,works,pictures,work));
  }
  await mkdir(path.join(output,'privacidade'),{recursive:true});
  await writeFile(path.join(output,'privacidade/index.html'),privacy(site));
  await writeFile(path.join(output,'admin/config.json'),JSON.stringify(adminConfig,null,2));
  // A demonstração carrega somente conteúdo publicado, nunca rascunhos.
  await writeFile(path.join(output,'admin/demo-content.json'),JSON.stringify({site,works}));
  const urls=['/','/portfolio/',...works.map(w=>`/portfolio/${w.slug}/`),'/privacidade/'];
  const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.map(url=>{
    const w=works.find(w=>url===`/portfolio/${w.slug}/`);
    return `\n<url><loc>${ORIGIN+url}</loc>${w?`<image:image><image:loc>${ORIGIN+pictures.get(w.image).social}</image:loc></image:image>`:''}</url>`;
  }).join('')}\n</urlset>\n`;
  await writeFile(path.join(output,'sitemap.xml'),sitemap);
  await writeFile(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  await writeFile(path.join(output,'404.html'),`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Página não encontrada | RTG Tattoo</title><link rel="stylesheet" href="/assets/css/site.css"></head><body><main class="wrap privacy"><p class="eyebrow">RTG Tattoo · 404</p><h1>Esse caminho<br>ainda não foi traçado.</h1><p>A página pode ter mudado de endereço.</p><a class="button" href="/">Voltar ao estúdio ↗</a></main></body></html>`);
  await writeFile(path.join(output,'google-posts.json'),JSON.stringify(works.filter(w=>w.google?.enabled).map(w=>({slug:w.slug,title:w.title,url:ORIGIN+`/portfolio/${w.slug}/`,summary:w.google.text?.trim() || w.description,image:ORIGIN+pictures.get(w.image).google})),null,2));
  const imageBytes = (await Promise.all((await readdir(mediaDir)).map(async f=>(await stat(path.join(mediaDir,f))).size))).reduce((a,b)=>a+b,0);
  console.log(`Site gerado: ${urls.length} páginas, ${works.length} trabalhos publicados, ${allWorks.length-works.length} rascunhos. Imagens responsivas: ${(imageBytes/1024/1024).toFixed(2)} MB no total.`);
  return {site,works,pictures};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await build();
