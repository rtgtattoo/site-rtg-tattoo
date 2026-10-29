const cookieName='__Host-rtg-oauth';
const encode = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const decode = value => Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const random = () => encode(crypto.getRandomValues(new Uint8Array(32)));
const clearCookie=`${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
const baseHeaders={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY'};
async function key(secret){return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret)),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function seal(session,secret){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(secret),new TextEncoder().encode(JSON.stringify(session)));
  return encode(iv)+'.'+encode(new Uint8Array(ciphertext));
}
export async function unseal(value,secret){
  const [iv,body]=value.split('.');
  const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(iv)},await key(secret),decode(body));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function responsePage(origin,payload,ok=false,status=400){
  const nonce=random();
  const message=JSON.stringify(`authorization:github:${ok?'success':'error'}:${JSON.stringify(payload)}`).replace(/</g,'\\u003c');
  const script=`const origin=${JSON.stringify(origin)};if(window.opener){window.addEventListener('message',function receive(event){if(event.origin!==origin||event.source!==window.opener||event.data!=='authorizing:github')return;window.removeEventListener('message',receive);window.opener.postMessage(${message},origin);});window.opener.postMessage('authorizing:github',origin);}`;
  return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Acesso RTG Tattoo</title><body><p>${ok?'Acesso autorizado. Você pode voltar ao painel.':'Não foi possível concluir o acesso. Feche esta janela e tente novamente pelo painel.'}</p><script nonce="${nonce}">${script}</script></body></html>`,{status:ok?200:status,headers:{...baseHeaders,'Content-Type':'text/html; charset=utf-8','Set-Cookie':clearCookie,'Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'`}});
}
export async function handleAuth(request,env,fetcher=fetch){
  const url=new URL(request.url);
  const origin=env.SITE_ORIGIN;
  if(request.method!=='GET')return new Response('Método não permitido',{status:405,headers:{...baseHeaders,Allow:'GET'}});
  if(!origin || !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || env.OAUTH_SESSION_SECRET?.length<32 || !env.OAUTH_SESSION_SECRET || !env.ALLOWED_GITHUB_USERS || !/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPO || '')){
    return new Response('O painel aguarda a configuração inicial do acesso GitHub.',{status:503,headers:baseHeaders});
  }
  if(url.origin!==origin || new URL(origin).protocol!=='https:')return new Response('Origem não autorizada',{status:403,headers:baseHeaders});
  const callback=origin+'/api/auth/callback';
  if(url.pathname==='/api/auth'){
    if(url.searchParams.get('provider')!=='github')return new Response('Provedor inválido',{status:400,headers:baseHeaders});
    const state=random(),verifier=random();
    const challenge=encode(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
    const session=await seal({state,verifier,expires:Date.now()+600000},env.OAUTH_SESSION_SECRET);
    const target=new URL('https://github.com/login/oauth/authorize');
    Object.entries({client_id:env.GITHUB_CLIENT_ID,redirect_uri:callback,scope:env.GITHUB_SCOPE==='repo'?'repo':'public_repo',state,code_challenge:challenge,code_challenge_method:'S256',allow_signup:'false'}).forEach(([k,v])=>target.searchParams.set(k,v));
    return new Response(null,{status:302,headers:{...baseHeaders,Location:target.href,'Set-Cookie':`${cookieName}=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`}});
  }
  if(url.pathname!=='/api/auth/callback')return new Response('Não encontrado',{status:404,headers:baseHeaders});
  try{
    const cookie=request.headers.get('Cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    if(!cookie)throw Error('Sessão ausente');
    const session=await unseal(cookie,env.OAUTH_SESSION_SECRET);
    if(session.expires<Date.now() || session.state!==url.searchParams.get('state') || !url.searchParams.get('code') || url.searchParams.has('error'))throw Error('Sessão inválida');
    const tokenResult=await fetcher('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code:url.searchParams.get('code'),redirect_uri:callback,code_verifier:session.verifier})});
    if(!tokenResult.ok)throw Error('Falha de autenticação');
    const token=await tokenResult.json();
    if(!token.access_token || token.error)throw Error('Falha de autenticação');
    const headers={Authorization:`Bearer ${token.access_token}`,Accept:'application/vnd.github+json','User-Agent':'RTG-Tattoo-CMS','X-GitHub-Api-Version':'2022-11-28'};
    const userResult=await fetcher('https://api.github.com/user',{headers});
    if(!userResult.ok)throw Error('Falha de identidade');
    const user=await userResult.json();
    const allowed=env.ALLOWED_GITHUB_USERS.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    if(!allowed.includes(String(user.login).toLowerCase()))return responsePage(origin,{message:'Esta conta não está autorizada a editar o estúdio.'},false,403);
    const repoResult=await fetcher(`https://api.github.com/repos/${env.GITHUB_REPO}`,{headers});
    if(!repoResult.ok || !(await repoResult.json()).permissions?.push)return responsePage(origin,{message:'Sua conta precisa de permissão de escrita no repositório do estúdio.'},false,403);
    return responsePage(origin,{token:token.access_token,provider:'github'},true);
  }catch{
    return responsePage(origin,{message:'A sessão expirou ou a autorização falhou. Inicie o acesso novamente.'});
  }
}
export default {async fetch(request,env){
  if(new URL(request.url).pathname.startsWith('/api/'))return handleAuth(request,env);
  return env.ASSETS.fetch(request);
}};
