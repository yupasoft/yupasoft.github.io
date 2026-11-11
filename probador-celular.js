/* Yupasoft · Panel "vista celular"
   Botón 📱 discreto que abre un panel lateral con ESTA misma pantalla dentro de un marco de celular.
   Activarlo en cualquier página de Yupasoft (una sola línea, antes de </body>):
       <script src="/probador-celular.js" defer></script>
   Un solo archivo para todos los proyectos: al mejorarlo aquí, se mejora en todos.
   - No aparece dentro del propio panel (evita el espejo infinito), ni en pantalla completa, ni al imprimir.
   - Opciones en la etiqueta: data-modelo="1" (0..4, modelo inicial) y data-oculto="1" (solo con ?probar=1). */
(function(){
  if(window.top!==window.self||window.__ypcCel)return;
  window.__ypcCel=1;
  var tag=document.currentScript||{getAttribute:function(){return null}};
  var oculto=tag.getAttribute&&tag.getAttribute('data-oculto')==='1';
  if(oculto&&!/[?&]probar=1/.test(location.search))return;

  var DEV=[["Android chico · 360×800",360,800],["iPhone 14 · 390×844",390,844],["Android grande · 412×915",412,915],["iPhone SE · 375×667",375,667],["Tablet · 768×1024",768,1024]];
  var st={rot:false,i:+(tag.getAttribute&&tag.getAttribute('data-modelo'))||1,abierto:false};
  try{var g=localStorage.getItem('ypc_panel_modelo');if(g!==null&&DEV[+g])st.i=+g}catch(e){}

  var host=document.createElement('div');
  host.style.cssText='all:initial;position:fixed;z-index:2147483000;top:0;left:0;width:0;height:0';
  var R=host.attachShadow({mode:'open'});
  R.innerHTML=
  '<style>'+
  ':host{all:initial}*{box-sizing:border-box}'+
  '.fab{position:fixed;left:12px;bottom:12px;width:38px;height:38px;border-radius:50%;border:1px solid #243B58;background:#0C1A2E;color:#2ED3B7;font-size:18px;line-height:1;cursor:pointer;opacity:.45;transition:opacity .2s;box-shadow:0 2px 10px rgba(0,0,0,.35)}'+
  '.fab:hover,.fab:focus-visible{opacity:1;outline:2px solid #2ED3B7}'+
  '.pnl{position:fixed;top:0;right:0;height:100%;width:min(480px,100vw);background:#0C1A2E;color:#F4F7FA;border-left:1px solid #243B58;box-shadow:-10px 0 40px rgba(0,0,0,.5);display:none;flex-direction:column;font:13px Sora,system-ui,Segoe UI,Arial,sans-serif}'+
  '.pnl.on{display:flex}'+
  '.top{display:flex;align-items:center;gap:8px;padding:9px 10px;background:#152741;border-bottom:1px solid #243B58;flex-wrap:wrap}'+
  '.lg{display:flex;align-items:center;gap:7px;font-weight:800;font-size:13px;margin-right:auto}.lg svg{width:22px;height:22px;border-radius:6px}'+
  '.lg small{display:block;font:400 9px "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:#F2A93B;margin-top:1px}'+
  'select,button.b{background:#0C1A2E;color:#F4F7FA;border:1px solid #243B58;border-radius:7px;padding:6px 8px;font:inherit;cursor:pointer}'+
  'button.b:hover,select:hover{border-color:#2ED3B7}'+
  'button.x{background:#2ED3B7;color:#0C1A2E;border-color:#2ED3B7;font-weight:700}'+
  '.cuerpo{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;align-items:center;padding:14px 10px;background:radial-gradient(ellipse at 50% 0%,#14304a 0%,#0C1A2E 70%)}'+
  '.frame{background:#050c16;border-radius:38px;box-shadow:0 10px 30px rgba(0,0,0,.45),0 0 0 1px #243B58;position:relative;flex:none}'+
  '.frame:before{content:"";position:absolute;left:50%;transform:translateX(-50%);background:#243B58;border-radius:3px}'+
  '.scr{background:#fff;overflow:hidden}'+
  'iframe{border:0;display:block;background:#fff;transform-origin:top left}'+
  '.inf{margin-top:8px;color:#9BB0C9;font:11px "IBM Plex Mono",monospace;text-align:center}'+
  '@media print{.fab,.pnl{display:none!important}}'+
  '</style>'+
  '<button class="fab" id="fab" title="Ver en vista celular" aria-label="Ver en vista celular">📱</button>'+
  '<div class="pnl" id="pnl" role="dialog" aria-label="Vista celular">'+
    '<div class="top">'+
      '<div class="lg"><svg viewBox="0 0 130 130"><rect width="130" height="130" rx="28.6" fill="#0C1A2E"/><g fill="#2ED3B7"><rect x="16" y="94" width="20" height="20" rx="5.6"/><rect x="42" y="68" width="20" height="20" rx="5.6"/><rect x="42" y="94" width="20" height="20" rx="5.6"/><rect x="68" y="42" width="20" height="20" rx="5.6"/><rect x="68" y="68" width="20" height="20" rx="5.6"/><rect x="68" y="94" width="20" height="20" rx="5.6"/><rect x="94" y="42" width="20" height="20" rx="5.6"/><rect x="94" y="68" width="20" height="20" rx="5.6"/><rect x="94" y="94" width="20" height="20" rx="5.6"/></g><rect x="94" y="16" width="20" height="20" rx="5.6" fill="#F2A93B"/></svg><div>Yupasoft<small>Vista celular</small></div></div>'+
      '<select id="mod" aria-label="Modelo"></select>'+
      '<button class="b" id="rot" title="Girar">⟲</button>'+
      '<button class="b" id="rel" title="Recargar">↻</button>'+
      '<button class="b x" id="cer" title="Cerrar (Esc)">✕</button>'+
    '</div>'+
    '<div class="cuerpo" id="cue"></div>'+
  '</div>';

  var $=function(i){return R.getElementById(i)};
  var sel=$('mod');
  DEV.forEach(function(d,i){var o=document.createElement('option');o.value=i;o.textContent=d[0];sel.appendChild(o)});
  sel.value=st.i;

  function dibujar(){
    var cue=$('cue');cue.innerHTML='';
    if(!st.abierto)return;
    var d=DEV[st.i],w=st.rot?d[2]:d[1],h=st.rot?d[1]:d[2];
    var padV=14,padH=10,extra=30;
    var aw=cue.clientWidth-20,ah=cue.clientHeight-28-extra;
    var z=Math.max(.3,Math.min(1.5,ah/(h+2*padV),aw/(w+2*padH)));
    var fr=document.createElement('div');fr.className='frame';
    fr.style.padding=(padV*z)+'px '+(padH*z)+'px';fr.style.borderRadius=(38*z)+'px';
    var nt=document.createElement('style');
    nt.textContent='.frame:before{top:'+(6*z)+'px;width:'+(70*z)+'px;height:'+(5*z)+'px}';
    var sc=document.createElement('div');sc.className='scr';
    sc.style.width=(w*z)+'px';sc.style.height=(h*z)+'px';sc.style.borderRadius=(24*z)+'px';
    var f=document.createElement('iframe');f.style.width=w+'px';f.style.height=h+'px';f.style.transform='scale('+z+')';
    f.src=location.href;
    sc.appendChild(f);fr.appendChild(nt);fr.appendChild(sc);cue.appendChild(fr);
    var inf=document.createElement('div');inf.className='inf';
    inf.textContent=w+' × '+h+' px · vista al '+Math.round(z*100)+'%';cue.appendChild(inf);
  }
  function abrir(){st.abierto=true;$('pnl').classList.add('on');dibujar();$('cer').focus()}
  function cerrar(){st.abierto=false;$('pnl').classList.remove('on');$('cue').innerHTML='';$('fab').focus()}

  $('fab').onclick=abrir;
  $('cer').onclick=cerrar;
  $('rel').onclick=dibujar;
  $('rot').onclick=function(){st.rot=!st.rot;dibujar()};
  sel.onchange=function(){st.i=+sel.value;try{localStorage.setItem('ypc_panel_modelo',st.i)}catch(e){}dibujar()};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&st.abierto)cerrar()});
  var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(dibujar,150)});

  // El botón no debe verse en pantalla completa (por ejemplo, la pantalla LED) ni en la app instalada.
  function visibilidad(){
    var fs=!!(document.fullscreenElement||document.webkitFullscreenElement);
    var app=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches;
    $('fab').style.display=(fs||app)&&!st.abierto?'none':'';
  }
  document.addEventListener('fullscreenchange',visibilidad);
  document.addEventListener('webkitfullscreenchange',visibilidad);
  visibilidad();

  function montar(){document.body.appendChild(host)}
  if(document.body)montar();else document.addEventListener('DOMContentLoaded',montar);
})();
