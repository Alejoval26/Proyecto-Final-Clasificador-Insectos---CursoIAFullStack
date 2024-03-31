// Asegúrate de que el nombre de este archivo coincida con el que has referenciado en tu HTML

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('http://localhost:8000/registrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
    
    const data = await response.json();
    if (response.ok) {
        // Aquí puedes redirigir al usuario a otro HTML o mostrar un mensaje de éxito
        alert('Usuario registrado con éxito');
        window.location.href = 'login.html'; // Cambia a tu página de inicio de sesión
    } else {
        // Mostrar mensaje de error al usuario
        alert(`Error en el registro: ${data.detail}`);
    }
});
