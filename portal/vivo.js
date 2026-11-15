/* =====================================================================
   YUPASOFT · Movimiento (común a todas las herramientas). Va junto con vivo.css.

     Vivo.entrar(elemento)   al CAMBIAR de sección: lo de adentro entra en cascada, los montos suben
                             contando desde cero y la línea del gráfico se dibuja.
   No hace nada si el equipo pide "reducir movimiento". Si este archivo no carga, la herramienta
   funciona igual, solo que quieta.
   ===================================================================== */
(function () {
  'use strict';
  const calma = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const CASCADA = '.card,.kpi,.it,.ev,.tw,.vacio,.cta,.selbar,.inicio,.nota';
  const MONTOS = '.kpi b,.heroe .num,.tengo .num,.total b,.cta .num';

  // Fondo: luces de la marca y la cuadrícula del logo encendiéndose
  function fondo() {
    if (document.querySelector('.vv-fondo') || !document.body) return;
    const f = document.createElement('div'); f.className = 'vv-fondo'; f.setAttribute('aria-hidden', 'true');
    let h = '', n = 0;
    for (let fila = 0; fila < 4; fila++) for (let c = 0; c < 4; c++) { const on = fila >= 3 - c; h += `<i class="${on ? 'on' : ''}${on && c === 3 && fila === 0 ? ' top' : ''}" style="--n:${on ? n++ : 0}"></i>`; }
    f.innerHTML = '<div class="vv-rej">' + h + '</div>';
    document.body.insertBefore(f, document.body.firstChild);
  }
  // Las fichas del logo se numeran para encenderse en orden
  function logos() {
    document.querySelectorAll('#logo svg, #gLogo svg').forEach(s => { if (s.dataset.vv) return; s.dataset.vv = 1; s.querySelectorAll('rect[fill^="#"]').forEach((r, i) => r.style.setProperty('--n', i)); });
  }

  // "S/ 2,000.00" sube contando desde cero. Solo textos simples con un número; lo demás no se toca.
  function contar(el) {
    if (el.children.length) return;
    const t = el.textContent, m = /^(\D*?)(\d[\d,]*)(\.\d+)?([\s\S]*)$/.exec(t);
    if (!m) return;
    const fin = parseFloat((m[2] + (m[3] || '')).replace(/,/g, '')), dec = m[3] ? m[3].length - 1 : 0;
    if (!(fin > 0)) return;
    const t0 = performance.now(), dur = 700;
    const paso = ahora => {
      if (!el.isConnected) return;
      const k = Math.min(1, (ahora - t0) / dur);
      if (k >= 1) { el.textContent = t; return; }
      el.textContent = m[1] + (fin * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + m[4];
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }
  // La línea del gráfico se dibuja de izquierda a derecha
  function trazar(p) {
    try {
      const L = p.getTotalLength(); if (!(L > 0)) return;
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.getBoundingClientRect();
      p.classList.add('vv-trazo'); p.style.strokeDashoffset = 0;
      setTimeout(() => { p.classList.remove('vv-trazo'); p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }, 1400);
    } catch (e) { }
  }

  // sel (opcional): qué elementos entran en cascada, para páginas que no usan los nombres de clase del kit
  function entrar(raiz, sel) {
    if (!raiz) return;
    fondo(); logos();
    if (calma()) return;
    raiz.classList.remove('vv-entra'); void raiz.offsetWidth; raiz.classList.add('vv-entra');
    let i = 0;
    raiz.querySelectorAll(sel || CASCADA).forEach(e => { if (sel) e.classList.add('vv-c'); e.style.setProperty('--vv-i', Math.min(i++, 18)); });
    raiz.querySelectorAll('.barras > div, .graf .g-p').forEach((e, k) => { (e.matches('.g-p') ? e : e.querySelector('i') || e).style.setProperty('--vv-b', Math.min(k, 14)); });
    raiz.querySelectorAll(MONTOS).forEach(contar);
    raiz.querySelectorAll('.graf .g-s').forEach(trazar);
    clearTimeout(raiz._vv); raiz._vv = setTimeout(() => raiz.classList.remove('vv-entra'), 1700);
  }

  /* ---------- Gráficos e íconos (devuelven HTML listo para poner en la página) ---------- */
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLORES = ['#2ED3B7', '#F2A93B', '#5B8DEF', '#B07CF0', '#FF7A70', '#4FD1A0', '#F2C94C', '#58C4DD', '#E98AC0', '#9BB0C9'];
  // Mismo texto, mismo color siempre (categorías, productos)
  const colorDe = t => { let h = 0; for (const c of String(t || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORES[h % COLORES.length]; };
  const ICO = {
    inicio: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    caja: '<path d="M20 7 12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 21V11"/>',
    carro: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11L21 7H6"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    grafico: '<path d="M3 3v18h18M7 15l4-5 3 3 5-7"/>',
    barras: '<path d="M5 20V10M11 20V4M17 20v-7M2 20h20"/>',
    tienda: '<path d="M3 9l1.5-5h15L21 9M4 9v11h16V9M3 9h18M9 20v-6h6v6"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    escaner: '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M7 8v8M11 8v8M14 8v8M17 8v8"/>',
    oferta: '<path d="M20 12 12 20l-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    bajar: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    entra: '<path d="M12 4v13M6 11l6 6 6-6"/>',
    sale: '<path d="M12 20V7M6 13l6-6 6 6"/>',
    cartera: '<path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14h2"/>',
    ahorro: '<path d="M4 10h16v10H4zM2 10l10-6 10 6M8 14v3M12 14v3M16 14v3"/>',
    alerta: '<path d="M12 3 2 20h20zM12 10v5M12 17.5v.5"/>',
    traslado: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    ajuste: '<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    pagos: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    flujo: '<path d="M3 17c4 0 4-10 9-10s5 10 9 10"/>',
    lista: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    moneda: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.6-1-1.5-1.5-2.7-1.5-1.6 0-2.6.8-2.6 2 0 2.8 5.6 1.2 5.6 4 0 1.2-1.1 2-2.8 2-1.3 0-2.4-.6-3-1.6M12 6v2M12 16v2"/>',
    sube: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  const ico = n => `<svg class="vv-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n] || ICO.caja}</svg>`;
  // Cuadrito con la inicial (o un ícono) y un color propio: producto, categoría, cuenta, tipo de movimiento
  const av = (texto, clave, clase) => `<span class="vv-av ${clase || ''}" ${clase ? '' : `style="--c:${colorDe(clave || texto)}"`} aria-hidden="true">${ICO[texto] ? ico(texto) : esc(String(texto || '?').trim().charAt(0).toUpperCase())}</span>`;
  // Marca redonda de una tarjeta de indicador
  const chip = (n, color) => `<span class="vv-chip" style="${color ? '--c:' + color : ''}">${ico(n)}</span>`;

  // Dona: datos [{n: nombre, v: valor, c?: color, a?: atributos para hacerla tocable}], centro (texto grande), sub (texto chico), f = formato
  function dona(datos, centro, sub, f) {
    f = f || (x => x);
    let d = (datos || []).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
    if (d.length > 6) { const resto = d.slice(5).reduce((a, x) => a + x.v, 0); d = d.slice(0, 5).concat([{ n: 'Otros', v: resto, c: '#9BB0C9' }]); }
    const tot = d.reduce((a, x) => a + x.v, 0), R = 42, C = 2 * Math.PI * R; let ac = 0;
    if (!tot) return '';
    const seg = d.map((x, k) => { const L = x.v / tot * C, o = -ac; ac += L; x.c = x.c || COLORES[k % COLORES.length];
      return `<circle class="seg" cx="50" cy="50" r="${R}" style="--c:${x.c};--d:${Math.max(0, L - (d.length > 1 ? 1.2 : 0)).toFixed(2)};--C:${C.toFixed(2)};--o:${o.toFixed(2)};--k:${k}"><title>${esc(x.n)}: ${esc(f(x.v))}</title></circle>`; }).join('');
    return `<div class="vv-dona"><div class="vv-dona-g"><svg viewBox="0 0 100 100" role="img" aria-label="${esc(sub || '')}"><circle class="pista" cx="50" cy="50" r="${R}"/>${seg}</svg>
      <div class="vv-dona-c"><b>${esc(centro)}</b><small>${esc(sub || '')}</small></div></div>
      <ul class="vv-ley">${d.map(x => `<li ${x.a ? x.a + ' role="button" tabindex="0" class="toca"' : ''}><i style="--c:${x.c}"></i><span>${esc(x.n)}</span><b>${esc(f(x.v))}</b><em>${Math.round(x.v / tot * 100)}%</em></li>`).join('')}</ul></div>`;
  }
  // Barras horizontales: datos [{n, v, t: texto a la derecha, s?: texto chico, c?: color, a?: atributos para hacerla tocable}]
  function barrasH(datos) {
    const max = Math.max(...(datos || []).map(x => x.v), 0) || 1;
    return `<div class="vv-bh">${(datos || []).map((x, k) => `<div class="f ${x.a ? 'toca' : ''}" ${x.a ? x.a + ' role="button" tabindex="0"' : ''}><span class="n">${esc(x.n)}</span><span class="v">${esc(x.t)}</span>
      <span class="p"><i style="width:${Math.max(2, x.v / max * 100).toFixed(1)}%;--c:${x.c || colorDe(x.n)};--k:${k}"></i></span>${x.s ? `<span class="s">${esc(x.s)}</span>` : ''}</div>`).join('')}</div>`;
  }
  // Barrita de nivel (stock contra su mínimo, avance de una meta): pct 0..100, clase '', 'bajo' o 'cero'
  const nivel = (pct, clase) => `<span class="vv-niv ${clase || ''}"><i style="width:${Math.max(0, Math.min(100, pct)).toFixed(0)}%"></i></span>`;
  // Dibujo para cuando no hay nada todavía
  const vacio = n => `<span class="vv-vacio">${ico(n)}</span>`;

  document.documentElement.classList.add('vv');
  if (document.body) { fondo(); logos(); } else document.addEventListener('DOMContentLoaded', () => { fondo(); logos(); });
  window.Vivo = { entrar, contar, calma, ico, av, chip, dona, barrasH, nivel, vacio, colorDe, COLORES };
})();
