// login.js
document.getElementById('loginForm').onsubmit = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            username,
            password
        })
    });

    const data = await response.json();
    if (response.ok) {
        //cambio de pestana gracias a peticion exitosa
        window.location.href = 'clasificar.html';
    } else {
        // alerta por error en la peticion
        alert(data.detail);
    }
};
