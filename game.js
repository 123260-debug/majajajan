'use strict';
const $=s=>document.querySelector(s),esc=s=>(s||'').replace(/[<>&"']/g,''),W=['東','南','西','北'];
let pref={dbl:1,naki:1,spd:700,tc:0};try{Object.assign(pref,JSON.parse(localStorage.getItem('mjp')||'{}'))}catch(e){}
const savePref=()=>{try{localStorage.setItem('mjp',JSON.stringify(pref))}catch(e){}};
const NM=[...'一二三四五六七八九'],KN=[...NM.map(x=>x+'萬'),...NM.map(x=>x+'筒'),...NM.map(x=>x+'索'),'東','南','西','北','白','發','中'];
const KO=[0,8,9,17,18,26,27,28,29,30,31,32,33];
let G=null,isHost=false,me=0,peer,hc,room='',names=['あなた','CPU1','CPU2','CPU3'],bots=[0,1,1,1],seatConn={},ar=0,sel=-1,V=null,RULE={len:2,pts:25000,aka:1},hostTm,chiS=0,kanS=0,lastAuto=-1;
const sorted=h=>h.slice().sort((a,b)=>a-b),cnt=h=>{const c=Array(34).fill(0);h.forEach(t=>c[t>>2]++);return c};

/* ---------- 牌の絵(SVG・牌一覧画像に合わせる) ---------- */
const FC={},FF="'Yuji Boku','Yuji Syuku','Shippori Mincho B1','Yu Mincho','Noto Serif JP',serif";
const PP=[0,[[30,40]],[[30,22],[30,58]],[[14,14],[30,40],[46,66]],[[18,22],[42,22],[18,58],[42,58]],[[16,16],[44,16],[30,40],[16,64],[44,64]],[[18,16],[42,16],[18,40],[42,40],[18,64],[42,64]],[[12,12],[30,22],[48,32],[18,54],[42,54],[18,70],[42,70]],[[18,12],[42,12],[18,32],[42,32],[18,52],[42,52],[18,70],[42,70]],[[14,14],[30,14],[46,14],[14,40],[30,40],[46,40],[14,66],[30,66],[46,66]]];
const SP=[0,0,[[30,22],[30,58]],[[30,20],[18,58],[42,58]],[[18,22],[42,22],[18,58],[42,58]],[[16,18],[44,18],[30,40],[16,62],[44,62]],[[14,22],[30,22],[46,22],[14,58],[30,58],[46,58]],[[30,14],[14,40],[30,40],[46,40],[14,66],[30,66],[46,66]],[[12,24],[24,24],[36,24],[48,24],[12,56],[24,56],[36,56],[48,56]],PP[9]];
function face(k,a){const ck=k+(a?'r':'');if(FC[ck])return FC[ck];const R='#c0202a',D='#222',Gn='#1b6b34',K='#161616';
 const tx=(t,x,y,z,c)=>`<text x="${x}" y="${y}" font-size="${z}" fill="${c}" font-weight="800" text-anchor="middle" font-family="${FF}">${t}</text>`;
 let s='';
 if(k<9)s=tx(NM[k],30,37,38,a&&k==4?R:K)+tx('萬',30,76,42,R);
 else if(k<18){const n=k-8;
  if(n==1)s=`<circle cx="30" cy="40" r="25" fill="#fff" stroke="${R}" stroke-width="3"/><circle cx="30" cy="40" r="20" fill="none" stroke="${D}" stroke-width="2" stroke-dasharray="3 2"/><circle cx="30" cy="40" r="14" fill="${R}"/><circle cx="30" cy="40" r="9" fill="#fff"/><circle cx="30" cy="40" r="5" fill="${D}"/>`+[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${30+22*Math.cos(i*.785)}" cy="${40+22*Math.sin(i*.785)}" r="2.6" fill="${i%2?D:R}"/>`).join('');
  else{const r=n<=3?11:n<=5?10:n<=7?8.5:7.5;PP[n].forEach(([x,y],i)=>{const c=n==5?(a||i==2?R:D):n==6?(i<2?D:R):n==7?(i<3?D:R):n==9?(i>=3&&i<6?R:D):D;
   s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${c}" stroke-width="2.4"/><circle cx="${x}" cy="${y}" r="${r*.72}" fill="none" stroke="${c}" stroke-width="1.2" stroke-dasharray="1.6 1.6"/><circle cx="${x}" cy="${y}" r="${r*.4}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r*.13}" fill="#fff"/>`})}}
 else if(k<27){const n=k-17;
  if(n==1)s=`<ellipse cx="30" cy="48" rx="13" ry="19" fill="${Gn}"/><circle cx="30" cy="22" r="9" fill="${Gn}"/><path d="M26 14Q30 4 34 14" stroke="${R}" stroke-width="3" fill="none"/><circle cx="34" cy="20" r="2.4" fill="#fff"/><path d="M22 40Q30 52 38 40M30 64L20 76M30 64L40 76" stroke="${R}" stroke-width="3" fill="none"/><path d="M30 28v30" stroke="#fff" stroke-width="1.5" opacity=".6"/>`;
  else{const h=n>=7?20:24;SP[n].forEach(([x,y],i)=>{const c=(n==3&&i==0)||(n==5&&i==2)||(a&&n==5)||(n==7&&i==0)||(n==9&&i%3==1)?R:Gn,rt=n==8?((i<4?i%2:1-i%2)?-24:24):0;
   s+=`<g transform="rotate(${rt} ${x} ${y})"><rect x="${x-4.5}" y="${y-h/2}" width="9" height="${h}" rx="3.5" fill="${c}"/><rect x="${x-4.5}" y="${y-h/2+1.5}" width="9" height="2.5" fill="#fff" opacity=".9"/><rect x="${x-4.5}" y="${y+h/2-4}" width="9" height="2.5" fill="#fff" opacity=".9"/><rect x="${x-4.5}" y="${y-1.2}" width="9" height="2.4" fill="#fff" opacity=".8"/></g>`})}}
 else if(k<31)s=tx(W[k-27],30,60,58,K);
 else if(k==31)s='';
 else s=tx(k==32?'發':'中',30,60,58,k==32?Gn:R);
 return FC[ck]=`<svg viewBox="0 0 60 80">${s}</svg>`}
const AKA=new Set([16,52,88]);let AKAON=1;
const T=(id,c,e)=>`<span class="tl ${c}" ${e||''}>${face(id>>2,AKAON&&AKA.has(id))}</span>`;

/* ---------- 麻雀ロジック(全役・符計算) ---------- */
const cl=s=>G.melds[s].every(m=>m.cl),isT=k=>k>=27||k%9==0||k%9==8,isH=k=>k>=27,GRN=[19,20,21,23,25,32];
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
function decomps(c){const out=[],rec=(acc,p)=>{const i=c.findIndex(x=>x>0);if(i<0){out.push({p,s:acc.slice()});return}
 if(c[i]>=3){c[i]-=3;acc.push({k:i,q:'k'});rec(acc,p);acc.pop();c[i]+=3}
 if(i<27&&i%9<7&&c[i+1]&&c[i+2]){c[i]--;c[i+1]--;c[i+2]--;acc.push({k:i,q:'s'});rec(acc,p);acc.pop();c[i]++;c[i+1]++;c[i+2]++}};
 for(let p=0;p<34;p++)if(c[p]>=2){c[p]-=2;rec([],p);c[p]+=2}return out}
const mset=m=>{const a=m.t.map(t=>t>>2);return a.length==4||a[0]==a[1]?{k:a[0],q:'k',o:!m.cl,kan:a.length==4}:{k:Math.min(...a),q:'s',o:1}};
const dk=t=>{const k=t>>2;return k<27?(k%9==8?k-8:k+1):k<31?(k==30?27:k+1):(k==33?31:k+1)};
const doraN=a=>{let n=0;for(let i=0;i<=G.kn;i++)n+=a[dk(G.dead[4+2*i])];return n},uraN=a=>{let n=0;for(let i=0;i<=G.kn;i++)n+=a[dk(G.dead[5+2*i])];return n};
function common(s,all,closed,ts,kans,F){const ym=[],y=[],sw=27+(s-G.dealer+4)%4,rw=27+(G.kyoku>3?1:0),ks=[];all.forEach((x,k)=>{if(x)ks.push(k)});
 const ho=ks.some(isH),ss=new Set(ks.filter(k=>k<27).map(k=>(k/9)|0));
 if(F.th)ym.push(['天和',13]);if(F.ch)ym.push(['地和',13]);
 if(ks.every(isH))ym.push(['字一色',13]);if(ks.every(k=>GRN.includes(k)))ym.push(['緑一色',13]);
 if(ks.every(k=>isT(k)&&k<27))ym.push(['清老頭',13]);if([31,32,33].every(k=>all[k]>=3))ym.push(['大三元',13]);
 const wn=[27,28,29,30].map(k=>all[k]);if(wn.every(x=>x>=3))ym.push(['大四喜',26]);else if(wn.filter(x=>x>=3).length==3&&wn.includes(2))ym.push(['小四喜',13]);
 if(kans==4)ym.push(['四槓子',13]);
 if(ym.length)return{ym,y};
 if(F.dbl)y.push(['ダブルリーチ',2]);else if(G.rii[s])y.push(['リーチ',1]);
 if(G.rii[s]&&G.ip[s])y.push(['一発',1]);
 if(closed&&ts)y.push(['門前清自摸和',1]);
 if(ks.every(k=>!isT(k)))y.push(['断么九',1]);
 [[31,'役牌:白'],[32,'役牌:發'],[33,'役牌:中'],[sw,'自風:'+W[sw-27]],[rw,'場風:'+W[rw-27]]].forEach(([k,n])=>{if(all[k]>=3)y.push([n,1])});
 if(ss.size==1)y.push(ho?['混一色',closed?3:2]:['清一色',closed?6:5]);
 const d3=[31,32,33].map(k=>all[k]).sort();if(d3[0]==2&&d3[1]>=3&&d3[2]>=3)y.push(['小三元',2]);
 if(ho&&ks.every(isT))y.push(['混老頭',2]);
 if(F.rh)y.push(['人和',5]);if(F.rin)y.push(['嶺上開花',1]);if(F.chk)y.push(['槍槓',1]);if(F.hai)y.push([ts?'海底摸月':'河底撈魚',1]);
 return{ym,y}}
const base=r=>r.ym?8000*r.ym:r.han>=13?8000:r.han>=11?6000:r.han>=8?4000:r.han>=6?3000:r.han>=5?2000:Math.min(2000,r.fu*2**(r.han+2));
function evalWin(s,c,wk,ts,F){const M=G.melds[s],ms=M.map(mset),closed=cl(s),nm=M.length,all=c.slice();M.forEach(m=>m.t.forEach(t=>all[t>>2]++));
 const sw=27+(s-G.dealer+4)%4,rw=27+(G.kyoku>3?1:0),cm=common(s,all,closed,ts,ms.filter(x=>x.kan).length,F),cs=[];
 const mkc=y=>{const yv=y.filter(a=>a[1]>=13),ym=yv.reduce((s,a)=>s+a[1]/13,0);return ym?{y:yv,fu:0,han:13*ym,ym}:{y,fu:0,han:y.reduce((a,x)=>a+x[1],0),ym:0}};
 if(!nm&&KO.every(k=>c[k])&&KO.reduce((a,k)=>a+c[k],0)==14)cs.push(mkc([c[wk]==2?['国士無双十三面待ち',26]:['国士無双',13],...cm.ym.filter(a=>a[0]=='天和'||a[0]=='地和')]));
 if(!nm&&c.every(x=>x==0||x==2)&&c.filter(x=>x==2).length==7){const r=mkc([...cm.ym,...cm.y,['七対子',2]]);r.fu=25;cs.push(r)}
 if(win(c.slice(),nm))decomps(c.slice()).forEach(d=>{const ws=[];
  if(d.p==wk)ws.push({t:'tan',i:-1});
  d.s.forEach((x,i)=>{if(x.q=='k'&&x.k==wk)ws.push({t:'shan',i});else if(x.q=='s'&&wk>=x.k&&wk<=x.k+2){const o=wk-x.k,e=x.k%9;ws.push({t:o==1?'kan':(o==0&&e==6)||(o==2&&e==0)?'pen':'ryan',i})}});
  ws.forEach(w=>{const S=d.s.map((x,i)=>({...x,o:w.t=='shan'&&w.i==i&&!ts?1:0})).concat(ms),sq=S.filter(x=>x.q=='s'),tr=S.filter(x=>x.q=='k'),anko=tr.filter(x=>!x.o).length;
   const y=[...cm.ym,...cm.y];
   if(closed&&anko==4)y.push(w.t=='tan'?['四暗刻単騎',26]:['四暗刻',13]);
   const ks=[];all.forEach((x,k)=>{if(x)ks.push(k)});
   if(!nm&&ks.every(k=>k<27&&((k/9)|0)==((ks[0]/9)|0))&&[3,1,1,1,1,1,1,1,3].every((b,i)=>all[((ks[0]/9)|0)*9+i]>=b))y.push([3,1,1,1,1,1,1,1,3].every((b,i)=>all[((ks[0]/9)|0)*9+i]-(((ks[0]/9)|0)*9+i==wk?1:0)==b)?['純正九蓮宝燈',26]:['九蓮宝燈',13]);
   if(!cm.ym.length&&!y.some(a=>a[1]>=13)){
    const pH=d.p>=31||d.p==sw||d.p==rw;
    if(closed&&sq.length==4&&w.t=='ryan'&&!pH)y.push(['平和',1]);
    if(closed){const m={};sq.forEach(x=>m[x.k]=(m[x.k]||0)+1);const n=Object.values(m).reduce((a,v)=>a+(v>>1),0);if(n>=2)y.push(['二盃口',3]);else if(n==1)y.push(['一盃口',1])}
    for(let b=0;b<7;b++)if([0,9,18].every(o=>sq.some(x=>x.k==b+o)))y.push(['三色同順',closed?2:1]);
    [0,9,18].forEach(o=>{if([0,3,6].every(b=>sq.some(x=>x.k==o+b)))y.push(['一気通貫',closed?2:1])});
    if(tr.length==4)y.push(['対々和',2]);if(anko==3)y.push(['三暗刻',2]);
    for(let b=0;b<9;b++)if([0,9,18].every(o=>tr.some(x=>x.k==b+o)))y.push(['三色同刻',2]);
    if(S.filter(x=>x.kan).length==3)y.push(['三槓子',2]);
    if([...S.map(x=>x.q=='s'?(x.k%9==0||x.k%9==6):isT(x.k)),isT(d.p)].every(Boolean)&&sq.length)y.push(ks.some(isH)?['混全帯么九',closed?2:1]:['純全帯么九',closed?3:2])}
   const r=mkc(y);
   if(!r.ym){let fu=20+(ts?2:closed?10:0);S.forEach(x=>{if(x.q=='k'){let f=isT(x.k)?4:2;if(x.kan)f*=4;if(!x.o)f*=2;fu+=f}});
    if(d.p>=31)fu+=2;if(d.p==sw)fu+=2;if(d.p==rw)fu+=2;if(w.t=='tan'||w.t=='kan'||w.t=='pen')fu+=2;
    if(y.some(a=>a[0]=='平和'))fu=ts?20:30;else{fu=Math.ceil(fu/10)*10;if(!closed&&fu<30)fu=30}r.fu=fu}
   cs.push(r)})});
 const ok=cs.filter(r=>r.han>0);if(!ok.length)return null;
 ok.forEach(r=>{if(!r.ym){const dn=doraN(all),un=G.rii[s]?uraN(all):0;if(dn){r.y.push(['ドラ',dn]);r.han+=dn}if(un){r.y.push(['裏ドラ',un]);r.han+=un}if(F.aka){r.y.push(['赤ドラ',F.aka]);r.han+=F.aka}}});
 return ok.sort((a,b)=>base(b)-base(a)||b.han-a.han)[0]}
const akaN=(s,ts)=>{if(!G.rl||!G.rl.aka)return 0;let n=0;G.hands[s].forEach(t=>{if(AKA.has(t))n++});G.melds[s].forEach(m=>m.t.forEach(t=>{if(AKA.has(t))n++}));if(!ts&&AKA.has(G.last))n++;return n};
const flags=(s,ts)=>({aka:akaN(s,ts),rh:!ts&&s!=G.dealer&&!G.anyCall&&G.river[s].length==0,hai:G.wall.length==0,rin:ts&&G.rinF==s,chk:!!G.chk,dbl:G.dbl[s],th:ts&&s==G.dealer&&!G.anyCall&&G.river[s].length==0,ch:ts&&s!=G.dealer&&!G.anyCall&&G.river[s].length==0});
function furiten(s){if(G.tf[s]||G.rf[s])return true;const c=cnt(G.hands[s]),nm=G.melds[s].length;return G.dsc[s].some(k=>{if(c[k]>=4)return false;c[k]++;const r=win(c,nm);c[k]--;return r})}
function dOpts(s){const h=G.hands[s],c=cnt(h),o={},nm=G.melds[s].length;
 if(G.drawn>=0&&win(c.slice(),nm)&&evalWin(s,c,G.drawn>>2,1,flags(s,1)))o.tsumo=1;
 if(!G.rii[s]&&cl(s)&&G.sc[s]>=1000&&G.wall.length>=4)o.rii=h.filter(t=>{const d=cnt(h);d[t>>2]--;return tenpai(d,nm)});
 if(!G.rii[s]&&G.kn<4&&G.wall.length>0){const k=[];for(let i=0;i<34;i++)if(c[i]==4)k.push({k:i,a:1});
  G.melds[s].forEach((m,j)=>{if(!m.cl&&m.t.length==3&&m.t[0]>>2==m.t[1]>>2&&c[m.t[0]>>2]>=1)k.push({k:m.t[0]>>2,j})});if(k.length)o.kan=k}
 return o}
function cOpts(s,t,f){const c=cnt(G.hands[s]),k=t>>2,o={},nm=G.melds[s].length;
 c[k]++;if(win(c.slice(),nm)&&!furiten(s)&&evalWin(s,c,k,0,flags(s,0)))o.ron=1;c[k]--;
 if(!G.rii[s]){if(c[k]>=2)o.pon=1;if(c[k]>=3&&G.kn<4&&G.wall.length>0)o.kan=1;
  if((f+1)%4==s&&k<27){const l=[];[[-2,-1],[-1,1],[1,2]].forEach(([a,b])=>{const x=k%9+a,y=k%9+b;if(x>=0&&y<=8&&c[k+a]&&c[k+b])l.push([k+a,k+b])});if(l.length)o.chi=l}}
 return Object.keys(o).length?o:null}

/* ---------- 進行(ホストのみ) ---------- */
function newK(){const w=[...Array(136).keys()];
 for(let i=135;i>0;i--){const j=Math.random()*(i+1)|0;[w[i],w[j]]=[w[j],w[i]]}
 G.hands=[0,1,2,3].map(()=>w.splice(0,13));G.dead=w.splice(0,14);G.wall=w;G.kn=0;G.melds=[[],[],[],[]];G.river=[[],[],[],[]];
 G.rii=[0,0,0,0];G.ri=[-1,-1,-1,-1];G.ip=[0,0,0,0];G.dbl=[0,0,0,0];G.tf=[0,0,0,0];G.rf=[0,0,0,0];G.nc=[0,0,0,0];G.dsc=[[],[],[],[]];
 G.anyCall=false;G.rinF=-1;G.chk=0;G.res=null;G.rep=false;G.turn=G.dealer;G.calls=null;G.drawn=-1;G.last=-1;G.from=0;draw()}
function draw(){if(!G.wall.length)return ryu();
 const t=G.wall.pop();G.hands[G.turn].push(t);G.drawn=t;G.ph='d';G.calls=null;G.rinF=-1;send();bot()}
function rin(s){G.kn++;const t=G.dead[G.kn-1];G.hands[s].push(t);G.drawn=t;G.ph='d';G.calls=null;G.turn=s;G.rinF=s;send();bot()}
function disc(s,t,r){const h=G.hands[s];h.splice(h.indexOf(t),1);G.river[s].push(t);G.dsc[s].push(t>>2);G.tf[s]=0;G.rinF=-1;G.last=t;G.from=s;G.drawn=-1;G.sq++;
 if(G.rii[s])G.ip[s]=0;
 if(r){G.rii[s]=1;G.ri[s]=G.river[s].length-1;G.sc[s]-=1000;G.pot++;G.ip[s]=1;if(G.river[s].length==1&&!G.anyCall)G.dbl[s]=1}
 const c={};let n=0;for(let i=1;i<4;i++){const p=(s+i)%4,o=cOpts(p,t,s);if(o){c[p]=o;n++}}
 if(n){G.ph='c';G.calls=c;G.resp={};send();bot()}else{G.turn=(s+1)%4;draw()}}
function kan(s,x){const h=G.hands[s];G.anyCall=true;G.ip.fill(0);
 if(x.a){const u=[];for(let i=h.length-1;i>=0;i--)if(h[i]>>2==x.k)u.push(h.splice(i,1)[0]);G.melds[s].push({t:u,f:s,cl:1})}
 else{const t=h.splice(h.findIndex(y=>y>>2==x.k),1)[0];G.melds[s][x.j].t.push(t);
  const cs={};let n=0;G.chk=1;G.last=t;G.from=s;for(let i=1;i<4;i++){const p=(s+i)%4,c=cnt(G.hands[p]);c[t>>2]++;if(win(c.slice(),G.melds[p].length)&&!furiten(p)&&evalWin(p,c,t>>2,0,flags(p,0))){cs[p]={ron:1};n++}}
  if(n){G.last=t;G.from=s;G.kk=s;G.ph='c';G.calls=cs;G.resp={};send();bot();return}G.chk=0}
 rin(s)}
function meld(s,k){const h=G.hands[s],t=G.last,kk=t>>2,u=[],need=k=='pon'?[kk,kk]:k=='kan'?[kk,kk,kk]:G.calls[s].chi[+k.slice(3)];
 need.forEach(x=>u.push(h.splice(h.findIndex(y=>y>>2==x),1)[0]));
 G.river[G.from].pop();G.nc[G.from]=1;G.anyCall=true;G.ip.fill(0);G.melds[s].push({t:[t,...u],f:G.from,cl:0});G.turn=s;G.calls=null;
 if(k=='kan')return rin(s);G.ph='d';G.drawn=-1;send();bot()}
function win_(s,f){const ts=s==f,c=cnt(G.hands[s]);if(!ts)c[G.last>>2]++;
 const r=evalWin(s,c,ts?G.drawn>>2:G.last>>2,ts,flags(s,ts)),b=base(r),d=s==G.dealer,u=x=>Math.ceil(x/100)*100,ch=[0,0,0,0],sc0=G.sc.slice();
 if(ts){for(let i=0;i<4;i++)if(i!=s){const v=u(b*(d||i==G.dealer?2:1))+G.hb*100;ch[i]-=v;ch[s]+=v}}
 else{const v=u(b*(d?6:4))+G.hb*300;ch[f]-=v;ch[s]+=v}
 ch[s]+=G.pot*1000;G.pot=0;ch.forEach((v,i)=>G.sc[i]+=v);
 const hh=G.hands.map(sorted);if(ts)hh[s].splice(hh[s].indexOf(G.drawn),1);
 G.res={w:s,f,ts,y:r.y,h:r.han,fu:r.fu,ym:r.ym,ch,sc0,hands:hh,tile:ts?G.drawn:G.last,di:Array.from({length:G.kn+1},(_,i)=>G.dead[4+2*i]),ui:G.rii[s]?Array.from({length:G.kn+1},(_,i)=>G.dead[5+2*i]):[]};
 G.chk=0;G.ph='e';G.rep=d;G.hb=d?G.hb+1:0;send()}
function ryu(){const tp=[0,1,2,3].map(s=>tenpai(cnt(G.hands[s]),G.melds[s].length)),ch=[0,0,0,0],sc0=G.sc.slice();
 const ng=[0,1,2,3].filter(s=>!G.nc[s]&&G.river[s].length&&G.river[s].every(t=>isT(t>>2)));
 if(ng.length)ng.forEach(s=>{for(let i=0;i<4;i++)if(i!=s){const v=s==G.dealer||i==G.dealer?4000:2000;ch[i]-=v;ch[s]+=v}});
 else{const n=tp.filter(Boolean).length;if(n&&n<4)tp.forEach((t,i)=>ch[i]+=t?3000/n:-3000/(4-n))}
 ch.forEach((v,i)=>G.sc[i]+=v);
 G.res={draw:1,ch,sc0,tp,ng,hands:G.hands.map(sorted)};G.ph='e';G.rep=tp[G.dealer];G.hb++;send()}
function resolve(){if(G.ph!='c')return;const p=Object.keys(G.calls);if(!p.every(x=>x in G.resp))return;
 let q=p.find(x=>G.resp[x]=='ron');if(q!=null)return win_(+q,G.from);
 if(G.chk){G.chk=0;return rin(G.kk)}
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
 else if(G.ph=='c'){for(const p in G.calls)if(bots[p]&&!(p in G.resp)){const o=G.calls[p],k=G.last>>2,sw=27+(p-G.dealer+4)%4,rw=27+(G.kyoku>3?1:0);
   G.resp[p]=o.ron?'ron':(o.pon&&(k>=31||k==sw||k==rw))?'pon':'pass'}resolve()}},pref.spd)}
function act(s,a){if(!G)return;
 if(a.k=='next'){if(G.ph=='e'&&s==0){if(!G.rep)G.kyoku++;G.dealer=G.kyoku%4;if(G.kyoku>=G.rl.len*4||G.sc.some(x=>x<0)){G.ph='o';send()}else newK()}return}
 if(G.ph=='d'&&G.turn==s){
  if(a.k=='d'&&G.hands[s].includes(a.t)){if(G.rii[s]&&a.t!=G.drawn)return;
   if(a.r&&!(dOpts(s).rii||[]).includes(a.t))return;return disc(s,a.t,a.r?1:0)}
  if(a.k=='tsumo'&&dOpts(s).tsumo)return win_(s,s);
  if(a.k=='kan'){const o=dOpts(s);if(o.kan&&o.kan[a.i])return kan(s,o.kan[a.i])}}
 if(G.ph=='c'&&G.calls[s]&&!(s in G.resp)){const o=G.calls[s];
  if((a.k=='ron'&&o.ron)||(a.k=='pon'&&o.pon)||(a.k=='kan'&&o.kan)||(a.k=='chi'&&o.chi&&o.chi[a.i])||a.k=='pass'){
   if(a.k=='pass'&&o.ron){if(G.rii[s])G.rf[s]=1;else G.tf[s]=1}
   G.resp[s]=a.k=='chi'?'chi'+a.i:a.k;resolve()}}}
function view(s){const g=G;return{me:s,n:names.slice(),sc:g.sc.slice(),dealer:g.dealer,kyoku:g.kyoku,turn:g.turn,ph:g.ph,river:g.river.map(r=>r.slice()),melds:g.melds.map(m=>m.map(x=>({...x,t:x.t.slice()}))),rii:g.rii.slice(),ri:g.ri.slice(),
 hn:g.hands.map(h=>h.length),hand:sorted(g.hands[s].filter(t=>t!=g.drawn||g.turn!=s||g.ph!='d')),drawn:g.turn==s&&g.ph=='d'?g.drawn:-1,
 wall:g.wall.length,res:g.res,pot:g.pot,hb:g.hb,lt:g.last,lf:g.from,sq:g.sq,dr:Array.from({length:g.kn+1},(_,i)=>g.dead[4+2*i]),rule:g.rl,room,fu:g.ph=='d'||g.ph=='c'?furiten(s):false,
 o:g.ph=='d'&&g.turn==s?dOpts(s):(g.ph=='c'&&g.calls[s]&&!(s in g.resp)?g.calls[s]:undefined)}}
function send(){for(let s=0;s<4;s++){if(bots[s])continue;const v=view(s);if(s==0)render(v);else seatConn[s]&&seatConn[s].send({t:'v',v})}}
function A(a){if(isHost)act(0,a);else hc.send({t:'a',a})}
function start(){G={sc:Array(4).fill(RULE.pts),dealer:0,kyoku:0,pot:0,hb:0,sq:0,rl:{...RULE}};$('#lb').style.display='none';newK()}

/* ---------- 通信(PeerJS: 部屋コード方式) ---------- */
const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]};
const ERR={'peer-unavailable':'その部屋コードの部屋が見つかりません。コードと、ホストが待機中かを確認してください','network':'PeerJSサーバーに接続できません。少し待って再試行してください','server-error':'PeerJSサーバーが応答しません','socket-error':'サーバーとの通信に失敗しました','webrtc':'WebRTC通信のエラーです','browser-incompatible':'このブラウザは対応していません'};
const DEFAULT_SRV='';/* 自分の通信サーバーを使う場合はここに「xxxx.onrender.com」のように書く */
const peerOpts=()=>{const h=pref.srv||DEFAULT_SRV;return h?{host:h,port:443,secure:true,path:'/'}:{}};
async function diag(){const out=[],add=(ok,t)=>out.push((ok?'✅ ':'❌ ')+t),show=()=>{const e=$('#nt');if(e){e.style.color='#f4ecd0';e.style.textAlign='left';e.innerHTML=out.join('<br>')}};
 add(typeof Peer!=='undefined','通信ライブラリ(PeerJS)の読み込み');add(typeof RTCPeerConnection!=='undefined','WebRTC対応ブラウザ');show();
 try{await fetch('https://'+(pref.srv||DEFAULT_SRV||'0.peerjs.com')+'/',{mode:'no-cors'});add(1,'PeerJSサーバーに到達できる')}catch(e){add(0,'PeerJSサーバーに到達できない(学校・会社のネットワークが遮断している可能性)')}show();
 try{await new Promise((res,rej)=>{const w=new WebSocket('wss://'+(pref.srv||DEFAULT_SRV||'0.peerjs.com')+'/peerjs?key=peerjs&id=diag'+Date.now()+'&token=x'),t=setTimeout(()=>{w.close();rej()},6000);w.onopen=()=>{clearTimeout(t);w.close();res()};w.onerror=()=>{clearTimeout(t);rej()}});add(1,'WebSocket接続できる')}catch(e){add(0,'WebSocket接続できない(これが✅でないと部屋は作れません)')}show();
 try{await fetch(NT,{mode:'no-cors'});add(1,'別方式の通信サーバー(ntfy.sh)に到達できる')}catch(e){add(0,'別方式の通信サーバー(ntfy.sh)に到達できない')}show();
 try{const ok=await new Promise(res=>{const pc=new RTCPeerConnection(ICE);pc.createDataChannel('x');let f=0;pc.onicecandidate=e=>{if(e.candidate&&/srflx/.test(e.candidate.candidate)){f=1;res(1)}};pc.createOffer().then(o=>pc.setLocalDescription(o));setTimeout(()=>{res(f);pc.close()},5000)});add(ok,ok?'STUN(外部IPの取得)ができる':'STUN(外部IP)を取得できない。別の回線の人とは繋がりにくい')}catch(e){add(0,'WebRTCを開始できない')}show();
 out.push('<br>この結果を教えてください。');show()}
const shareUrl=()=>(typeof location!='undefined'?location.origin+location.pathname:'')+'?room='+room;
function cp(){const u=shareUrl(),ok=()=>note('招待リンクをコピーしました',0);try{navigator.clipboard.writeText(u).then(ok,()=>{const i=document.querySelector('.lk input');i.select();document.execCommand('copy');ok()})}catch(e){const i=document.querySelector('.lk input');i.select();document.execCommand('copy');ok()}}
function sh(){navigator.share({title:'麻雀オンライン',text:'麻雀の部屋 '+room+' に参加しよう',url:shareUrl()}).catch(()=>{})}
function listRooms(){if(typeof Peer==='undefined')return note('通信ライブラリを読み込めません',1);note('部屋を探しています…');
 const p=new Peer({config:ICE,...peerOpts()});const tm=setTimeout(()=>{note('一覧を取得できませんでした。部屋一覧は、自分の通信サーバー(peer-server.zip)でのみ使えます',1);try{p.destroy()}catch(e){}},10000);
 p.on('error',e=>{clearTimeout(tm);note('エラー: '+(ERR[e.type]||e.type),1)});
 p.on('open',()=>p.listAllPeers(l=>{clearTimeout(tm);p.destroy();const r=(l||[]).filter(x=>/^mjrm-\d{4}$/.test(x)).map(x=>x.slice(5)),e=$('#rl');
  if(e)e.innerHTML=r.length?r.map(c=>`<button class="pb bl" style="margin:4px" onclick="$('#code').value='${c}';join()">部屋 ${c}</button>`).join(''):'<div style="font-size:13px;color:#b9c4ac;margin-top:6px">いま開いている部屋はありません</div>';note(r.length?'入りたい部屋を選んでください':'')}))}
function note(t,bad){const e=$('#nt');if(e){e.textContent=t;e.style.color=bad?'#ff9a8a':'#b9e6b0'}else alert(t)}
function setName(){names[0]=esc($('#nm')&&$('#nm').value)||names[0]||'あなた'}
function resetAll(){try{peer&&peer.destroy()}catch(e){}try{ntES&&ntES.close()}catch(e){}ntES=null;try{manC&&manC.close()}catch(e){}manC=null;clearTimeout(hostTm);G=null;V=null;isHost=false;peer=null;hc=null;seatConn={};bots=[0,1,1,1];names=['あなた','CPU1','CPU2','CPU3'];room='';me=0;ar=0;sel=-1;
 $('#rm').textContent='';$('#ov').style.display='none';$('#pr').innerHTML='';$('#hd').innerHTML='';$('#plane').innerHTML='';$('#hud').innerHTML='';$('#top').innerHTML='';closeM();$('#lb').style.display='flex';lobby()}
function leave(){if(confirm('対局・部屋から退出してロビーに戻りますか?'))resetAll()}
let ntES=null,manC=null;
const NT='https://ntfy.sh/',ntT=(c,x)=>'mjrm-'+c+'-'+x;
const ntSub=(t,fn)=>{const es=new EventSource(NT+t+'/sse');es.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.event=='message')fn(m.message)}catch(x){}};return es};
const ntPub=(t,x)=>x.length>3900?Promise.reject('コードが長すぎます(手動接続をお使いください)'):fetch(NT+t,{method:'POST',body:x});
/* WebRTCを直接使う接続(PeerJSと同じ形で扱えるようにしたもの) */
function RC(offerer){const o={h:{},metadata:{},pc:new RTCPeerConnection(ICE),dc:null,op:false,cl:false,
  on(e,f){(o.h[e]=o.h[e]||[]).push(f);return o},emit(e,a){(o.h[e]||[]).slice().forEach(f=>f(a))},
  send(m){try{if(o.dc&&o.dc.readyState=='open')o.dc.send(JSON.stringify(m))}catch(x){}},
  die(){if(o.cl)return;o.cl=true;o.emit('close')},close(){try{o.pc.close()}catch(x){}o.die()}};
 const bind=dc=>{o.dc=dc;dc.onopen=()=>{o.op=true;o.emit('open')};dc.onmessage=e=>{try{o.emit('data',JSON.parse(e.data))}catch(x){}};dc.onclose=()=>o.die()};
 if(offerer)bind(o.pc.createDataChannel('g'));else o.pc.ondatachannel=e=>bind(e.channel);
 o.pc.onconnectionstatechange=()=>{if(o.pc.connectionState=='failed')o.die()};
 const gather=()=>new Promise(res=>{if(o.pc.iceGatheringState=='complete')return res();const f=()=>{if(o.pc.iceGatheringState=='complete'){o.pc.removeEventListener('icegatheringstatechange',f);res()}};o.pc.addEventListener('icegatheringstatechange',f);setTimeout(res,4000)});
 o.offer=async()=>{await o.pc.setLocalDescription(await o.pc.createOffer());await gather();return JSON.stringify(o.pc.localDescription)};
 o.answer=async off=>{await o.pc.setRemoteDescription(JSON.parse(off));await o.pc.setLocalDescription(await o.pc.createAnswer());await gather();return JSON.stringify(o.pc.localDescription)};
 o.accept=async ans=>{await o.pc.setRemoteDescription(JSON.parse(ans))};
 return o}
