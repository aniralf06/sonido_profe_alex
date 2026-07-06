// 1. Configuración de conexión con tu base de datos de Supabase
const SUPABASE_URL = 'https://wmlwjskmyubjinxvjpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbHdqc2tteXViamlueHZqcHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDI1NzcsImV4cCI6MjA5ODg3ODU3N30.9OsyZ4TzFyuCgc1_2gHdSWZP3ea1f3jBcG1IQFYA-l8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const formulario = document.getElementById('requestForm');
let estaEnviando = false;

// 🔒 1. COMPROBACIÓN INICIAL: Ver el estado al cargar la página
async function validarAccesoEvento() {
    try {
        const { data: eventoActivo, error } = await supabaseClient.rpc('verificar_evento_activo');
        if (error) throw error;

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
        console.error('Error al checar el estado del evento:', error);
    }
}

// Ejecutar al cargar la página
validarAccesoEvento();


// 🔒 2. ESCUCHA DE ENVÍO BLINDADA (Verificación de último segundo)
formulario.addEventListener('submit', async function(event) {
    event.preventDefault(); // Frenamos la recarga nativa

    if (estaEnviando) return;
    estaEnviando = true;

    // Bloqueamos el botón visualmente
    const botonEnviar = formulario.querySelector('button') || formulario.querySelector('input[type="submit"]');
    botonEnviar.disabled = true;
    const textoOriginal = botonEnviar.innerText || botonEnviar.value;
    
    if (botonEnviar.tagName === 'BUTTON') {
        botonEnviar.innerText = 'ENVIANDO...';
    } else {
        botonEnviar.value = 'ENVIANDO...';
    }

    try {
        // 🚨 EL CANDADO TRIPLE A: Antes de meter los datos, preguntamos si sigue abierto
        const { data: sigueActivo, error: errorCheck } = await supabaseClient.rpc('verificar_evento_activo');
        if (errorCheck) throw errorCheck;

        // Si el DJ cerró el evento mientras el usuario escribía, lo rebotamos aquí
        if (sigueActivo === false || sigueActivo === null) {
            alert('¡Ops! El Profe Alex acaba de cerrar las peticiones en este preciso momento. Tu canción no pudo enviarse.');
            validarAccesoEvento(); // Transforma la pantalla al mensaje de cerrado inmediatamente
            return; // Cortamos la ejecución aquí, impidiendo el .from().insert()
        }

        // Si pasó la prueba, procedemos a atrapar los textos y enviarlos
        const nombre = document.getElementById('nombre').value;
        const cancion = document.getElementById('cancion').value;
        const autor = document.getElementById('autor').value;
        const mensaje = document.getElementById('mensaje').value;

        const { error: errorInsert } = await supabaseClient
            .from('peticiones')
            .insert([
                { nombre: nombre, cancion: cancion, autor: autor, mensaje: mensaje }
            ]);

        if (errorInsert) throw errorInsert;

        alert(`¡Petición enviada! Gracias ${nombre}, El Profe Alex la recibirá en su pantalla.`);
        formulario.reset(); 

    } catch (error) {
        console.error('Error en el proceso:', error);
        alert('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.');
    } finally {
        // Liberamos el botón solo si la pantalla no se transformó a "Cerrado"
        if (formulario.querySelector('input, textarea')) {
            estaEnviando = false;
            botonEnviar.disabled = false;
            if (botonEnviar.tagName === 'BUTTON') {
                botonEnviar.innerText = textoOriginal;
            } else {
                botonEnviar.value = textoOriginal;
            }
        }
    }
});
