'use strict';
const $=s=>document.querySelector(s),esc=s=>(s||'').replace(/[<>&"']/g,''),W=['東','南','西','北'];
let pref={dbl:1,naki:1,spd:700};try{Object.assign(pref,JSON.parse(localStorage.getItem('mjp')||'{}'))}catch(e){}
const savePref=()=>{try{localStorage.setItem('mjp',JSON.stringify(pref))}catch(e){}};
const NM=[...'一二三四五六七八九'],KN=[...NM.map(x=>x+'萬'),...NM.map(x=>x+'筒'),...NM.map(x=>x+'索'),'東','南','西','北','白','發','中'];
const KO=[0,8,9,17,18,26,27,28,29,30,31,32,33];
let G=null,isHost=false,me=0,peer,hc,room='',names=['あなた','CPU1','CPU2','CPU3'],bots=[0,1,1,1],seatConn={},ar=0,sel=-1,V=null,RULE={len:2,pts:25000},hostTm,chiS=0,kanS=0,lastAuto=-1;
const sorted=h=>h.slice().sort((a,b)=>a-b),cnt=h=>{const c=Array(34).fill(0);h.forEach(t=>c[t>>2]++);return c};

/* ---------- 牌の絵(SVG) ---------- */
const FC={},FF="'Shippori Mincho B1','Yu Mincho','Noto Serif JP','Hiragino Mincho ProN',serif";
const PP=[0,[[30,40]],[[30,22],[30,58]],[[14,14],[30,40],[46,66]],[[18,22],[42,22],[18,58],[42,58]],[[16,16],[44,16],[30,40],[16,64],[44,64]],[[18,16],[42,16],[18,40],[42,40],[18,64],[42,64]],[[12,12],[30,22],[48,32],[18,54],[42,54],[18,70],[42,70]],[[18,12],[42,12],[18,32],[42,32],[18,52],[42,52],[18,70],[42,70]],[[14,14],[30,14],[46,14],[14,40],[30,40],[46,40],[14,66],[30,66],[46,66]]];
const SP=[0,0,[[30,22],[30,58]],[[30,20],[18,58],[42,58]],[[18,22],[42,22],[18,58],[42,58]],[[16,18],[44,18],[30,40],[16,62],[44,62]],[[14,22],[30,22],[46,22],[14,58],[30,58],[46,58]],[[30,14],[14,40],[30,40],[46,40],[14,66],[30,66],[46,66]],[[12,22],[24,22],[36,22],[48,22],[12,58],[24,58],[36,58],[48,58]],PP[9]];
function face(k){if(FC[k])return FC[k];const R='#c8202a',B='#1a4fa0',Gn='#177a2a',K='#1b1b1b';
 const tx=(t,x,y,z,c)=>`<text x="${x}" y="${y}" font-size="${z}" fill="${c}" font-weight="800" text-anchor="middle" font-family="${FF}">${t}</text>`;
 let s='';
 if(k<9)s=tx(NM[k],30,36,36,K)+tx('萬',30,74,38,R);
 else if(k<18){const n=k-8,r=n==1?19:n<=3?11:n<=5?10:n<=7?8.5:7.5;
  PP[n].forEach(([x,y],i)=>{const c=n==1?R:n==9?[Gn,Gn,Gn,R,R,R,B,B,B][i]:n==7?(i<3?Gn:R):(n==5&&i==2)?R:i%2?Gn:B;
   s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${c}" stroke-width="2.6"/><circle cx="${x}" cy="${y}" r="${r*.58}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r*.2}" fill="#fff"/>`})}
 else if(k<27){const n=k-17;
  if(n==1)s=`<ellipse cx="30" cy="46" rx="13" ry="19" fill="${Gn}"/><circle cx="30" cy="22" r="9" fill="${Gn}"/><circle cx="34" cy="20" r="2.4" fill="#fff"/><path d="M30 62L20 76M30 62L40 76M22 38Q30 50 38 38" stroke="${R}" stroke-width="3" fill="none"/>`;
  else{const h=n>=7?20:24;SP[n].forEach(([x,y],i)=>{const c=(n==3&&i==0)||(n==5&&i==2)||(n==7&&i==0)||(n==9&&i>=3&&i<6)?R:Gn;
   s+=`<rect x="${x-4.5}" y="${y-h/2}" width="9" height="${h}" rx="4" fill="${c}"/><rect x="${x-4.5}" y="${y-1.5}" width="9" height="3" fill="#fff" opacity=".85"/><rect x="${x-1}" y="${y-h/2+3}" width="2" height="${h-6}" fill="#fff" opacity=".35"/>`})}}
 else if(k<31)s=tx(W[k-27],30,58,54,K);
 else if(k==31)s=`<rect x="9" y="10" width="42" height="60" rx="5" fill="none" stroke="${B}" stroke-width="4"/><rect x="15" y="16" width="30" height="48" rx="3" fill="none" stroke="${B}" stroke-width="1.5"/>`;
 else s=tx(k==32?'發':'中',30,60,56,k==32?Gn:R);
 return FC[k]=`<svg viewBox="0 0 60 80">${s}</svg>`}
const T=(id,c,e)=>`<span class="tl ${c}" ${e||''}>${face(id>>2)}</span>`;

/* ---------- 麻雀ロジック ---------- */
const cl=s=>G.melds[s].every(m=>m.cl);
function mk(c){const i=c.findIndex(x=>x>0);if(i<0)return true;
 if(c[i]>=3){c[i]-=3;const r=mk(c);c[i]+=3;if(r)return true}
 if(i<27&&i%9<7&&c[i+1]&&c[i+2]){c[i]--;c[i+1]--;c[i+2]--;const r=mk(c);c[i]++;c[i+1]++;c[i+2]++;if(r)return true}
 return false}
function win(c,nm){
 if(!nm){if(c.every(x=>x==0||x==2)&&c.filter(x=>x==2).length==7)return true;
  if(KO.every(k=>c[k])&&KO.reduce((a,k)=>a+c[k],0)==14)return true}
 for(let i=0;i<34;i++)if(c[i]>=2){c[i]-=2;const r=mk(c);c[i]+=2;if(r)return true}
 return false}
function tenpai(c,nm){for(let k=0;k<34;k++)if(c[k]<4){c[k]++;const r=win(c,nm);c[k]--;if(r)return true}return false}
function yk(s,c,ts){const m=G.melds[s],ct=cl(s),all=c.slice(),y=[];m.forEach(x=>x.t.forEach(t=>all[t>>2]++));
 if(!m.length&&KO.every(k=>c[k])&&KO.reduce((a,k)=>a+c[k],0)==14)return[['国士無双',13]];
 if(all.every((x,k)=>!x||k>=27))return[['字一色',13]];
 if([31,32,33].every(k=>all[k]>=3))return[['大三元',13]];
 if(G.rii[s])y.push(['リーチ',1]);if(ct&&ts)y.push(['門前清自摸和',1]);
 if(all.every((x,k)=>!x||(k<27&&k%9>0&&k%9<8)))y.push(['断么九',1]);
 [31,32,33,27+(s-G.dealer+4)%4,27+(G.kyoku>3?1:0)].forEach((k,i)=>{if(all[k]>=3)y.push([k>30?'役牌:'+KN[k]:(i==3?'自風:':'場風:')+W[k-27],1])});
 const ss=new Set(),ho=all.some((x,k)=>x&&k>=27);all.forEach((x,k)=>{if(x&&k<27)ss.add(k/9|0)});
 if(ss.size==1)y.push(ho?['混一色',ct?3:2]:['清一色',ct?6:5]);
 const d=[31,32,33].map(k=>all[k]).sort();if(d[0]==2&&d[1]>=3&&d[2]>=3)y.push(['小三元',2]);
 if(m.every(x=>x.t[0]>>2==x.t[1]>>2)&&c.every(x=>x==0||x==2||x>=3)&&c.filter(x=>x==2).length==1)y.push(['対々和',2]);
 if(!m.length&&c.filter(x=>x==2).length==7)y.push(['七対子',2]);
 return y}
const han=(s,c,ts)=>yk(s,c,ts).reduce((a,x)=>a+x[1],0);
const dk=t=>{const k=t>>2;return k<27?(k%9==8?k-8:k+1):k<31?(k==30?27:k+1):(k==33?31:k+1)};
function doraN(s,c){let n=0;const all=c.slice();G.melds[s].forEach(x=>x.t.forEach(t=>all[t>>2]++));for(let i=0;i<=G.kn;i++)n+=all[dk(G.dead[4+2*i])];return n}
function dOpts(s){const h=G.hands[s],c=cnt(h),o={},nm=G.melds[s].length;
 if(win(c,nm)&&han(s,c,1)>0)o.tsumo=1;
 if(!G.rii[s]&&cl(s)&&G.sc[s]>=1000&&G.wall.length>=4)o.rii=h.filter(t=>{const d=cnt(h);d[t>>2]--;return tenpai(d,nm)});
 if(!G.rii[s]&&G.kn<4&&G.wall.length>0){const k=[];for(let i=0;i<34;i++)if(c[i]==4)k.push({k:i,a:1});
  G.melds[s].forEach((m,j)=>{if(!m.cl&&m.t.length==3&&m.t[0]>>2==m.t[1]>>2&&c[m.t[0]>>2]>=1)k.push({k:m.t[0]>>2,j})});if(k.length)o.kan=k}
 return o}
function cOpts(s,t,f){const c=cnt(G.hands[s]),k=t>>2,o={},nm=G.melds[s].length;
 c[k]++;if(win(c,nm)&&han(s,c,0)>0)o.ron=1;c[k]--;
 if(!G.rii[s]){if(c[k]>=2)o.pon=1;if(c[k]>=3&&G.kn<4&&G.wall.length>0)o.kan=1;
  if((f+1)%4==s&&k<27){const l=[];[[-2,-1],[-1,1],[1,2]].forEach(([a,b])=>{const x=k%9+a,y=k%9+b;if(x>=0&&y<=8&&c[k+a]&&c[k+b])l.push([k+a,k+b])});if(l.length)o.chi=l}}
 return Object.keys(o).length?o:null}

/* ---------- 進行(ホストのみ) ---------- */
function newK(){const w=[...Array(136).keys()];
 for(let i=135;i>0;i--){const j=Math.random()*(i+1)|0;[w[i],w[j]]=[w[j],w[i]]}
 G.hands=[0,1,2,3].map(()=>w.splice(0,13));G.dead=w.splice(0,14);G.wall=w;G.kn=0;G.melds=[[],[],[],[]];G.river=[[],[],[],[]];
 G.rii=[0,0,0,0];G.ri=[-1,-1,-1,-1];G.res=null;G.rep=false;G.turn=G.dealer;G.calls=null;G.drawn=-1;G.last=-1;G.from=0;draw()}
function draw(){if(!G.wall.length){G.res={draw:1,ch:[0,0,0,0]};G.ph='e';G.rep=true;G.hb++;return send()}
 const t=G.wall.pop();G.hands[G.turn].push(t);G.drawn=t;G.ph='d';G.calls=null;send();bot()}
function rin(s){G.kn++;const t=G.dead[G.kn-1];G.hands[s].push(t);G.drawn=t;G.ph='d';G.calls=null;G.turn=s;send();bot()}
function disc(s,t,r){const h=G.hands[s];h.splice(h.indexOf(t),1);G.river[s].push(t);G.last=t;G.from=s;G.drawn=-1;G.sq++;
 if(r){G.rii[s]=1;G.ri[s]=G.river[s].length-1;G.sc[s]-=1000;G.pot++}
 const c={};let n=0;for(let i=1;i<4;i++){const p=(s+i)%4,o=cOpts(p,t,s);if(o){c[p]=o;n++}}
 if(n){G.ph='c';G.calls=c;G.resp={};send();bot()}else{G.turn=(s+1)%4;draw()}}
function kan(s,x){const h=G.hands[s];
 if(x.a){const u=[];for(let i=h.length-1;i>=0;i--)if(h[i]>>2==x.k)u.push(h.splice(i,1)[0]);G.melds[s].push({t:u,f:s,cl:1})}
 else G.melds[s][x.j].t.push(h.splice(h.findIndex(y=>y>>2==x.k),1)[0]);
 rin(s)}
function meld(s,k){const h=G.hands[s],t=G.last,kk=t>>2,u=[],need=k=='pon'?[kk,kk]:k=='kan'?[kk,kk,kk]:G.calls[s].chi[+k.slice(3)];
 need.forEach(x=>u.push(h.splice(h.findIndex(y=>y>>2==x),1)[0]));
 G.river[G.from].pop();G.melds[s].push({t:[t,...u],f:G.from,cl:0});G.turn=s;G.calls=null;
 if(k=='kan')return rin(s);G.ph='d';G.drawn=-1;send();bot()}
function win_(s,f){const ts=s==f,c=cnt(G.hands[s]);if(!ts)c[G.last>>2]++;
 const y=yk(s,c,ts),dr=doraN(s,c);let h=y.reduce((a,x)=>a+x[1],0);if(dr)y.push(['ドラ',dr]);h+=dr;
 const b=h>=13?8000:h>=11?6000:h>=8?4000:h>=6?3000:h>=5?2000:Math.min(2000,30*2**(h+2)),d=s==G.dealer,u=x=>Math.ceil(x/100)*100,ch=[0,0,0,0];
 if(ts){for(let i=0;i<4;i++)if(i!=s){const v=u(b*(d||i==G.dealer?2:1))+G.hb*100;ch[i]-=v;ch[s]+=v}}
 else{const v=u(b*(d?6:4))+G.hb*300;ch[f]-=v;ch[s]+=v}
 ch[s]+=G.pot*1000;G.pot=0;ch.forEach((v,i)=>G.sc[i]+=v);
 const hh=G.hands.map(sorted);if(ts)hh[s].splice(hh[s].indexOf(G.drawn),1);
 G.res={w:s,f,h,ch,ts,y,hands:hh,tile:ts?G.drawn:G.last};G.ph='e';G.rep=d;G.hb=d?G.hb+1:0;send()}
function resolve(){if(G.ph!='c')return;const p=Object.keys(G.calls);if(!p.every(x=>x in G.resp))return;
 let q=p.find(x=>G.resp[x]=='ron');if(q!=null)return win_(+q,G.from);
 q=p.find(x=>G.resp[x]=='pon'||G.resp[x]=='kan');if(q!=null)return meld(+q,G.resp[q]);
 q=p.find(x=>G.resp[x].startsWith('chi'));if(q!=null)return meld(+q,G.resp[q]);
 G.turn=(G.from+1)%4;draw()}
function bot(){setTimeout(()=>{if(!G||G.ph=='e'||G.ph=='o')return;
 if(G.ph=='d'){const s=G.turn,o=dOpts(s);
  if(bots[s]&&o.tsumo)return win_(s,s);
  if(bots[s]||(G.rii[s]&&!o.tsumo)){
   if(G.rii[s])return disc(s,G.drawn,0);
   const h=G.hands[s],c=cnt(h);let best=h[0],bs=1e9;
   h.forEach(t=>{const k=t>>2,x=k%9,n=(d,v)=>(k<27&&x+d>=0&&x+d<=8&&c[k+d])?v:0;
    const sc=c[k]*10+n(-1,4)+n(1,4)+n(-2,2)+n(2,2)+(k<27&&x>0&&x<8?1:0);if(sc<bs){bs=sc;best=t}});
   return disc(s,best,o.rii&&o.rii.includes(best)?1:0)}}
 else if(G.ph=='c'){for(const p in G.calls)if(bots[p]&&!(p in G.resp))G.resp[p]=G.calls[p].ron?'ron':'pass';resolve()}},pref.spd)}
function act(s,a){if(!G)return;
 if(a.k=='next'){if(G.ph=='e'&&s==0){if(!G.rep)G.kyoku++;G.dealer=G.kyoku%4;if(G.kyoku>=G.rl.len*4||G.sc.some(x=>x<0)){G.ph='o';send()}else newK()}return}
 if(G.ph=='d'&&G.turn==s){
  if(a.k=='d'&&G.hands[s].includes(a.t)){if(G.rii[s]&&a.t!=G.drawn)return;
   if(a.r&&!(dOpts(s).rii||[]).includes(a.t))return;return disc(s,a.t,a.r?1:0)}
  if(a.k=='tsumo'&&dOpts(s).tsumo)return win_(s,s);
  if(a.k=='kan'){const o=dOpts(s);if(o.kan&&o.kan[a.i])return kan(s,o.kan[a.i])}}
 if(G.ph=='c'&&G.calls[s]&&!(s in G.resp)){const o=G.calls[s];
  if((a.k=='ron'&&o.ron)||(a.k=='pon'&&o.pon)||(a.k=='kan'&&o.kan)||(a.k=='chi'&&o.chi&&o.chi[a.i])||a.k=='pass'){G.resp[s]=a.k=='chi'?'chi'+a.i:a.k;resolve()}}}
function view(s){const g=G;return{me:s,n:names,sc:g.sc,dealer:g.dealer,kyoku:g.kyoku,turn:g.turn,ph:g.ph,river:g.river,melds:g.melds,rii:g.rii,ri:g.ri,
 hn:g.hands.map(h=>h.length),hand:sorted(g.hands[s].filter(t=>t!=g.drawn||g.turn!=s||g.ph!='d')),drawn:g.turn==s&&g.ph=='d'?g.drawn:-1,
 wall:g.wall.length,res:g.res,pot:g.pot,hb:g.hb,lt:g.last,lf:g.from,sq:g.sq,dr:Array.from({length:g.kn+1},(_,i)=>g.dead[4+2*i]),rule:g.rl,room,
 o:g.ph=='d'&&g.turn==s?dOpts(s):(g.ph=='c'&&g.calls[s]&&!(s in g.resp)?g.calls[s]:undefined)}}
function send(){for(let s=0;s<4;s++){if(bots[s])continue;const v=view(s);if(s==0)render(v);else seatConn[s]&&seatConn[s].send({t:'v',v})}}
function A(a){if(isHost)act(0,a);else hc.send({t:'a',a})}
function start(){G={sc:Array(4).fill(RULE.pts),dealer:0,kyoku:0,pot:0,hb:0,sq:0,rl:{...RULE}};$('#lb').style.display='none';newK()}

/* ---------- 通信(PeerJS: 部屋コード方式) ---------- */
const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]};
const ERR={'peer-unavailable':'その部屋コードの部屋が見つかりません。コードと、ホストが待機中かを確認してください','network':'PeerJSサーバーに接続できません。少し待って再試行してください','server-error':'PeerJSサーバーが応答しません','socket-error':'サーバーとの通信に失敗しました','webrtc':'WebRTC通信のエラーです','browser-incompatible':'このブラウザは対応していません'};
function note(t,bad){const e=$('#nt');if(e){e.textContent=t;e.style.color=bad?'#ff9a8a':'#b9e6b0'}else alert(t)}
function setName(){names[0]=esc($('#nm')&&$('#nm').value)||names[0]||'あなた'}
function resetAll(){try{peer&&peer.destroy()}catch(e){}clearTimeout(hostTm);G=null;V=null;isHost=false;peer=null;hc=null;seatConn={};bots=[0,1,1,1];names=['あなた','CPU1','CPU2','CPU3'];room='';me=0;ar=0;sel=-1;
 $('#rm').textContent='';$('#ov').style.display='none';$('#pr').innerHTML='';$('#hd').innerHTML='';$('#plane').innerHTML='';$('#hud').innerHTML='';$('#top').innerHTML='';closeM();$('#lb').style.display='flex';lobby()}
function leave(){if(confirm('対局・部屋から退出してロビーに戻りますか?'))resetAll()}
function host(){setName();if(typeof Peer==='undefined')return note('通信ライブラリ(PeerJS)を読み込めませんでした。ネット接続を確認して再読み込みしてください',1);
 isHost=true;me=0;note('部屋を作成中…');clearTimeout(hostTm);
 hostTm=setTimeout(()=>{if(!$('#rm').textContent){isHost=false;if(peer)peer.destroy();lobby();note('部屋を作れません。PeerJSの公開サーバーに接続できていません。少し待って再試行するか、「ひとりで遊ぶ」をお使いください',1)}},12000);
 tryRoom()}
function solo(){setName();isHost=true;me=0;room='';bots=[0,1,1,1];start()}
function tryRoom(){room=''+(1000+Math.random()*9000|0);if(peer)peer.destroy();peer=new Peer('mjrm-'+room,{config:ICE});
 peer.on('error',e=>{if(e.type=='unavailable-id')return tryRoom();isHost=false;lobby();note('エラー: '+(ERR[e.type]||e.type),1)});
 peer.on('disconnected',()=>{try{peer.reconnect()}catch(e){}});
 peer.on('open',()=>{clearTimeout(hostTm);$('#rm').textContent=room;lobby()});
 peer.on('connection',c=>{const s=[1,2,3].find(i=>!seatConn[i]);
  if(!s||G){c.on('open',()=>{c.send({t:'full'});setTimeout(()=>c.close(),300)});return}
  c.on('open',()=>{seatConn[s]=c;bots[s]=0;names[s]=esc(c.metadata&&c.metadata.name)||'プレイヤー'+s;c.send({t:'seat',s});lobby()});
  c.on('data',m=>{if(m.t=='a')act(s,m.a)});
  c.on('close',()=>{if(seatConn[s]!==c)return;delete seatConn[s];bots[s]=1;names[s]='CPU'+s;lobby();if(G){send();if(G.ph=='d'||G.ph=='c')bot()}})})}
function join(){setName();const code=($('#code').value||'').trim();
 if(!/^\d{4}$/.test(code))return note('4桁の部屋コードを入力してください',1);
 note('接続中…');let ok=0,inRoom=0;if(peer)peer.destroy();peer=new Peer({config:ICE});
 const tm=setTimeout(()=>{if(!ok){note('接続できませんでした。コードとホストの待機状態を確認してください。回線が違う相手とは繋がらない場合があります',1);peer.destroy()}},15000);
 peer.on('error',e=>{clearTimeout(tm);note('入室できません: '+(ERR[e.type]||e.type),1)});
 peer.on('open',()=>{note('部屋を探しています…');hc=peer.connect('mjrm-'+code,{metadata:{name:names[0]},reliable:true});
  hc.on('open',()=>{ok=1;clearTimeout(tm);note('入室処理中…')});
  hc.on('error',e=>note('通信エラー: '+e,1));
  hc.on('data',m=>{ok=1;clearTimeout(tm);
   if(m.t=='seat'){inRoom=1;me=m.s;room=code;$('#rm').textContent=code;$('#lb').innerHTML=shell('<h3>入室しました</h3><p style="font-size:14px">ホストの開始を待っています…</p><div class="bar"><button class="pb" onclick="resetAll()">← 退室</button></div>')}
   if(m.t=='full')note('満席、または対局が始まっています',1);
   if(m.t=='v'){$('#lb').style.display='none';render(m.v)}});
  hc.on('close',()=>{if(inRoom){resetAll();note('ホストとの接続が切れました',1)}})})}

/* ---------- ロビー・モーダル ---------- */
function dec(){return [[33,'5%','10%',-12],[4,'86%','16%',10],[31,'9%','66%',8],[27,'84%','64%',-8],[13,'44%','80%',5],[22,'50%','2%',-6],[12,'72%','40%',14],[0,'18%','36%',-16]].map(([k,l,t,r])=>`<span class="dc" style="left:${l};top:${t};transform:rotate(${r}deg)">${T(k*4,'')}</span>`).join('')}
function shell(x){return dec()+`<div class="box"><h1>麻雀</h1><div class="sub">オンライン対戦</div>${x}<div id="nt" class="nt"></div></div>`}
function lobby(){const L=$('#lb');if(G)return;
 const sub=`<div class="bar"><button class="pb bl" onclick="yakuM()">役表</button><button class="pb bl" onclick="rulesM()">ルール設定</button></div>`;
 if(!isHost){L.innerHTML=shell(`<input id="nm" placeholder="あなたの名前" maxlength="8"><div class="two"><div><h3>部屋を作る</h3><p style="margin:0 0 12px">友達を招待します</p><button class="pb" onclick="host()">部屋を作る</button><p style="margin-top:14px"><button class="pb bl" onclick="solo()">ひとりで遊ぶ(CPU対戦)</button></p></div><i></i><div><h3>部屋に入る</h3><input id="code" placeholder="部屋コード4桁" maxlength="4"><button class="pb" onclick="join()">入室</button></div></div>${sub}<p>空席はCPUが入ります</p>`);return}
 L.innerHTML=shell(`<h3>部屋コード</h3><div class="code">${room}</div><div class="seats">${names.map((n,i)=>`<div class="seat${i==0?' me':''}"><b>${W[i]}</b>${n}<br><span>${bots[i]?'CPU':'プレイヤー'}</span></div>`).join('')}</div><div class="bar"><button class="pb" onclick="resetAll()">← 戻る</button><button class="pb" onclick="start()">対局開始</button></div>${sub}<p>このコードを友達に伝えてください</p>`)}
const md=h=>{const m=$('#md');m.innerHTML=`<div class="mc">${h}</div>`;m.style.display='flex'};
function closeM(){$('#md').style.display='none'}
const YK=[['リーチ','1','門前でテンパイ宣言(1000点を供託)',1],['門前清自摸和','1','門前でツモ和了',1],['断么九','1','2〜8の数牌だけ',1],['役牌','1','白・發・中、自風、場風の刻子/槓子',1],['七対子','2','7組の対子',1],['対々和','2','全て刻子(槓子)',1],['混一色','3(鳴き2)','1種の数牌+字牌',1],['清一色','6(鳴き5)','1種の数牌だけ',1],['小三元','2','三元牌の2つが刻子、1つが雀頭',1],['大三元','役満','白發中すべて刻子',1],['字一色','役満','字牌だけ',1],['国士無双','役満','13種の么九牌+1枚',1],['ドラ','1枚ごと','表示牌の次の牌(槓で追加)',1],['平和','1','',0],['一盃口','1','',0],['一発','1','',0],['三色同順','2',' ',0],['一気通貫','2','',0],['混全帯么九','2','',0],['三暗刻','2','',0],['純全帯么九','3','',0],['四暗刻','役満','',0],['嶺上開花・海底・槍槓','1','',0]];
function yakuM(){md(`<h2>役表</h2><table><tr><th>役</th><th>翻</th><th>内容</th><th></th></tr>${YK.map(y=>`<tr><td>${y[0]}</td><td>${y[1]}</td><td>${y[2]}</td><td class="${y[3]?'ok':'no'}">${y[3]?'✓ 対応':'未対応'}</td></tr>`).join('')}</table><p style="font-size:12px;color:#b9c4ac">点数は30符固定の簡易計算です。フリテンの判定はありません。</p><button class="bk2" onclick="closeM()">← 戻る</button>`)}
const seg=(lab,arr,cur,f)=>`<div class="row"><span>${lab}</span>${arr.map(([t,v])=>`<button class="sgb${v==cur?' on':''}" onclick="${f},${v})">${t}</button>`).join('')}</div>`;
function sr(k,v){RULE[k]=v;rulesM()}
function sp(k,v){pref[k]=v;savePref();rulesM();if(V)render(V)}
function rulesM(){const R=(G&&G.rl)||(V&&V.rule)||RULE,ed=isHost&&!G;
 md(`<h2>ルール設定</h2><h4>部屋のルール${ed?'':'(開始後は変更できません)'}</h4>`+
 (ed?seg('局数',[['東風戦(4局)',1],['東南戦(8局)',2]],RULE.len,"sr('len'")+seg('持ち点',[['25000点',25000],['30000点',30000]],RULE.pts,"sr('pts'"):`<div class="row">局数: ${R.len==1?'東風戦(4局)':'東南戦(8局)'} ／ 持ち点: ${R.pts}</div>`)+
 `<h4>あなたの設定</h4>`+seg('鳴き(ポン・チー・カン)',[['ON',1],['OFF',0]],pref.naki,"sp('naki'")+seg('打牌の操作',[['ダブルクリック',1],['ワンクリック',0]],pref.dbl,"sp('dbl'")+seg('CPUの速さ(ホスト)',[['速い',350],['普通',700],['ゆっくり',1100]],pref.spd,"sp('spd'")+`<button class="bk2" onclick="closeM()">← 戻る</button>`)}
function menuM(){md(`<h2>メニュー</h2><button class="mbn" onclick="yakuM()">役表</button><button class="mbn" onclick="rulesM()">ルール設定</button><button class="mbn" onclick="leave()">ロビーに戻る(退室)</button><button class="bk2" onclick="closeM()">← 閉じる</button>`)}

/* ---------- 描画 ---------- */
function pick(t){const v=V,o=v.o||{};if(!(v.ph=='d'&&v.turn==v.me))return;
 if(ar&&!(o.rii||[]).includes(t))return;if(v.rii[v.me]&&t!=v.drawn)return;
 if(!pref.dbl||sel==t){sel=-1;const r=ar;ar=0;A({k:'d',t,r:r?1:0})}else{sel=t;render(v)}}
function prompt_(v){const o=v.o;if(!o)return'';const B=(t,c,f)=>`<button class="ab ${c}" onclick="${f}">${t}</button>`;let h='',tl='',sub='';
 if(v.ph=='c'){const l=[];if(o.ron)l.push('ロン');if(pref.naki){if(o.pon)l.push('ポン');if(o.chi)l.push('チー');if(o.kan)l.push('カン')}
  tl=`${T(v.lt,'sm')}<span>${esc(v.n[v.lf])}の「${KN[v.lt>>2]}」 — ${l.join('・')}できます</span>`;
  if(o.ron)h+=B('ロン','ron',"A({k:'ron'})");
  if(pref.naki){if(o.pon)h+=B('ポン','pon',"A({k:'pon'})");if(o.kan)h+=B('カン','kan',"A({k:'kan'})");
   if(o.chi)h+=B('チー','chi',o.chi.length>1?'chiS=!chiS;render(V)':"A({k:'chi',i:0})")}
  if(!h)return'';h+=B('パス','pass',"chiS=0;A({k:'pass'})");
  if(chiS&&o.chi)sub=o.chi.map((q,i)=>`<span class="pk" onclick="chiS=0;A({k:'chi',i:${i}})">${[q[0],q[1],v.lt>>2].sort((a,b)=>a-b).map(k=>T(k*4,'sm')).join('')}</span>`).join('')}
 else{if(o.tsumo)h+=B('ツモ','ron',"A({k:'tsumo'})");
  if(o.rii&&o.rii.length)h+=B(ar?'リーチ取消':'リーチ','rii','ar=!ar;sel=-1;render(V)');
  if(o.kan)h+=B('カン','kan',o.kan.length>1?'kanS=!kanS;render(V)':"A({k:'kan',i:0})");
  if(!h)return'';tl=o.tsumo?'和了できます!':ar?'リーチする牌を選んでください':'行動を選べます';
  if(kanS&&o.kan)sub=o.kan.map((x,i)=>`<span class="pk" onclick="kanS=0;A({k:'kan',i:${i}})">${T(x.k*4,'sm')}<br>${x.a?'暗槓':'加槓'}</span>`).join('')}
 return `<div class="pt">${tl}</div><div>${h}</div>${sub?`<div>${sub}</div>`:''}`}
function resHTML(v){const r=v.res,nx=v.me==0?`<button class="go" onclick="A({k:'next'})">次の局へ</button>`:'<div style="font-size:15px">ホストが進めるのを待っています</div>';
 if(v.ph=='o'){const rk=[0,1,2,3].sort((a,b)=>v.sc[b]-v.sc[a]);return `<h2>対局終了</h2>${rk.map((i,n)=>`<div style="font-size:24px">${n+1}位 ${esc(v.n[i])} <b style="color:#ffe9a8">${v.sc[i]}</b></div>`).join('')}<button class="go" onclick="resetAll()">ロビーに戻る</button>`}
 const sc=`<div style="font-size:15px">${[0,1,2,3].map(i=>`${esc(v.n[i])} ${v.sc[i]}(${r.ch[i]>0?'+':''}${r.ch[i]})`).join(' ／ ')}</div>`;
 if(r.draw)return `<h2>流局</h2>${sc}${nx}`;
 const w=r.w,lab=r.h>=13?'役満':r.h>=11?'三倍満':r.h>=8?'倍満':r.h>=6?'跳満':r.h>=5?'満貫':'';
 return `<h2>${esc(v.n[w])} ${r.ts?'ツモ':'ロン'}</h2><div class="wh">${r.hands[w].map(t=>T(t,'sm')).join('')}${v.melds[w].map(m=>'<span class="gp"></span>'+m.t.map(t=>T(t,'sm')).join('')).join('')}<span class="gp"></span>${T(r.tile,'sm')}</div><table class="yt">${r.y.map(x=>`<tr><td>${x[0]}</td><td>${x[1]>=13?'役満':x[1]+'翻'}</td></tr>`).join('')}</table><div class="big">${r.h>=13?'役満':r.h+'翻'} ${lab}</div>${sc}${nx}`}
function render(v){V=v;if(!(v.ph=='d'&&v.turn==v.me)){sel=-1;ar=0}
 const seat=q=>(v.me+q)%4,at=v.ph=='d'&&v.turn==v.me,o=v.o||{},rot=[0,-90,180,90];
 const lab=(v.kyoku<4?'東':'南')+NM[v.kyoku%4]+'局';
 let h=`<div id="cb"><div class="cm"><div class="rd">${lab}</div><div class="rm">残 ${v.wall}</div>${v.hb?`<div class="hb2">${v.hb}本場</div>`:''}</div></div>`;
 for(let q=0;q<4;q++){const i=seat(q),wd=(i-v.dealer+4)%4;
  h+=`<div class="sg" style="transform:rotate(${rot[q]}deg)"><div class="pad${v.turn==i&&(v.ph=='d'||v.ph=='c')?' on':''}${wd==0?' dl':''}"><span>${W[wd]}</span><b>${v.sc[i]}</b></div>`
  +(v.rii[i]?'<div class="stk"></div>':'')
  +`<div class="rvw">${v.river[i].map((t,j)=>`<span class="rv${v.ri[i]==j?' rr':''}${t==v.lt?' lst':''}">${T(t,'rt')}</span>`).join('')}</div>`
  +(q?`<div class="ohw" style="left:${-v.hn[i]*14.5}px">${'<span class="tl fd fh"></span>'.repeat(v.hn[i])}</div>`:'')
  +`<div class="mlw">${v.melds[i].map(m=>`<div>${m.t.map((t,j)=>m.cl&&(j==0||j==3)?'<span class="tl fd rt"></span>':T(t,'rt')).join('')}</div>`).join('')}</div>`
  +`<div class="tgw"><div class="tg" style="transform:rotate(${-rot[q]}deg)">${esc(v.n[i])}${v.rii[i]?'<em>リーチ</em>':''}</div></div></div>`}
 $('#plane').innerHTML=h;
 $('#hud').innerHTML=`<div class="hu"><div class="hr"><i class="sk r"></i><b>${v.pot}</b></div><div class="hr"><i class="sk"></i><b>${v.hb}</b></div><div class="drs">${[0,1,2,3,4].map(i=>i<v.dr.length?T(v.dr[i],'sm'):'<span class="tl sm ob"></span>').join('')}</div></div>`;
 $('#top').innerHTML=`<span class="rl">${v.room?'部屋 '+v.room:'ひとり'}</span><span class="tb" onclick="yakuM()">役表</span><span class="tb" onclick="rulesM()">ルール設定</span><span class="tb" onclick="menuM()">☰ メニュー</span>`;
 const ht=t=>{const can=at&&(!v.rii[v.me]||t==v.drawn)&&(!ar||(o.rii||[]).includes(t));return T(t,'mh'+(sel==t?' sel':'')+(at&&!can?' dim':''),can?`onclick="pick(${t})"`:'')};
 $('#hd').innerHTML=v.hand.map(ht).join('')+(v.drawn>=0?'<span class="gp"></span>'+ht(v.drawn):'')+(at?`<div class="hint">${pref.dbl?'牌をダブルクリックで捨てる':'牌をクリックで捨てる'}</div>`:'');
 $('#pr').innerHTML=prompt_(v);
 const ov=$('#ov');if(v.ph=='e'||v.ph=='o'){ov.innerHTML=resHTML(v);ov.style.display='flex'}else ov.style.display='none';
 if(v.ph=='c'&&v.o&&!pref.naki&&!v.o.ron&&lastAuto!=v.sq){lastAuto=v.sq;setTimeout(()=>A({k:'pass'}),60)}}
function fit(){const k=Math.min(innerWidth/1000,innerHeight/620);$('#st').style.transform=`scale(${k}) translate(-50%,-50%)`}
addEventListener('resize',fit);fit();lobby();
