//EVENTOS BASE

// Define una lista de eventos predeterminados que deben existir en el sistema.
// Estos sirven como contenido inicial para la aplicación.
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

// Función autoejecutable (IIFE) para inicializar los eventos base.
// Revisa el localStorage y, si alguno de los eventos base no existe, lo agrega.
// Esto asegura que la aplicación siempre tenga un conjunto mínimo de datos al arrancar.
(function initEventosBase() {
    // Obtiene los eventos guardados en localStorage o un objeto vacío si no hay nada.
    let eventosLS = JSON.parse(localStorage.getItem("eventos") || "{}");
    // Itera sobre los eventos base.
    EVENTOS_BASE.forEach(ev => {
        // Si un evento base no se encuentra en localStorage por su ID, se añade.
        if (!eventosLS[ev.id]) {
            eventosLS[ev.id] = ev;
        }
    });
    // Guarda el objeto actualizado de eventos de nuevo en localStorage.
    localStorage.setItem("eventos", JSON.stringify(eventosLS));
    
    // Exporta la constante EVENTOS_BASE al objeto global 'window' para que otros scripts,
    // como 'inscripciones.js', puedan acceder a ella fácilmente.
    window.EVENTOS_BASE = EVENTOS_BASE;
})();


//  INICIO DEL SCRIPT

// Se agrega un event listener que se ejecuta cuando el contenido del DOM ha sido completamente cargado.
// Esto previene errores al intentar manipular elementos que aún no existen en la página.
document.addEventListener('DOMContentLoaded', function() {
    // Si se encuentra el formulario para crear eventos en la página actual, se inicializa.
    if (document.getElementById('form-evento')) {
        inicializarFormularioEvento();
    }

    // Si se encuentra el contenedor principal donde se muestran las tarjetas de eventos.
    if (document.querySelector('.row.row-cols-1')) {
        // Muestra todos los eventos disponibles (base + los creados por el usuario).
        mostrarEventos(getAllEventosArray());
        // Configura los listeners para los filtros de tipo y fecha.
        configurarFiltros();
        // Configura los listeners para la barra de búsqueda por texto.
        configurarBusqueda();
    }
});

//  FORMULARIO: CREAR EVENTO
// Prepara el formulario de creación de eventos.
// Establece la fecha mínima y añade el listener para el evento 'submit'.
function inicializarFormularioEvento() {
    const formulario = document.getElementById('form-evento');
    const mensajeExito = document.getElementById('mensaje-exito');
    if (!formulario) return; // Si no hay formulario, no hace nada.

    // Configura la fecha mínima para el input de fecha.
    // No se pueden crear eventos en el pasado.
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const ahora = new Date();
        // Ajusta la fecha actual a la zona horaria local para establecerla como mínimo.
        const offset = ahora.getTimezoneOffset() * 60000;
        const localISOTime = new Date(ahora - offset).toISOString().slice(0, 16);
        fechaInput.min = localISOTime;
    }

    // Listener para cuando se envía el formulario.
    formulario.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita que la página se recargue.
        // Si el formulario no pasa las validaciones, se muestran los mensajes de error y se detiene.
        if (!validarFormulario()) {
            formulario.classList.add('was-validated'); // Activa los estilos de validación de Bootstrap.
            return;
        }

        // Si es válido, se recogen los datos, se guarda el evento y se muestra un mensaje de éxito.
        const evento = obtenerDatosEvento();
        guardarEvento(evento);

        if (mensajeExito) {
            mensajeExito.style.display = 'block';
            // El mensaje de éxito se oculta automáticamente después de 5 segundos.
            setTimeout(() => mensajeExito.style.display = 'none', 5000);
        }

        // Se limpia el formulario y se quitan los estilos de validación.
        formulario.reset();
        formulario.classList.remove('was-validated');
    });
}

