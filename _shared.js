/**
 * _shared.js
 * Librería común para todos los paneles autenticados de Copa Bon Bon Bum 2026.
 *
 * Lo que provee:
 *   - API_URL y apiCall()    para llamar al backend
 *   - Auth helpers           login, logout, getToken, requireAuth
 *   - CSS común              variables, botones, formularios, modales
 *   - Helpers de UI          toast, modal, escudo, fechas, escapeHtml
 *
 * Cargar en cada HTML autenticado con:
 *   <script src="_shared.js"></script>
 */

// ════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════

const API_URL = 'https://script.google.com/macros/s/AKfycbyQY6eVJjE1CqAFCnrdnwnN4UiGqcTzr6W-vPhZNJpLZ4WuWVXCiMk3N1hkzTal0f3Y/exec';

const ROLES = {
  ADMIN: 'ADMIN',
  PLANILLADOR: 'PLANILLADOR',
  ENTRENADOR: 'ENTRENADOR'
};

// ════════════════════════════════════════════════════════════════
// API CLIENT
// ════════════════════════════════════════════════════════════════

async function apiCall(action, params = {}) {
  const token = sessionGet('token');
  const esLectura = /^(listar|obtener|get|ping)/i.test(action);

  try {
    let response;
    if (esLectura) {
      const url = new URL(API_URL);
      url.searchParams.set('action', action);
      if (token) url.searchParams.set('token', token);
      for (const k in params) {
        if (params[k] !== undefined && params[k] !== null) {
          url.searchParams.set(k, params[k]);
        }
      }
      response = await fetch(url.toString(), { method: 'GET' });
    } else {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, token, params })
      });
    }

    const json = await response.json();

    if (json.codigo === 'AUTH_REQUIRED') {
      sessionClear();
      window.location.href = 'login.html?reason=expired';
      return json;
    }

    return json;
  } catch (e) {
    console.error('API error:', e);
    return {
      success: false,
      mensaje: 'Error de conexión: ' + e.message,
      codigo: 'NETWORK_ERROR'
    };
  }
}

// ════════════════════════════════════════════════════════════════
// SESSION STORAGE
// ════════════════════════════════════════════════════════════════

const SESSION_PREFIX = 'bbb_';

function sessionSet(key, value) {
  try { sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(value)); }
  catch (e) { console.warn('No se pudo guardar en sessionStorage:', e); }
}

function sessionGet(key) {
  try {
    const v = sessionStorage.getItem(SESSION_PREFIX + key);
    return v ? JSON.parse(v) : null;
  } catch (e) { return null; }
}

function sessionClear() {
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(SESSION_PREFIX)) keys.push(k);
    }
    keys.forEach(k => sessionStorage.removeItem(k));
  } catch (e) {}
}

// ════════════════════════════════════════════════════════════════
// AUTH HELPERS
// ════════════════════════════════════════════════════════════════

function requireAuth(rolesPermitidos) {
  const token = sessionGet('token');
  const rol = sessionGet('rol');

  if (!token || !rol) {
    window.location.href = 'login.html?reason=no_auth';
    return false;
  }
  if (rolesPermitidos && rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
    window.location.href = 'login.html?reason=forbidden';
    return false;
  }
  return true;
}

async function logout() {
  await apiCall('logout');
  sessionClear();
  window.location.href = 'login.html';
}

function getRol()      { return sessionGet('rol'); }
function getUsuario()  { return sessionGet('usuario'); }
function getNombre()   { return sessionGet('nombre'); }
function getIdEquipo() { return sessionGet('id_equipo'); }

// ════════════════════════════════════════════════════════════════
// CSS COMÚN
// ════════════════════════════════════════════════════════════════

