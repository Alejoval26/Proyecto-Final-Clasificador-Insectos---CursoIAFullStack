// clasificar.js
document.getElementById('imageForm').onsubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    const imageFile = document.getElementById('image').files[0];
    formData.append('file', imageFile);

    const response = await fetch('http://localhost:8000/clasificar', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (response.ok) {
        // Mostrar el resultado de la clasificación
        document.getElementById('resultado').innerText = `Clase predicha: ${data.clase}`;
    } else {
        // errpr en la peticion
        document.getElementById('resultado').innerText = `Error: ${data.error}`;
    }
};