//  VALIDACIONES Y OBTENCIÓN DE DATOS
// Valida todos los campos del formulario de creación de eventos.
// Utiliza la API de validación de HTML5 (setCustomValidity) para mostrar mensajes de error específicos.
// @returns {boolean} - Devuelve 'true' si todos los campos son válidos, 'false' en caso contrario.
function validarFormulario() {
    const formulario = document.getElementById('form-evento');
    if (!formulario) return false;
    let esValido = true;

    // Validación para cada campo del formulario.
    const titulo = document.getElementById('titulo');
    if (!titulo.value.trim()) { titulo.setCustomValidity('El título es obligatorio'); esValido = false; } else { titulo.setCustomValidity(''); }

    const tipo = document.getElementById('tipo');
    if (!tipo.value) { tipo.setCustomValidity('Debe seleccionar un tipo de evento'); esValido = false; } else { tipo.setCustomValidity(''); }

    const fecha = document.getElementById('fecha');
    if (!fecha.value) { fecha.setCustomValidity('La fecha es obligatoria'); esValido = false; }
    else {
        const fechaSeleccionada = new Date(fecha.value);
        const ahora = new Date();
        if (fechaSeleccionada <= ahora) { fecha.setCustomValidity('La fecha debe ser futura'); esValido = false; } else { fecha.setCustomValidity(''); }
    }

    const sede = document.getElementById('sede');
    if (!sede.value.trim()) { sede.setCustomValidity('La sede es obligatoria'); esValido = false; } else { sede.setCustomValidity(''); }

    const cupo = document.getElementById('cupo');
    // El cupo debe ser un número mayor o igual a 1.
    if (!cupo.value || cupo.value < 1) { cupo.setCustomValidity('El cupo debe ser al menos 1'); esValido = false; } else { cupo.setCustomValidity(''); }

    const descripcion = document.getElementById('descripcion');
    if (!descripcion.value.trim()) { descripcion.setCustomValidity('La descripción es obligatoria'); esValido = false; } else { descripcion.setCustomValidity(''); }

    return esValido;
}

//Recoge los valores de los campos del formulario y los estructura en un objeto de evento.
//@returns {object} - Un objeto que representa el nuevo evento.
function obtenerDatosEvento() {
    const titulo = document.getElementById('titulo').value.trim();
    const tipo = document.getElementById('tipo').value;
    const fecha = document.getElementById('fecha').value;
    const sede = document.getElementById('sede').value.trim();
    const cupo = parseInt(document.getElementById('cupo').value);
    const descripcion = document.getElementById('descripcion').value.trim();
    // Se genera un ID único para el evento usando la fecha actual en milisegundos.
    const id = 'evento' + Date.now();

    return { id, titulo, tipo, fecha, sede, cupo, descripcion, asistentes: [], fechaCreacion: new Date().toISOString() };
}


//  INTERACCIÓN CON LOCALSTORAGE
// Guarda un objeto de evento en el localStorage.
// Los eventos se almacenan en un objeto grande donde cada clave es el ID del evento.
// @param {object} evento - El evento a guardar.
function guardarEvento(evento) {
    let eventos = JSON.parse(localStorage.getItem('eventos') || '{}');
    eventos[evento.id] = evento;
    localStorage.setItem('eventos', JSON.stringify(eventos));
    console.log('Evento guardado:', evento);
}

// Obtiene el objeto de eventos completo desde el localStorage.
// @returns {object} - El objeto con todos los eventos guardados.
function getEventosFromStorageObj() {
    return JSON.parse(localStorage.getItem('eventos') || '{}');
}

//  CONSTRUCCIÓN DE LISTA DE EVENTOS COMBINADA
// Combina los eventos base con los eventos guardados en localStorage.
// Los eventos de localStorage con el mismo ID que un evento base sobreescriben al base.
//@returns {array} - Un array con todos los eventos, listos para ser mostrados.
function getAllEventosArray() {
    // Obtiene los eventos guardados por el usuario.
    const guardadosObj = getEventosFromStorageObj();

    // Se crea un mapa para manejar los eventos de forma eficiente, usando el ID como clave.
    const mapa = {};
    // Primero se añaden los eventos base al mapa.
    EVENTOS_BASE.forEach(e => mapa[e.id] = { ...e }); // Se usa copia para evitar mutaciones.
    // Luego, se añaden (o sobreescriben) los eventos guardados.
    Object.values(guardadosObj).forEach(e => mapa[e.id] = e);

    // Se convierte el mapa de nuevo a un array para poder iterar y mostrarlo.
    return Object.values(mapa);
}


//  MOSTRAR EVENTOS (RENDERIZADO)