(function inyectarCSS() {
  if (document.getElementById('bbb-shared-css')) return;

  const css = `
    :root {
      --rojo:        #E30613;
      --rojo-osc:    #B5050F;
      --amarillo:    #FFCC00;
      --amarillo-osc:#E6B800;
      --verde:       #2DA94F;
      --verde-osc:   #1F8A3D;
      --texto:       #1A1A1A;
      --texto-2:     #4A4A4A;
      --gris:        #707070;
      --gris-cl:     #E8E8E8;
      --gris-bg:     #F5F5F5;
      --bg:          #FFFBF2;
      --blanco:      #FFFFFF;
      --shadow:      0 2px 8px rgba(0,0,0,0.06);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Mulish', sans-serif;
      background: var(--bg);
      color: var(--texto);
      line-height: 1.55;
      font-size: 15px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 20px;
      border: none;
      border-radius: 100px;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      white-space: nowrap;
    }
    .btn-primario { background: var(--rojo); color: var(--blanco); box-shadow: 0 3px 0 var(--rojo-osc); }
    .btn-primario:hover { transform: translateY(-2px); box-shadow: 0 5px 0 var(--rojo-osc); }
    .btn-primario:active { transform: translateY(1px); box-shadow: 0 1px 0 var(--rojo-osc); }
    .btn-amarillo { background: var(--amarillo); color: var(--texto); box-shadow: 0 3px 0 var(--amarillo-osc); }
    .btn-amarillo:hover { transform: translateY(-2px); box-shadow: 0 5px 0 var(--amarillo-osc); }
    .btn-verde { background: var(--verde); color: var(--blanco); box-shadow: 0 3px 0 var(--verde-osc); }
    .btn-verde:hover { transform: translateY(-2px); box-shadow: 0 5px 0 var(--verde-osc); }
    .btn-secundario { background: var(--blanco); color: var(--texto); border: 2px solid var(--gris-cl); }
    .btn-secundario:hover { border-color: var(--texto); }
    .btn-peligro { background: var(--blanco); color: var(--rojo); border: 2px solid var(--rojo); }
    .btn-peligro:hover { background: var(--rojo); color: var(--blanco); }
    .btn-sm { padding: 7px 14px; font-size: 12px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

    .form-grupo { margin-bottom: 18px; }
    .form-label {
      display: block;
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--texto);
      margin-bottom: 6px;
    }
    .form-label .req { color: var(--rojo); }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 11px 14px;
      border: 2px solid var(--gris-cl);
      border-radius: 10px;
      font-size: 14px;
      font-family: 'Mulish', sans-serif;
      background: var(--blanco);
      transition: all 0.2s;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--rojo);
      box-shadow: 0 0 0 3px rgba(227,6,19,0.1);
    }
    .form-textarea { min-height: 80px; resize: vertical; }
    .form-help { font-size: 12px; color: var(--gris); margin-top: 4px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid var(--gris-cl);
    }

    .card {
      background: var(--blanco);
      border: 1px solid var(--gris-cl);
      border-radius: 16px;
      padding: 24px;
      box-shadow: var(--shadow);
    }
    .card-titulo {
      font-family: 'Nunito', sans-serif;
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 2px solid var(--gris-cl);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-title {
      font-family: 'Nunito', sans-serif;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .page-subtitle { color: var(--gris); font-size: 14px; margin-top: 4px; }

    .tabla-wrap {
      background: var(--blanco);
      border: 1px solid var(--gris-cl);
      border-radius: 16px;
      overflow: hidden;
      overflow-x: auto;
      box-shadow: var(--shadow);
    }
    table.tabla { width: 100%; border-collapse: collapse; }
    table.tabla th {
      background: var(--texto);
      color: var(--blanco);
      text-align: left;
      padding: 12px 14px;
      font-size: 11px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      font-weight: 800;
      font-family: 'Nunito', sans-serif;
      white-space: nowrap;
    }
    table.tabla td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--gris-cl);
      font-size: 14px;
    }
    table.tabla tr:last-child td { border-bottom: none; }
    table.tabla tr:hover td { background: rgba(0,0,0,0.02); }
    table.tabla .acciones { display: flex; gap: 6px; justify-content: flex-end; }

    .modal-bg {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.2s;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      background: var(--blanco);
      border-radius: 20px;
      padding: 28px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 70px rgba(0,0,0,0.3);
      animation: slideUp 0.25s;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--gris-cl);
    }
    .modal-titulo {
      font-family: 'Nunito', sans-serif;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .modal-cerrar {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: var(--gris);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .modal-cerrar:hover { background: var(--gris-cl); color: var(--texto); }

    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast {
      background: var(--texto);
      color: var(--blanco);
      padding: 14px 20px;
      border-radius: 12px;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: toastIn 0.3s, toastOut 0.3s 3.7s forwards;
      max-width: 400px;
      pointer-events: auto;
    }
    .toast-success { background: var(--verde); }
    .toast-error { background: var(--rojo); }
    .toast-warning { background: var(--amarillo); color: var(--texto); }
    @keyframes toastIn { from { transform: translateX(120%); } to { transform: translateX(0); } }
    @keyframes toastOut { to { transform: translateX(120%); opacity: 0; } }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-family: 'Nunito', sans-serif;
    }
    .badge-success { background: rgba(45,169,79,0.15); color: var(--verde-osc); }
    .badge-warning { background: rgba(255,204,0,0.2); color: #B58B00; }
    .badge-danger  { background: rgba(227,6,19,0.1); color: var(--rojo); }
    .badge-info    { background: rgba(0,0,0,0.06); color: var(--texto-2); }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: var(--gris);
      font-weight: 600;
    }
    .loading::before {
      content: '';
      display: inline-block;
      width: 28px;
      height: 28px;
      border: 3px solid var(--gris-cl);
      border-top-color: var(--rojo);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 14px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty {
      text-align: center;
      padding: 50px 20px;
      color: var(--gris);
    }
    .empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }

    .escudo-mini {
      width: 32px; height: 32px;
      background: var(--bg);
      border: 1px solid var(--gris-cl);
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: 'Nunito', sans-serif;
      font-size: 11px;
      color: var(--rojo);
      font-weight: 900;
      overflow: hidden;
      vertical-align: middle;
    }
    .escudo-mini img { width: 100%; height: 100%; object-fit: cover; }

    .search-box { position: relative; max-width: 400px; }
    .search-box input {
      width: 100%;
      padding: 10px 14px 10px 38px;
      border: 2px solid var(--gris-cl);
      border-radius: 100px;
      font-size: 14px;
      font-family: 'Mulish', sans-serif;
      background: var(--blanco);
    }
    .search-box::before {
      content: '🔍';
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      opacity: 0.5;
    }
  `;

  const style = document.createElement('style');
  style.id = 'bbb-shared-css';
  style.textContent = css;
  document.head.appendChild(style);
})();

