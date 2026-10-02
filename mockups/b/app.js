(function(){
'use strict';
var BASE='../../',D=window.PORTFOLIO,page=document.body.dataset.page;
var cur=document.querySelector('nav.main a[data-n="'+(page==='about'?'about':'work')+'"]');
if(cur&&page==='about')cur.setAttribute('aria-current','page');
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
if(page==='about'){
  var a=D.about,im=new Image();im.src=BASE+a.md;im.alt='Portrait of Greg Kabulski';im.width=a.w;im.height=a.h;im.decoding='async';
  im.srcset=BASE+a.sm+' 480w, '+BASE+a.md+' 960w';im.sizes='(min-width:900px) 40vw, 100vw';
  var f=document.getElementById('portrait');f.insertBefore(im,f.firstChild);return;
}
var catLabel={};D.categories.forEach(function(c){catLabel[c.id]=c.label});
var sup='⁰¹²³⁴⁵⁶⁷⁸⁹';
function sp(n){return String(n).split('').map(function(d){return sup[d]}).join('')}
var filt=document.getElementById('filters'),grid=document.getElementById('grid');
var active='all',list=D.photos.slice();
var cats=[{id:'all',label:'All'}].concat(D.categories);
cats.forEach(function(c){
  var n=c.id==='all'?D.photos.length:D.photos.filter(function(p){return p.category===c.id}).length;
  var b=el('button');b.type='button';b.dataset.cat=c.id;
  var t=el('span','t',c.label);b.appendChild(t);b.appendChild(el('sup',null,n));
  b.addEventListener('click',function(){setFilter(c.id,true)});filt.appendChild(b);
});
function setFilter(id,push){
  if(id!=='all'&&!catLabel[id])id='all';
  active=id;list=id==='all'?D.photos.slice():D.photos.filter(function(p){return p.category===id});
  Array.prototype.forEach.call(filt.children,function(b){b.setAttribute('aria-pressed',b.dataset.cat===id)});
  if(push){try{history.replaceState(null,'',id==='all'?location.pathname+location.search:'#'+id)}catch(e){}}
  render();
}
function render(){
  grid.innerHTML='';
  var fr=document.createDocumentFragment();
  list.forEach(function(p,i){
    var li=document.createElement('li'),b=el('button','tile');b.type='button';
    b.setAttribute('aria-label',p.title+', '+catLabel[p.category]);
    var ph=el('span','ph');ph.style.background=p.color;
    var im=new Image();im.alt='';im.width=p.w;im.height=p.h;im.decoding='async';
    im.srcset=BASE+p.sm+' 480w, '+BASE+p.md+' 960w';im.sizes='(min-width:1100px) 22vw,(min-width:700px) 30vw,46vw';
    if(i<4){im.loading='eager';im.fetchPriority='high'}else im.loading='lazy';
    im.src=BASE+p.md;ph.appendChild(im);b.appendChild(ph);
    var cap=el('span','cap');cap.appendChild(el('span','ti',p.title));cap.appendChild(el('span','ct',catLabel[p.category]));b.appendChild(cap);
    b.addEventListener('click',function(){openLb(i,b)});li.appendChild(b);fr.appendChild(li);
  });
  grid.appendChild(fr);
}
window.addEventListener('hashchange',function(){setFilter(location.hash.slice(1),false)});
var h=location.hash.slice(1);setFilter(catLabel[h]?h:'all',false);
// lightbox
var lb=document.getElementById('lb'),img=document.getElementById('lbImg'),idx=0,opener=null;
function pre(i){var p=list[(i+list.length)%list.length];if(p){var x=new Image();x.src=BASE+p.lg}}
function show(i){
  idx=(i+list.length)%list.length;var p=list[idx];
  img.style.opacity=0;var n=new Image();
  n.onload=function(){img.src=n.src;img.alt=p.title;img.style.opacity=1};
  n.src=BASE+p.lg;
  document.getElementById('lbTitle').textContent=p.title;
  document.getElementById('lbMeta').textContent=[catLabel[p.category],p.exif,p.year].filter(Boolean).join('  ·  ');
  document.getElementById('lbCount').textContent=(idx+1)+' / '+list.length;
  pre(idx+1);pre(idx-1);
}
function openLb(i,from){
  opener=from;lb.hidden=false;lb.classList.add('open');document.body.classList.add('locked');
  requestAnimationFrame(function(){lb.classList.add('show')});show(i);document.getElementById('lbClose').focus();
}
function closeLb(){
  lb.classList.remove('show');document.body.classList.remove('locked');
  setTimeout(function(){lb.classList.remove('open');lb.hidden=true;img.removeAttribute('src')},300);
  if(opener)opener.focus();
}
document.getElementById('lbClose').onclick=closeLb;
document.getElementById('lbPrev').onclick=function(){show(idx-1)};
document.getElementById('lbNext').onclick=function(){show(idx+1)};
lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb-stage')||e.target.tagName==='FIGURE')closeLb()});
document.addEventListener('keydown',function(e){
  if(lb.hidden)return;
  if(e.key==='Escape')closeLb();
  else if(e.key==='ArrowLeft')show(idx-1);
  else if(e.key==='ArrowRight')show(idx+1);
  else if(e.key==='Tab'){
    var f=Array.prototype.filter.call(lb.querySelectorAll('button'),function(b){return b.offsetParent!==null});
    var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
var sx=null;
lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
lb.addEventListener('touchend',function(e){if(sx==null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)show(idx+(dx<0?1:-1))});
})();