function hostConn(c){c.on('open',()=>{const s=[1,2,3].find(i=>!seatConn[i]);
  if(!s||G){c.send({t:'full'});setTimeout(()=>c.close(),300);return}
  seatConn[s]=c;bots[s]=0;names[s]=esc(c.metadata&&c.metadata.name)||'プレイヤー'+s;c.send({t:'seat',s});lobby();
  c.on('data',m=>{if(m.t=='a')act(s,m.a)});
  c.on('close',()=>{if(seatConn[s]!==c)return;delete seatConn[s];bots[s]=1;names[s]='CPU'+s;lobby();if(G){send();if(G.ph=='d'||G.ph=='c')bot()}})})}
function wireGuest(c,code,onOk){let inRoom=0;hc=c;
 c.on('open',()=>{onOk();note('入室処理中…')});
 c.on('error',e=>note('通信エラー: '+e,1));
 c.on('data',m=>{onOk();
  if(m.t=='seat'){inRoom=1;me=m.s;room=code;$('#rm').textContent=code;$('#lb').innerHTML=shell('<h3>入室しました</h3><p style="font-size:14px">ホストの開始を待っています…</p><div class="bar"><button class="pb" onclick="resetAll()">← 退室</button></div>')}
  if(m.t=='full')note('満席、または対局が始まっています',1);
  if(m.t=='v'){$('#lb').style.display='none';render(m.v)}});
 c.on('close',()=>{if(inRoom){resetAll();note('ホストとの接続が切れました',1)}})}

