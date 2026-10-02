(function(){
'use strict';
var BASE='../../',D=window.PORTFOLIO,P=D.photos,C=D.categories;
var $=function(i){return document.getElementById(i)};
var pad=function(n){return String(n).padStart(3,'0')};
var catLabel=function(id){for(var i=0;i<C.length;i++)if(C[i].id===id)return C[i].label;return id};
var catIdx=function(id){for(var i=0;i<C.length;i++)if(C[i].id===id)return i+1;return 0};
P.forEach(function(p,i){p.n=i+1});

// about page
if($('aboutImg')){var a=D.about,im=$('aboutImg');im.src=BASE+a.md;im.srcset=BASE+a.sm+' 480w, '+BASE+a.md+' 960w';im.sizes='(min-width:900px) 420px, 90vw';return}
if(!$('grid'))return;

var cur='all',list=P.slice(),grid=$('grid'),lastW=0;
$('nFrames').textContent=P.length;$('nStages').textContent=C.length;

// hero pins
var cyc=P.filter(function(p){return p.category==='cycling'}),pick=[cyc[0],cyc[2],cyc[5]||cyc[1]];
$('pins').innerHTML=pick.map(function(p){return '<figure class="pin"><img src="'+BASE+p.md+'" srcset="'+BASE+p.sm+' 480w,'+BASE+p.md+' 960w" sizes="(min-width:900px) 17vw, 30vw" width="'+p.w+'" height="'+p.h+'" alt="" fetchpriority="high"><figcaption>#'+pad(p.n)+'</figcaption></figure>'}).join('');

// chips
function counts(id){return id==='all'?P.length:P.filter(function(p){return p.category===id}).length}
var chips=$('chips');
chips.innerHTML='<button class="chip" data-c="all" aria-pressed="false"><i>ALL</i> Full route <small>'+P.length+'</small></button>'+C.map(function(c,i){return '<button class="chip" data-c="'+c.id+'" aria-pressed="false"><i>ST.'+pad(i+1).slice(1)+'</i> '+c.label+' <small>'+counts(c.id)+'</small></button>'}).join('');
chips.addEventListener('click',function(e){var b=e.target.closest('.chip');if(b)setFilter(b.dataset.c,true)});
function setFilter(id,push){
  if(id!=='all'&&!C.some(function(c){return c.id===id}))id='all';
  cur=id;list=id==='all'?P.slice():P.filter(function(p){return p.category===id});
  Array.prototype.forEach.call(chips.children,function(b){b.setAttribute('aria-pressed',b.dataset.c===id)});
  $('count').textContent=list.length+' frames · '+(id==='all'?'all stages':catLabel(id));
  if(push)history.replaceState(null,'',id==='all'?location.pathname+location.search:'#'+id);
  layout(true);
}

// justified rows
var GAP=6;
function layout(force){
  var W=grid.clientWidth;if(!W)return;
  if(!force&&W===lastW)return;lastW=W;
  var target=W<600?180:W<1000?230:280,rows=[],row=[],ar=0;
  list.forEach(function(p){
    row.push(p);ar+=p.w/p.h;
    var h=(W-GAP*(row.length-1))/ar;
    if(h<=target){rows.push({items:row,h:h});row=[];ar=0}
  });
  var html='',idx=0;
  rows.forEach(function(r){html+='<div class="row" style="height:'+r.h.toFixed(1)+'px">'+r.items.map(function(p){return tile(p,r.h,idx++)}).join('')+'</div>'});
  if(row.length){ // last row: keep target height unless nearly full
    var h2=(W-GAP*(row.length-1))/ar,hh=Math.min(h2,target);
    html+='<div class="row" style="height:'+hh.toFixed(1)+'px">'+row.map(function(p){return tile(p,hh,idx++)}).join('')+'</div>'}
  grid.innerHTML=html||'<noscript></noscript>';
}
function tile(p,h,i){
  var w=Math.floor(h*p.w/p.h*100)/100,eager=i<4;
  var flex=' style="width:'+w.toFixed(2)+'px;'+'height:'+h.toFixed(1)+'px;background:'+p.color+';animation-delay:'+Math.min(i*25,300)+'ms"';
  return '<button class="tile" data-id="'+p.id+'"'+flex+' aria-label="Open #'+pad(p.n)+' '+esc(p.title)+'"><img src="'+BASE+p.md+'" srcset="'+BASE+p.sm+' 480w,'+BASE+p.md+' 960w" sizes="'+Math.ceil(w)+'px" width="'+p.w+'" height="'+p.h+'" alt="'+esc(p.title)+'" '+(eager?'loading="eager" fetchpriority="high"':'loading="lazy"')+' decoding="async"><span class="bib">#'+pad(p.n)+'</span><span class="cap"><b>'+esc(p.title)+'</b><span>'+esc(p.exif)+'</span></span></button>'
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
// scale tiles of last row & widths: rows are flex; ensure exact fill by letting widths sum (rounding negligible)
var t;if('ResizeObserver'in window){new ResizeObserver(function(){clearTimeout(t);t=setTimeout(function(){layout(false)},120)}).observe(grid)}
else window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(function(){layout(false)},120)});

grid.addEventListener('click',function(e){var b=e.target.closest('.tile');if(b)openLb(b.dataset.id,b)});
window.addEventListener('hashchange',function(){setFilter(location.hash.slice(1)||'all',false)});

// lightbox
var lb=$('lb'),img=$('lbImg'),pos=0,opener=null;
function show(i){
  pos=(i+list.length)%list.length;var p=list[pos];
  img.style.setProperty('--lbcolor',p.color);img.alt=p.title;img.src=BASE+p.lg;
  $('lbNo').textContent='#'+pad(p.n)+' / '+pad(P.length);
  $('lbTitle').textContent=p.title;
  $('lbCat').textContent='ST.'+pad(catIdx(p.category)).slice(1)+' '+catLabel(p.category);
  $('lbExif').textContent=p.exif;$('lbYear').textContent=p.year;
  [1,-1].forEach(function(d){var q=list[(pos+d+list.length)%list.length];(new Image()).src=BASE+q.lg});
}
function openLb(id,from){
  pos=Math.max(0,list.map(function(p){return p.id}).indexOf(id));opener=from;
  lb.hidden=false;lb.classList.add('open');document.body.classList.add('lock');show(pos);$('lbClose').focus();
}
function closeLb(){lb.classList.remove('open');lb.hidden=true;document.body.classList.remove('lock');if(opener&&document.contains(opener))opener.focus();else{var t=grid.querySelector('.tile');}}
$('lbClose').onclick=closeLb;
$('lbPrev').onclick=$('lbSidePrev').onclick=function(){show(pos-1)};
$('lbNext').onclick=$('lbSideNext').onclick=function(){show(pos+1)};
lb.addEventListener('click',function(e){if(e.target===lb||e.target===$('stage'))closeLb()});
document.addEventListener('keydown',function(e){
  if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')closeLb();
  else if(e.key==='ArrowLeft')show(pos-1);
  else if(e.key==='ArrowRight')show(pos+1);
  else if(e.key==='Tab'){var f=Array.prototype.filter.call(lb.querySelectorAll('button'),function(b){return b.offsetParent!==null});
    if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
});
var sx=null;
lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
lb.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)show(pos+(dx<0?1:-1))});

setFilter(location.hash.slice(1)||'all',false);
})();