// Función para crear las tarjetas de los eventos en el contenedor principal.
// @param {array} eventosArray - El array de eventos que se debe mostrar.
function mostrarEventos(eventosArray) {
    const container = document.querySelector('.row.row-cols-1');
    if (!container) return; // Si no existe el contenedor, no se hace nada.

    // Se limpia el contenido previo para evitar duplicados al filtrar.
    container.innerHTML = '';

    // Si el array está vacío (por ejemplo, tras un filtro sin resultados), se muestra un mensaje.
    if (!eventosArray || eventosArray.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4>No se encontraron eventos</h4>
                <p>Intenta con otros términos de búsqueda o ajusta los filtros.</p>
            </div>
        `;
        return;
    }

    // Se itera sobre el array y se crea una tarjeta para cada evento.
    eventosArray.forEach(evento => crearCardEvento(evento, container));

    // Es necesario volver a asignar los listeners a los botones "Inscribirme"
    // porque el contenido del contenedor fue reemplazado.
    reasignarEventListenersInscripcion();
}

// Crea el HTML para una tarjeta de evento individual y la añade al contenedor.
// @param {object} evento - El objeto del evento a mostrar.
// @param {HTMLElement} container - El elemento HTML donde se insertará la tarjeta.
function crearCardEvento(evento, container) {
    const col = document.createElement('div');
    col.className = 'col';

    // Se selecciona una imagen por defecto según el tipo de evento.
    let imagen = 'img/taller_img.jpg'; // Imagen por defecto
    if (evento.tipo === 'conferencia') imagen = 'img/conferencia_img.jpg';
    if (evento.tipo === 'curso') imagen = 'img/taller3.jpg';
    if (evento.tipo === 'taller') imagen = 'img/taller1.jpg';
    if (evento.tipo === 'congreso') imagen = 'img/congreso_img.jpg';

    // Se construye el HTML de la tarjeta usando template literals para mayor legibilidad.
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
                    // Si hay cupo, se muestra el botón de inscripción.
                    `<button class="btn btn-primary btn-inscribirse" data-bs-toggle="modal" data-bs-target="#modalInscripcion" data-evento="${evento.id}">
                        <i class="bi bi-pencil-fill"></i> Inscribirme
                    </button>` :
                    // Si no hay cupo, el botón aparece deshabilitado.
                    `<button class="btn btn-secondary" disabled><i class="bi bi-x-octagon-fill"></i> Cupos Completos</button>`
                }
            </div>
        </div>
    `;

    container.appendChild(col);
}

// Vuelve a asignar los listeners a los botones de inscripción.
// Se debe llamar cada vez que se redibujan las tarjetas de eventos.
function reasignarEventListenersInscripcion() {
    const botones = document.querySelectorAll('.btn-inscribirse');
    botones.forEach(b => {
        // Se elimina el listener anterior para evitar que se acumulen.
        b.removeEventListener('click', onInscribirseClick);
        // Se añade el nuevo listener.
        b.addEventListener('click', onInscribirseClick);
    });
}

// Función que se ejecuta al hacer clic en un botón "Inscribirme".
// Almacena el ID del evento en el formulario del modal de inscripción.
// @param {Event} e - El objeto del evento de clic.
function onInscribirseClick(e) {
    const eventoId = this.getAttribute('data-evento');
    const form = document.querySelector('#formInscripcion');
    if (form) {
        // Se guarda el ID del evento en un atributo 'data-' del formulario del modal.
        form.dataset.evento = eventoId;
    }
}

//  UTILIDADES: FORMATEO Y MAPEO

// Formatea una fecha en formato ISO (YYYY-MM-DDTHH:mm) a un formato más legible (DD/MM/YYYY).
// @param {string} fechaISO - La fecha en formato ISO.
// @returns {string} - La fecha formateada.
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    // Si la fecha no es válida, devuelve el string original.
    if (isNaN(fecha)) return fechaISO;
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Convierte el identificador de tipo de evento (ej. 'conferencia') a un nombre capitalizado (ej. 'Conferencia').
//  @param {string} tipo - El identificador del tipo.
// @returns {string} - El nombre formateado del tipo.
function obtenerNombreTipo(tipo) {
    const tipos = { 'conferencia': 'Conferencia', 'taller': 'Taller', 'curso': 'Curso', 'congreso': 'Congreso' };
    return tipos[tipo] || tipo; // Si no encuentra el tipo, devuelve el identificador original.
}

//  CONFIGURAR FILTROS Y BÚSQUEDA

//Añade el listener al formulario de filtros para que se ejecuten al enviarlo.
function configurarFiltros() {
    const formFiltros = document.querySelector('.card-body form');
    if (!formFiltros) return;
    formFiltros.addEventListener('submit', function(e) {
        e.preventDefault(); // Previene recarga de página.
        aplicarFiltros();
    });
}

//Configura los listeners para la barra de búsqueda y el botón de limpiar.
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
    // El filtro se aplica en tiempo real mientras el usuario escribe.
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', aplicarFiltros);
    }
    // El botón de limpiar resetea todos los filtros.
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }
}

