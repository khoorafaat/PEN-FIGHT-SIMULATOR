// ===== SETUP =====
const cv=document.getElementById('c'),g=cv.getContext('2d'),ov=document.getElementById('ov'),$=id=>document.getElementById(id);
const W=900,H=560,D0={x:40,y:40,w:820,h:480},L=130,T=14,I=4000,SUB=6;
const COL=['#2a5fd0','#d8352a'],NAME=['Blue','Red'];
const PENS=[{n:'Classic',d:'balanced',m:1,s:1,f:.985},{n:'Heavy',d:'hard to move',m:1.8,s:.85,f:.984},{n:'Speedy',d:'light and fast',m:.8,s:1.15,f:.985},{n:'Slick',d:'glides far',m:1,s:1,f:.992}];
let D={...D0},Dt={...D0},pens,turn=0,state='menu',scores=[0,0],drag=null,shake=0,parts=[],float=[],endT=0,ac,
 cfg={ai:false,t:[0,0],lvl:1,shr:true},boost=[true,true],armed=false,moves=0,hits=0,paused=false,muted=false,fr=0;

// ===== SOUND =====
function tone(f,d,t='sine',v=.15,s=0){if(!ac||muted)return;const n=ac.currentTime,o=ac.createOscillator(),k=ac.createGain();
 o.type=t;o.frequency.setValueAtTime(f,n);if(s)o.frequency.exponentialRampToValueAtTime(s,n+d);
 k.gain.setValueAtTime(v,n);k.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(k).connect(ac.destination);o.start();o.stop(n+d)}
const sndFlick=()=>tone(500,.12,'triangle',.12,150),sndHit=v=>tone(180+v*8,.15,'square',Math.min(.25,v/60),60),
 sndWin=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.25,'triangle',.15),i*120));

// ===== WOOD TEXTURE =====
const wood=document.createElement('canvas');wood.width=W;wood.height=H;
(function(){const w=wood.getContext('2d'),gr=w.createLinearGradient(0,D0.y,0,D0.y+D0.h);
 gr.addColorStop(0,'#9a6a3e');gr.addColorStop(.5,'#865a33');gr.addColorStop(1,'#744b28');w.fillStyle=gr;w.fillRect(D0.x,D0.y,D0.w,D0.h);
 let s=7;const r=()=>(s=s*16807%2147483647)/2147483647;
 for(let i=0;i<110;i++){const y=D0.y+r()*D0.h;w.strokeStyle=`rgba(${r()>.5?'40,20,5':'210,160,100'},${.05+r()*.12})`;w.lineWidth=.6+r()*1.6;
  w.beginPath();w.moveTo(D0.x,y);for(let x=D0.x;x<=D0.x+D0.w;x+=80)w.lineTo(x,y+Math.sin(x*.01+i)*4);w.stroke()}})();

