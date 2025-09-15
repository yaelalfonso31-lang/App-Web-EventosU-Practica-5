// asistentes.js - Versión corregida

// Variables globales
let todosLosAsistentes = [];
let asistentesFiltrados = [];
let eventos = [];
let paginaActual = 1;
const asistentesPorPagina = 5;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    inicializarDatos();
    configurarEventListeners();
    cargarEventosEnSelector();
    mostrarAsistentes();
});

// Inicializar datos desde localStorage
function inicializarDatos() {
    const eventosData = localStorage.getItem('eventos');
    
    // Reinicializar arrays
    todosLosAsistentes = [];
    eventos = [];
    
    if (eventosData) {
        const eventosObj = JSON.parse(eventosData);
        
        // Obtener todos los eventos y asistentes
        Object.keys(eventosObj).forEach(eventoId => {
            if (eventosObj[eventoId] && eventosObj[eventoId].asistentes) {
                // Agregar evento a la lista
                eventos.push({
                    id: eventoId,
                    nombre: obtenerNombreEvento(eventoId),
                    cupo: eventosObj[eventoId].cupo || 0
                });
                
                // Agregar asistentes del evento
                eventosObj[eventoId].asistentes.forEach(asistente => {
                    todosLosAsistentes.push({
                        ...asistente,
                        evento: obtenerNombreEvento(eventoId),
                        eventoId: eventoId,
                        estado: asistente.estado || 'Confirmado' // Estado por defecto
                    });
                });
            }
        });
        
        // Inicializar lista filtrada
        asistentesFiltrados = [...todosLosAsistentes];
        actualizarContador();
    }
}

// Obtener nombre del evento basado en el ID
function obtenerNombreEvento(eventoId) {
    // Si estamos en el mismo dominio, intentamos obtener el nombre real
    try {
        // Esta función solo funciona si los eventos están cargados en el DOM
        // En un entorno real, deberíamos tener los nombres de eventos almacenados
        if (eventoId === 'evento1') return 'Taller de Ciberseguridad';
        if (eventoId === 'evento2') return 'Conferencia de Inteligencia Artificial';
        if (eventoId === 'evento3') return 'Curso de Desarrollo Web';
    } catch (e) {
        console.error('Error al obtener nombre del evento:', e);
    }
    return `Evento ${eventoId}`;
}

// Configurar event listeners
function configurarEventListeners() {
    // Filtro por evento
    document.getElementById('evento').addEventListener('change', function() {
        filtrarAsistentes();
    });
    
    // Filtro por estado
    document.getElementById('filtro-estado').addEventListener('change', function() {
        filtrarAsistentes();
    });
    
    // Búsqueda
    document.getElementById('btn-buscar').addEventListener('click', function() {
        filtrarAsistentes();
    });
    
    document.getElementById('buscar-asistente').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filtrarAsistentes();
        }
    });
    
    // Exportar a TXT
    document.getElementById('btn-exportar-txt').addEventListener('click', exportarATXT);
    
    // Navegación por páginas
    document.getElementById('btn-prev').addEventListener('click', function() {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarAsistentes();
        }
    });
    
    document.getElementById('btn-next').addEventListener('click', function() {
        const totalPaginas = Math.ceil(asistentesFiltrados.length / asistentesPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarAsistentes();
        }
    });
    
    // Confirmar acción en modal
    document.getElementById('btn-confirmar-accion').addEventListener('click', function() {
        // La acción específica se configura al mostrar el modal
    });
}

// Cargar eventos en el selector
function cargarEventosEnSelector() {
    const selectorEvento = document.getElementById('evento');
    
    // Limpiar opciones excepto la primera
    while (selectorEvento.options.length > 1) {
        selectorEvento.remove(1);
    }
    
    // Agregar eventos
    eventos.forEach(evento => {
        const option = document.createElement('option');
        option.value = evento.id;
        option.textContent = evento.nombre;
        selectorEvento.appendChild(option);
    });
}

