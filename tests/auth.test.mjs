import test from 'node:test';
import assert from 'node:assert/strict';
import {handleAuth,seal} from '../worker/index.mjs';
const origin='https://www.rtgtattoo.com.br';
const env={SITE_ORIGIN:origin,GITHUB_CLIENT_ID:'test-client',GITHUB_CLIENT_SECRET:'test-secret',OAUTH_SESSION_SECRET:'a-test-session-key-longer-than-thirty-two-characters',ALLOWED_GITHUB_USERS:'studio,partner',GITHUB_REPO:'studio/site'};
const json=value=>Response.json(value);
async function callback(state='test-state',cookieState='test-state',expires=Date.now()+60000){
  const cookie=await seal({state:cookieState,verifier:'test-verifier',expires},env.OAUTH_SESSION_SECRET);
  return new Request(`${origin}/api/auth/callback?code=fake-code&state=${state}`,{headers:{Cookie:`__Host-rtg-oauth=${cookie}`}});
}
test('acesso indisponível antes da configuração, e origem de prévia recusada',async()=>{
  assert.equal((await handleAuth(new Request(origin+'/api/auth'),{})).status,503);
  assert.equal((await handleAuth(new Request('https://preview.example/api/auth'),env)).status,403);
});
test('início usa PKCE, estado e cookie HttpOnly seguro',async()=>{
  const response=await handleAuth(new Request(origin+'/api/auth?provider=github&scope=repo'),env);
  assert.equal(response.status,302);
  const url=new URL(response.headers.get('Location'));
  assert.equal(url.searchParams.get('scope'),'public_repo');
  assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  assert.equal(url.searchParams.get('state').length,43);
  assert.match(response.headers.get('Set-Cookie'),/HttpOnly; Secure; SameSite=Lax/);
});
test('estado trocado e sessão expirada recusados antes de consultar GitHub',async()=>{
  const fetcher=()=>{throw Error('Não deveria consultar a rede');};
  assert.equal((await handleAuth(await callback('wrong'),env,fetcher)).status,400);
  assert.equal((await handleAuth(await callback('test-state','test-state',0),env,fetcher)).status,400);
});
test('conta fora da lista nunca recebe token no popup',async()=>{
  let calls=0;
  const response=await handleAuth(await callback(),env,async()=>++calls===1?json({access_token:'secret-fake-token'}):json({login:'intruder'}));
  assert.equal(response.status,403);assert.equal(calls,2);
  assert.ok(!(await response.text()).includes('secret-fake-token'));
});
test('conta autorizada ainda precisa de permissão de escrita no repositório',async()=>{
  let calls=0;
  const response=await handleAuth(await callback(),env,async()=>[json({access_token:'secret-fake-token'}),json({login:'studio'}),json({permissions:{push:false}})][calls++]);
  assert.equal(response.status,403);assert.ok(!(await response.text()).includes('secret-fake-token'));
});
test('sucesso envia token somente após handshake com origem e janela esperadas',async()=>{
  let calls=0;
  const response=await handleAuth(await callback(),env,async(url,options)=>{
    if(calls===0)assert.equal(options.body.get('code_verifier'),'test-verifier');
    return [json({access_token:'secret-fake-token'}),json({login:'partner'}),json({permissions:{push:true}})][calls++];
  });
  assert.equal(response.status,200);
  const html=await response.text();assert.match(html,/event.origin!==origin\|\|event.source!==window.opener/);assert.match(html,/authorization:github:success/);
  assert.match(response.headers.get('Content-Security-Policy'),/default-src 'none'/);
  assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/);
});
