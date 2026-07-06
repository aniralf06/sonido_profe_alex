const SUPABASE_URL = 'https://wmlwjskmyubjinxvjpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbHdqc2tteXViamlueHZqcHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDI1NzcsImV4cCI6MjA5ODg3ODU3N30.9OsyZ4TzFyuCgc1_2gHdSWZP3ea1f3jBcG1IQFYA-l8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🧭 Guardado seguro por pestaña (sessionStorage)
let miPin = sessionStorage.getItem('dj_pin') || '';
let estadoEventoGlobal = false;

const pantallaLogin = document.getElementById('pantallaLogin');
const pantallaPanel = document.getElementById('pantallaPanel');
const inputPin = document.getElementById('inputPin');
const btnEntrar = document.getElementById('btnEntrar');
const contenedor = document.getElementById('contenedorPeticiones');

async function inicializarPanel() {
    if (!miPin) {
        pantallaLogin.style.display = 'block';
        pantallaPanel.style.display = 'none';
        return;
    }

    try {
        await cargarPeticiones();
        await checarEstadoBoton();
        
        pantallaLogin.style.display = 'none';
        pantallaPanel.style.display = 'block';
    } catch (err) {
        alert('PIN de acceso inválido.');
        marcarSalida();
    }
}

btnEntrar.addEventListener('click', () => {
    miPin = inputPin.value.trim();
    sessionStorage.setItem('dj_pin', miPin);
    inicializarPanel();
});

function marcarSalida() {
    sessionStorage.removeItem('dj_pin');
    miPin = '';
    inputPin.value = '';
    pantallaLogin.style.display = 'block';
    pantallaPanel.style.display = 'none';
}
document.getElementById('btnCerrarSesion').addEventListener('click', marcarSalida);

async function cargarPeticiones() {
    const { data: peticiones, error } = await supabaseClient.rpc('obtener_peticiones_seguras', { pin_ingresado: miPin });
    if (error) throw error;

    contenedor.innerHTML = peticiones.length === 0 
        ? '<p style="color: #666; text-align: center; font-size: 13px;">No hay peticiones pendientes en este evento.</p>' 
        : '';

    peticiones.forEach(peticion => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-cancion';
        tarjeta.innerHTML = `
            <div class="info-cancion">
                <h4>🎵 ${peticion.cancion}</h4>
                <p><strong>Autor:</strong> ${peticion.autor || 'Desconocido'}</p>
                <p><strong>De:</strong> ${peticion.nombre}</p>
                ${peticion.mensaje ? `<p class="saludo">💬 "${peticion.mensaje}"</p>` : ''}
            </div>
            <div>
                <button class="btn-delete" onclick="borrarPeticion(${peticion.id})">❌</button>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

async function checarEstadoBoton() {
    const { data: activo, error } = await supabaseClient.rpc('verificar_evento_activo');
    if (error) return;
    
    estadoEventoGlobal = activo;
    const btn = document.getElementById('btnSwitchEvento');
    if (activo) {
        btn.innerText = '🟢 EVENTO ACTIVO (Peticiones Abiertas)';
        btn.className = 'btn-flat btn-status-active';
    } else {
        btn.innerText = '🔴 EVENTO PAUSADO (Peticiones Cerradas)';
        btn.className = 'btn-flat btn-status-inactive';
    }
}

document.getElementById('btnSwitchEvento').addEventListener('click', async () => {
    const nuevoEstado = !estadoEventoGlobal;
    const { error } = await supabaseClient.rpc('cambiar_estado_evento', { 
        pin_ingresado: miPin, 
        nuevo_estado: nuevoEstado 
    });
    
    if (error) return alert('Error al cambiar estado.');
    checarEstadoBoton();
});

window.borrarPeticion = async (id) => {
    const { error } = await supabaseClient.rpc('eliminar_peticion_segura', { pin_ingresado: miPin, peticion_id: id });
    if (error) return alert('No se pudo remover.');
    cargarPeticiones();
};

document.getElementById('btnLimpiarTodo').addEventListener('click', async () => {
    if (!confirm('¿Seguro que deseas vaciar toda la lista para empezar un nuevo evento?')) return;
    const { error } = await supabaseClient.rpc('limpiar_peticiones_seguras', { pin_ingresado: miPin });
    if (error) return alert('Error al limpiar base de datos.');
    cargarPeticiones();
});

document.getElementById('btnActualizar').addEventListener('click', cargarPeticiones);

inicializarPanel();