/* 方式1: PeerJS(4桁) */
function host(){setName();if(typeof Peer==='undefined')return hostN();
 isHost=true;me=0;note('部屋を作成中…');clearTimeout(hostTm);
 hostTm=setTimeout(()=>{if(!$('#rm').textContent){try{peer.destroy()}catch(e){}note('標準の通信サーバーに繋がらないため、別の方式で作成します…');hostN()}},9000);
 tryRoom()}
function solo(){setName();isHost=true;me=0;room='';bots=[0,1,1,1];start()}
function tryRoom(){room=''+(1000+Math.random()*9000|0);if(peer)peer.destroy();peer=new Peer('mjrm-'+room,{config:ICE,...peerOpts()});
 peer.on('error',e=>{if(e.type=='unavailable-id')return tryRoom();clearTimeout(hostTm);note('標準の通信サーバーに繋がらないため、別の方式で作成します…');hostN()});
 peer.on('disconnected',()=>{try{peer.reconnect()}catch(e){}});
 peer.on('open',()=>{clearTimeout(hostTm);$('#rm').textContent=room;lobby()});
 peer.on('connection',hostConn)}
/* 方式2: ntfy.sh経由で自動接続(6桁) */
function hostN(){if(typeof RTCPeerConnection==='undefined'||typeof EventSource==='undefined')return note('このブラウザは対応していません',1);
 try{peer&&peer.destroy()}catch(e){}peer=null;clearTimeout(hostTm);try{ntES&&ntES.close()}catch(e){}
 isHost=true;me=0;room=''+(100000+Math.random()*900000|0);$('#rm').textContent='';note('別の方式で部屋を作成中…');
 const es=ntES=ntSub(ntT(room,'h'),async txt=>{try{const m=JSON.parse(txt),c=RC(false);c.metadata={name:m.n};hostConn(c);await ntPub(ntT(room,'g'+m.i),await c.answer(m.o))}catch(e){}});
 es.onopen=()=>{clearTimeout(hostTm);$('#rm').textContent=room;lobby()};
 hostTm=setTimeout(()=>{if(!$('#rm').textContent){try{es.close()}catch(e){}isHost=false;lobby();note('どの方式でも部屋を作れません。ネットワークが遮断している可能性があります。「手動で部屋を作る」を試すか、別の回線でお試しください',1)}},12000)}
