// --- VARIABLES GLOBALES ---

let todosLosAsistentes = []; //Va a guardar la lista COMPLETA de asistentes de TODOS los eventos.
let asistentesFiltrados = [];// Esta es la lista que se muestra en la tabla.
// Cambia según los filtros que elija el usuario (por evento, por estado, o por búsqueda).
let eventos = []; // Un array para guardar la información básica de cada evento (su id, nombre y cupo).
let paginaActual = 1; //Para controlar la paginación. Guarda el número de la página que se está viendo.
const asistentesPorPagina = 5; // Definir cuántos asistentes quiero mostrar en cada página de la tabla.


// Se ejecuta cuando todo el contenido del HTML ha sido cargado y está listo.
document.addEventListener('DOMContentLoaded', function() {
    inicializarDatos(); //Carga los datos guardados en el navegador.
    configurarEventListeners();//Prepara todos los botones y filtros para que respondan a los clics o cambios. 
    cargarEventosEnSelector();   //Rellena el menú desplegable (<select>) con los eventos que se cargan. 
    mostrarAsistentes();  // Muestra la lista inicial de asistentes en la tabla.
});


// --- FUNCIONES ---

//Carga los datos desde el localStorage//
function inicializarDatos() {    
    const eventosData = localStorage.getItem('eventos');// Pide al navegador que dé los datos guardados bajo la clave 'eventos'.

    todosLosAsistentes = [];//Se limpian los arrays por si esta función se llegara a llamar más de una vez.
    eventos = [];
    
    // Verifica si de verdad había algo guardado.
    if (eventosData) {
        // Los datos en localStorage se guardan como texto en formato JSON.
        // Con JSON.parse() se convierten de nuevo en un objeto de JavaScript para poder usarlo.
        const eventosObj = JSON.parse(eventosData);
        
        // Ahora se recorre cada evento que encontré en el objeto.
        // Object.keys() me da una lista de las "claves" (en este caso, 'evento1', 'evento2', etc.).
        Object.keys(eventosObj).forEach(eventoId => {
            // Verivicar que el evento exista y tenga una lista de asistentes.
            if (eventosObj[eventoId] && eventosObj[eventoId].asistentes) {
                
                // Guarda la información del evento en array 'eventos'.
                eventos.push({
                    id: eventoId,
                    nombre: obtenerNombreEvento(eventoId), // Le pongo un nombre legible.
                    cupo: eventosObj[eventoId].cupo || 0 // Si no tiene cupo, le pongo 0.
                });
                
                // Ahora recorre los asistentes de ESTE evento en particular.
                eventosObj[eventoId].asistentes.forEach(asistente => {
                    // Y los agregoa a mi lista general 'todosLosAsistentes'.
                    // Uso el "spread operator" (...) para copiar todas las propiedades del asistente y agrega nuevas propiedades que servirán después.
                    todosLosAsistentes.push({
                        ...asistente, // Copia nombre, email, telefono
                        evento: obtenerNombreEvento(eventoId), // Nombre del evento al que pertenece
                        eventoId: eventoId, // ID del evento
                        estado: asistente.estado || 'Confirmado' // Por defecto, todos están confirmados.
                    });
                });
            }
        });
        
        // Al principio, la lista filtrada es igual a la lista completa.
        // Se usa [...] para crear una copia y no una referencia directa.
        asistentesFiltrados = [...todosLosAsistentes];
        actualizarContador(); // Actualiza el numerito que dice cuántos asistentes hay.
    }
}

//Esta es una función "ayudante". Como en los datos solo guardo IDs como 'evento1',
//devuelve un nombre más descriptivo para mostrar en la interfaz.
function obtenerNombreEvento(eventoId) {
    // Intento darle un nombre "bonito" a cada evento según su ID.
    if (eventoId === 'evento1') return 'Taller de Ciberseguridad';
    if (eventoId === 'evento2') return 'Conferencia de Inteligencia Artificial';
    if (eventoId === 'evento3') return 'Curso de Desarrollo Web';
    
    // Si no reconozco el ID, devuelvo un nombre genérico.
    return `Evento ${eventoId}`;
}

