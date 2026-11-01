import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ORIGIN, escape } from './lib.mjs';

function reportPost(slug, post) {
  const state = ['LIVE','PROCESSING','REJECTED','SCHEDULED','RECURRING'].includes(post?.state) ? post.state : 'NAO_INFORMADO';
  console.log(`Google: ${slug} estado da postagem: ${state}.`);
  if (post?.searchUrl) {
    try {
      const url = new URL(post.searchUrl);
      if(url.protocol==='https:' && (url.hostname==='google.com'||url.hostname.endsWith('.google.com'))) console.log(`Google: ${slug} link da postagem: ${url.href}`);
    } catch {}
  }
}

export async function syncGoogle(posts,env=process.env,fetcher=fetch){
  if(!posts.length){console.log('Nenhum trabalho selecionado para publicação no Google.');return {created:0,updated:0,photosCreated:0};}
  for(const name of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN','GOOGLE_LOCATION'])if(!env[name])throw Error(`Configure ${name} antes de sincronizar.`);
  if(!/^accounts\/\d+\/locations\/\d+$/.test(env.GOOGLE_LOCATION))throw Error('GOOGLE_LOCATION deve usar accounts/ID/locations/ID.');
  // Confere o manifesto exato servido pelo domínio. Evita postar páginas de builds ainda não publicados.
  const remote=await fetcher(ORIGIN+'/google-posts.json',{cache:'no-store'});
  if(!remote.ok)throw Error('O site ainda não publicou o manifesto desta versão.');
  const published=await remote.json();
  if(JSON.stringify(published)!==JSON.stringify(posts))throw Error('O site publicado ainda não corresponde a esta versão. Aguarde o deploy antes de sincronizar.');
  for(const post of posts){
    if(!/^https:\/\/www\.rtgtattoo\.com\.br\/portfolio\/[a-z0-9-]+\/$/.test(post.url) || !post.image.startsWith(ORIGIN+'/media/'))throw Error('URL de publicação inválida.');
    const page=await fetcher(post.url,{cache:'no-store'});
    if(!page.ok || !(await page.text()).includes(`rel="canonical" href="${escape(post.url)}"`))throw Error(`Página ainda indisponível: ${post.slug}`);
    const image=await fetcher(post.image,{method:'HEAD'});
    if(!image.ok || !image.headers.get('content-type')?.startsWith('image/'))throw Error(`Imagem ainda indisponível: ${post.slug}`);
    if(!post.summary?.trim() || post.summary.length>1500)throw Error(`Texto do Google deve ter entre 1 e 1500 caracteres: ${post.slug}`);
  }
  const tokenResult=await fetcher('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:env.GOOGLE_REFRESH_TOKEN,grant_type:'refresh_token'})});
  if(!tokenResult.ok)throw Error('Google: não foi possível renovar a autorização.');
  const {access_token}=await tokenResult.json();
  if(!access_token)throw Error('Google não retornou uma autorização válida.');
  const headers={Authorization:`Bearer ${access_token}`,'Content-Type':'application/json'};
  const base=`https://mybusiness.googleapis.com/v4/${env.GOOGLE_LOCATION}/localPosts`;
  const mediaBase=`https://mybusiness.googleapis.com/v4/${env.GOOGLE_LOCATION}/media`;
  async function listAll(endpoint, field) {
    const entries=[];
    let pageToken='',pages=0;
    do{
      if(++pages>100)throw Error('Limite de páginas atingido; sincronização interrompida para evitar duplicações.');
      const url=new URL(endpoint);url.searchParams.set('pageSize','100');if(pageToken)url.searchParams.set('pageToken',pageToken);
      const response=await fetcher(url,{headers});
      if(!response.ok)throw Error(`Google: falha ao consultar ${field} (HTTP ${response.status}). Nenhuma criação deve ser tentada sem essa consulta.`);
      const data=await response.json();entries.push(...(data[field]||[]));pageToken=data.nextPageToken||'';
    }while(pageToken);
    return entries;
  }
  // Consulta os dois destinos antes de qualquer escrita, inclusive após falhas parciais.
  const existing=await listAll(base,'localPosts');
  const media=await listAll(mediaBase,'mediaItems');
  const gallerySources=new Set(media.filter(m=>m.locationAssociation).map(m=>m.sourceUrl).filter(Boolean));
  let created=0,updated=0,photosCreated=0;
  for(const post of posts){
    const matches=existing.filter(p=>p.callToAction?.url===post.url);
    if(matches.length>1)throw Error(`Há postagens duplicadas para ${post.slug}; revise no Google antes de sincronizar.`);
    const previous=matches[0];
    if(!gallerySources.has(post.image)) {
      const photo=await fetcher(mediaBase,{method:'POST',headers,body:JSON.stringify({mediaFormat:'PHOTO',locationAssociation:{category:'ADDITIONAL'},sourceUrl:post.image,description:post.title||post.slug})});
      if(!photo.ok)throw Error(`Google: falha ao enviar foto de ${post.slug} à galeria (HTTP ${photo.status}). Consulte a galeria antes de repetir.`);
      const saved=await photo.json();
      if(!saved.name)throw Error(`Google não confirmou o identificador da foto de ${post.slug}. Consulte a galeria antes de repetir.`);
      gallerySources.add(post.image);photosCreated++;
      console.log(`Google: ${post.slug} foto enviada à galeria; exibição sujeita ao processamento do Google.`);
    }
    const body={languageCode:'pt-BR',summary:post.summary,topicType:'STANDARD',callToAction:{actionType:'LEARN_MORE',url:post.url},media:[{mediaFormat:'PHOTO',sourceUrl:post.image}]};
    if(previous && previous.summary===body.summary && previous.media?.[0]?.sourceUrl===post.image){reportPost(post.slug,previous);continue;}
    if(previous && !new RegExp(`^${env.GOOGLE_LOCATION}/localPosts/[A-Za-z0-9_-]+$`).test(previous.name))throw Error('Google retornou um identificador de postagem inválido.');
    const target=previous?`https://mybusiness.googleapis.com/v4/${previous.name}?updateMask=summary,callToAction,media`:base;
    const response=await fetcher(target,{method:previous?'PATCH':'POST',headers,body:JSON.stringify(body)});
    if(!response.ok)throw Error(`Google: falha em ${post.slug} (HTTP ${response.status}). Verifique acesso à API e as políticas do perfil.`);
    const saved=await response.json();
    previous?updated++:created++;
    console.log(`Google: ${post.slug} ${previous?'atualizado':'criado'}.`);
    reportPost(post.slug,saved);
  }
  return {created,updated,photosCreated};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const posts=JSON.parse(await readFile(new URL('../dist/google-posts.json',import.meta.url),'utf8'));
  if(process.argv.includes('--dry-run'))console.log(JSON.stringify(posts,null,2));
  else console.log(await syncGoogle(posts));
}
