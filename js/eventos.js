// eventos.js - Gestión de creación, validación, búsqueda y filtrado de eventos

// ----------------------
//  CONFIG: eventos base
// ----------------------
// --- Asegurar que los eventos base están en localStorage ---
const EVENTOS_BASE = [
    {
        id: 'evento1',
        titulo: 'Taller de Ciberseguridad',
        tipo: 'taller',
        fecha: '2025-09-18T10:00:00',
        sede: 'Aula Magna FCC',
        cupo: 15,
        descripcion: 'Taller sobre ciberseguridad',
        asistentes: []
    },
    {
        id: 'evento2',
        titulo: 'Conferencia de Inteligencia Artificial',
        tipo: 'conferencia',
        fecha: '2025-09-20T10:00:00',
        sede: 'Auditorio Principal',
        cupo: 0,
        descripcion: 'Conferencia sobre IA',
        asistentes: []
    },
    {
        id: 'evento3',
        titulo: 'Curso de Desarrollo Web',
        tipo: 'curso',
        fecha: '2025-09-25T10:00:00',
        sede: 'Laboratorio de Computación 3',
        cupo: 8,
        descripcion: 'Curso de desarrollo web',
        asistentes: []
    }
];

(function initEventosBase() {
    let eventosLS = JSON.parse(localStorage.getItem("eventos") || "{}");
    EVENTOS_BASE.forEach(ev => {
        if (!eventosLS[ev.id]) {
            eventosLS[ev.id] = ev;
        }
    });
    localStorage.setItem("eventos", JSON.stringify(eventosLS));
    // exportar al window para que inscripciones.js lo pueda usar
    window.EVENTOS_BASE = EVENTOS_BASE;
})();

function crearEventosBase(container) {
    const eventosBase = [
        {
            id: 'evento1',
            titulo: 'Taller de Ciberseguridad',
            tipo: 'taller',
            fecha: '2025-09-18T10:00:00',
            sede: 'Aula Magna FCC',
            cupo: 15,
            descripcion: 'Taller sobre ciberseguridad',
            asistentes: []
        },
        {
            id: 'evento2',
            titulo: 'Conferencia de Inteligencia Artificial',
            tipo: 'conferencia',
            fecha: '2025-09-20T10:00:00',
            sede: 'Auditorio Principal',
            cupo: 0,
            descripcion: 'Conferencia sobre IA',
            asistentes: []
        },
        {
            id: 'evento3',
            titulo: 'Curso de Desarrollo Web',
            tipo: 'curso',
            fecha: '2025-09-25T10:00:00',
            sede: 'Laboratorio de Computación 3',
            cupo: 8,
            descripcion: 'Curso de desarrollo web',
            asistentes: []
        }
    ];
    
    // Pintar siempre en pantalla
    eventosBase.forEach(evento => {
        crearCardEvento(evento, container);
    });

    // 👇 Sincronizar con localStorage
    let eventosLS = JSON.parse(localStorage.getItem("eventos") || "{}");
    eventosBase.forEach(ev => {
        if (!eventosLS[ev.id]) {
            eventosLS[ev.id] = ev; // guardar evento base completo
        }
    });
    localStorage.setItem("eventos", JSON.stringify(eventosLS));

    // Guardamos referencia global para inscripciones.js
    window.EVENTOS_BASE = eventosBase;
}



// ----------------------
//  Inicio
// ----------------------
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('form-evento')) {
        inicializarFormularioEvento();
    }

    // Si existe el contenedor de eventos en la página principal
    if (document.querySelector('.row.row-cols-1')) {
        // Mostrar todos los eventos (base + guardados)
        mostrarEventos(getAllEventosArray());
        configurarFiltros();
        configurarBusqueda();
    }
});