// ===== PHYSICS (with pen mass) =====
const mk=(x,y,a,t)=>({x,y,a,vx:0,vy:0,w:0,out:false,t:PENS[t],tr:[]});
const corners=p=>{const c=Math.cos(p.a),s=Math.sin(p.a);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>{u*=L/2;v*=T/2;return{x:p.x+u*c-v*s,y:p.y+u*s+v*c}})};
const inside=(p,q)=>{const c=Math.cos(p.a),s=Math.sin(p.a),dx=q.x-p.x,dy=q.y-p.y;return Math.abs(dx*c+dy*s)<=L/2&&Math.abs(-dx*s+dy*c)<=T/2};
function collide(A,B){
 const ca=corners(A),cb=corners(B);let best=1e9,n=null;
 for(const p of[A,B]){const c=Math.cos(p.a),s=Math.sin(p.a);
  for(const ax of[{x:c,y:s},{x:-s,y:c}]){const pr=q=>q.map(v=>v.x*ax.x+v.y*ax.y),a=pr(ca),b=pr(cb);
   const o=Math.min(Math.max(...a),Math.max(...b))-Math.max(Math.min(...a),Math.min(...b));
   if(o<=0)return;if(o<best){best=o;n=ax}}}
 if((B.x-A.x)*n.x+(B.y-A.y)*n.y<0)n={x:-n.x,y:-n.y};
 const mA=A.t.m,mB=B.t.m,IA=I*mA,IB=I*mB;
 const pts=[...ca.filter(v=>inside(B,v)),...cb.filter(v=>inside(A,v))];
 const P=pts.length?{x:pts.reduce((s,v)=>s+v.x,0)/pts.length,y:pts.reduce((s,v)=>s+v.y,0)/pts.length}:{x:(A.x+B.x)/2,y:(A.y+B.y)/2};
 const ka=best*mB/(mA+mB),kb=best*mA/(mA+mB);
 A.x-=n.x*ka;A.y-=n.y*ka;B.x+=n.x*kb;B.y+=n.y*kb;
 const ra={x:P.x-A.x,y:P.y-A.y},rb={x:P.x-B.x,y:P.y-B.y};
 const va={x:A.vx-A.w*ra.y,y:A.vy+A.w*ra.x},vb={x:B.vx-B.w*rb.y,y:B.vy+B.w*rb.x};
 const vn=(va.x-vb.x)*n.x+(va.y-vb.y)*n.y;if(vn<=0)return;
 const cA=ra.x*n.y-ra.y*n.x,cB=rb.x*n.y-rb.y*n.x,j=1.8*vn/(1/mA+1/mB+cA*cA/IA+cB*cB/IB);
 A.vx-=j*n.x/mA;A.vy-=j*n.y/mA;A.w-=cA*j/IA;B.vx+=j*n.x/mB;B.vy+=j*n.y/mB;B.w+=cB*j/IB;
 if(vn>2){hits++;shake=Math.min(16,vn*.8);sndHit(vn);burst(P.x,P.y,16,['#f2c14e','#fff']);
  if(vn>14)float.push({t:'Big hit!',x:P.x,y:P.y-24,l:55})}
}
function burst(x,y,k,cols){for(let i=0;i<k;i++){const a=Math.random()*6.28,s=1+Math.random()*4;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:30,c:cols[i%cols.length]})}}
function step(){
 for(let i=0;i<SUB;i++){for(const p of pens){p.x+=p.vx/SUB;p.y+=p.vy/SUB;p.a+=p.w/SUB}collide(pens[0],pens[1])}
 let moving=false;
 for(const p of pens){const f=p.t.f;p.vx*=f;p.vy*=f;p.w*=.96;
  if(Math.hypot(p.vx,p.vy)<.08&&Math.abs(p.w)<.003){p.vx=p.vy=p.w=0}else moving=true;
  if(Math.hypot(p.vx,p.vy)>1.5){p.tr.push({x:p.x,y:p.y});if(p.tr.length>14)p.tr.shift()}else if(p.tr.length)p.tr.shift();
  p.out=p.x<D.x||p.x>D.x+D.w||p.y<D.y||p.y>D.y+D.h}
 const anyOut=pens[0].out||pens[1].out;
 if(state==='moving'){
  if(anyOut){state='ending';endT=70}
  else if(!moving){moves++;turn^=1;armed=false;
   if(cfg.shr&&moves>=6&&moves%2===0&&Dt.w>420&&Dt.h>260){Dt.x+=20;Dt.y+=20;Dt.w-=40;Dt.h-=40;state='shrink';endT=50;shake=10;
    tone(120,.5,'sawtooth',.2,60);float.push({t:'The desk shrinks!',x:W/2,y:H/2,l:70})}
   else nextTurn()}}
 else if(state==='shrink'){if(anyOut){state='ending';endT=70}else if(--endT<=0)nextTurn()}
 else if(state==='ending'&&--endT<=0)endRound();
}
function nextTurn(){state='aim';hud();if(cfg.ai&&turn===1)aiMove()}

// ===== GAME STATE =====
function hud(){$('s0').textContent=scores[0];$('s1').textContent=scores[1];
 const t=$('turn'),live=state==='aim'||state==='moving';t.textContent=live?NAME[turn]+'’s turn':'';t.style.color=COL[turn];
 const can=Dt.w>420&&Dt.h>260,nxt=moves<6?6-moves:2-(moves-6)%2;
 $('sub').textContent=!cfg.shr||state==='menu'?'':can?`Desk shrinks in ${nxt} flick${nxt>1?'s':''}`:'The desk is at its smallest';
 const b=$('bst');b.disabled=!(state==='aim'&&!(cfg.ai&&turn===1)&&boost[turn]);
 b.textContent=armed?'⚡ Boost armed':boost[turn]?'⚡ Boost (Space)':'⚡ Boost used'}
function newRound(){pens=[mk(260,280,0,cfg.t[0]),mk(640,280,Math.PI,cfg.t[1])];turn=(scores[0]+scores[1])%2;
 D={...D0};Dt={...D0};boost=[true,true];armed=false;moves=0;hits=0;parts=[];float=[];ov.style.display='none';nextTurn()}
function startMatch(){ac||=new(window.AudioContext||window.webkitAudioContext)();scores=[0,0];newRound()}
function show(title,msg,btns){ov.style.display='flex';ov.innerHTML=`<h2>${title}</h2><p>${msg}</p>`;
 btns.forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;ov.appendChild(b)})}
