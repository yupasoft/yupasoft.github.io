/* =====================================================================
   YUPASOFT · Exportar a Excel (reutilizable por todas las herramientas)

   Uso en cualquier página de Yupasoft:
     <script src="https://yupasoft.github.io/portal/exportar-excel.js"></script>
     YupaExcel.descargar({
       archivo: 'Yupasoft_Mi-tienda_2026-11-08',          // sin .xlsx
       hojas: [{
         nombre: 'Ventas',                                  // máx. 31 letras
         titulo: 'Ventas del mes',                          // franja superior, debajo del logo
         columnas: [
           { clave: 'fecha',  titulo: 'Fecha',   tipo: 'fechahora' },
           { clave: 'codigo', titulo: 'Código',  tipo: 'texto' },     // texto: Excel NO lo convierte en fecha
           { clave: 'cant',   titulo: 'Cant.',   tipo: 'entero' },
           { clave: 'total',  titulo: 'Total',   tipo: 'moneda' },
           { clave: 'margen', titulo: 'Margen',  tipo: 'porcentaje' }  // valor como fracción: 0.25 = 25 %
         ],
         filas: [ { fecha: '2026-11-08T15:30:00Z', codigo: '0012', cant: 3, total: 45.5, margen: 0.25 } ]
       }]
     });
   Tipos: texto, entero, decimal, moneda (S/), porcentaje, fecha (AAAA-MM-DD), fechahora (ISO, se muestra en hora de Lima).
   Formato Yupasoft (igual en todas las herramientas): fila 1 franja Tinta con el logo, fila 2 el título, fila 3 la fecha y
   el conteo, fila 4 los encabezados en turquesa con filtro, datos desde la fila 5 con filas alternas. Las 4 primeras filas
   quedan congeladas y se repiten al imprimir.
   Los datos que llegan aquí ya vienen filtrados por la base de datos: este archivo no decide quién puede ver qué.
   ===================================================================== */