// ----------------------
//  Formulario: crear evento
// ----------------------
function inicializarFormularioEvento() {
    const formulario = document.getElementById('form-evento');
    const mensajeExito = document.getElementById('mensaje-exito');
    if (!formulario) return;

    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const ahora = new Date();
        const offset = ahora.getTimezoneOffset() * 60000;
        const localISOTime = new Date(ahora - offset).toISOString().slice(0, 16);
        fechaInput.min = localISOTime;
    }

    formulario.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!validarFormulario()) {
            formulario.classList.add('was-validated');
            return;
        }

        const evento = obtenerDatosEvento();
        guardarEvento(evento);

        if (mensajeExito) {
            mensajeExito.style.display = 'block';
            setTimeout(() => mensajeExito.style.display = 'none', 5000);
        }

        formulario.reset();
        formulario.classList.remove('was-validated');

        // Si estamos en la página principal, refrescamos la vista
        if (document.querySelector('.row.row-cols-1')) {
            mostrarEventos(getAllEventosArray());
        }
    });
}

// ----------------------
//  Validaciones y obtención de datos
// ----------------------
function validarFormulario() {
    const formulario = document.getElementById('form-evento');
    if (!formulario) return false;
    let esValido = true;

    const titulo = document.getElementById('titulo');
    if (!titulo.value.trim()) { titulo.setCustomValidity('El título es obligatorio'); esValido = false; } else titulo.setCustomValidity('');

    const tipo = document.getElementById('tipo');
    if (!tipo.value) { tipo.setCustomValidity('Debe seleccionar un tipo de evento'); esValido = false; } else tipo.setCustomValidity('');

    const fecha = document.getElementById('fecha');
    if (!fecha.value) { fecha.setCustomValidity('La fecha es obligatoria'); esValido = false; }
    else {
        const fechaSeleccionada = new Date(fecha.value);
        const ahora = new Date();
        if (fechaSeleccionada <= ahora) { fecha.setCustomValidity('La fecha debe ser futura'); esValido = false; } else fecha.setCustomValidity('');
    }

    const sede = document.getElementById('sede');
    if (!sede.value.trim()) { sede.setCustomValidity('La sede es obligatoria'); esValido = false; } else sede.setCustomValidity('');

    const cupo = document.getElementById('cupo');
    if (!cupo.value || cupo.value < 1) { cupo.setCustomValidity('El cupo debe ser al menos 1'); esValido = false; } else cupo.setCustomValidity('');

    const descripcion = document.getElementById('descripcion');
    if (!descripcion.value.trim()) { descripcion.setCustomValidity('La descripción es obligatoria'); esValido = false; } else descripcion.setCustomValidity('');

    return esValido;
}

function obtenerDatosEvento() {
    const titulo = document.getElementById('titulo').value.trim();
    const tipo = document.getElementById('tipo').value;
    const fecha = document.getElementById('fecha').value;
    const sede = document.getElementById('sede').value.trim();
    const cupo = parseInt(document.getElementById('cupo').value);
    const descripcion = document.getElementById('descripcion').value.trim();
    const id = 'evento' + Date.now();

    return { id, titulo, tipo, fecha, sede, cupo, descripcion, asistentes: [], fechaCreacion: new Date().toISOString() };
}

// ----------------------
//  LocalStorage
// ----------------------
function guardarEvento(evento) {
    let eventos = JSON.parse(localStorage.getItem('eventos') || '{}');
    eventos[evento.id] = evento;
    localStorage.setItem('eventos', JSON.stringify(eventos));
    console.log('Evento guardado:', evento);
}

function getEventosFromStorageObj() {
    return JSON.parse(localStorage.getItem('eventos') || '{}');
}