function menu(){state='menu';D={...D0};Dt={...D0};pens=[mk(260,280,0,0),mk(640,280,Math.PI,0)];hud();
 const o=s=>PENS.map((p,i)=>`<option value="${i}"${i===s?' selected':''}>${p.n} (${p.d})</option>`).join('');
 ov.style.display='flex';
 ov.innerHTML=`<h2>Pen Fight</h2><div class="f">
 <label>Mode<select id="mo"><option value="0">Two players</option><option value="1"${cfg.ai?' selected':''}>Play the computer</option></select></label>
 <label>Blue pen<select id="p0">${o(cfg.t[0])}</select></label><label>Red pen<select id="p1">${o(cfg.t[1])}</select></label>
 <label>Computer<select id="lv"><option value="0">Easy</option><option value="1"${cfg.lvl===1?' selected':''}>Normal</option><option value="2"${cfg.lvl===2?' selected':''}>Hard</option></select></label>
 <label>Sudden death<select id="sh"><option value="1">Desk shrinks</option><option value="0"${cfg.shr?'':' selected'}>Off</option></select></label></div><button id="go">Start match</button>`;
 $('go').onclick=()=>{cfg={ai:$('mo').value==='1',t:[+$('p0').value,+$('p1').value],lvl:+$('lv').value,shr:$('sh').value==='1'};startMatch()}}
function endRound(){const o=[pens[0].out,pens[1].out],w=o[0]&&o[1]?-1:o[0]?1:0;state='over';
 if(w>=0)scores[w]++;hud();sndWin();const info=`Score: Blue ${scores[0]}, Red ${scores[1]}. Hits this round: ${hits}.`;
 if(w>=0&&scores[w]>=3)show(NAME[w]+' wins the match',`Final score ${scores[0]} to ${scores[1]}.`,[['Play again',startMatch],['Main menu',menu]]);
 else show(w<0?'Both pens fell':NAME[w]+' takes the round',info,[['Next round',newRound]])}
function flick(i,ang,sp){const p=pens[i];p.a=ang;p.vx=Math.cos(ang)*sp;p.vy=Math.sin(ang)*sp;state='moving';drag=null;sndFlick();hud()}

// ===== AI (3 levels; hard aims to push toward the nearest edge) =====
function aiMove(){const go=()=>{if(state!=='aim'||turn!==1)return;if(paused)return setTimeout(go,300);
 const a=pens[1],b=pens[0],l=cfg.lvl;let tx=b.x,ty=b.y;
 if(l===2){const d=[[b.x-D.x,-1,0],[D.x+D.w-b.x,1,0],[b.y-D.y,0,-1],[D.y+D.h-b.y,0,1]].sort((u,v)=>u[0]-v[0])[0];tx-=d[1]*40;ty-=d[2]*40}
 const pw=[[.4,.75],[.55,1],[.8,1]][l];let sp=(pw[0]+Math.random()*(pw[1]-pw[0]))*22*a.t.s;
 if(l===2&&boost[1]&&Math.random()<.5){boost[1]=false;sp*=1.6;burst(a.x,a.y,20,['#ff9a3c','#f2c14e'])}
 flick(1,Math.atan2(ty-a.y,tx-a.x)+(Math.random()-.5)*[.38,.2,.05][l],sp)};setTimeout(go,900)}

// ===== INPUT =====
const pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
function pull(e){const m=pos(e),p=pens[turn],dx=p.x-m.x,dy=p.y-m.y;
 drag={pow:Math.min(Math.hypot(dx,dy),130),ang:Math.atan2(dy,dx)};if(drag.pow>8)p.a=drag.ang}
cv.addEventListener('pointerdown',e=>{if(state!=='aim'||paused||(cfg.ai&&turn===1))return;const m=pos(e),p=pens[turn];
 if(Math.hypot(m.x-p.x,m.y-p.y)<110){cv.setPointerCapture(e.pointerId);pull(e)}});
cv.addEventListener('pointermove',e=>{if(drag)pull(e)});
cv.addEventListener('pointerup',()=>{if(drag&&state==='aim'&&drag.pow>14){const p=pens[turn];let sp=drag.pow*.17*p.t.s;
 if(armed){sp*=1.6;boost[turn]=false;armed=false;burst(p.x,p.y,24,['#ff9a3c','#f2c14e'])}flick(turn,drag.ang,sp)}else drag=null});
function toggleBoost(){if(!$('bst').disabled){armed=!armed;hud();tone(800,.1,'triangle',.1,1200)}}
function togglePause(){if(state==='menu'||state==='over')return;paused=!paused;$('pz').textContent=paused?'Resume (P)':'Pause (P)'}
function toggleMute(){muted=!muted;$('mt').textContent=muted?'Sound off (M)':'Sound on (M)'}
$('bst').onclick=toggleBoost;$('pz').onclick=togglePause;$('mt').onclick=toggleMute;
addEventListener('keydown',e=>{if(e.target.tagName==='SELECT')return;if(e.code==='Space'){e.preventDefault();toggleBoost()}
 else if(e.key==='p'||e.key==='P')togglePause();else if(e.key==='m'||e.key==='M')toggleMute()});