// Filtrar asistentes
function filtrarAsistentes() {
    const eventoSeleccionado = document.getElementById('evento').value;
    const estadoSeleccionado = document.getElementById('filtro-estado').value;
    const textoBusqueda = document.getElementById('buscar-asistente').value.toLowerCase();
    
    asistentesFiltrados = todosLosAsistentes.filter(asistente => {
        // Filtrar por evento
        if (eventoSeleccionado && asistente.eventoId !== eventoSeleccionado) {
            return false;
        }
        
        // Filtrar por estado
        if (estadoSeleccionado && asistente.estado !== estadoSeleccionado) {
            return false;
        }
        
        // Filtrar por texto de búsqueda
        if (textoBusqueda && 
            !asistente.nombre.toLowerCase().includes(textoBusqueda) && 
            !asistente.email.toLowerCase().includes(textoBusqueda)) {
            return false;
        }
        
        return true;
    });
    
    paginaActual = 1;
    mostrarAsistentes();
    actualizarContador();
}

// Mostrar asistentes en la tabla
function mostrarAsistentes() {
    const tabla = document.getElementById('tabla-asistentes');
    const tbody = tabla.querySelector('tbody');
    const sinAsistentes = document.getElementById('sin-asistentes');
    
    // Limpiar tabla excepto el mensaje de "sin asistentes"
    const filas = tbody.querySelectorAll('tr');
    filas.forEach(fila => {
        if (fila.id !== 'sin-asistentes') {
            fila.remove();
        }
    });
    
    if (asistentesFiltrados.length === 0) {
        sinAsistentes.style.display = '';
        actualizarBotonesPaginacion();
        return;
    }
    
    sinAsistentes.style.display = 'none';
    
    // Calcular índices para la paginación
    const inicio = (paginaActual - 1) * asistentesPorPagina;
    const fin = Math.min(inicio + asistentesPorPagina, asistentesFiltrados.length);
    
    // Crear filas para cada asistente
    for (let i = inicio; i < fin; i++) {
        const asistente = asistentesFiltrados[i];
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${asistente.nombre}</td>
            <td>${asistente.email}</td>
            <td>${asistente.telefono}</td>
            <td>${asistente.evento}</td>
            <td>
                <span class="badge ${obtenerClaseEstado(asistente.estado)}">${asistente.estado}</span>
            </td>
            <td class="text-center">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary cambiar-estado" data-index="${i}">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn btn-outline-danger eliminar-asistente" data-index="${i}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    }
    
    // Agregar event listeners a los botones después de un breve delay
    setTimeout(() => {
        document.querySelectorAll('.cambiar-estado').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cambiarEstadoAsistente(index);
            });
        });
        
        document.querySelectorAll('.eliminar-asistente').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                eliminarAsistente(index);
            });
        });
    }, 100);
    
    actualizarBotonesPaginacion();
    actualizarInfoCupos();
}

