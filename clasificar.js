// clasificar.js

document.addEventListener('DOMContentLoaded', function() {
    const videoElement = document.getElementById('videoStream');
    const canvasElement = document.getElementById('canvas');
    const imageInput = document.getElementById('image');
    const captureButton = document.getElementById('captureButton');
    const classifyButton = document.getElementById('classifyButton');
    const resultadoDiv = document.getElementById('resultado');
    let imageCaptured = false; // Para rastrear si se ha capturado una imagen

    // Tamaños fijos para el canvas
    const canvasWidth = 200; // Ancho del canvas
    const canvasHeight = 200; // Alto del canvas
    canvasElement.width = canvasWidth;
    canvasElement.height = canvasHeight;

    // Función para iniciar la cámara automáticamente
    async function setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
            captureButton.style.display = 'block'; // Muestra el botón de captura
        } catch (error) {
            console.error("Error al acceder a la cámara del dispositivo:", error);
        }
    }

    // Función para capturar una foto de la cámara y dibujarla en el canvas
    captureButton.addEventListener('click', function() {
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        imageCaptured = true; // Establece que se ha capturado una imagen
    });

    // Convertir DataURL a Blob
    function dataURLtoBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const imageType = parts[0].split(':')[1];
        const decodedData = window.atob(parts[1]);
        const array = new Uint8Array(decodedData.length);

        for (let i = 0; i < decodedData.length; ++i) {
            array[i] = decodedData.charCodeAt(i);
        }

        return new Blob([array], { type: imageType });
    }

    // Evento 'change' para input de tipo 'file'
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgElement = new Image();
                imgElement.onload = function() {
                    const ctx = canvasElement.getContext('2d');
                    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                    ctx.drawImage(imgElement, 0, 0, canvasElement.width, canvasElement.height);
                    imageCaptured = true; // Establece que se ha capturado una imagen
                };
                imgElement.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Función para manejar la clasificación de la imagen
    classifyButton.addEventListener('click', async () => {
        if (!imageCaptured) {
            alert('Por favor, captura o sube una imagen antes de clasificar.');
            return;
        }

        // Preparar la imagen del canvas para enviar
        const imageData = canvasElement.toDataURL('image/jpeg');
        const blobData = dataURLtoBlob(imageData);

        resultadoDiv.style.display = 'none';
        const formData = new FormData();
        formData.append('file', blobData);

        try {
            const response = await fetch('http://localhost:8000/clasificar', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok && data.clase) {
                resultadoDiv.innerText = `Clase predicha: ${data.clase}`;
            } else {
                resultadoDiv.innerText = `Error: ${data.error || 'Error en la clasificación'}`;
            }
        } catch (error) {
            resultadoDiv.innerText = `Error en la petición: ${error.message}`;
        }
        resultadoDiv.style.display = 'block';
    });

    setupCamera(); // Inicia la cámara al cargar la página
});
