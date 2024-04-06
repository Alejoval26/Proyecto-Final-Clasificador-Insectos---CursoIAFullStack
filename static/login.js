// Agrega un escuchador de eventos para el formulario de inicio de sesión (login)
document.getElementById('loginForm').onsubmit = async (event) => {
    // Previene el comportamiento por defecto del formulario, que es recargar la página
    event.preventDefault();

    // Obtiene los valores de usuario y contraseña de los campos del formulario
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Crea una nueva instancia de URLSearchParams que es útil para construir cuerpos de solicitud
    const formData = new URLSearchParams();
    // Agrega el nombre de usuario y la contraseña a la instancia formData
    formData.append('username', username);
    formData.append('password', password);

    // Realiza una solicitud POST al servidor para intentar iniciar sesión
    const response = await fetch('http://localhost:8000/login', {
        method: 'POST', // Método HTTP utilizado para la solicitud
        body: formData  // El cuerpo de la solicitud conteniendo los datos del formulario
    });

    // Espera la respuesta del servidor y la convierte en formato JSON
    const data = await response.json();

    // Verifica si la respuesta del servidor fue exitosa (código de estado 200-299)
    if (response.ok) {
        // Si el inicio de sesión fue exitoso, redirige al usuario a la página de clasificación
        window.location.href = '/clasificar';
    } else {
        // Si hay un error (como credenciales inválidas), muestra un mensaje de alerta
        alert(data.detail);
    }
};