(function () {
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
  const TINTA = 'FF0C1A2E', TURQ = 'FF159C86', CLARO = 'FFF4F7FA', BORDE = 'FFD5DFEA', GRIS = 'FF5A7086';
  const FORMATOS = {
    texto: '@', entero: '#,##0', decimal: '#,##0.00', moneda: '"S/" #,##0.00',
    porcentaje: '0.00%', fecha: 'dd/mm/yyyy', fechahora: 'dd/mm/yyyy hh:mm'
  };
  // Logo Yupasoft (isotipo + letras en blanco, fondo transparente) para la franja Tinta. 711 × 101 px.
  const LOGO = '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';
  const LOGO_ALTO = 24, LOGO_ANCHO = Math.round(LOGO_ALTO * 711 / 101), ANCHO_MIN = 30;   // ANCHO_MIN: letras; para que el logo no se salga de la franja
  const ENC = 4;                                                                          // fila de los encabezados
  let cargando = null;

  function cargarLibreria() {
    if (window.ExcelJS) return Promise.resolve();
    if (!cargando) cargando = new Promise((ok, mal) => {
      const s = document.createElement('script'); s.src = CDN;
      s.onload = ok; s.onerror = () => { cargando = null; mal(new Error('No se pudo preparar el Excel. Revisa tu internet e inténtalo otra vez.')); };
      document.head.appendChild(s);
    });
    return cargando;
  }

  // Un instante se muestra como la hora de Lima (Excel no guarda zona horaria)
  function limaComoUTC(iso) {
    const d = new Date(iso); if (isNaN(d)) return null;
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).reduce((a, x) => (a[x.type] = x.value, a), {});
    return new Date(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second));
  }
  function soloFecha(v) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v)); if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  }
  function valor(tipo, v) {
    if (v === null || v === undefined || v === '') return null;
    switch (tipo) {
      case 'entero': case 'decimal': case 'moneda': case 'porcentaje': { const n = Number(v); return isNaN(n) ? String(v) : n; }
      case 'fecha': return soloFecha(v) || String(v);
      case 'fechahora': return limaComoUTC(v) || String(v);
      default: return typeof v === 'boolean' ? (v ? 'Sí' : 'No') : String(v);
    }
  }
  const nombreHoja = t => String(t || 'Hoja').replace(/[\[\]:*?\/\\]/g, ' ').trim().slice(0, 31) || 'Hoja';
  const nombreArchivo = t => String(t || 'Yupasoft').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'Yupasoft';

  function armarHoja(wb, h, logo) {
    const cols = h.columnas || [], filas = h.filas || [];
    const ws = wb.addWorksheet(nombreHoja(h.nombre), { views: [{ state: 'frozen', ySplit: ENC, showGridLines: false }], properties: { tabColor: { argb: TURQ } } });
    const n = Math.max(1, cols.length);
    const tinta = { type: 'pattern', pattern: 'solid', fgColor: { argb: TINTA } };

    // Fila 1: franja con el logo. Fila 2: título. Fila 3: fecha y conteo. Fila 4: encabezados.
    ws.mergeCells(1, 1, 1, n);
    ws.getCell(1, 1).fill = tinta;
    ws.getRow(1).height = 36;
    ws.addImage(logo, { tl: { col: 0.12, row: 0.25 }, ext: { width: LOGO_ANCHO, height: LOGO_ALTO }, editAs: 'oneCell' });
    ws.mergeCells(2, 1, 2, n);
    const t = ws.getCell(2, 1); t.value = h.titulo || h.nombre || '';
    t.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    t.fill = tinta;
    t.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.getRow(2).height = 26;
    ws.mergeCells(3, 1, 3, n);
    const st = ws.getCell(3, 1);
    st.value = 'Generado el ' + new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short' }).format(new Date()) + ' · ' + filas.length + (filas.length === 1 ? ' fila' : ' filas') + ' · Yupasoft';
    st.font = { name: 'Calibri', size: 10, italic: true, color: { argb: GRIS } };
    st.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CLARO } };
    st.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.getRow(3).height = 20;
    const enc = ws.getRow(ENC); enc.height = 24;
    cols.forEach((c, i) => {
      const cell = enc.getCell(i + 1); cell.value = c.titulo || c.clave;
      cell.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TURQ } };
      cell.alignment = { vertical: 'middle', horizontal: ['entero', 'decimal', 'moneda', 'porcentaje'].includes(c.tipo) ? 'right' : 'left', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: BORDE } }, right: { style: 'thin', color: { argb: 'FF3BB5A2' } } };
    });

    // Datos
    filas.forEach((f, r) => {
      const row = ws.getRow(ENC + 1 + r);
      cols.forEach((c, i) => {
        const cell = row.getCell(i + 1); const tipo = c.tipo || 'texto';
        cell.value = valor(tipo, f[c.clave]);
        cell.numFmt = FORMATOS[tipo] || '@';
        cell.font = { name: 'Calibri', size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: ['entero', 'decimal', 'moneda', 'porcentaje'].includes(tipo) ? 'right' : (['fecha', 'fechahora'].includes(tipo) ? 'center' : 'left'), wrapText: tipo === 'texto' };
        cell.border = { bottom: { style: 'thin', color: { argb: BORDE } }, right: { style: 'thin', color: { argb: BORDE } } };
        if (r % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CLARO } };
      });
    });

    // Anchos y filtro
    let total = 0;
    cols.forEach((c, i) => {
      let w = c.ancho;
      if (!w) {
        w = String(c.titulo || c.clave || '').length + 6;   // + la flecha del filtro
        filas.slice(0, 200).forEach(f => { const v = f[c.clave]; const l = v == null ? 0 : (c.tipo === 'fechahora' ? 16 : String(v).length); if (l + 3 > w) w = l + 3; });
        w = Math.min(Math.max(w, 11), 55);
      }
      if (i === cols.length - 1 && total + w < ANCHO_MIN) w = ANCHO_MIN - total;
      total += w;
      ws.getColumn(i + 1).width = w;
    });
    if (!cols.length) ws.getColumn(1).width = ANCHO_MIN;
    if (cols.length) ws.autoFilter = { from: { row: ENC, column: 1 }, to: { row: ENC, column: cols.length } };
    ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:' + ENC };
  }

  async function descargar(cfg) {
    await cargarLibreria();
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Yupasoft'; wb.created = new Date();
    wb.company = 'Yupasoft';
    const logo = wb.addImage({ base64: LOGO, extension: 'png' });
    (cfg.hojas || []).forEach(h => armarHoja(wb, h, logo));
    if (!wb.worksheets.length) throw new Error('No hay nada que exportar');
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = nombreArchivo(cfg.archivo) + '.xlsx';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  }

  window.YupaExcel = { descargar, nombreArchivo };
})();
