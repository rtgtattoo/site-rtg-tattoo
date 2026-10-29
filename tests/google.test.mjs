import test from 'node:test';
import assert from 'node:assert/strict';
import {syncGoogle} from '../scripts/sync-google.mjs';
const post={slug:'test',url:'https://www.rtgtattoo.com.br/portfolio/test/',summary:'Um trabalho do estúdio.',image:'https://www.rtgtattoo.com.br/media/test.webp'};
const env={GOOGLE_CLIENT_ID:'test',GOOGLE_CLIENT_SECRET:'test',GOOGLE_REFRESH_TOKEN:'test',GOOGLE_LOCATION:'accounts/123/locations/456'};
function fetcherFor(existing=[],published=[post],listStatus=200){
  const mutations=[];
  const fetcher=async(url,options={})=>{
    url=String(url);
    if(url.endsWith('/google-posts.json'))return Response.json(published);
    if(url===post.url)return new Response(`<link rel="canonical" href="${post.url}">`);
    if(url===post.image)return new Response(null,{headers:{'Content-Type':'image/webp'}});
    if(url.includes('oauth2.googleapis'))return Response.json({access_token:'test-token'});
    if(options.method==='POST'||options.method==='PATCH'){mutations.push({url,...options});return Response.json({});}
    return Response.json({localPosts:existing},{status:listStatus});
  };
  return {fetcher,mutations};
}
test('nenhum post selecionado não exige credenciais nem usa a rede',async()=>{
  assert.deepEqual(await syncGoogle([],{},()=>{throw Error('Rede indevida');}),{created:0,updated:0});
});
test('não publica antes de o site servir o manifesto da mesma versão',async()=>{
  const {fetcher,mutations}=fetcherFor([],[]);
  await assert.rejects(syncGoogle([post],env,fetcher),/ainda não corresponde/);assert.equal(mutations.length,0);
});
test('uma postagem existente com mesmo endereço é atualizada, sem duplicação',async()=>{
  const {fetcher,mutations}=fetcherFor([{name:env.GOOGLE_LOCATION+'/localPosts/abc',summary:'Texto antigo',callToAction:{url:post.url}}]);
  assert.deepEqual(await syncGoogle([post],env,fetcher),{created:0,updated:1});assert.equal(mutations[0].method,'PATCH');
});
test('postagem inalterada não gera escrita',async()=>{
  const {fetcher,mutations}=fetcherFor([{name:env.GOOGLE_LOCATION+'/localPosts/abc',summary:post.summary,callToAction:{url:post.url},media:[{sourceUrl:post.image}]}]);
  assert.deepEqual(await syncGoogle([post],env,fetcher),{created:0,updated:0});assert.equal(mutations.length,0);
});
test('falha na consulta ao Google impede criação e duplicações',async()=>{
  const {fetcher,mutations}=fetcherFor([], [post],403);
  await assert.rejects(syncGoogle([post],env,fetcher),/falha ao consultar/);assert.equal(mutations.length,0);
});