// ===== RENDER =====
function pen(p,c){
 g.save();g.translate(p.x+5,p.y+8);g.rotate(p.a);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.roundRect(-65,-7,130,14,6);g.fill();g.restore();
 g.save();g.translate(p.x,p.y);g.rotate(p.a);
 g.fillStyle=c;g.beginPath();g.roundRect(-65,-7,110,14,6);g.fill();
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.roundRect(-65,-7,26,14,6);g.fill();
 g.fillStyle='#e8e4da';g.fillRect(-36,-10,24,3);
 g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-36,-4,78,2);
 g.fillStyle='#d9d2c4';g.beginPath();g.moveTo(45,-7);g.lineTo(65,-1.5);g.lineTo(65,1.5);g.lineTo(45,7);g.fill();
 g.fillStyle='#222';g.fillRect(62,-1.5,3,3);g.restore()}
function render(){
 for(const k in D)D[k]+=(Dt[k]-D[k])*.12;
 g.save();g.fillStyle='#1a1512';g.fillRect(0,0,W,H);shake*=.85;if(shake>.3)g.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=14;g.strokeRect(D.x,D.y,D.w,D.h);
 g.save();g.beginPath();g.rect(D.x,D.y,D.w,D.h);g.clip();g.drawImage(wood,0,0);g.restore();
 const warn=cfg.shr&&state==='aim'&&moves>=5&&moves%2===1&&Dt.w>420&&Dt.h>260;
 g.strokeStyle=warn?`rgba(230,60,40,${.6+.4*Math.sin(Date.now()/120)})`:'#c9965f';g.lineWidth=4;g.strokeRect(D.x,D.y,D.w,D.h);
 if(pens){
  pens.forEach((p,i)=>{if(p.tr.length>1){g.lineCap='round';g.lineWidth=7;g.strokeStyle=COL[i];
   for(let k=1;k<p.tr.length;k++){g.globalAlpha=k/p.tr.length*.35;g.beginPath();g.moveTo(p.tr[k-1].x,p.tr[k-1].y);g.lineTo(p.tr[k].x,p.tr[k].y);g.stroke()}g.globalAlpha=1}});
  pens.forEach((p,i)=>{if(armed&&i===turn&&state==='aim'){g.shadowColor='#f2c14e';g.shadowBlur=26}pen(p,COL[i]);g.shadowBlur=0});
  if(state==='aim'){const p=pens[turn];g.strokeStyle=armed?'#f2c14e':COL[turn];g.lineWidth=armed?5:3;g.setLineDash([8,8]);
   g.globalAlpha=.6+.4*Math.sin(Date.now()/200);g.beginPath();g.arc(p.x,p.y,84,0,6.28);g.stroke();g.globalAlpha=1;
   if(drag&&drag.pow>8){g.setLineDash([10,8]);g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(p.x,p.y);
    g.lineTo(p.x+Math.cos(drag.ang)*drag.pow*2.4,p.y+Math.sin(drag.ang)*drag.pow*2.4);g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(0,0,0,.5)';g.fillRect(350,528,200,12);g.fillStyle=armed?'#f2c14e':`hsl(${120-drag.pow/130*120},80%,55%)`;g.fillRect(350,528,200*drag.pow/130,12)}
   g.setLineDash([])}}
 parts=parts.filter(q=>q.l>0);for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.l--;g.globalAlpha=q.l/30;g.fillStyle=q.c;g.fillRect(q.x,q.y,3,3)}
 g.globalAlpha=1;g.font='bold 26px "Trebuchet MS",Verdana,sans-serif';g.textAlign='center';
 float=float.filter(f=>f.l>0);for(const f of float){f.y-=.6;f.l--;g.globalAlpha=Math.min(1,f.l/25);g.fillStyle='#f2c14e';g.fillText(f.t,f.x,f.y)}
 if(paused){g.globalAlpha=1;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,W,H);g.fillStyle='#fff';g.font='bold 44px "Trebuchet MS",Verdana,sans-serif';g.fillText('Paused',W/2,H/2)}
 g.globalAlpha=1;g.restore()}
function loop(){if(!paused&&(state==='moving'||state==='ending'||state==='shrink')){
  if(!(state==='ending'&&endT>40&&(fr++&1)))step()}   // slow motion at the moment a pen falls
 render();requestAnimationFrame(loop)}
menu();loop();