//  LÓGICA DE FILTRADO

// Limpia todos los campos de filtro y búsqueda y vuelve a mostrar todos los eventos.
function limpiarFiltros() {
    // Resetea los valores de los inputs.
    const inputBusqueda = document.getElementById('input-busqueda');
    if (inputBusqueda) inputBusqueda.value = '';

    const tipoSelect = document.querySelector('select.form-select');
    if (tipoSelect) tipoSelect.value = '';

    const fechaInput = document.querySelector('input[type="date"]');
    if (fechaInput) fechaInput.value = '';

    // Vuelve a renderizar la lista completa de eventos.
    mostrarEventos(getAllEventosArray());
}

// Normaliza una fecha a un formato estándar 'YYYY-MM-DD' para poder comparar.
// @param {string} value - El string de la fecha.
// @returns {string} - La fecha normalizada.
function normalizeDateToLocalYYYYMMDD(value) {
    if (!value) return '';
    // Si ya tiene el formato correcto, se devuelve tal cual.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // Si viene con hora, se convierte a un objeto Date y se extrae la fecha.
    const d = new Date(value);
    if (isNaN(d)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// Función principal que aplica los filtros seleccionados.
// Obtiene los valores de los filtros, filtra el array de todos los eventos
// y llama a `mostrarEventos` para actualizar la vista con los resultados.
function aplicarFiltros() {
    // 1. Obtiene los valores actuales de los campos de filtro.
    const tipoSelect = document.querySelector('select.form-select');
    const tipoFiltro = tipoSelect ? tipoSelect.value.trim().toLowerCase() : '';

    const fechaInput = document.querySelector('input[type="date"]');
    const fechaFiltro = fechaInput ? fechaInput.value : '';

    const textoBusqueda = document.getElementById('input-busqueda') 
        ? document.getElementById('input-busqueda').value.trim().toLowerCase() 
        : '';

    // 2. Obtiene la lista completa de eventos.
    const todos = getAllEventosArray();

    // 3. Filtra la lista aplicando todas las condiciones.
    const filtrados = todos.filter(ev => {
        let esCoincidencia = true;

        // Condición de filtro por tipo.
        if (tipoFiltro && ev.tipo !== tipoFiltro) {
            esCoincidencia = false;
        }

        // Condición de filtro por fecha.
        if (fechaFiltro) {
            // Normaliza ambas fechas para asegurar una comparación correcta.
            const fechaEventoNormalizada = normalizeDateToLocalYYYYMMDD(ev.fecha);
            if (fechaEventoNormalizada !== fechaFiltro) {
                esCoincidencia = false;
            }
        }

        // Condición de filtro por texto de búsqueda.
        // Busca la coincidencia en el título, sede o tipo del evento.
        if (textoBusqueda) {
            const enTitulo = (ev.titulo || '').toLowerCase().includes(textoBusqueda);
            const enSede = (ev.sede || '').toLowerCase().includes(textoBusqueda);
            const enTipo = (obtenerNombreTipo(ev.tipo) || '').toLowerCase().includes(textoBusqueda);
            if (!enTitulo && !enSede && !enTipo) {
                esCoincidencia = false;
            }
        }

        return esCoincidencia;
    });

    // 4. Muestra los eventos que pasaron todos los filtros.
    mostrarEventos(filtrados);
}