// Agrega un escuchador de eventos para el envío del formulario de registro
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    // Previene el comportamiento por defecto de enviar el formulario
    event.preventDefault();
    
    // Obtiene los valores de usuario y contraseña de los campos del formulario
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Realiza una solicitud POST al servidor para registrar un nuevo usuario
    const response = await fetch('http://localhost:8000/registrar', {
        method: 'POST', // Método HTTP utilizado para la solicitud
        headers: {
            'Content-Type': 'application/json', // Establece el tipo de contenido como JSON
        },
        body: JSON.stringify({ // Convierte el objeto de usuario y contraseña a una cadena JSON
            username: username,
            password: password
        })
    });
    
    // Espera la respuesta del servidor y la convierte en formato JSON
    const data = await response.json();
    
    // Verifica si la respuesta del servidor fue exitosa (código de estado 200-299)
    if (response.ok) {
        // Si el registro fue exitoso, muestra un mensaje y redirige al usuario a la página de inicio de sesión
        alert('Usuario registrado con éxito');
        window.location.href = 'login.html'; // Se redirige al usuario a la página de login
    } else {
        // Si hay un error (como un usuario ya existente), muestra un mensaje de alerta
        alert(`Error en el registro: ${data.detail}`);
    }
});
