import test from 'node:test';
import assert from 'node:assert/strict';
import {syncGoogle} from '../scripts/sync-google.mjs';
const post={slug:'test',title:'Trabalho de teste',url:'https://www.rtgtattoo.com.br/portfolio/test/',summary:'Um trabalho do estúdio.',image:'https://www.rtgtattoo.com.br/media/test-google.jpg'};
const env={GOOGLE_CLIENT_ID:'test',GOOGLE_CLIENT_SECRET:'test',GOOGLE_REFRESH_TOKEN:'test',GOOGLE_LOCATION:'accounts/123/locations/456'};
const galleryPhoto={name:env.GOOGLE_LOCATION+'/media/photo',locationAssociation:{category:'ADDITIONAL'},sourceUrl:post.image};
function fetcherFor(existing=[],published=[post],listStatus=200,media=[galleryPhoto],mediaListStatus=200){
  const mutations=[];
  const fetcher=async(url,options={})=>{
    url=String(url);
    if(url.endsWith('/google-posts.json'))return Response.json(published);
    if(url===post.url)return new Response(`<link rel="canonical" href="${post.url}">`);
    if(url===post.image)return new Response(null,{headers:{'Content-Type':'image/jpeg'}});
    if(url.includes('oauth2.googleapis'))return Response.json({access_token:'test-token'});
    if(options.method==='POST'||options.method==='PATCH'){
      mutations.push({url,...options});
      if(url.endsWith('/media'))return Response.json({name:galleryPhoto.name});
      return Response.json({name:env.GOOGLE_LOCATION+'/localPosts/abc',state:'PROCESSING',searchUrl:'https://local.google.com/test'});
    }
    if(new URL(url).pathname.endsWith('/media'))return Response.json({mediaItems:media},{status:mediaListStatus});
    return Response.json({localPosts:existing},{status:listStatus});
  };
  return {fetcher,mutations};
}
test('nenhum post selecionado não exige credenciais nem usa a rede',async()=>{
  assert.deepEqual(await syncGoogle([],{},()=>{throw Error('Rede indevida');}),{created:0,updated:0,photosCreated:0});
});
test('não publica antes de o site servir o manifesto da mesma versão',async()=>{
  const {fetcher,mutations}=fetcherFor([],[]);
  await assert.rejects(syncGoogle([post],env,fetcher),/ainda não corresponde/);assert.equal(mutations.length,0);
});
test('uma postagem existente com mesmo endereço é atualizada, sem duplicação',async()=>{
  const {fetcher,mutations}=fetcherFor([{name:env.GOOGLE_LOCATION+'/localPosts/abc',summary:'Texto antigo',callToAction:{url:post.url}}]);
  assert.deepEqual(await syncGoogle([post],env,fetcher),{created:0,updated:1,photosCreated:0});assert.equal(mutations[0].method,'PATCH');
});
test('postagem inalterada não gera escrita',async()=>{
  const {fetcher,mutations}=fetcherFor([{name:env.GOOGLE_LOCATION+'/localPosts/abc',summary:post.summary,callToAction:{url:post.url},media:[{sourceUrl:post.image}]}]);
  assert.deepEqual(await syncGoogle([post],env,fetcher),{created:0,updated:0,photosCreated:0});assert.equal(mutations.length,0);
});
test('falha na consulta ao Google impede criação e duplicações',async()=>{
  const {fetcher,mutations}=fetcherFor([], [post],403);
  await assert.rejects(syncGoogle([post],env,fetcher),/falha ao consultar/);assert.equal(mutations.length,0);
});

test('envia uma foto à galeria e cria postagem como operações distintas',async()=>{
  const {fetcher,mutations}=fetcherFor([], [post],200,[]);
  assert.deepEqual(await syncGoogle([post],env,fetcher),{created:1,updated:0,photosCreated:1});
  assert.equal(mutations.length,2);
  assert.ok(mutations[0].url.endsWith('/media'));
  const photo=JSON.parse(mutations[0].body);
  assert.equal(photo.sourceUrl,post.image);assert.equal(photo.description,post.title);
  assert.deepEqual(photo.locationAssociation,{category:'ADDITIONAL'});
  assert.ok(mutations[1].url.endsWith('/localPosts'));
});

test('foto existente e postagem com mesmo link não são duplicadas',async()=>{
  const {fetcher,mutations}=fetcherFor([{name:env.GOOGLE_LOCATION+'/localPosts/abc',summary:post.summary,callToAction:{url:post.url},media:[{sourceUrl:post.image}],state:'LIVE'}]);
  assert.deepEqual(await syncGoogle([post],env,fetcher),{created:0,updated:0,photosCreated:0});
  assert.equal(mutations.length,0);
});

test('falha na consulta da galeria impede todas as escritas',async()=>{
  const {fetcher,mutations}=fetcherFor([], [post],200,[],403);
  await assert.rejects(syncGoogle([post],env,fetcher),/falha ao consultar mediaItems/);
  assert.equal(mutations.length,0);
});

test('consulta também páginas seguintes da galeria antes de criar uma foto',async()=>{
  const fixture=fetcherFor([{name:env.GOOGLE_LOCATION+'/localPosts/abc',summary:post.summary,callToAction:{url:post.url},media:[{sourceUrl:post.image}]}]);
  let galleryCalls=0;
  const fetcher=async(url,options)=>{
    const parsed=new URL(String(url));
    if(parsed.pathname.endsWith('/media')&&!options?.method){
      galleryCalls++;
      return Response.json(parsed.searchParams.get('pageToken')?{mediaItems:[galleryPhoto]}:{mediaItems:[],nextPageToken:'next'});
    }
    return fixture.fetcher(url,options);
  };
  assert.deepEqual(await syncGoogle([post],env,fetcher),{created:0,updated:0,photosCreated:0});
  assert.equal(galleryCalls,2);assert.equal(fixture.mutations.length,0);
});

test('falha parcial: foto aceita não é reenviada na execução seguinte',async()=>{
  let uploaded=false;
  let photoWrites=0;
  const fixture=fetcherFor();
  const fetcher=async(url,options={})=>{
    const pathname=new URL(String(url)).pathname;
    if(pathname.endsWith('/media')){
      if(options.method==='POST'){uploaded=true;photoWrites++;return Response.json({name:galleryPhoto.name});}
      return Response.json({mediaItems:uploaded?[galleryPhoto]:[]});
    }
    if(pathname.endsWith('/localPosts')&&options.method==='POST')return new Response(null,{status:500});
    return fixture.fetcher(url,options);
  };
  await assert.rejects(syncGoogle([post],env,fetcher),/HTTP 500/);
  await assert.rejects(syncGoogle([post],env,fetcher),/HTTP 500/);
  assert.equal(photoWrites,1);
});
