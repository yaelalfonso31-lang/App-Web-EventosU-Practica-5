// inscripciones.js
document.addEventListener('DOMContentLoaded', function() {
    inicializarInscripciones();
});

function inicializarInscripciones() {
    const form = document.querySelector("#formInscripcion");
    if (!form) return;
    
    let eventoActual = "";
    
    // Capturar el eventoId cuando se abre el modal
    const modal = document.querySelector("#modalInscripcion");
    if (modal) {
        modal.addEventListener("show.bs.modal", (e) => {
            const button = e.relatedTarget;
            eventoActual = button.getAttribute("data-evento");
            form.dataset.evento = eventoActual;
        });
    }
}  



// Inicializar localStorage
if (!localStorage.getItem("eventos")) {
    localStorage.setItem("eventos", JSON.stringify({}));
}

const form = document.querySelector("#formInscripcion");
let eventoActual = "";

// Capturar el eventoId cuando se abre el modal
const modal = document.querySelector("#modalInscripcion");
modal.addEventListener("show.bs.modal", (e) => {
    const button = e.relatedTarget;
    eventoActual = button.getAttribute("data-evento");
    form.dataset.evento = eventoActual;
});

// Función para registrar asistente
// Función para registrar asistente
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = form.querySelector("#nombre").value.trim();
    const email = form.querySelector("#email").value.trim();
    const telefono = form.querySelector("#telefono").value.trim();
    const eventoId = form.dataset.evento;

    let eventos = JSON.parse(localStorage.getItem("eventos")) || {};

    // 🚨 Asegurarnos de que el evento existe
    if (!eventos[eventoId]) {
    // Intentar recuperarlo de EVENTOS_BASE
    const base = (window.EVENTOS_BASE || []).find(e => e.id === eventoId);
    if (base) {
        eventos[eventoId] = base;
        localStorage.setItem("eventos", JSON.stringify(eventos));
    } else {
        alert("❌ Error: evento no encontrado.");
        return;
    }
}



    let evento = eventos[eventoId];

    // Evitar duplicados
    if (evento.asistentes.some(a => a.email === email)) {
        alert("❌ Ya estás registrado en este evento con ese correo.");
        return;
    }

    // Verificar cupo
    if (evento.cupo <= 0) {
        alert("⚠️ No quedan cupos disponibles.");
        return;
    }

    // Registrar
    evento.asistentes.push({ nombre, email, telefono });
    evento.cupo--;

    // Guardar en localStorage
    eventos[eventoId] = evento;
    localStorage.setItem("eventos", JSON.stringify(eventos));

    // Actualizar UI
    actualizarCupoUI(eventoId, evento.cupo);

    alert("✅ Registro exitoso para " + nombre);
    form.reset();
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
});



// Obtener cupo inicial desde el HTML
function obtenerCupoInicial(eventoId) {
    const el = document.querySelector(`#${eventoId} .cupo`);
    return el ? parseInt(el.textContent, 10) : 0;
}

// Actualizar cupo en UI
function actualizarCupoUI(eventoId, nuevoCupo) {
    const el = document.querySelector(`#${eventoId} .cupo`);
    if (el) el.textContent = nuevoCupo;

    // Cambiar estado del botón si se acaban los cupos
    const btn = document.querySelector(`#${eventoId} .btn-inscribirse`);
    if (btn) {
        if (nuevoCupo <= 0) {
            btn.classList.remove("btn-primary");
            btn.classList.add("btn-secondary");
            btn.setAttribute("disabled", "true");
            btn.innerHTML = '<i class="bi bi-x-octagon-fill"></i> Cupos Completos';
        }
    }
}
