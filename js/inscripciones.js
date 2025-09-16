// inscripciones.js - Maneja la lógica de inscripción de asistentes a los eventos.

// Se ejecuta cuando todo el contenido del HTML ha sido cargado y está listo.
document.addEventListener('DOMContentLoaded', function() {
    // Llama a la función principal para configurar la lógica de inscripciones.
    inicializarInscripciones();
});

//Función principal que configura los listeners y la lógica para el formulario de inscripción.
function inicializarInscripciones() {
    // Selecciona el formulario de inscripción del DOM.
    const form = document.querySelector("#formInscripcion");
    // Si el formulario no existe en la página actual, la función termina para evitar errores.
    if (!form) return;
    
    // Variable para almacenar el ID del evento que se está procesando.
    let eventoActual = "";
    
    // Selecciona el modal de inscripción.
    const modal = document.querySelector("#modalInscripcion");
    if (modal) {
        // Se añade un listener para el evento 'show.bs.modal', que es disparado por Bootstrap
        // justo cuando el modal está a punto de mostrarse.
        modal.addEventListener("show.bs.modal", (e) => {
            // 'e.relatedTarget' es el botón que activó el modal (el botón "Inscribirme").
            const button = e.relatedTarget;
            // Se obtiene el ID del evento guardado en el atributo 'data-evento' del botón.
            eventoActual = button.getAttribute("data-evento");
            // Se almacena el ID del evento en el dataset del formulario para usarlo al momento de enviar.
            form.dataset.evento = eventoActual;
        });
    }

    // Listener para el evento 'submit' del formulario.
    form.addEventListener("submit", (e) => {
        // previene el comportamiento por defecto del formulario (recargar la página).
        e.preventDefault();

        // Obtiene y limpia los valores de los campos del formulario.
        const nombre = form.querySelector("#nombre").value.trim();
        const email = form.querySelector("#email").value.trim();
        const telefono = form.querySelector("#telefono").value.trim();
        // Recupera el ID del evento desde el dataset del formulario.
        const eventoId = form.dataset.evento;

        // Carga todos los eventos desde localStorage. Si no hay, inicia con un objeto vacío.
        let eventos = JSON.parse(localStorage.getItem("eventos")) || {};

        // --- VALIDACIONES ---

        // Asegura que el objeto del evento exista en los datos cargados.
        if (!eventos[eventoId]) {
            alert("❌ Error: El evento no fue encontrado en la base de datos local.");
            return;
        }

        let evento = eventos[eventoId];

        // Verifica si ya existe un asistente con el mismo correo electrónico en este evento.
        // El método .some() devuelve true si al menos un elemento cumple la condición.
        if (evento.asistentes.some(a => a.email === email)) {
            alert("❌ Ya estás registrado en este evento con ese correo.");
            return; // Detiene la ejecución.
        }

        // Verifica si quedan cupos disponibles.
        if (evento.cupo <= 0) {
            alert("⚠️ Lo sentimos, no quedan cupos disponibles para este evento.");
            return; // Detiene la ejecución.
        }

        // --- REGISTRO ---

        // Si todas las validaciones pasan, se agrega el nuevo asistente al array.
        evento.asistentes.push({ nombre, email, telefono, estado: 'Confirmado' });
        // Se decrementa el contador de cupos disponibles.
        evento.cupo--;

        // --- PERSISTENCIA Y ACTUALIZACIÓN ---

        // Actualiza el objeto del evento dentro de la estructura de todos los eventos.
        eventos[eventoId] = evento;
        // Guarda el objeto de eventos actualizado de vuelta en localStorage.
        localStorage.setItem("eventos", JSON.stringify(eventos));

        // Llama a la función para actualizar la interfaz de usuario con el nuevo número de cupos.
        actualizarCupoUI(eventoId, evento.cupo);

        // Muestra un mensaje de éxito al usuario.
        alert("✅ ¡Registro exitoso para " + nombre + "!");
        
        // Limpia los campos del formulario.
        form.reset();
        
        // Cierra el modal de inscripción utilizando la API de Bootstrap.
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
    });
}

// Actualiza la interfaz de usuario para reflejar el nuevo número de cupos.
// @param {string} eventoId - El ID del evento a actualizar.
// @param {number} nuevoCupo - El nuevo número de cupos disponibles.
function actualizarCupoUI(eventoId, nuevoCupo) {
    // Busca el elemento <span> que muestra el número de cupos para el evento específico.
    const el = document.querySelector(`#${eventoId} .cupo`);
    // Si el elemento existe, actualiza su contenido de texto.
    if (el) el.textContent = nuevoCupo;

    // Busca el botón de inscripción para ese evento.
    const btn = document.querySelector(`#${eventoId} .btn-inscribirse`);
    if (btn) {
        // Si el cupo llega a cero o menos...
        if (nuevoCupo <= 0) {
            // ...se cambia el estilo del botón para que parezca deshabilitado.
            btn.classList.remove("btn-primary");
            btn.classList.add("btn-secondary");
            // Se añade el atributo 'disabled' para que no se pueda hacer clic.
            btn.setAttribute("disabled", "true");
            // Se cambia el texto y el ícono del botón para informar que no hay cupos.
            btn.innerHTML = '<i class="bi bi-x-octagon-fill"></i> Cupos Completos';
        }
    }
}