//Se le dice a cada botón, campo de búsqueda o selector qué función
//debe ejecutar cuando el usuario interactúe con él (haga clic, escriba, etc.).
function configurarEventListeners() {
    // Cuando el usuario cambie la opción en el selector de eventos, se llamará a filtrarAsistentes.
    document.getElementById('evento').addEventListener('change', filtrarAsistentes);
    
    // Lo mismo para el filtro de estado (Confirmado, Pendiente, etc.).
    document.getElementById('filtro-estado').addEventListener('change', filtrarAsistentes);
    
    // Cuando se haga clic en el botón de buscar...
    document.getElementById('btn-buscar').addEventListener('click', filtrarAsistentes);
    
    // Y también quiero que busque si el usuario escribe algo y presiona la tecla "Enter".
    document.getElementById('buscar-asistente').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filtrarAsistentes();
        }
    });
    
    // Configuro el botón para exportar los datos a un archivo de texto.
    document.getElementById('btn-exportar-txt').addEventListener('click', exportarATXT);
    
    // Botón para ir a la página anterior de la tabla.
    document.getElementById('btn-prev').addEventListener('click', function() {
        if (paginaActual > 1) { // Solo funciona si no estoy en la primera página.
            paginaActual--; // Resto uno a la página actual.
            mostrarAsistentes(); // Vuelvo a dibujar la tabla con los datos de la nueva página.
        }
    });
    
    // Botón para ir a la página siguiente.
    document.getElementById('btn-next').addEventListener('click', function() {
        // Calculo cuántas páginas hay en total.
        const totalPaginas = Math.ceil(asistentesFiltrados.length / asistentesPorPagina);
        if (paginaActual < totalPaginas) { // Solo funciona si no estoy en la última página.
            paginaActual++; // Sumo uno a la página actual.
            mostrarAsistentes(); // Vuelvo a dibujar la tabla.
        }
    });
}

//Rellena el menú desplegable (el <select>) con los nombres de los eventos que cargué desde el localStorage
function cargarEventosEnSelector() {
    const selectorEvento = document.getElementById('evento');
    
    // Primero, limpio las opciones que pudiera haber, excepto la primera ("Todos los eventos").
    while (selectorEvento.options.length > 1) {
        selectorEvento.remove(1);
    }
    
    // Ahora, por cada evento que tengo en mi array 'eventos', creo una nueva opción.
    eventos.forEach(evento => {
        const option = document.createElement('option'); // Creo la etiqueta <option>
        option.value = evento.id; // El valor interno será el ID
        option.textContent = evento.nombre; // El texto que ve el usuario será el nombre completo.
        selectorEvento.appendChild(option); // La agrego al <select>.
    });
}

//Esta es la función clave para la búsqueda y los filtros.
//Se encarga de actualizar la lista 'asistentesFiltrados' 
//basándose en los valores seleccionados por el usuario.
function filtrarAsistentes() {
    // 1. Obtengo los valores actuales de los filtros.
    const eventoSeleccionado = document.getElementById('evento').value;
    const estadoSeleccionado = document.getElementById('filtro-estado').value;
    // Convierto el texto de búsqueda a minúsculas para que no importe si el usuario escribe "Juan" o "juan".
    const textoBusqueda = document.getElementById('buscar-asistente').value.toLowerCase();
    
    // 2. Uso el método .filter() sobre la lista COMPLETA de asistentes.
    // Este método crea un nuevo array solo con los elementos que cumplen ciertas condiciones.
    asistentesFiltrados = todosLosAsistentes.filter(asistente => {
        // Condición 1: Filtrar por evento.
        // Si el usuario eligió un evento, y el evento del asistente actual NO es el elegido, lo descarto (return false).
        if (eventoSeleccionado && asistente.eventoId !== eventoSeleccionado) {
            return false;
        }
        
        // Condición 2: Filtrar por estado.
        // Si se eligió un estado, y el estado del asistente NO coincide, lo descarto.
        if (estadoSeleccionado && asistente.estado !== estadoSeleccionado) {
            return false;
        }
        
        // Condición 3: Filtrar por texto de búsqueda.
        // Si hay texto de búsqueda, y este texto NO está ni en el nombre NI en el email del asistente, lo descarto.
        if (textoBusqueda && 
            !asistente.nombre.toLowerCase().includes(textoBusqueda) && 
            !asistente.email.toLowerCase().includes(textoBusqueda)) {
            return false;
        }
        
        // Si el asistente pasó todas las condiciones anteriores, lo incluyo en el resultado (return true).
        return true;
    });
    
    // 3. Después de filtrar, reseteo la paginación a la primera página y actualizo la vista.
    paginaActual = 1;
    mostrarAsistentes();
    actualizarContador();
}