async function joinN(code){note('接続中…');let ok=0;const c=RC(true),id=Math.random().toString(36).slice(2,8);
 const tm=setTimeout(()=>{if(!ok){note('接続できませんでした。コードと、ホストの待機状態を確認してください',1);try{ntES.close()}catch(e){}c.close()}},20000);
 try{try{ntES&&ntES.close()}catch(e){}ntES=ntSub(ntT(code,'g'+id),async a=>{try{await c.accept(a)}catch(e){}});
  await new Promise(r=>{ntES.onopen=r;setTimeout(r,3000)});
  const o=await c.offer();wireGuest(c,code,()=>{ok=1;clearTimeout(tm)});
  await ntPub(ntT(code,'h'),JSON.stringify({i:id,n:names[0],o}))}catch(e){clearTimeout(tm);note('通信エラー: '+e,1)}}
/* 方式3: 手動(コードをコピーして送り合う。サーバー不要) */
function manHost(){setName();isHost=true;me=0;room='手動';$('#rm').textContent=room;lobby()}
function manAddM(){md(`<h2>友達を手動で招待</h2><p>1. 友達が「手動で入室」で作ったコードを貼り付けます。</p><textarea id="mo" rows="4" style="width:100%"></textarea><button class="bk2" onclick="manAns()">返信コードを作る</button><p>2. 出てきた返信コードを友達に送ります。</p><textarea id="ma" rows="4" style="width:100%" readonly></textarea><button class="bk2" onclick="closeM()">← 閉じる</button>`)}
async function manAns(){try{const m=JSON.parse(atob($('#mo').value.trim())),c=RC(false);c.metadata={name:m.n};hostConn(c);$('#ma').value=btoa(await c.answer(m.o));$('#ma').select()}catch(e){alert('コードが正しくありません')}}
function manJoin(){setName();md(`<h2>手動で入室</h2><p>1. 下のコードをホストに送ります。</p><textarea id="mg" rows="4" style="width:100%" readonly>作成中…</textarea><p>2. ホストから届いた返信コードを貼って「接続」を押します。</p><textarea id="mr" rows="4" style="width:100%"></textarea><button class="bk2" onclick="manGo()">接続</button><button class="bk2" onclick="closeM()">← 戻る</button>`);
 manC=RC(true);wireGuest(manC,'手動',()=>{});manC.offer().then(o=>{$('#mg').value=btoa(JSON.stringify({n:names[0],o}));$('#mg').select()})}
