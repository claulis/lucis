// Teste do fluxo do jogo (início, barra, cartões de vitória e derrota). Requer playwright.
const {chromium,devices}=require('playwright');const assert=require('assert');(async()=>{const b=await chromium.launch(),ctx=await b.newContext({...devices['Pixel 7']}),p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));const out=null;
await p.goto('file://'+require('path').resolve(__dirname,'../www/index.html'));await p.tap('body');assert.deepEqual(await p.evaluate(()=>[total>0,total===orbs.length,need>0&&need<total]),[true,true,true]);
// força vitória: meta baixa e orbes agrupados no centro
await p.evaluate(()=>{need=3;for(const o of orbs.slice(0,9)){o.x=W/2+(Math.random()-.5)*120;o.y=H/2+(Math.random()-.5)*120;o.vx=o.vy=0};hud()});
await p.touchscreen.tap(206,420);await p.waitForTimeout(500);
await p.waitForFunction(()=>state==='end',null,{timeout:20000});await p.waitForTimeout(700);
const w=await p.evaluate(()=>({popped,need,total,chain,level,txt:document.getElementById('card').innerText}));console.log('vitória:',JSON.stringify(w));
// toque fora do botão não deve avançar
await p.touchscreen.tap(30,800);await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>state),'end');
await p.tap('#next');assert.deepEqual(await p.evaluate(()=>[state,level]),['play',2]);console.log('Próxima fase -> nível 2 ok');
// força derrota: toque num canto vazio, meta impossível
await p.evaluate(()=>{need=total-1;for(const o of orbs){o.x=W-20;o.y=20;o.vx=o.vy=0}});await p.touchscreen.tap(60,700);
await p.waitForFunction(()=>state==='end',null,{timeout:20000});await p.waitForTimeout(700);
console.log('derrota:',JSON.stringify(await p.evaluate(()=>document.getElementById('card').innerText)));
await p.tap('#again');assert.deepEqual(await p.evaluate(()=>[state,level]),['play',2]);console.log('Tentar de novo -> mesmo nível ok');
console.log('erros:',errs);assert(!errs.length);await b.close()})().catch(e=>{console.error('FALHOU',e.message);process.exit(1)});
