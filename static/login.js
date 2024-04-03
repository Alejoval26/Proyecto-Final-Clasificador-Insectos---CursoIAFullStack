// login.js
document.getElementById('loginForm').onsubmit = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (response.ok) {
        // Cambio de pestaña gracias a petición exitosa
        window.location.href = '/clasificar';
    } else {
        // Alerta por error en la petición
        alert(data.detail);
    }
};