async function manGo(){try{await manC.accept(atob($('#mr').value.trim()));closeM();$('#lb').style.display='flex';note('接続中…')}catch(e){alert('コードが正しくありません')}}
function join(){setName();const code=($('#code').value||'').trim();
 if(/^\d{6}$/.test(code))return joinN(code);
 if(!/^\d{4}$/.test(code))return note('4桁または6桁の部屋コードを入力してください',1);
 note('接続中…');let ok=0;if(peer)peer.destroy();peer=new Peer({config:ICE,...peerOpts()});
 const tm=setTimeout(()=>{if(!ok){note('接続できませんでした。コードとホストの待機状態を確認してください。回線が違う相手とは繋がらない場合があります',1);peer.destroy()}},15000);
 peer.on('error',e=>{clearTimeout(tm);note('入室できません: '+(ERR[e.type]||e.type),1)});
 peer.on('open',()=>{note('部屋を探しています…');const c=peer.connect('mjrm-'+code,{metadata:{name:names[0]},reliable:true});wireGuest(c,code,()=>{ok=1;clearTimeout(tm)})})}

/* ---------- ロビー・モーダル ---------- */
function dec(){return [[33,'5%','10%',-12],[4,'86%','16%',10],[31,'9%','66%',8],[27,'84%','64%',-8],[13,'44%','80%',5],[22,'50%','2%',-6],[12,'72%','40%',14],[0,'18%','36%',-16]].map(([k,l,t,r])=>`<span class="dc" style="left:${l};top:${t};transform:rotate(${r}deg)">${T(k*4,'')}</span>`).join('')}
function shell(x){return dec()+`<div class="box"><h1>麻雀</h1><div class="sub">オンライン対戦</div>${x}<div id="nt" class="nt"></div></div>`}
function lobby(){const L=$('#lb');if(G)return;
 const sub=`<div class="bar"><button class="pb bl" onclick="yakuM()">役表</button><button class="pb bl" onclick="rulesM()">ルール設定</button><button class="pb bl" onclick="diag()">接続診断</button></div>`,
  sub2=`<div class="bar"><button class="pb bl" onclick="hostN()">別方式で部屋を作る</button><button class="pb bl" onclick="manHost()">手動で部屋を作る</button><button class="pb bl" onclick="manJoin()">手動で入室</button></div>`;
 if(!isHost){L.innerHTML=shell(`<input id="nm" placeholder="あなたの名前" maxlength="8"><div class="two"><div><h3>部屋を作る</h3><p style="margin:0 0 12px">友達を招待します</p><button class="pb" onclick="host()">部屋を作る</button><p style="margin-top:14px"><button class="pb bl" onclick="solo()">ひとりで遊ぶ(CPU対戦)</button></p></div><i></i><div><h3>部屋に入る</h3><input id="code" placeholder="部屋コード(4〜6桁)" maxlength="6"><button class="pb" onclick="join()">入室</button><div style="margin-top:8px"><button class="pb bl" onclick="listRooms()">部屋一覧</button></div><div id="rl"></div></div></div>${sub}${sub2}<p>空席はCPUが入ります</p>`);
  const q=typeof location!='undefined'&&new URLSearchParams(location.search).get('room');if(q&&/^\d{4}$/.test(q)){const e=$('#code');if(e)e.value=q;note('部屋 '+q+' の招待リンクです。名前を入れて「入室」を押してください')}return}
 L.innerHTML=shell(`<h3>部屋コード</h3><div class="code">${room}</div><div class="seats">${names.map((n,i)=>`<div class="seat${i==0?' me':''}"><b>${W[i]}</b>${n}<br><span>${bots[i]?'CPU':'プレイヤー'}</span></div>`).join('')}</div><div class="bar"><button class="pb" onclick="resetAll()">← 戻る</button><button class="pb" onclick="start()">対局開始</button></div>${sub}${/^\d+$/.test(room)?`<div class="lk"><input readonly value="${shareUrl()}" onclick="this.select()"><div class="bar"><button class="pb bl" onclick="cp()">リンクをコピー</button>${navigator.share?'<button class="pb bl" onclick="sh()">共有</button>':''}</div></div><p>このリンクかコードを友達に送ってください</p>`:''}<div class="bar" style="margin-top:8px"><button class="pb bl" onclick="manAddM()">手動で招待</button></div>`)}
