// Teste da lógica de atualização com o plugin simulado. Requer playwright: npx -y -p playwright node test/update.js
const {chromium}=require('playwright');const assert=require('assert');
const M=(v,ns)=>({version:v,nativeSince:ns,web:{url:'W'+v,sha256:'abc'},apk:{url:'about:blank#apk'+v}});
async function run(b,{manifest,builtin='1.1.0',cur={id:'builtin',version:'builtin'},list=[],tapFirst=false}){
  const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(([manifest,builtin,cur,list,tapFirst])=>{window.calls=[];const c=(n,r)=>async a=>{calls.push([n,a]);return typeof r==='function'?r(a):r};
    window.Capacitor={Plugins:{CapacitorHttp:{get:async a=>{if(tapFirst)await new Promise(r=>setTimeout(r,300));return {status:200,data:JSON.stringify(manifest)}}},
      CapacitorUpdater:{notifyAppReady:c('ready',{}),getBuiltinVersion:c('builtin',{version:builtin}),current:c('current',{bundle:cur}),
        list:c('list',{bundles:list}),download:c('download',a=>({id:'b1',version:a.version})),set:c('set'),next:c('next')}}}},[manifest,builtin,cur,list,tapFirst]);
  await p.goto('file://'+require('path').resolve(__dirname,'../www/index.html'));if(tapFirst)await p.mouse.click(100,100);await p.waitForTimeout(700);
  const r={calls:(await p.evaluate(()=>calls)).map(x=>x[0]+(x[1]?':'+JSON.stringify(x[1]):'')),btn:await p.$eval('#upd',e=>e.style.display+'|'+e.textContent),errs};await p.close();return r}
(async()=>{const b=await chromium.launch();let r;
 r=await run(b,{manifest:M('1.1.1','1.1.0')});console.log('A conteúdo novo, na tela inicial:',r.calls.filter(c=>/download|set|next/.test(c)));
 assert(r.calls.includes('download:{"url":"W1.1.1","version":"1.1.1","checksum":"abc"}'));assert(r.calls.some(c=>c.startsWith('set')));assert(r.calls[0]==='ready');
 r=await run(b,{manifest:M('1.1.1','1.1.0'),tapFirst:true});console.log('B no meio da partida:',r.calls.filter(c=>/set|next/.test(c)));assert(r.calls.some(c=>c.startsWith('next'))&&!r.calls.some(c=>c.startsWith('set')));
 r=await run(b,{manifest:M('1.2.0','1.2.0')});console.log('C exige APK novo:',r.btn,r.calls.filter(c=>/download/.test(c)));assert(r.btn==='block|Atualizar para 1.2.0'&&!r.calls.some(c=>c.startsWith('download')));
 r=await run(b,{manifest:M('1.1.0','1.1.0')});console.log('D já atualizado:',r.calls.filter(c=>/download/.test(c)));assert(!r.calls.some(c=>c.startsWith('download')));
 r=await run(b,{manifest:M('1.1.1','1.1.0'),list:[{version:'1.1.1',status:'error'}]});console.log('E versão que falhou antes:',r.calls.filter(c=>/download/.test(c)));assert(!r.calls.some(c=>c.startsWith('download')));
 r=await run(b,{manifest:M('1.1.2','1.1.0'),cur:{id:'x',version:'1.1.1'}});assert(r.calls.some(c=>c.startsWith('download')));console.log('F a partir de bundle baixado: ok');
 const p=await b.newPage(),e=[];p.on('pageerror',x=>e.push(x.message));await p.goto('file://'+require('path').resolve(__dirname,'../www/index.html'));await p.waitForTimeout(300);console.log('G navegador puro, erros:',e);assert(!e.length);
 await b.close();console.log('TODOS OK')})().catch(e=>{console.error('FALHOU',e.message);process.exit(1)});
