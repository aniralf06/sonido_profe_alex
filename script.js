// 1. Configuración de conexión con tu base de datos de Supabase
const SUPABASE_URL = 'https://wmlwjskmyubjinxvjpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbHdqc2tteXViamlueHZqcHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDI1NzcsImV4cCI6MjA5ODg3ODU3N30.9OsyZ4TzFyuCgc1_2gHdSWZP3ea1f3jBcG1IQFYA-l8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Seleccionamos el formulario en el HTML
const formulario = document.getElementById('requestForm');

// 3. Escuchamos el evento de envío
formulario.addEventListener('submit', async function(event) {
    event.preventDefault(); 

    // 🔍 Localizamos el botón de enviar dentro de tu formulario
    const botonEnviar = formulario.querySelector('button') || formulario.querySelector('input[type="submit"]');

    // 🛑 PASO NUEVO: Deshabilitamos el botón inmediatamente para frenar el doble clic
    botonEnviar.disabled = true;
    const textoOriginal = botonEnviar.innerText || botonEnviar.value;
    
    // Le cambiamos el texto visual para dar feedback al usuario
    if (botonEnviar.tagName === 'BUTTON') {
        botonEnviar.innerText = 'ENVIANDO...';
    } else {
        botonEnviar.value = 'ENVIANDO...';
    }

    // Atrapamos los valores de las casillas
    const nombre = document.getElementById('nombre').value;
    const cancion = document.getElementById('cancion').value;
    const autor = document.getElementById('autor').value;
    const mensaje = document.getElementById('mensaje').value;

    try {
        // 4. Enviamos los datos usando nuestra variable blindada
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

        if (error) {
            throw error;
        }

        // Alerta de éxito si todo sale bien
        alert(`¡Petición enviada! Gracias ${nombre}, El Profe Alex la recibirá en su pantalla.`);
        formulario.reset(); // Limpiamos el formulario

    } catch (error) {
        console.error('Error detallado:', error);
        alert('Hubo un problema al enviar tu canción. Inténtalo de nuevo.');
    } finally {
        // 🔓 PASO NUEVO: Pase lo que pase (éxito o error), restauramos el botón
        botonEnviar.disabled = false;
        if (botonEnviar.tagName === 'BUTTON') {
            botonEnviar.innerText = textoOriginal;
        } else {
            botonEnviar.value = textoOriginal;
        }
    }
});