const md=h=>{const m=$('#md');m.innerHTML=`<div class="mc">${h}</div>`;m.style.display='flex'};
function closeM(){$('#md').style.display='none'}
const YK=[['1翻',[['立直','門前でテンパイ宣言(1000点供託)'],['一発','立直後、1巡以内に和了'],['門前清自摸和','門前でツモ和了'],['断么九','2〜8の数牌だけ'],['平和','順子4組・役のない雀頭・両面待ち(門前)'],['一盃口','同じ順子が2組(門前)'],['役牌','白・發・中、自風、場風の刻子'],['嶺上開花','カンの後の牌でツモ和了'],['槍槓','加槓された牌でロン'],['海底摸月','最後の牌でツモ和了'],['河底撈魚','最後の捨て牌でロン']]],
['2翻',[['ダブル立直','第一打でリーチ'],['七対子','7組の対子(25符)'],['三色同順','3色で同じ数の順子(鳴き1翻)'],['一気通貫','同じ色で123・456・789(鳴き1翻)'],['対々和','全て刻子(槓子)'],['三暗刻','暗刻が3組'],['三色同刻','3色で同じ数の刻子'],['三槓子','槓子が3組'],['混老頭','么九牌だけ'],['小三元','三元牌の2つが刻子・1つが雀頭'],['混全帯么九','全ての組に么九牌(字牌あり・鳴き1翻)']]],
['3翻',[['混一色','1種の数牌+字牌(鳴き2翻)'],['純全帯么九','全ての組に老頭牌(字牌なし・鳴き2翻)'],['二盃口','一盃口が2組(門前)']]],
['5〜6翻',[['人和','親の第一打までのロン(満貫扱い5翻)'],['清一色','1種の数牌だけ(鳴き5翻)']]],
['役満',[['国士無双','13種の么九牌+1枚'],['四暗刻','暗刻が4組'],['大三元','白發中すべて刻子'],['字一色','字牌だけ'],['小四喜','風牌の3つが刻子・1つが雀頭'],['大四喜','風牌4つすべて刻子(ダブル役満)'],['緑一色','2・3・4・6・8索と發だけ'],['清老頭','老頭牌だけ'],['九蓮宝燈','1種の数牌で1112345678999+1枚'],['四槓子','槓子が4組'],['天和','親の配牌でツモ和了'],['地和','子の第一ツモで和了']]],
['ダブル役満',[['国士無双十三面待ち','13種すべてを待っていた国士'],['四暗刻単騎','雀頭待ちの四暗刻'],['純正九蓮宝燈','九面待ちの九蓮宝燈'],['大四喜','風牌4刻子']]],
['ドラ',[['ドラ・裏ドラ','表示牌の次の牌が1枚1翻(立直で裏ドラ、槓でドラ追加)'],['赤ドラ','赤い5(各色1枚)が1枚1翻(ルールで切替)']]]];
function yakuM(){md(`<h2>役表</h2>${YK.map(([t,l])=>`<h4>${t}</h4><table>${l.map(y=>`<tr><td style="width:30%">${y[0]}</td><td>${y[1]}</td></tr>`).join('')}</table>`).join('')}<p style="font-size:12px;color:#b9c4ac">流し満貫・数え役満(13翻以上)・ノーテン罰符・フリテンにも対応しています。符は計算します。</p><button class="bk2" onclick="closeM()">← 戻る</button>`)}
const seg=(lab,arr,cur,f)=>`<div class="row"><span>${lab}</span>${arr.map(([t,v])=>`<button class="sgb${v==cur?' on':''}" onclick="${f},${v})">${t}</button>`).join('')}</div>`;
function sr(k,v){RULE[k]=v;rulesM()}
function theme(){if(typeof document!='undefined'&&document.body)document.body.classList.toggle('blue',pref.tc==1)}
function sp(k,v){pref[k]=v;savePref();theme();rulesM();if(V)render(V)}
function rulesM(){const R=(G&&G.rl)||(V&&V.rule)||RULE,ed=isHost&&!G;
 md(`<h2>ルール設定</h2><h4>部屋のルール${ed?'':'(開始後は変更できません)'}</h4>`+
 (ed?seg('局数',[['東風戦(4局)',1],['東南戦(8局)',2]],RULE.len,"sr('len'")+seg('持ち点',[['25000点',25000],['30000点',30000]],RULE.pts,"sr('pts'")+seg('赤ドラ',[['あり',1],['なし',0]],RULE.aka,"sr('aka'"):`<div class="row">局数: ${R.len==1?'東風戦(4局)':'東南戦(8局)'} ／ 持ち点: ${R.pts} ／ 赤ドラ: ${R.aka?'あり':'なし'}</div>`)+
 `<h4>あなたの設定</h4>`+seg('鳴き(ポン・チー・カン)',[['ON',1],['OFF',0]],pref.naki,"sp('naki'")+seg('打牌の操作',[['ダブルクリック',1],['ワンクリック',0]],pref.dbl,"sp('dbl'")+seg('卓の色',[['緑',0],['青',1]],pref.tc,"sp('tc'")+seg('CPUの速さ(ホスト)',[['速い',350],['普通',700],['ゆっくり',1100]],pref.spd,"sp('spd'")+`<div class="row"><span>通信サーバー(上級者向け)</span><input style="padding:6px;width:230px" placeholder="空欄=標準(0.peerjs.com)" value="${esc(pref.srv||'')}" onchange="pref.srv=esc(this.value.trim());savePref()"></div><button class="bk2" onclick="closeM()">← 戻る</button>`)}
