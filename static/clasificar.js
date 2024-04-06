// Cuando el DOM está completamente cargado, se ejecutan las siguientes instrucciones.
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a los elementos HTML necesarios para el streaming de video y captura de imágenes.
    const videoElement = document.getElementById('videoStream');
    const canvasElement = document.getElementById('canvas');
    const imageInput = document.getElementById('image');
    const captureButton = document.getElementById('captureButton');
    const classifyButton = document.getElementById('classifyButton');
    const resultadoDiv = document.getElementById('resultado');
    let imageCaptured = false; // Flag para indicar si se ha capturado una imagen.

    // Tamaños fijos para el canvas donde se mostrará la imagen capturada.
    const canvasWidth = 200;
    const canvasHeight = 200;
    canvasElement.width = canvasWidth;
    canvasElement.height = canvasHeight;

    // Función para configurar y acceder a la cámara del dispositivo.
    async function setupCamera() {
        try {
            // Intenta obtener el stream de video y lo asigna al elemento video para su reproducción.
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;
            // Hace visible el video y el botón de captura.
            videoElement.style.display = 'block';
            captureButton.style.display = 'block';
        } catch (error) {
            // Si ocurre un error al acceder a la cámara, se registra en la consola.
            console.error("Error al acceder a la cámara del dispositivo:", error);
        }
    }

    // Evento para manejar la captura de una imagen utilizando la cámara del dispositivo.
    captureButton.addEventListener('click', function() {
        // Contexto del canvas para poder dibujar en él.
        const ctx = canvasElement.getContext('2d');
        // Limpia el canvas y dibuja la imagen actual del video en el canvas.
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        imageCaptured = true; // Establece que se ha capturado una imagen.
    });

    // Función auxiliar para convertir DataURL a Blob, necesario para el envío de la imagen al servidor.
    function dataURLtoBlob(dataURL) {
        // Separa la metadata del contenido en base64 de la DataURL.
        const parts = dataURL.split(';base64,');
        const imageType = parts[0].split(':')[1];
        const decodedData = window.atob(parts[1]);
        const array = new Uint8Array(decodedData.length);

        // Convierte los datos decodificados en un array de bytes.
        for (let i = 0; i < decodedData.length; ++i) {
            array[i] = decodedData.charCodeAt(i);
        }

        // Crea y retorna un Blob a partir del array de bytes.
        return new Blob([array], { type: imageType });
    }

    // Evento para cuando se selecciona un archivo de imagen a través del input tipo 'file'.
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0]; // El archivo seleccionado.
        if (file) {
            // FileReader para leer el contenido del archivo seleccionado.
            const reader = new FileReader();
            reader.onload = function(e) {
                // Crea una nueva imagen y establece su contenido una vez que esté cargado.
                const imgElement = new Image();
                imgElement.onload = function() {
                    // Dibuja la imagen cargada en el canvas.
                    const ctx = canvasElement.getContext('2d');
                    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                    ctx.drawImage(imgElement, 0, 0, canvasElement.width, canvasElement.height);
                    imageCaptured = true; // Establece que se ha capturado una imagen.
                };
                imgElement.src = e.target.result; // Resultado de FileReader, la DataURL del archivo.
            };
            reader.readAsDataURL(file); // Inicia la lectura del archivo y carga su contenido.
        }
    });

    // Evento para el botón de clasificar que enviará la imagen al servidor para su procesión.
    classifyButton.addEventListener('click', async () => {
        // Verifica si se ha capturado una imagen antes de proceder.
        if (!imageCaptured) {
            alert('Por favor, captura o sube una imagen antes de clasificar.');
            return;
        }

        // Obtiene los datos de la imagen del canvas y los convierte a Blob.
        const imageData = canvasElement.toDataURL('image/jpeg');
        const blobData = dataURLtoBlob(imageData);

        // Prepara el formulario para enviar la imagen al servidor.
        resultadoDiv.style.display = 'none';
        const formData = new FormData();
        formData.append('file', blobData);

        try {
            // Hace una petición POST al servidor con la imagen para su clasificación.
            const response = await fetch('http://localhost:8000/clasificar', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            // Maneja la respuesta del servidor.
            if (response.ok && data.clase) {
                // Muestra la clase predicha y la descripción si están presentes en la respuesta.
                resultadoDiv.innerHTML = `<strong>Clase predicha:</strong> ${data.clase}<br>`;
                if (data.descripcion) {
                    resultadoDiv.innerHTML += `<strong>Descripción:</strong> ${data.descripcion}`;
                }
            } else {
                // Muestra un mensaje de error si la respuesta no fue exitosa.
                resultadoDiv.innerText = `Error: ${data.error || 'Error en la clasificación'}`;
            }
        } catch (error) {
            // Maneja errores de la petición, como problemas de red.
            resultadoDiv.innerText = `Error en la petición: ${error.message}`;
        }
        // Vuelve a mostrar el div de resultados.
        resultadoDiv.style.display = 'block';
    });

    // Llama a la función para configurar la cámara al cargar la página.
    setupCamera();
});
