const SALT='rigel-salt:', SECRET='CHANGE-THIS-ORGANISER-SECRET';
const L={ex:{p:0,h:['67993cb16e67a5a72ecb','cdd891788a8297de769f'],w:'peugeot'},1:{p:100,h:['895e1b41018a44e3e7dd'],w:'alpine'},2:{p:200,h:['b047dd70de05fde2aa0d','1710720a7495e14a7bd8','40ce6513af91a10351b0'],w:'cadillac'},3:{p:300,h:['076ebc620f1aea926dbe'],w:'toyota'},4:{p:400,h:['648e69eaea0e3f326cc8'],w:'bmw'},5:{p:500,h:['8d27dd7f29c8c116ff4f'],w:'porsche',x:1},6:{p:600,h:['88a4371682fc77b265b7'],w:'valkyrie'},7:{p:700,h:['a9727bfb174adbf46c2f'],w:'ferrari'}};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const enc=new TextEncoder();
async function sha(t){return hex(await crypto.subtle.digest('SHA-256',enc.encode(t))).slice(0,20)}
async function flag(roll,id){const k=await crypto.subtle.importKey('raw',enc.encode(SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return 'RIGEL{'+L[id].w+'_'+hex(await crypto.subtle.sign('HMAC',k,enc.encode(roll+':'+id))).slice(0,8)+'}'}
let me=null, solved=[], db=null, uid=null, players=[];
const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const score=s=>s.reduce((a,i)=>a+L[i].p,0);
function view(){const v=(location.hash||'#home').slice(1);const n=['score','race'].includes(v)?v:'home';
 ['home','score','race'].forEach(x=>$('#v-'+x).hidden=x!==n);$$('nav a').forEach(a=>a.classList.toggle('on',a.dataset.v===n));
 if(n==='score')drawBoard();if(n==='race')drawRace();if(v==='login')$('#login').scrollIntoView()}
addEventListener('hashchange',view);
function drawRace(){$('#rmsg').textContent=me?('Racing as '+me.name+'.'):'Please log in first (Home page, below “Let’s go”).';
 $$('.car').forEach(c=>{const id=c.dataset.id,d=solved.includes(id);c.classList.toggle('done',d);
  const st=c.querySelector('.st');st.textContent=d?'Finished':(id==='ex'?'No points':L[id].p+' pts');
  if(d&&me)flag(me.roll,id).then(f=>{const r=c.querySelector('.res');r.textContent='Finished! Your unique flag: ';const s=document.createElement('span');s.className='fl';s.textContent=f;r.append(s)})})}
$$('.car>button').forEach(b=>b.onclick=()=>b.parentElement.classList.toggle('open'));
$$('.sub').forEach(b=>b.onclick=async()=>{const c=b.closest('.car'),id=c.dataset.id,r=c.querySelector('.res');
 if(!me){r.textContent='Log in first on the Home page.';return}
 let a=c.querySelector('input').value.trim();if(!L[id].x)a=a.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(!L[id].h.includes(await sha(a))){r.textContent='Not the key. Check the clue and try again.';return}
 if(!solved.includes(id))solved.push(id);save();drawRace()});
async function save(){const rec={name:me.name,roll:me.roll,solved:solved,score:score(solved)};ls.set('rigel_me',rec);
 const bd=ls.get('rigel_board')||{};bd[me.roll]=rec;ls.set('rigel_board',bd);
 if(db&&uid)try{await db.collection('players').doc(uid).set(rec)}catch(e){}}
$('#start').onclick=async()=>{const n=$('#nm').value.trim(),r=$('#rl').value.trim().toLowerCase();
 if(!n||!r){$('#lmsg').textContent='Please enter your name and roll number.';return}
 const old=(ls.get('rigel_board')||{})[r];me={name:n,roll:r};solved=old?old.solved:[];await save();
 $('#lmsg').textContent='Ready, '+n+'. Opening the race…';location.hash='#race'};
function drawBoard(){const shared=!!db;let list=shared?players:Object.values(ls.get('rigel_board')||{});
 list=list.slice().sort((a,b)=>b.score-a.score);
 $('#smode').textContent=shared?'Live scoreboard: everyone logged in sees the same scores.':'Scores shown here are saved on this device only.';
 const ch=$('#chart'),lb=$('#clab'),rk=$('#rank');ch.replaceChildren();lb.replaceChildren();rk.replaceChildren();
 if(!list.length){rk.textContent='No scores yet. Be the first!';return}
 list.slice(0,10).forEach((p,i)=>{const mine=me&&p.roll===me.roll;const b=document.createElement('div');b.className='bar'+(mine?' me':'');
  b.style.height=Math.max(8,p.score/700*100)+'%';b.textContent=p.score;ch.append(b);const s=document.createElement('span');s.textContent=mine?'You':p.name;lb.append(s)});
 list.forEach((p,i)=>{const d=document.createElement('div');d.className='rk';const a=document.createElement('span'),z=document.createElement('span');
  a.textContent=(i+1)+'. '+p.name+(me&&p.roll===me.roll?' (you)':'');z.className='m';z.textContent=(p.solved||[]).filter(x=>x!=='ex').length+' / 7 cars · '+p.score+' pts';d.append(a,z);rk.append(d)})}
const saved=ls.get('rigel_me');if(saved){me={name:saved.name,roll:saved.roll};solved=saved.solved||[];$('#nm').value=me.name;$('#rl').value=me.roll}
view();
(async()=>{try{db=await claude.use('db');const u=await claude.use('user');uid=u?await u.id():null;if(!uid)db=null;
 if(db){db.collection('players').onSnapshot(s=>{players=s.docs.map(d=>typeof d.data==='function'?d.data():d);if(!$('#v-score').hidden)drawBoard()});if(me)save()}
 }catch(e){db=null}})();

// cars cycling behind the home text
(function(){const im=$$('.stage img');if(im.length<2||matchMedia('(prefers-reduced-motion:reduce)').matches)return;let i=0;
 setInterval(()=>{im[i].classList.remove('on');i=(i+1)%im.length;im[i].classList.add('on')},3500)})();
