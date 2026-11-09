/* =====================================================================
   YUPASOFT · Exportar a Excel (reutilizable por todas las herramientas)

   Uso en cualquier página de Yupasoft:
     <script src="https://yupasoft.github.io/portal/exportar-excel.js"></script>
     YupaExcel.descargar({
       archivo: 'Yupasoft_Mi-tienda_2026-11-08',          // sin .xlsx
       hojas: [{
         nombre: 'Ventas',                                  // máx. 31 letras
         titulo: 'Ventas del mes',                          // franja superior
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
   Los datos que llegan aquí ya vienen filtrados por la base de datos: este archivo no decide quién puede ver qué.
   ===================================================================== */
(function () {
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
  const TINTA = 'FF0C1A2E', TURQ = 'FF159C86', CLARO = 'FFF4F7FA', BORDE = 'FFD5DFEA', GRIS = 'FF5A7086';
  const FORMATOS = {
    texto: '@', entero: '#,##0', decimal: '#,##0.00', moneda: '"S/" #,##0.00',
    porcentaje: '0.00%', fecha: 'dd/mm/yyyy', fechahora: 'dd/mm/yyyy hh:mm'
  };
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

  function armarHoja(wb, h) {
    const cols = h.columnas || [], filas = h.filas || [];
    const ws = wb.addWorksheet(nombreHoja(h.nombre), { views: [{ state: 'frozen', ySplit: 3, showGridLines: false }] });
    const n = Math.max(1, cols.length);

    // Franja de título, subtítulo y encabezados
    ws.mergeCells(1, 1, 1, n);
    const t = ws.getCell(1, 1); t.value = h.titulo || h.nombre || '';
    t.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
    t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TINTA } };
    t.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.getRow(1).height = 30;
    ws.mergeCells(2, 1, 2, n);
    const st = ws.getCell(2, 1);
    st.value = 'Generado el ' + new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short' }).format(new Date()) + ' · ' + filas.length + (filas.length === 1 ? ' fila' : ' filas') + ' · Yupasoft';
    st.font = { name: 'Calibri', size: 10, italic: true, color: { argb: GRIS } };
    st.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    const enc = ws.getRow(3); enc.height = 22;
    cols.forEach((c, i) => {
      const cell = enc.getCell(i + 1); cell.value = c.titulo || c.clave;
      cell.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TURQ } };
      cell.alignment = { vertical: 'middle', horizontal: ['entero', 'decimal', 'moneda', 'porcentaje'].includes(c.tipo) ? 'right' : 'left', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: BORDE } } };
    });

    // Datos
    filas.forEach((f, r) => {
      const row = ws.getRow(4 + r);
      cols.forEach((c, i) => {
        const cell = row.getCell(i + 1); const tipo = c.tipo || 'texto';
        cell.value = valor(tipo, f[c.clave]);
        cell.numFmt = FORMATOS[tipo] || '@';
        cell.font = { name: 'Calibri', size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: ['entero', 'decimal', 'moneda', 'porcentaje'].includes(tipo) ? 'right' : (['fecha', 'fechahora'].includes(tipo) ? 'center' : 'left'), wrapText: tipo === 'texto' };
        cell.border = { bottom: { style: 'thin', color: { argb: BORDE } } };
        if (r % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CLARO } };
      });
    });

    // Anchos y filtro
    cols.forEach((c, i) => {
      let w = c.ancho;
      if (!w) {
        w = String(c.titulo || c.clave || '').length + 3;
        filas.slice(0, 200).forEach(f => { const v = f[c.clave]; const l = v == null ? 0 : (c.tipo === 'fechahora' ? 16 : String(v).length); if (l + 2 > w) w = l + 2; });
        w = Math.min(Math.max(w, 11), 55);
      }
      ws.getColumn(i + 1).width = w;
    });
    if (cols.length) ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: cols.length } };
    ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  }

  async function descargar(cfg) {
    await cargarLibreria();
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Yupasoft'; wb.created = new Date();
    (cfg.hojas || []).forEach(h => armarHoja(wb, h));
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
