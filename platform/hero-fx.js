/* KAIVYRA hero-fx: cinematic medical background for .kvh-hero. Lightweight by design:
   pre-rendered sprites, batched paths, 30fps cap, pauses off-screen / hidden tab,
   and auto-degrades (then stops) if the device cannot keep up. */
(function(){
'use strict';
var D=document,hero=D.querySelector('.kvh-hero');if(!hero)return;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var TAU=Math.PI*2,R=Math.random,rnd=function(a,b){return a+R()*(b-a)};
var LOW=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4||innerWidth<700;

/* ---- markup ---- */
var box=D.createElement('div');box.className='kvx-fx';box.setAttribute('aria-hidden','true');
box.innerHTML='<canvas></canvas><canvas></canvas>';hero.insertBefore(box,hero.firstChild);
var ui=D.createElement('div');ui.className='kvx-ui';
ui.innerHTML='<span class="kvx-cap"><i></i><b id="kvx-n">Hematology</b><small id="kvx-s">Live blood flow</small></span><span class="kvx-dots" role="group" aria-label="Background scenes"><button type="button" aria-label="Hematology"></button><button type="button" aria-label="Genomics"></button><button type="button" aria-label="Neuroscience"></button><button type="button" aria-label="Cardiology"></button><button type="button" aria-label="Pharmacology"></button></span>';
hero.appendChild(ui);
var cv=[].slice.call(box.children),ctx=cv.map(function(c){return c.getContext('2d',{alpha:true})});

/* ---- sprites (drawn once) ---- */
function spr(s,fn){var c=D.createElement('canvas');c.width=c.height=s;fn(c.getContext('2d'),s);return c}
function glow(rgb){return spr(64,function(c,s){var g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba('+rgb+',1)');g.addColorStop(.35,'rgba('+rgb+',.35)');g.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=g;c.fillRect(0,0,s,s)})}
var S={teal:glow('94,234,212'),vio:glow('180,160,255'),pink:glow('255,170,190'),
 rbc:spr(96,function(c,s){var g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(120,8,38,1)');g.addColorStop(.34,'rgba(196,26,64,1)');g.addColorStop(.78,'rgba(255,86,114,1)');g.addColorStop(1,'rgba(255,130,150,0)');c.fillStyle=g;c.fillRect(0,0,s,s);c.strokeStyle='rgba(255,180,195,.4)';c.lineWidth=1.5;c.beginPath();c.arc(s/2,s/2,s*.34,.3,2.3);c.stroke()}),
 wbc:spr(128,function(c,s){var g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(225,215,255,.65)');g.addColorStop(.7,'rgba(160,140,240,.35)');g.addColorStop(1,'rgba(160,140,240,0)');c.fillStyle=g;c.fillRect(0,0,s,s);c.fillStyle='rgba(110,80,200,.55)';[[.4,.45],[.58,.42],[.5,.6]].forEach(function(p){c.beginPath();c.arc(p[0]*s,p[1]*s,s*.13,0,TAU);c.fill()})})};
var EL={C:'#9db4d8',O:'#ff5470',N:'#5aa0ff',H:'#e8f1ff',S:'#ffd166'},AT={};
Object.keys(EL).forEach(function(k){AT[k]=spr(48,function(c,s){var g=c.createRadialGradient(s*.36,s*.34,s*.04,s/2,s/2,s/2);g.addColorStop(0,'#fff');g.addColorStop(.3,EL[k]);g.addColorStop(1,'rgba(8,16,40,.95)');c.fillStyle=g;c.beginPath();c.arc(s/2,s/2,s/2-1,0,TAU);c.fill()})});
function put(c,im,x,y,r,a){c.globalAlpha=a;c.drawImage(im,x-r,y-r,r*2,r*2)}

/* ---- scenes ---- */
function blood(){var W,H,cells,wbc,plt;
 return{name:'Hematology',sub:'Live blood flow',rgb:'255,77,109',
 init:function(w,h,q){W=w;H=h;cells=[];wbc=[];plt=[];var i;for(i=0;i<Math.round(46*q);i++)cells.push({x:R()*(w+160),z:R(),o:rnd(-1,1),r:rnd(14,26),ph:rnd(0,TAU),sp:rnd(.7,1.3),tl:rnd(.45,1)});cells.sort(function(a,b){return a.z-b.z});
  for(i=0;i<2;i++)wbc.push({x:R()*(w+200),o:rnd(-.7,.7),r:rnd(40,54),sp:rnd(.6,.9)});for(i=0;i<Math.round(26*q);i++)plt.push({x:R()*(w+80),o:rnd(-1,1),sp:rnd(.8,1.5),z:R()})},
 draw:function(c,t){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(150,12,50,.38)');g.addColorStop(.3,'rgba(90,8,40,.04)');g.addColorStop(.7,'rgba(90,8,40,.04)');g.addColorStop(1,'rgba(150,12,50,.38)');c.fillStyle=g;c.fillRect(0,0,W,H);
  var i,k,x,y;for(i=0;i<plt.length;i++){k=plt[i];x=((k.x+t*50*k.sp)%(W+80))-40;y=H*.5+Math.sin(x*.004+k.o*2+t*.2)*H*.2+k.o*H*.34;put(c,S.pink,x,y,3+k.z*4,.4+k.z*.4)}
  for(i=0;i<cells.length;i++){k=cells[i];x=((k.x+t*(14+k.z*62)*k.sp)%(W+160))-80;y=H*.5+Math.sin(x*.004+k.o*2+t*.2)*H*.19+k.o*H*.33;var s=.45+k.z*1.05,r=k.r*s,a=.3+k.z*.7;if(k.z>.9){r*=1.5;a*=.45}
   var sq=k.tl*(.78+.22*Math.sin(t*k.sp+k.ph)),rot=k.ph+t*.25*k.sp,cs=Math.cos(rot),sn=Math.sin(rot);c.setTransform(cs,sn,-sn*sq,cs*sq,x,y);c.globalAlpha=a;c.drawImage(S.rbc,-r,-r,r*2,r*2)}
  c.setTransform(1,0,0,1,0,0);
  for(i=0;i<wbc.length;i++){k=wbc[i];x=((k.x+t*26*k.sp)%(W+200))-100;y=H*.5+Math.sin(x*.004+k.o*2+t*.2)*H*.19+k.o*H*.3;put(c,S.wbc,x,y,k.r,.9)}c.globalAlpha=1}}}

function dna(){var W,H;var cols=['#5eead4','#60a5fa','#fbbf24','#f472b6'];
 return{name:'Genomics',sub:'Double-helix sequencing',rgb:'94,234,212',
 init:function(w,h){W=w;H=h},
 draw:function(c,t){
  function helix(y0,sl,Rr,al,sp,k,st){var A=[],B=[],x,j,n=0;for(x=-40;x<W+40;x+=st,n++){var ph=x*k+t*sp,yy=y0+(x-W/2)*sl,s=Math.sin(ph)*Rr,z=Math.cos(ph);A.push([x,yy+s,z]);B.push([x,yy-s,-z])}
   c.lineCap='round';c.lineJoin='round';
   function path(P,front){c.beginPath();var on=false;for(var i=0;i<P.length;i++){var f=P[i][2]>=0;if(f===front){on?c.lineTo(P[i][0],P[i][1]):c.moveTo(P[i][0],P[i][1]);on=true}else on=false}c.stroke()}
   c.lineWidth=1.4;c.globalAlpha=al*.3;c.strokeStyle='#38bdf8';path(A,false);c.strokeStyle='#a78bfa';path(B,false);
   cols.forEach(function(col,ci){c.beginPath();for(j=ci;j<A.length;j+=4){c.moveTo(A[j][0],A[j][1]);c.lineTo(B[j][0],B[j][1])}c.strokeStyle=col;c.globalAlpha=al*.22;c.lineWidth=1.3;c.stroke()});
   c.lineWidth=3.4*(Rr/110+.5);c.globalAlpha=al*.9;c.strokeStyle='#5eead4';path(A,true);c.strokeStyle='#818cf8';path(B,true);
   for(j=0;j<A.length;j+=4){if(A[j][2]>.25)put(c,S.teal,A[j][0],A[j][1],5+A[j][2]*6,al*A[j][2]);if(B[j][2]>.25)put(c,S.vio,B[j][0],B[j][1],5+B[j][2]*6,al*B[j][2])}c.globalAlpha=1}
  helix(H*.74,-.22,H*.2,.5,-.55,.008,14);helix(H*.52,-.15,H*.2,1,.9,.0125,9);helix(H*.2,.12,H*.09,.55,1.3,.02,12)}}}

function neuro(){var W,H,N,P,last,D2;
 return{name:'Neuroscience',sub:'Signal propagation',rgb:'167,139,250',
 init:function(w,h,q){W=w;H=h;N=[];P=[];last=0;D2=Math.pow(Math.max(140,w*.13),2);for(var i=0,n=Math.round(46*q);i<n;i++)N.push({x:R()*w,y:R()*h,vx:rnd(-6,6),vy:rnd(-6,6),r:rnd(2,4.4),g:0})},
 draw:function(c,t,dt){var i,j,a,b,L=[],d;
  for(i=0;i<N.length;i++){a=N[i];a.x+=a.vx*dt;a.y+=a.vy*dt;if(a.x<-20)a.x=W+20;if(a.x>W+20)a.x=-20;if(a.y<-20)a.y=H+20;if(a.y>H+20)a.y=-20;a.g=Math.max(0,a.g-dt*1.4)}
  var bk=[[],[],[]];for(i=0;i<N.length;i++)for(j=i+1;j<N.length;j++){a=N[i];b=N[j];d=(a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y);if(d<D2){var l=[a,b];L.push(l);bk[Math.min(2,(d/D2*3)|0)].push(l)}}
  c.lineWidth=1;[.55,.34,.16].forEach(function(al,k){c.beginPath();bk[k].forEach(function(l){c.moveTo(l[0].x,l[0].y);c.lineTo(l[1].x,l[1].y)});c.strokeStyle='rgb(150,150,255)';c.globalAlpha=al;c.stroke()});
  if(t-last>.18&&L.length){last=t;var l0=L[R()*L.length|0];P.push({a:l0[0],b:l0[1],p:0,sp:rnd(.8,1.3),k:0})}
  for(i=P.length-1;i>=0;i--){var p=P[i];p.p+=dt*p.sp;if(p.p>=1){p.b.g=1;if(p.k<4&&R()<.7){var nx=L.filter(function(l){return l[0]===p.b||l[1]===p.b});if(nx.length){var m=nx[R()*nx.length|0];P.push({a:p.b,b:m[0]===p.b?m[1]:m[0],p:0,sp:rnd(.8,1.3),k:p.k+1})}}P.splice(i,1);continue}
   put(c,S.teal,p.a.x+(p.b.x-p.a.x)*p.p,p.a.y+(p.b.y-p.a.y)*p.p,15,.95)}
  for(i=0;i<N.length;i++){a=N[i];put(c,S.vio,a.x,a.y,a.r*(1+a.g)*4.5,.75+a.g*.25);c.globalAlpha=.9;c.fillStyle='#ece8ff';c.beginPath();c.arc(a.x,a.y,a.r*(1+a.g*.8),0,TAU);c.fill()}c.globalAlpha=1}}}

function ecg(){var W,H,grid;function g(x,m,s,a){return a*Math.exp(-((x-m)*(x-m))/(2*s*s))}
 function wave(p){return g(p,.14,.026,.13)+g(p,.255,.006,-.11)+g(p,.275,.0105,1)+g(p,.296,.008,-.24)+g(p,.52,.045,.24)}
 function pleth(p){return g(p,.2,.07,1)+g(p,.46,.07,.35)}
 return{name:'Cardiology',sub:'Telemetry · sinus rhythm',rgb:'52,211,153',
 init:function(w,h){W=w;H=h;grid=D.createElement('canvas');grid.width=w;grid.height=h;var c=grid.getContext('2d'),i;c.lineWidth=1;
  for(i=0;i<w;i+=26){c.strokeStyle='rgba(94,234,212,'+(i%130===0?.14:.05)+')';c.beginPath();c.moveTo(i+.5,0);c.lineTo(i+.5,h);c.stroke()}for(i=0;i<h;i+=26){c.strokeStyle='rgba(94,234,212,'+(i%130===0?.14:.05)+')';c.beginPath();c.moveTo(0,i+.5);c.lineTo(w,i+.5);c.stroke()}},
 draw:function(c,t){c.drawImage(grid,0,0);var sp=W/6,head=(t*sp)%(W+120),per=.83;
  [{y:H*.5,a:H*.17,f:function(tp){return wave((tp/per)%1)},col:'94,234,212',w:2.6},{y:H*.72,a:H*.08,f:function(tp){return pleth((tp/per)%1)*.9-.2},col:'96,165,250',w:2.2},{y:H*.88,a:H*.04,f:function(tp){return Math.sin(tp/4.2*TAU)},col:'196,181,253',w:2}].forEach(function(L){
   var x0=Math.max(0,head-W*.55),pts=[],xx;for(xx=x0;xx<=head;xx+=4)pts.push([xx,L.y-L.f(t-(head-xx)/sp)*L.a]);
   var seg=5,per2=Math.ceil(pts.length/seg),s,i;c.lineWidth=L.w;c.lineCap='round';c.lineJoin='round';for(s=0;s<seg;s++){c.strokeStyle='rgb('+L.col+')';c.globalAlpha=(s+1)/seg*.95;c.beginPath();for(i=s*per2;i<=Math.min(pts.length-1,(s+1)*per2);i++)i===s*per2?c.moveTo(pts[i][0],pts[i][1]):c.lineTo(pts[i][0],pts[i][1]);c.stroke()}
   var e=pts[pts.length-1];if(e)put(c,S.teal,e[0],e[1],18,1)});c.globalAlpha=1}}}

function mol(){var W,H,M;
 function build(){var at=[{p:[0,0,0],e:'C',n:0}],bd=[],n=rnd(7,12)|0,i,t2;for(i=1;i<n;i++){var par,k=0;do{par=at[R()*at.length|0];k++}while((par.e==='H'||par.n>=4)&&k<30);
  for(t2=0;t2<30;t2++){var a=rnd(0,TAU),b=Math.acos(rnd(-1,1)),p=[par.p[0]+Math.sin(b)*Math.cos(a),par.p[1]+Math.sin(b)*Math.sin(a),par.p[2]+Math.cos(b)];
   if(at.every(function(o){return(o.p[0]-p[0])*(o.p[0]-p[0])+(o.p[1]-p[1])*(o.p[1]-p[1])+(o.p[2]-p[2])*(o.p[2]-p[2])>.7})){var r=R(),e=r<.5?'C':r<.68?'O':r<.84?'N':r<.96?'H':'S';at.push({p:p,e:e,n:1});par.n++;bd.push([at.indexOf(par),at.length-1]);break}}}return{at:at,bd:bd}}
 return{name:'Pharmacology',sub:'Molecular structure',rgb:'96,165,250',
 init:function(w,h,q){W=w;H=h;M=[];for(var i=0,n=Math.round(9*q);i<n;i++){var m=build();m.x=R()*(w+200)-60;m.y=rnd(.1,.9)*h;m.s=rnd(.6,1.5);m.v=rnd(8,22);m.ra=rnd(.1,.35);m.rb=rnd(.1,.3);m.p=rnd(0,TAU);M.push(m)}M.sort(function(a,b){return a.s-b.s})},
 draw:function(c,t){M.forEach(function(m){var x0=((m.x+t*m.v)%(W+200))-100,y0=m.y+Math.sin(t*.3+m.p)*12,U=40*m.s,al=Math.min(1,.5+m.s*.3),ca=Math.cos(t*m.ra+m.p),sa=Math.sin(t*m.ra+m.p),cb=Math.cos(t*m.rb),sb=Math.sin(t*m.rb);
  var P=m.at.map(function(a){var x=a.p[0]*ca+a.p[2]*sa,z=-a.p[0]*sa+a.p[2]*ca,y=a.p[1]*cb-z*sb;z=a.p[1]*sb+z*cb;return{x:x0+x*U,y:y0+y*U,z:z,e:a.e}});
  c.strokeStyle='rgb(200,220,255)';c.globalAlpha=al*.5;c.lineWidth=2*m.s;c.lineCap='round';c.beginPath();m.bd.forEach(function(b){c.moveTo(P[b[0]].x,P[b[0]].y);c.lineTo(P[b[1]].x,P[b[1]].y)});c.stroke();
  P.sort(function(a,b){return a.z-b.z}).forEach(function(p){var r=(p.e==='H'?6:p.e==='S'?13:10)*m.s*(1+p.z*.12);put(c,AT[p.e],p.x,p.y,r,al)})});c.globalAlpha=1}}}

var SC=[blood,dna,neuro,ecg,mol],pool={};
function scene(i){return pool[i]||(pool[i]=SC[i]())}

/* ---- controller ---- */
var dots=[].slice.call(ui.querySelectorAll('button')),nEl=D.getElementById('kvx-n'),sEl=D.getElementById('kvx-s');
var W=0,H=0,SCALE=LOW?.6:.85,FPS=LOW?24:30,Q=LOW?.55:1,act=-1,idx=-1,timer=0,running=false,visible=true,lastT=0,t0=performance.now(),DUR=7000,live=[0,0],bad=0,n=0,acc=0;
function size(){W=Math.max(300,Math.round(hero.clientWidth*SCALE));H=Math.max(200,Math.round(hero.clientHeight*SCALE));
 cv.forEach(function(c,i){c.width=W;c.height=H;if(live[i]&&c._sc)c._sc.init(W,H,Q)})}
function go(i,quiet){i=(i+SC.length)%SC.length;if(i===idx)return;var k=(act+1)%2,nc=cv[k],old=act>=0?cv[act]:null,s=scene(i);
 s.init(W,H,Q);nc._sc=s;live[k]=1;nc.classList.add('on');
 if(old){old.classList.remove('on');var oi=act;setTimeout(function(){if(!cv[oi].classList.contains('on'))live[oi]=0},1900)}
 act=k;idx=i;nEl.textContent=s.name;sEl.textContent=s.sub;hero.style.setProperty('--fx',s.rgb);
 dots.forEach(function(d,j){d.classList.toggle('on',j===i)});var d=dots[i];d.classList.remove('on');void d.offsetWidth;d.classList.add('on');
 if(RM&&!running)tick(performance.now(),true)}
function sched(){clearTimeout(timer);if(RM)return;timer=setTimeout(function(){go(idx+1);sched()},DUR)}
function tick(now,once){if(!once&&!running)return;
 var el=now-lastT;if(!once&&el<1000/FPS-2){requestAnimationFrame(tick);return}
 var dt=Math.min(.06,el/1000);lastT=now;var t=(now-t0)/1000+(RM?3:0),w0=performance.now();
 for(var i=0;i<2;i++){if(!live[i]||!cv[i]._sc)continue;var c=ctx[i];c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.clearRect(0,0,W,H);cv[i]._sc.draw(c,t,dt)}
 /* auto-degrade: if drawing alone eats >14ms on average, shrink; if still heavy, stop animating */
 if(!once){var cost=performance.now()-w0;acc+=cost;if(++n===45){var avg=acc/n;n=0;acc=0;
  if(avg>14){bad++;if(bad===1){SCALE=.6;Q=.55;size()}else if(bad===2){SCALE=.45;Q=.4;FPS=20;size()}else{stop();hero.classList.add('kvx-still')}}}
  requestAnimationFrame(tick)}}
function start(){if(RM||running||!visible||D.hidden||bad>2)return;running=true;lastT=performance.now();requestAnimationFrame(tick);sched()}
function stop(){running=false;clearTimeout(timer)}
dots.forEach(function(d,j){d.addEventListener('click',function(){go(j);if(running)sched()})});
size();go(0);
if(RM)tick(performance.now(),true);else start();
var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){size();if(RM)tick(performance.now(),true)},250)});
if('IntersectionObserver' in window)new IntersectionObserver(function(e){visible=e[0].isIntersecting;visible?start():stop()},{threshold:0}).observe(hero);
D.addEventListener('visibilitychange',function(){D.hidden?stop():start()});
})();