function menuM(){md(`<h2>メニュー</h2><button class="mbn" onclick="yakuM()">役表</button><button class="mbn" onclick="rulesM()">ルール設定</button><button class="mbn" onclick="leave()">ロビーに戻る(退室)</button><button class="bk2" onclick="closeM()">← 閉じる</button>`)}

/* ---------- 描画 ---------- */
let PV=null,anim={};
function pick(t){const v=V,o=v.o||{};if(!(v.ph=='d'&&v.turn==v.me))return;
 if(ar&&!(o.rii||[]).includes(t))return;if(v.rii[v.me]&&t!=v.drawn)return;
 if(!pref.dbl||sel==t){sel=-1;const r=ar;ar=0;A({k:'d',t,r:r?1:0})}
 else{sel=t;document.querySelectorAll('#hd .mh').forEach(e=>e.classList.toggle('sel',+e.dataset.t==t))}}
function meldH(m,s,sz){const rel=(m.f-s+4)%4,call=m.t[0];
 if(m.cl)return m.t.map((t,j)=>j==0||j==3?`<span class="tl fd ${sz}"></span>`:T(t,sz)).join('');
 const o=m.t.slice(1).sort((a,b)=>a-b),pos=rel==3||m.t.length==3&&rel==0?0:rel==2?1:o.length,it=o.map(t=>T(t,sz));
 it.splice(Math.min(pos,it.length),0,`<span class="sw ${sz}">${T(call,sz)}</span>`);return it.join('')}
function prompt_(v){const o=v.o;if(!o)return'';const B=(t,c,f)=>`<button class="ab ${c}" onclick="${f}">${t}</button>`;let h='',tl='',sub='';
 if(v.ph=='c'){const l=[];if(o.ron)l.push('ロン');if(pref.naki){if(o.pon)l.push('ポン');if(o.chi)l.push('チー');if(o.kan)l.push('カン')}
  tl=`${T(v.lt,'sm')}<span>${esc(v.n[v.lf])}の「${KN[v.lt>>2]}」 — ${l.join('・')}できます</span>`;
  if(o.ron)h+=B('ロン','ron',"A({k:'ron'})");
  if(pref.naki){if(o.pon)h+=B('ポン','pon',"A({k:'pon'})");if(o.kan)h+=B('カン','kan',"A({k:'kan'})");
   if(o.chi)h+=B('チー','chi',o.chi.length>1?'chiS=!chiS;render(V)':"A({k:'chi',i:0})")}
  if(!h)return'';h+=B('パス','pass',"chiS=0;A({k:'pass'})");
  if(chiS&&o.chi)sub=o.chi.map((q,i)=>`<span class="pk" onclick="chiS=0;A({k:'chi',i:${i}})">${[q[0],q[1],v.lt>>2].sort((a,b)=>a-b).map(k=>T(k*4+1,'sm')).join('')}</span>`).join('')}
 else{if(o.tsumo)h+=B('ツモ','ron',"A({k:'tsumo'})");
  if(o.rii&&o.rii.length)h+=B(ar?'リーチ取消':'リーチ','rii','ar=!ar;sel=-1;render(V)');
  if(o.kan)h+=B('カン','kan',o.kan.length>1?'kanS=!kanS;render(V)':"A({k:'kan',i:0})");
  if(!h)return'';tl=o.tsumo?'和了できます!':ar?'リーチする牌を選んでください':'行動を選べます';
  if(kanS&&o.kan)sub=o.kan.map((x,i)=>`<span class="pk" onclick="kanS=0;A({k:'kan',i:${i}})">${T(x.k*4+1,'sm')}<br>${x.a?'暗槓':'加槓'}</span>`).join('')}
 return `<div class="pt">${tl}</div><div>${h}</div>${sub?`<div>${sub}</div>`:''}`}
