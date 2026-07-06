// 1. Configuración de conexión con tu base de datos
const SUPABASE_URL = 'https://wmlwjskmyubjinxvjpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbHdqc2tteXViamlueHZqcHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDI1NzcsImV4cCI6MjA5ODg3ODU3N30.9OsyZ4TzFyuCgc1_2gHdSWZP3ea1f3jBcG1IQFYA-l8';

// Cambiamos el nombre a 'supabaseClient' para que el navegador no se confunda
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Seleccionamos el formulario en el HTML
const formulario = document.getElementById('requestForm');

// 3. Escuchamos el evento de envío
formulario.addEventListener('submit', async function(event) {
    event.preventDefault(); // ¡Ahora sí se activará y detendrá el reinicio de la página!

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
    }
});