// Dibuja la tabla de asistentes en la página.
// Usa la lista 'asistentesFiltrados' y la variable 'paginaActual' para saber qué mostrar.
function mostrarAsistentes() {
    const tabla = document.getElementById('tabla-asistentes');
    const tbody = tabla.querySelector('tbody'); // El cuerpo de la tabla.
    const sinAsistentes = document.getElementById('sin-asistentes'); // La fila que dice "No hay asistentes".
    
    // Limpio la tabla de las filas anteriores antes de dibujar las nuevas.
    // Así no se acumulan los resultados.
    const filas = tbody.querySelectorAll('tr');
    filas.forEach(fila => {
        // No borro la fila "sin-asistentes", solo las de los datos.
        if (fila.id !== 'sin-asistentes') {
            fila.remove();
        }
    });
    
    // Si después de filtrar no quedó ningún asistente, muestro el mensaje y me detengo.
    if (asistentesFiltrados.length === 0) {
        sinAsistentes.style.display = ''; // Hago visible la fila de "No hay asistentes".
        actualizarBotonesPaginacion(); // Actualizo los botones de paginación (probablemente los desactivo).
        return; // Termino la función aquí.
    }
    
    // Si sí hay asistentes, oculto el mensaje.
    sinAsistentes.style.display = 'none';
    
    // Calculo qué asistentes mostrar según la página actual.
    // Por ejemplo, en la página 1 con 5 por página, mostraré del índice 0 al 4.
    const inicio = (paginaActual - 1) * asistentesPorPagina;
    const fin = Math.min(inicio + asistentesPorPagina, asistentesFiltrados.length);
    
    // Recorro solo la porción de asistentes que corresponde a la página actual.
    for (let i = inicio; i < fin; i++) {
        const asistente = asistentesFiltrados[i];
        const tr = document.createElement('tr'); // Creo una nueva fila <tr>.
        
        // Uso "template literals" (las comillas ` `) para construir el HTML de la fila de forma más sencilla.
        // Inserto los datos del asistente en las celdas <td>.
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
        
        tbody.appendChild(tr); // Agrego la fila completa al cuerpo de la tabla.
    }
    
    // Es importante volver a configurar los listeners para los botones de "cambiar estado" y "eliminar"
    // de las NUEVAS filas que acabo de crear. Si no, no funcionarían.
    // Uso un pequeño setTimeout para darle tiempo al navegador de dibujar los elementos.
    setTimeout(() => {
        document.querySelectorAll('.cambiar-estado').forEach(btn => {
            btn.addEventListener('click', function() {
                // Obtengo el índice del asistente que guardé en el atributo 'data-index'.
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
    
    // Finalmente, actualizo los botones de paginación y la información de cupos.
    actualizarBotonesPaginacion();
    actualizarInfoCupos();
}

// Función ayudante para darle un estilo visual diferente a cada estado.
function obtenerClaseEstado(estado) {
    switch(estado) {
        case 'Confirmado': return 'bg-success'; // Violeta
        case 'Pendiente': return 'bg-warning text-dark'; // Amarillo
        case 'Cancelado': return 'bg-danger'; // Rojo
        default: return 'bg-secondary'; // Gris para cualquier otro caso
    }
}

// Cambia el estado de un asistente de forma cíclica (Confirmado -> Pendiente -> Cancelado -> Confirmado...).
// @param {number} index - La posición del asistente en el array 'asistentesFiltrados'.
function cambiarEstadoAsistente(index) {
    const asistente = asistentesFiltrados[index];
    const estados = ['Confirmado', 'Pendiente', 'Cancelado'];
    const estadoActual = estados.indexOf(asistente.estado); // Encuentro la posición del estado actual (0, 1 o 2).
    // Con el operador módulo (%) logro que el ciclo vuelva a empezar. (0+1)%3=1, (1+1)%3=2, (2+1)%3=0.
    const nuevoEstado = estados[(estadoActual + 1) % estados.length];
    
    // Actualizo el estado en la lista filtrada (la que se ve).
    asistentesFiltrados[index].estado = nuevoEstado;
    
    // ¡Muy importante! También debo actualizarlo en la lista principal ('todosLosAsistentes')
    // para que el cambio se mantenga aunque cambie de filtro.
    const indexPrincipal = todosLosAsistentes.findIndex(a => 
        a.email === asistente.email && a.eventoId === asistente.eventoId
    );
    
    if (indexPrincipal !== -1) { // Si lo encontré...
        todosLosAsistentes[indexPrincipal].estado = nuevoEstado;
        // OJO: Decidí NO guardar el ESTADO en localStorage para que sea algo temporal de la sesión.
        // Si quisiera guardarlo, aquí iría una llamada a guardarEnLocalStorage().
    }
    
    // Vuelvo a dibujar la tabla para que se vea el cambio de color y texto.
    mostrarAsistentes();
}

// Elimina un asistente de las listas y actualiza el localStorage.
function eliminarAsistente(index) {
    const asistente = asistentesFiltrados[index];
    
    // Uso el modal de confirmación de Bootstrap para evitar borrados accidentales.
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    // Personalizo el mensaje del modal con el nombre del asistente y el evento.
    document.getElementById('mensaje-confirmacion').textContent = 
        `¿Está seguro de que desea eliminar a ${asistente.nombre} del evento ${asistente.evento}?`;
    
    // Configuro lo que pasará SOLAMENTE si el usuario hace clic en el botón "Confirmar".
    document.getElementById('btn-confirmar-accion').onclick = function() {
        // 1. Lo busco en la lista principal para borrarlo de ahí.
        const indexPrincipal = todosLosAsistentes.findIndex(a => 
            a.email === asistente.email && a.eventoId === asistente.eventoId
        );
        
        if (indexPrincipal !== -1) {
            todosLosAsistentes.splice(indexPrincipal, 1); // .splice() elimina elementos de un array.
            // Ahora sí, guardo los cambios en localStorage porque un borrado es permanente.
            guardarEnLocalStorage();
        }
        
        // 2. Lo elimino también de la lista filtrada para que desaparezca de la vista actual.
        asistentesFiltrados.splice(index, 1);
        
        // 3. Como liberé un lugar, actualizo el cupo del evento.
        actualizarCupoEvento(asistente.eventoId, 1); // Le sumo 1 cupo disponible.
        
        // 4. Actualizo la tabla y el contador.
        mostrarAsistentes();
        actualizarContador();
        modal.hide(); // Oculto el modal.
    };
    
    modal.show(); // Muestro el modal para preguntar.
}

// Guarda el estado actual de los asistentes en el localStorage.
// Esta función reescribe toda la lista de asistentes de cada evento.
function guardarEnLocalStorage() {
    // Primero, leo lo que ya hay en localStorage para no perder los cupos.
    const eventosData = JSON.parse(localStorage.getItem('eventos') || '{}');
    
    // Limpio las listas de asistentes de TODOS los eventos.
    // Si no hiciera esto, duplicaría los asistentes cada vez que guardo.
    Object.keys(eventosData).forEach(eventoId => {
        if (eventosData[eventoId].asistentes) {
            eventosData[eventoId].asistentes = [];
        }
    });
    
    // Ahora, recorro mi lista 'todosLosAsistentes' actualizada.
    todosLosAsistentes.forEach(asistente => {
        // Me aseguro de que el objeto del evento exista.
        if (!eventosData[asistente.eventoId]) {
            eventosData[asistente.eventoId] = { asistentes: [], cupo: 0 };
        }
        
        // Creo un objeto solo con los datos básicos del asistente.
        // No guardo el 'estado' ni el 'eventoId' dentro del asistente mismo,
        // porque esa información ya la tengo por el evento al que pertenece.
        const { nombre, email, telefono, estado } = asistente;
        eventosData[asistente.eventoId].asistentes.push({ nombre, email, telefono, estado });
    });
    
    // Convierto el objeto de JavaScript de nuevo a texto JSON y lo guardo.
    localStorage.setItem('eventos', JSON.stringify(eventosData));
}


// Actualiza el número de cupos disponibles para un evento en el localStorage.
// @param {string} eventoId - El ID del evento a modificar.
// @param {number} incremento - Cuánto sumar al cupo (puede ser negativo para restar).
function actualizarCupoEvento(eventoId, incremento) {
    const eventosData = JSON.parse(localStorage.getItem('eventos') || '{}');
    
    if (eventosData[eventoId]) {
        // Sumo (o resto) el valor al cupo actual del evento.
        eventosData[eventoId].cupo += incremento;
        // Guardo los cambios.
        localStorage.setItem('eventos', JSON.stringify(eventosData));
    }
}


// Actualiza el texto que muestra el número de asistentes filtrados.
function actualizarContador() {
    document.getElementById('contador-asistentes').textContent = 
        `${asistentesFiltrados.length} asistentes`;
}

// Activa o desactiva los botones de "Anterior" y "Siguiente" de la paginación
// según la página actual y el total de páginas.
function actualizarBotonesPaginacion() {
    const totalPaginas = Math.ceil(asistentesFiltrados.length / asistentesPorPagina);
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    // Desactivo "Anterior" si estoy en la primera página.
    btnPrev.disabled = paginaActual <= 1;
    // Desactivo "Siguiente" si estoy en la última página o si no hay páginas.
    btnNext.disabled = paginaActual >= totalPaginas || totalPaginas === 0;
}

//Muestra información sobre los cupos del evento seleccionado.
function actualizarInfoCupos() {
    const infoCupos = document.getElementById('info-cupos');
    const eventoSeleccionado = document.getElementById('evento').value;
    
    if (asistentesFiltrados.length === 0) {
        infoCupos.textContent = 'No hay asistentes para mostrar';
        return;
    }
    
    // Si hay un evento específico seleccionado...
    if (eventoSeleccionado) {
        const evento = eventos.find(e => e.id === eventoSeleccionado);
        
        if (evento) {
            const asistentesConfirmados = asistentesFiltrados.filter(a => a.eventoId === eventoSeleccionado && a.estado === 'Confirmado').length;
            const totalCupos = evento.cupo + asistentesConfirmados;
            infoCupos.textContent = `Evento con ${totalCupos} cupos totales. Quedan ${evento.cupo} disponibles.`;
            return;
        }
    }
    
    // Si no hay ningún evento seleccionado, muestro un mensaje general.
    infoCupos.textContent = `Mostrando ${asistentesFiltrados.length} asistentes de todos los eventos`;
}

//Crea un archivo de texto (.txt) con los datos de los asistentes filtrados y lo ofrece para descargar.
function exportarATXT() {
    if (asistentesFiltrados.length === 0) {
        alert('No hay asistentes para exportar');
        return;
    }
    
    // Construyo el contenido del archivo de texto línea por línea.
    let contenido = 'Lista de Asistentes - EventosU\n';
    contenido += '================================\n\n';
    
    asistentesFiltrados.forEach((asistente, index) => {
        contenido += `Asistente #${index + 1}:\n`;
        contenido += `  Nombre: ${asistente.nombre}\n`;
        contenido += `  Email: ${asistente.email}\n`;
        contenido += `  Teléfono: ${asistente.telefono}\n`;
        contenido += `  Evento: ${asistente.evento}\n`;
        contenido += `  Estado: ${asistente.estado}\n`;
        contenido += '--------------------------------\n';
    });
    
    contenido += `\nTotal: ${asistentesFiltrados.length} asistentes`;
    contenido += `\nGenerado: ${new Date().toLocaleString()}`;
    
    // Este es el truco para descargar el archivo:
    // 1. Creo un "Blob", que es como un objeto de archivo en memoria.
    const blob = new Blob([contenido], { type: 'text/plain' });
    // 2. Creo una URL temporal para ese Blob.
    const url = URL.createObjectURL(blob);
    // 3. Creo un enlace <a> invisible en la página.
    const a = document.createElement('a');
    a.href = url; // Le pongo la URL del Blob.
    a.download = 'asistentes_eventosu.txt'; // Le digo qué nombre de archivo usar.
    // 4. Simulo un clic en el enlace para que se inicie la descarga.
    document.body.appendChild(a);
    a.click();
    // 5. Limpio todo eliminando el enlace y la URL temporal.
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}