const WN=(i,v)=>W[(i-v.dealer+4)%4];
function sbH(v,r,hands){return `<div class="sb">${[0,1,2,3].map(i=>{const d=r.ch[i];return `<div class="sc${i==v.me?' me':''}${r.w===i?' wn':''}"><span>${WN(i,v)}家 ${esc(v.n[i])}</span><b class="cu" data-a="${r.sc0[i]}" data-b="${v.sc[i]}">${r.sc0[i]}</b><em class="${d>0?'up':d<0?'dn':''}">${d?(d>0?'+':'')+d:'±0'}</em>${hands?`<div class="th">${r.tp[i]?r.hands[i].map(t=>T(t,'sm')).join(''):'<i>ノーテン</i>'}</div>`:''}</div>`}).join('')}</div>`}
function animCU(){if(!document.querySelectorAll||typeof requestAnimationFrame=='undefined')return;const t0=Date.now();
 const f=()=>{const p=Math.min(1,(Date.now()-t0-500)/900);document.querySelectorAll('.cu').forEach(e=>{const a=+e.dataset.a,b=+e.dataset.b;e.textContent=Math.round(a+(b-a)*(p<0?0:1-(1-p)*(1-p)))});if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
function resHTML(v){const r=v.res,lab=(v.kyoku<4?'東':'南')+NM[v.kyoku%4]+'局',
 nx=v.me==0?`<button class="go" onclick="A({k:'next'})">次の局へ</button>`:'<div class="wt">ホストが進めるのを待っています</div>';
 if(v.ph=='o'){const rk=[0,1,2,3].sort((a,b)=>v.sc[b]-v.sc[a]);return `<div class="rh">対局終了</div><div class="fin">${rk.map((i,n)=>`<div class="fr${n==0?' f1':''}"><i>${n+1}位</i><span>${esc(v.n[i])}</span><b>${v.sc[i]}</b></div>`).join('')}</div><button class="go" style="margin-top:30px" onclick="resetAll()">ロビーに戻る</button>`}
 if(r.draw)return `<div class="rh">${lab} ${r.ng.length?'流し満貫':'流局'}</div>${sbH(v,r,!r.ng.length)}<div class="nxt">${nx}</div>`;
 const w=r.w,ym=r.ym,lb=ym?(ym>=2?'ダブル役満':'役満'):r.h>=11?'三倍満':r.h>=8?'倍満':r.h>=6?'跳満':r.h>=5||(r.fu*2**(r.h+2)>=2000)?'満貫':'';
 const slot=(a)=>[0,1,2,3,4].map(i=>i<a.length?T(a[i],'rb'):'<span class="tl rb ob"></span>').join('');
 return `<div class="rh">${lab}　${WN(w,v)}家　${r.ts?'ツモ':'ロン'}和了</div>
 <div class="wh">${r.hands[w].map(t=>T(t,'rb')).join('')}<span class="gp"></span>${T(r.tile,'rb')}${v.melds[w].length?'<span class="gp"></span>'+v.melds[w].map(m=>meldH(m,w,'rb')).join('<span class="gp"></span>'):''}</div>
 <div class="wc"><b>${WN(w,v)}</b>${esc(v.n[w])}</div>
 <table class="yt">${r.y.map(x=>`<tr><td>${x[0]}</td><td>${x[1]>=26?'ダブル役満':x[1]>=13?'役満':x[1]+'翻'}</td></tr>`).join('')}</table>
 <div class="dsp"><h5>ドラ表示牌</h5><div>${slot(r.di)}</div><div>${slot(r.ui)}</div></div>
 <div class="pts"><div class="fh2">${ym?lb:r.fu+'符'+r.h+'翻'}${!ym&&lb?'　'+lb:''}</div><div class="pp"><b class="cu" data-a="0" data-b="${r.ch[w]}">0</b><small>点</small></div></div>
 ${sbH(v,r,false)}<div class="nxt">${nx}</div>`}
function render(v){V=v;AKAON=v.rule&&v.rule.aka===0?0:1;const now=Date.now();
 if(PV&&PV.river){for(let i=0;i<4;i++){const a=v.river[i],b=PV.river[i];if(a.length>b.length)anim.r={i,t:a[a.length-1],at:now}}if(v.drawn>=0&&v.drawn!=PV.drawn)anim.d={t:v.drawn,at:now}}
 PV=v;if(!(v.ph=='d'&&v.turn==v.me)){sel=-1;ar=0}
 const seat=q=>(v.me+q)%4,at=v.ph=='d'&&v.turn==v.me,o=v.o||{},rot=[0,-90,180,90],lab=(v.kyoku<4?'東':'南')+NM[v.kyoku%4]+'局',st=68-Math.ceil((v.wall+14)/2);
 let h=`<div class="tbl"><i class="fl"></i><i class="sd"></i><i class="sl"></i><i class="sr"></i></div>`;
 for(let q=0;q<4;q++){const i=seat(q),wd=(i-v.dealer+4)%4,j0=Math.max(0,st-wd*17),nw=17-j0;
  h+=`<div class="sg" style="transform:translateZ(1px) rotate(${rot[q]}deg)">`
  
  +`<div class="pad${v.turn==i&&(v.ph=='d'||v.ph=='c')?' on':''}${wd==0?' dl':''}"><span>${W[wd]}</span><b>${v.sc[i]}</b></div>`
  +(v.rii[i]?'<div class="stk"></div>':'')
  +`<div class="rvw">${v.river[i].map((t,j)=>{const nr=anim.r&&anim.r.i==i&&anim.r.t==t&&now-anim.r.at<600;return `<span class="rv${v.ri[i]==j?' rr':''}${t==v.lt?' lst':''}${nr?' new':''}">${T(t,'rt')}</span>`}).join('')}</div>`
  +(q?`<div class="ohw" style="left:${-(v.hn[i]*31+v.melds[i].reduce((a,m)=>a+m.t.length*31+8,0))/2}px">${'<span class="tl fd fh"></span>'.repeat(v.hn[i])}${v.melds[i].map(m=>'<span class="gp"></span>'+meldH(m,i,'rt')).join('')}</div>`:'')
  +`<div class="tgw"><div class="tg" style="transform:rotate(${-rot[q]}deg)">${esc(v.n[i])}${v.rii[i]?'<em>リーチ</em>':''}${i==v.me&&v.fu?'<em class="fu">フリテン</em>':''}</div></div></div>`}
 h+=`<div class="sg" style="transform:translateZ(1px)"><div class="cbx"><i class="cf"></i><i class="cb2"></i><i class="cl"></i><i class="cr"></i><div class="cbt"><s class="cn a"></s><s class="cn b"></s><s class="cn c"></s><s class="cn d"></s><div class="cm"><div class="rd">${lab}</div><div class="rm">残 ${v.wall}</div>${v.hb?`<div class="hb2">${v.hb}本場</div>`:''}</div></div></div></div>`;
 $('#plane').innerHTML=h;
 $('#hud').innerHTML=`<div class="hu"><div class="hr"><i class="sk r"></i><b>${v.pot}</b></div><div class="hr"><i class="sk"></i><b>${v.hb}</b></div><div class="drs">${[0,1,2,3,4].map(i=>i<v.dr.length?T(v.dr[i],'sm'):'<span class="tl sm ob"></span>').join('')}</div></div>`;
 $('#top').innerHTML=`<span class="rl">${v.room?'部屋 '+v.room:'ひとり'}</span><span class="tb" onclick="yakuM()">役表</span><span class="tb" onclick="rulesM()">ルール設定</span><span class="tb" onclick="menuM()">☰ メニュー</span>`;
 const ht=t=>{const can=at&&(!v.rii[v.me]||t==v.drawn)&&(!ar||(o.rii||[]).includes(t)),nd=anim.d&&anim.d.t==t&&now-anim.d.at<600;return T(t,'mh'+(sel==t?' sel':'')+(at&&!can?' dim':'')+(nd?' nw':''),`data-t="${t}" ${can?`onclick="pick(${t})"`:''}`)};
 $('#hd').innerHTML=`<div class="hrow">${v.hand.map(ht).join('')}${v.drawn>=0?'<span class="gp"></span>'+ht(v.drawn):''}${v.melds[v.me].map(m=>'<span class="gp"></span>'+meldH(m,v.me,'mm')).join('')}</div>`+(at?`<div class="hint">${pref.dbl?'牌をダブルクリックで捨てる':'牌をクリックで捨てる'}</div>`:'');
 $('#pr').innerHTML=prompt_(v);
 const ov=$('#ov'),was=ov.style.display=='flex'&&ov.dataset.k==v.sq+'/'+v.ph;
 if(v.ph=='e'||v.ph=='o'){if(!was){ov.innerHTML=resHTML(v);ov.dataset.k=v.sq+'/'+v.ph;animCU()}ov.style.display='flex'}else{ov.style.display='none';ov.dataset.k=''}
 if(v.ph=='c'&&v.o&&!pref.naki&&!v.o.ron&&lastAuto!=v.sq){lastAuto=v.sq;setTimeout(()=>A({k:'pass'}),60)}}
function fit(){const k=Math.min(innerWidth/1000,innerHeight/620);$('#st').style.transform=`scale(${k}) translate(-50%,-50%)`}
addEventListener('resize',fit);fit();theme();lobby();