// ----------------------
//  Construcción de lista combinada (base + guardados)
// ----------------------
function getAllEventosArray() {
    // Empezamos con copias de los eventos base (para evitar mutaciones)
    const baseCopy = EVENTOS_BASE.map(e => Object.assign({}, e));

    // Leer guardados
    const guardadosObj = getEventosFromStorageObj();

    // Si hay eventos guardados que coinciden con IDs base, los reemplazamos/actualizamos
    const guardadosArray = Object.keys(guardadosObj).map(k => guardadosObj[k]);

    // Construir map por id: los guardados sobreescriben los base
    const mapa = {};
    baseCopy.forEach(e => mapa[e.id] = e);
    guardadosArray.forEach(e => mapa[e.id] = e);

    // Devolvemos array ordenado (primero base por orden, luego nuevos guardados no-base)
    const resultado = [];
    EVENTOS_BASE.forEach(base => {
        if (mapa[base.id]) resultado.push(mapa[base.id]);
    });
    // agregar eventos guardados que no son base
    guardadosArray.forEach(e => {
        if (!EVENTOS_BASE.find(b => b.id === e.id)) resultado.push(e);
    });

    return resultado;
}

// ----------------------
//  Mostrar eventos (render)
 // ----------------------
function mostrarEventos(eventosArray) {
    const container = document.querySelector('.row.row-cols-1');
    if (!container) return;

    container.innerHTML = '';

    if (!eventosArray || eventosArray.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4>No se encontraron eventos</h4>
                <p>Intenta con otros términos de búsqueda o ajusta los filtros.</p>
            </div>
        `;
        return;
    }

    eventosArray.forEach(evento => crearCardEvento(evento, container));

    // Después de renderizar, reasignar listeners si los necesitas
    reasignarEventListenersInscripcion();
}

function crearCardEvento(evento, container) {
    const col = document.createElement('div');
    col.className = 'col';

    let imagen = 'img/taller1.jpg';
    if (evento.tipo === 'conferencia') imagen = 'img/taller2.jpg';
    if (evento.tipo === 'curso') imagen = 'img/taller3.jpg';
    if (evento.tipo === 'congreso') imagen = 'img/taller2.jpg';

    col.innerHTML = `
        <div class="card h-100 shadow-sm" id="${evento.id}">
            <div class="card-body text-center">
                <h3 class="card-title h5">${evento.titulo}</h3>
                <img src="${imagen}" alt="${evento.titulo}" class="img-fluid rounded mb-3 d-block mx-auto" style="width:350px; height:300px; object-fit:cover;">
                <p class="card-text"><strong>Fecha:</strong> ${formatearFecha(evento.fecha)}</p>
                <p class="card-text"><strong>Sede:</strong> ${evento.sede}</p>
                <p class="card-text"><strong>Tipo:</strong> ${obtenerNombreTipo(evento.tipo)}</p>
                <p class="card-text"><strong>Cupos disponibles:</strong> <span class="cupo">${evento.cupo}</span></p>
                ${evento.cupo > 0 ?
                    `<button class="btn btn-primary btn-inscribirse" data-bs-toggle="modal" data-bs-target="#modalInscripcion" data-evento="${evento.id}">
                        <i class="bi bi-pencil-fill"></i> Inscribirme
                    </button>` :
                    `<button class="btn btn-secondary" disabled><i class="bi bi-x-octagon-fill"></i> Cupos Completos</button>`
                }
            </div>
        </div>
    `;

    container.appendChild(col);
}

function reasignarEventListenersInscripcion() {
    const botones = document.querySelectorAll('.btn-inscribirse');
    botones.forEach(b => {
        b.removeEventListener('click', onInscribirseClick);
        b.addEventListener('click', onInscribirseClick);
    });
}

function onInscribirseClick(e) {
    const eventoId = this.getAttribute ? this.getAttribute('data-evento') : e.currentTarget.getAttribute('data-evento');
    const form = document.querySelector('#formInscripcion');
    if (form) form.dataset.evento = eventoId;
}

// ----------------------
//  Utiles: formateo y mapping
// ----------------------
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    if (isNaN(fecha)) return fechaISO; // fallback
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function obtenerNombreTipo(tipo) {
    const tipos = { 'conferencia': 'Conferencia', 'taller': 'Taller', 'curso': 'Curso', 'congreso': 'Congreso' };
    return tipos[tipo] || tipo;
}

// ----------------------
//  Configurar filtros y búsqueda
// ----------------------
function configurarFiltros() {
    const formFiltros = document.querySelector('.card-body form');
    if (!formFiltros) return;
    formFiltros.addEventListener('submit', function(e) {
        e.preventDefault();
        aplicarFiltros();
    });
}

function configurarBusqueda() {
    const formBusqueda = document.getElementById('form-busqueda');
    const inputBusqueda = document.getElementById('input-busqueda');
    const btnLimpiar = document.getElementById('btn-limpiar');

    if (formBusqueda) {
        formBusqueda.addEventListener('submit', function(e) {
            e.preventDefault();
            aplicarFiltros();
        });
    }
    if (inputBusqueda) inputBusqueda.addEventListener('input', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
}

// ----------------------
//  Limpiar filtros
// ----------------------
function limpiarFiltros() {
    const inputBusqueda = document.getElementById('input-busqueda');
    if (inputBusqueda) inputBusqueda.value = '';

    const tipoSelect = document.querySelector('select.form-select');
    if (tipoSelect) tipoSelect.value = '';

    const fechaInput = document.querySelector('input[type="date"]');
    if (fechaInput) fechaInput.value = '';

    // volver a mostrar todos
    mostrarEventos(getAllEventosArray());
}


// Helper: normaliza distintos formatos a "YYYY-MM-DD" en hora local
function normalizeDateToLocalYYYYMMDD(value) {
    if (!value) return '';
    // si ya es yyyy-mm-dd (date-only) lo devolvemos tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // si viene con hora (2025-09-18T10:00[:00]) usamos Date y extraemos la fecha local
    const d = new Date(value);
    if (isNaN(d)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}


// ----------------------
//  Aplicar filtros (filtramos los datos y volvemos a renderizar)
// ----------------------
function aplicarFiltros() {
    const tipoSelect = document.querySelector('select.form-select');
    const tipoFiltro = tipoSelect ? tipoSelect.value.trim().toLowerCase() : '';

    const fechaInput = document.querySelector('input[type="date"]');
    const fechaFiltroRaw = fechaInput ? fechaInput.value : ''; // ya viene en "YYYY-MM-DD"

    const textoBusqueda = document.getElementById('input-busqueda') 
        ? document.getElementById('input-busqueda').value.trim().toLowerCase() 
        : '';

    const todos = getAllEventosArray();

    const filtrados = todos.filter(ev => {
        let ok = true;

        // filtro por tipo (coincidencia parcial en clave o nombre mostrado)
        if (tipoFiltro) {
            const tipoClave = (ev.tipo || '').toLowerCase();
            const tipoNombre = (obtenerNombreTipo(ev.tipo) || '').toLowerCase();
            ok = ok && (tipoClave.includes(tipoFiltro) || tipoNombre.includes(tipoFiltro));
        }

        // filtro por fecha: normalizamos la fecha del evento y comparamos con la del input (YYYY-MM-DD)
        if (fechaFiltroRaw) {
            const fechaEvNormalized = normalizeDateToLocalYYYYMMDD(ev.fecha);
            ok = ok && (fechaEvNormalized === fechaFiltroRaw);
        }

        // filtro por texto (titulo, sede, tipo)
        if (textoBusqueda) {
            const titulo = (ev.titulo || '').toLowerCase();
            const sede = (ev.sede || '').toLowerCase();
            const tipoClave = (ev.tipo || '').toLowerCase();
            const tipoNombre = (obtenerNombreTipo(ev.tipo) || '').toLowerCase();
            ok = ok && (
                titulo.includes(textoBusqueda) || 
                sede.includes(textoBusqueda) || 
                tipoClave.includes(textoBusqueda) ||
                tipoNombre.includes(textoBusqueda)
            );
        }

        return ok;
    });

    mostrarEventos(filtrados);
}