// Obtener clase CSS según el estado
function obtenerClaseEstado(estado) {
    switch(estado) {
        case 'Confirmado': return 'bg-success';
        case 'Pendiente': return 'bg-warning text-dark';
        case 'Cancelado': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Cambiar estado de un asistente
function cambiarEstadoAsistente(index) {
    const asistente = asistentesFiltrados[index];
    const estados = ['Confirmado', 'Pendiente', 'Cancelado'];
    const estadoActual = estados.indexOf(asistente.estado);
    const nuevoEstado = estados[(estadoActual + 1) % estados.length];
    
    // Actualizar en la lista filtrada
    asistentesFiltrados[index].estado = nuevoEstado;
    
    // Actualizar en la lista principal
    const indexPrincipal = todosLosAsistentes.findIndex(a => 
        a.email === asistente.email && a.eventoId === asistente.eventoId
    );
    
    if (indexPrincipal !== -1) {
        todosLosAsistentes[indexPrincipal].estado = nuevoEstado;
        guardarEnLocalStorage();
    }
    
    mostrarAsistentes();
}

// Eliminar un asistente
function eliminarAsistente(index) {
    const asistente = asistentesFiltrados[index];
    
    // Mostrar modal de confirmación
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    document.getElementById('mensaje-confirmacion').textContent = 
        `¿Está seguro de que desea eliminar a ${asistente.nombre} del evento ${asistente.evento}?`;
    
    // Configurar acción de confirmación
    document.getElementById('btn-confirmar-accion').onclick = function() {
        // Eliminar de la lista principal
        const indexPrincipal = todosLosAsistentes.findIndex(a => 
            a.email === asistente.email && a.eventoId === asistente.eventoId
        );
        
        if (indexPrincipal !== -1) {
            todosLosAsistentes.splice(indexPrincipal, 1);
            guardarEnLocalStorage();
        }
        
        // Eliminar de la lista filtrada
        asistentesFiltrados.splice(index, 1);
        
        // Actualizar cupo en el evento
        actualizarCupoEvento(asistente.eventoId, 1);
        
        mostrarAsistentes();
        actualizarContador();
        modal.hide();
    };
    
    modal.show();
}

// Guardar cambios en localStorage
function guardarEnLocalStorage() {
    const eventosData = JSON.parse(localStorage.getItem('eventos') || '{}');
    
    // Reiniciar todos los asistentes en cada evento
    Object.keys(eventosData).forEach(eventoId => {
        if (eventosData[eventoId].asistentes) {
            eventosData[eventoId].asistentes = [];
        }
    });
    
    // Agregar asistentes actualizados
    todosLosAsistentes.forEach(asistente => {
        if (!eventosData[asistente.eventoId]) {
            eventosData[asistente.eventoId] = { asistentes: [], cupo: 0 };
        }
        
        // Solo guardar los datos básicos, no el estado (que es para UI)
        const { nombre, email, telefono } = asistente;
        eventosData[asistente.eventoId].asistentes.push({ nombre, email, telefono });
    });
    
    localStorage.setItem('eventos', JSON.stringify(eventosData));
}

// Actualizar cupo de un evento
function actualizarCupoEvento(eventoId, incremento) {
    const eventosData = JSON.parse(localStorage.getItem('eventos') || '{}');
    
    if (eventosData[eventoId]) {
        if (eventosData[eventoId].cupo === undefined) {
            // Si no existe la propiedad cupo, establecerla
            eventosData[eventoId].cupo = incremento;
        } else {
            eventosData[eventoId].cupo += incremento;
        }
        
        localStorage.setItem('eventos', JSON.stringify(eventosData));
    }
}

// Actualizar contador de asistentes
function actualizarContador() {
    document.getElementById('contador-asistentes').textContent = 
        `${asistentesFiltrados.length} asistentes`;
}

// Actualizar botones de paginación
function actualizarBotonesPaginacion() {
    const totalPaginas = Math.ceil(asistentesFiltrados.length / asistentesPorPagina);
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    btnPrev.disabled = paginaActual <= 1;
    btnNext.disabled = paginaActual >= totalPaginas || totalPaginas === 0;
}

// Actualizar información de cupos
function actualizarInfoCupos() {
    const infoCupos = document.getElementById('info-cupos');
    const eventoSeleccionado = document.getElementById('evento').value;
    
    if (asistentesFiltrados.length === 0) {
        infoCupos.textContent = 'No hay asistentes para mostrar';
        return;
    }
    
    if (eventoSeleccionado) {
        const eventosData = JSON.parse(localStorage.getItem('eventos') || '{}');
        const evento = eventosData[eventoSeleccionado];
        
        if (evento && evento.cupo !== undefined) {
            const totalCupos = evento.cupo + (evento.asistentes ? evento.asistentes.length : 0);
            infoCupos.textContent = `${evento.cupo} cupos disponibles de ${totalCupos}`;
            return;
        }
    }
    
    infoCupos.textContent = `Mostrando ${asistentesFiltrados.length} asistentes`;
}

// Exportar a TXT
function exportarATXT() {
    if (asistentesFiltrados.length === 0) {
        alert('No hay asistentes para exportar');
        return;
    }
    
    let contenido = 'Lista de Asistentes - EventosU\n';
    contenido += '================================\n\n';
    
    asistentesFiltrados.forEach((asistente, index) => {
        contenido += `Asistente #${index + 1}:\n`;
        contenido += `Nombre: ${asistente.nombre}\n`;
        contenido += `Email: ${asistente.email}\n`;
        contenido += `Teléfono: ${asistente.telefono}\n`;
        contenido += `Evento: ${asistente.evento}\n`;
        contenido += `Estado: ${asistente.estado}\n`;
        contenido += '--------------------------------\n';
    });
    
    contenido += `\nTotal: ${asistentesFiltrados.length} asistentes`;
    contenido += `\nGenerado: ${new Date().toLocaleString()}`;
    
    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asistentes_eventosu.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}