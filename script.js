// 1. Configuración de conexión con tu base de datos de Supabase
const SUPABASE_URL = 'https://wmlwjskmyubjinxvjpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbHdqc2tteXViamlueHZqcHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDI1NzcsImV4cCI6MjA5ODg3ODU3N30.9OsyZ4TzFyuCgc1_2gHdSWZP3ea1f3jBcG1IQFYA-l8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Seleccionamos el formulario en el HTML
const formulario = document.getElementById('requestForm');
let estaEnviando = false;

// 🔒 1. COMPROBACIÓN: Verificar si el Profe Alex tiene las peticiones abiertas
async function validarAccesoEvento() {
    try {
        // Llamamos a la función segura del servidor de Supabase
        const { data: eventoActivo, error } = await supabaseClient.rpc('verificar_evento_activo');
        
        if (error) throw error;

        // Si el evento está pausado (FALSE o vacío), bloqueamos la pantalla de inmediato
        if (eventoActivo === false || eventoActivo === null) {
            formulario.innerHTML = `
                <div style="text-align: center; padding: 40px 10px;">
                    <h2 style="font-size: 40px; margin-bottom: 15px; color: #fff;">🎧</h2>
                    <h3 style="color: #fff; margin-bottom: 10px; font-family: sans-serif; letter-spacing: 1px;">PETICIONES CERRADAS</h3>
                    <p style="color: #aaa; font-size: 14px; line-height: 1.5; font-family: sans-serif;">
                        El Profe Alex no está recibiendo canciones en este momento.<br>
                        ¡Te esperamos en el próximo evento en vivo!
                    </p>
                </div>
            `;
        }
    } catch (error) {
        // Si la función de Supabase no existe aún o falla la red, lo registramos en consola
        console.error('Error al checar el estado del evento:', error);
    }
}

// Ejecutamos la validación inmediatamente al cargar la página en el teléfono
validarAccesoEvento();


// 🔒 2. ESCUCHA DE ENVÍO: Captura el clic, frena la recarga y manda los datos
formulario.addEventListener('submit', async function(event) {
    event.preventDefault(); // 🛑 AQUÍ SE DETIENE LA RECARGA DE LA PÁGINA

    // Candado lógico interno contra clics ultra veloces
    if (estaEnviando) return;
    estaEnviando = true;

    // Cambiamos el aspecto visual del botón
    const botonEnviar = formulario.querySelector('button') || formulario.querySelector('input[type="submit"]');
    botonEnviar.disabled = true;
    const textoOriginal = botonEnviar.innerText || botonEnviar.value;
    
    if (botonEnviar.tagName === 'BUTTON') {
        botonEnviar.innerText = 'ENVIANDO...';
    } else {
        botonEnviar.value = 'ENVIANDO...';
    }

    // Atrapamos los textos de las casillas
    const nombre = document.getElementById('nombre').value;
    const cancion = document.getElementById('cancion').value;
    const autor = document.getElementById('autor').value;
    const mensaje = document.getElementById('mensaje').value;

    try {
        // Enviamos la petición directamente a Supabase
        const { data, error } = await supabaseClient
            .from('peticiones')
            .insert([
                { 
                    nombre: nombre, 
                    cancion: cancion, 
                    autor: autor, 
                    mensaje: mensaje 
                }
            ]);

        if (error) throw error;

        alert(`¡Petición enviada! Gracias ${nombre}, El Profe Alex la recibirá en su pantalla.`);
        formulario.reset(); 

    } catch (error) {
        console.error('Error al insertar:', error);
        alert('Hubo un problema al enviar tu canción. Inténtalo de nuevo.');
    } finally {
        // Al terminar, liberamos el botón para el siguiente intento
        estaEnviando = false;
        botonEnviar.disabled = false;
        if (botonEnviar.tagName === 'BUTTON') {
            botonEnviar.innerText = textoOriginal;
        } else {
            botonEnviar.value = textoOriginal;
        }
    }
});