// ════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════

function toast(mensaje, tipo = 'info') {
  let cont = document.getElementById('toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toast-container';
    cont.className = 'toast-container';
    document.body.appendChild(cont);
  }
  const t = document.createElement('div');
  t.className = 'toast toast-' + tipo;
  t.textContent = mensaje;
  cont.appendChild(t);
  setTimeout(() => t.remove(), 4100);
}

function toastError(msg)   { toast(msg, 'error');   }
function toastSuccess(msg) { toast(msg, 'success'); }
function toastWarning(msg) { toast(msg, 'warning'); }

// ════════════════════════════════════════════════════════════════
// MODAL
// ════════════════════════════════════════════════════════════════

function showModal(titulo, contenidoHTML) {
  closeModal();
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.id = 'modal-actual';
  bg.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3 class="modal-titulo">${escapeHtml(titulo)}</h3>
        <button class="modal-cerrar" onclick="closeModal()">×</button>
      </div>
      <div class="modal-body">${contenidoHTML}</div>
    </div>
  `;
  bg.addEventListener('click', () => closeModal());
  document.body.appendChild(bg);
  return bg;
}

function closeModal() {
  const m = document.getElementById('modal-actual');
  if (m) m.remove();
}

function confirmar(mensaje, opciones = {}) {
  return new Promise(resolve => {
    const tituloModal = opciones.titulo || 'Confirmar acción';
    const txtSi = opciones.txtSi || 'Confirmar';
    const txtNo = opciones.txtNo || 'Cancelar';
    const peligroso = opciones.peligroso !== false;

    showModal(tituloModal, `
      <p style="font-size:15px;margin-bottom:24px;">${escapeHtml(mensaje)}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button class="btn btn-secundario" onclick="window._confirmResolve(false)">${escapeHtml(txtNo)}</button>
        <button class="btn ${peligroso ? 'btn-peligro' : 'btn-primario'}" onclick="window._confirmResolve(true)">${escapeHtml(txtSi)}</button>
      </div>
    `);

    window._confirmResolve = (resultado) => {
      closeModal();
      delete window._confirmResolve;
      resolve(resultado);
    };
  });
}

// ════════════════════════════════════════════════════════════════
// HELPERS DE TEXTO Y FORMATO
// ════════════════════════════════════════════════════════════════

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function siglas(nombre) {
  if (!nombre) return '?';
  return String(nombre).split(/\s+/).filter(Boolean).slice(0, 3).map(s => s[0]).join('').toUpperCase();
}

function renderEscudoMini(escudoUrl, nombre) {
  if (escudoUrl) {
    return `<span class="escudo-mini"><img src="${escapeHtml(escudoUrl)}" alt="" onerror="this.outerHTML='${siglas(nombre)}'"></span>`;
  }
  return `<span class="escudo-mini">${siglas(nombre)}</span>`;
}


function badgeEstado(estado) {
  if (!estado) return '';
  const e = String(estado).toUpperCase();
  const map = {
    APROBADO:    'success',
    PENDIENTE:   'warning',
    RECHAZADO:   'danger',
    INSCRITO:    'info',
    SI:          'success',
    NO:          'danger',
    FINALIZADO:  'success',
    EN_CURSO:    'warning',
    PROGRAMADO:  'info',
    SUSPENDIDO:  'danger',
    APLAZADO:    'warning',
    WO_LOCAL:    'danger',
    WO_VISITANTE:'danger'
  };
  const cls = map[e] || 'info';
  return `<span class="badge badge-${cls}">${escapeHtml(estado)}</span>`;
}

function leerArchivoBase64(inputFile) {
  return new Promise((resolve, reject) => {
    const file = inputFile.files[0];
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target.result;
      const nombre = file.name || '';
      const ext = nombre.includes('.') ? nombre.split('.').pop().toLowerCase() : 'png';
      resolve({ base64, extension: ext, nombre, size: file.size });
    };
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.readAsDataURL(file);
  });
}
// ═══════════════════════════════════════════════════════════════
// FECHAS
// ═══════════════════════════════════════════════════════════════
 
/**
 * Formatea cualquier valor a "DD/MM/YYYY"
 * Soporta:
 *   - ISO date: "2026-10-07"
 *   - ISO datetime: "2026-10-07T07:00:00.000Z"
 *   - Formato roto: "07T07:00:00.000Z/10/2026" (autocorrección)
 *   - DD/MM/YYYY: "07/10/2026" (devuelve igual)
 *   - Date objects
 *   - Vacíos: ""
 */
function formatearFecha(valor) {
  if (!valor) return '';
 
  // String
  if (typeof valor === 'string') {
    // ISO completo: "2026-10-07" o "2026-10-07T..."
    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
      const partes = valor.substring(0, 10).split('-');
      return partes[2] + '/' + partes[1] + '/' + partes[0];
    }
 
    // Ya formateado "DD/MM/YYYY"
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return valor;
 
    // Formato roto tipo "07T07:00:00.000Z/10/2026" → intentar parsear
    if (/T\d{2}:\d{2}/.test(valor)) {
      const d = new Date(valor.split('/').reverse().join('-').substring(0, 10) || valor);
      if (!isNaN(d.getTime())) {
        return _ddmmyyyy(d);
      }
    }
  }
 
  // Date object
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return _ddmmyyyy(valor);
  }
 
  // Último intento
  try {
    const d = new Date(valor);
    if (!isNaN(d.getTime())) return _ddmmyyyy(d);
  } catch (e) {}
 
  return String(valor);
}
 
function _ddmmyyyy(d) {
  return String(d.getUTCDate()).padStart(2, '0') + '/' +
         String(d.getUTCMonth() + 1).padStart(2, '0') + '/' +
         d.getUTCFullYear();
}
 
/**
 * Compatibilidad con código viejo - mismo comportamiento que formatearFecha
 */
function formatearFechaCorta(valor) {
  return formatearFecha(valor);
}
 
// ═══════════════════════════════════════════════════════════════
// HORAS
// ═══════════════════════════════════════════════════════════════
 
/**
 * Extrae HH:MM de cualquier formato.
 * Maneja específicamente el caso Google Sheets: "1899-12-30T17:30:00.000Z"
 */
function formatearHora(valor) {
  if (!valor) return '';
 
  if (typeof valor === 'string') {
    // Si tiene T (ISO o formato hora-Sheets "1899-12-30T17:30:00.000Z")
    if (valor.indexOf('T') !== -1) {
      const m = valor.match(/T(\d{2}):(\d{2})/);
      if (m) return m[1] + ':' + m[2];
    }
 
    // Ya es "HH:MM" o "HH:MM:SS"
    const m2 = valor.match(/^(\d{1,2}):(\d{2})/);
    if (m2) return String(m2[1]).padStart(2, '0') + ':' + m2[2];
  }
 
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return String(valor.getUTCHours()).padStart(2, '0') + ':' +
           String(valor.getUTCMinutes()).padStart(2, '0');
  }
 
  try {
    const d = new Date(valor);
    if (!isNaN(d.getTime())) {
      return String(d.getUTCHours()).padStart(2, '0') + ':' +
             String(d.getUTCMinutes()).padStart(2, '0');
    }
  } catch (e) {}
 
  return String(valor);
}
 
// ═══════════════════════════════════════════════════════════════
// NORMALIZACIÓN AUTOMÁTICA - intercepta apiCall
// ═══════════════════════════════════════════════════════════════
//
// Esta sección hace que TODAS las respuestas del backend pasen
// automáticamente por un normalizador que convierte fechas y horas.
// Así no hay que tocar admin-*.html, planillador.html, ni index.html.
//
// IMPORTANTE: este bloque DEBE ejecutarse DESPUÉS de que se haya
// definido apiCall en _shared.js. Si lo pegás al final del archivo,
// va a funcionar automáticamente.
 
(function() {
  if (typeof apiCall !== 'function') {
    console.warn('apiCall no definida todavía - el normalizador no se aplicará');
    return;
  }
 
  // Guardar la versión original
  const _apiCallOriginal = apiCall;
 
  // Reemplazar con versión que normaliza
  window.apiCall = async function(action, params) {
    const r = await _apiCallOriginal(action, params);
    try {
      if (r && r.data) _normalizarFechasYHoras(r.data);
    } catch (e) {
      console.warn('Error normalizando fechas:', e);
    }
    return r;
  };
})();
 
/**
 * Recorre recursivamente un objeto y formatea los campos que son
 * fechas u horas conocidas.
 */
function _normalizarFechasYHoras(obj) {
  if (!obj) return;
 
  // Array → recursión
  if (Array.isArray(obj)) {
    obj.forEach(_normalizarFechasYHoras);
    return;
  }
 
  // No es objeto → nada
  if (typeof obj !== 'object') return;
 
  // Lista de nombres de campos a tratar
  const camposFecha = [
    'fecha', 'fecha_creacion', 'fecha_nacimiento', 'fecha_inicio',
    'fecha_fin', 'fecha_cierre_inscripciones', 'fecha_resolucion',
    'fecha_solicitud', 'fecha_emision', 'fecha_actualizacion',
    'fecha_inscripcion', 'fecha_pago', 'nueva_fecha'
  ];
  const camposHora = ['hora', 'hora_inicio', 'nueva_hora'];
 
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const v = obj[key];
 
    if (v == null || v === '') continue;
 
    if (camposFecha.indexOf(key) !== -1) {
      obj[key] = formatearFecha(v);
    } else if (camposHora.indexOf(key) !== -1) {
      obj[key] = formatearHora(v);
    } else if (typeof v === 'object') {
      _normalizarFechasYHoras(v);
    }
  }
}