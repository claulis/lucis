// Teste do fluxo do jogo: início, barra, estrelas, Lumes, itens, continuar. Requer playwright.
const {chromium,devices}=require('playwright');const assert=require('assert');
const URL='file://'+require('path').resolve(__dirname,'../www/index.html');
// junta os orbes no centro e fixa a meta, para a vitória/derrota não depender da sorte
const rig=(p,{gather,need})=>p.evaluate(([g,nd])=>{if(nd!=null)need=nd;orbs.forEach((o,i)=>{o.vx=o.vy=0;if(i<g){o.x=W/2+(Math.random()-.5)*60;o.y=H/2+(Math.random()-.5)*60}else{o.x=W-15;o.y=15+i}});hud()},[gather,need]);
const endOf=p=>p.waitForFunction(()=>state==='end',null,{timeout:30000});
const S=p=>p.evaluate(()=>JSON.parse(JSON.stringify(save)));
(async()=>{const b=await chromium.launch(),ctx=await b.newContext({...devices['Pixel 7']}),p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
// migração: recorde da versão antiga vira nível liberado
await p.goto(URL);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('lucisBest','3')});await p.reload();
assert.equal((await S(p)).best,3);assert.match(await p.textContent('#home'),/Continuar.*Nível 3/);console.log('migração lucisBest -> Continuar nível 3 ok');
await p.evaluate(()=>{localStorage.clear()});await p.reload();
assert.match(await p.textContent('#home'),/Começar/);
await p.tap('#cont');assert.deepEqual(await p.evaluate(()=>[state,level,total>0,total===orbs.length,need>0&&need<total]),['play',1,true,true,true]);
// ★★★ na fase 1: todos no centro
await rig(p,{gather:99});await p.touchscreen.tap(206,420);await endOf(p);
let s=await S(p);assert.equal(s.stars[1],3);assert.equal(s.coins,25);console.log('fase 1 ★★★: +25 ✦ (3 estrelas + bônus) ok');
assert.match(await p.textContent('#card'),/\+25 ✦/);
// repetir a mesma fase com ★★★ não paga de novo
await p.tap('#again');await rig(p,{gather:99});await p.touchscreen.tap(206,420);await endOf(p);
s=await S(p);assert.equal(s.coins,25);assert.doesNotMatch(await p.textContent('#card'),/✦/);console.log('repetir ★★★: +0 ✦ ok');
// próxima fase, ★ só (meta baixa, poucos orbes juntos)
await p.tap('#next');assert.equal(await p.evaluate(()=>level),2);
await rig(p,{gather:4,need:3});await p.touchscreen.tap(206,420);await endOf(p);
s=await S(p);assert.equal(s.stars[2],1);assert.equal(s.coins,30);assert.equal(s.best,3);console.log('fase 2 ★: +5 ✦ ok');
// item: compra desconta, segundo não pode, item caro bloqueado
await p.tap('#again');await p.tap('.it[data-k=ampla]');s=await S(p);assert.equal(s.coins,15);
assert.equal(await p.evaluate(()=>[active.ampla,waveMax/((86-1.2*2)*S)].map(v=>+(+v).toFixed(2)).join()),'1,1.15');
await p.tap('.it[data-k=ampla]');assert.equal((await S(p)).coins,15);
await p.tap('.it[data-k=toque]');assert.equal((await S(p)).coins,15);assert.equal(await p.evaluate(()=>tapped),false);console.log('compra Onda Ampla -15 ✦; sem saldo p/ Segundo Toque; toque na bandeja não solta onda ok');
// item gasto mesmo perdendo
await rig(p,{gather:0});await p.touchscreen.tap(206,420);await endOf(p);assert.match(await p.textContent('#card'),/Quase lá/);assert.equal((await S(p)).coins,15);
// Segundo Toque: dá saldo e testa dois toques
await p.evaluate(()=>{save.coins=40;persist()});await p.tap('#again');await p.tap('.it[data-k=toque]');assert.equal((await S(p)).coins,10);
await rig(p,{gather:0});await p.touchscreen.tap(100,700);await p.waitForFunction(()=>document.getElementById('hint').textContent.includes('toque de novo'),null,{timeout:30000});
assert.equal(await p.evaluate(()=>state),'play');await p.touchscreen.tap(100,700);await endOf(p);console.log('Segundo Toque: espera o 2º toque antes de encerrar ok');
// reabrir: continua do nível liberado com saldo
await p.reload();assert.match(await p.textContent('#home'),/Continuar.*Nível 3.*★ 4/);assert.match(await p.textContent('#home'),/✦ 10/);
await p.mouse.click(30,120);assert.deepEqual(await p.evaluate(()=>[state,level]),['play',3]);console.log('reabrir: Continuar nível 3, ★ 4, ✦ 10 ok');
console.log('erros:',errs);assert(!errs.length);await b.close();console.log('JOGO OK')})().catch(e=>{console.error('FALHOU',e.message);process.exit(1)});
