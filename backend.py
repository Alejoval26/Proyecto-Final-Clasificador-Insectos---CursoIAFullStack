from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import uvicorn
import numpy as np
import pandas as pd
import mysql.connector
from mysql.connector import Error
from io import BytesIO
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Inicialización de la aplicación FastAPI
app = FastAPI()

# Montaje del directorio de archivos estáticos para servir archivos como HTML, CSS y JavaScript
app.mount("/static", StaticFiles(directory="static"), name="static")

# Ruta principal que sirve la página de inicio de sesión (login.html)
@app.get("/")
async def read_root():
    return FileResponse('static/login.html')

# Ruta que sirve la página de clasificación (clasificar.html)
@app.get("/clasificar")
async def get_classification_page():
    return FileResponse('static/clasificar.html')

# Ruta que sirve la página de registro (register.html)
@app.get("/registro")
async def get_register_page():
    return FileResponse('static/register.html')

# Configuración del middleware CORS para permitir peticiones desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos
    allow_headers=["*"],  # Permitir todos los encabezados
)

# Carga del modelo de machine learning para la clasificación de imágenes
model = load_model('mi_modelo.h5')

# Configuración de la conexión a la base de datos
db_config = {
    'user': 'alejoval',
    'password': 'alejoval',
    'host': 'db',  # Utilizar el nombre del servicio de Docker Compose
    'database': 'clasificadorinsectosia'
}

# Carga del mapeo de etiquetas de clases de imágenes desde un archivo CSV
df_classes = pd.read_csv('_classes.csv')
label_map = {index - 2: class_name for index, class_name in enumerate(df_classes.columns) if index != 0}

# Función auxiliar para obtener una conexión a la base de datos
def get_db_connection():
    connection = mysql.connector.connect(**db_config)
    return connection

# Modelo Pydantic para validar los datos de registro de usuario
class UserRegistration(BaseModel):
    username: str
    password: str

# Endpoint para registrar un nuevo usuario
@app.post("/registrar")
def register_user(user: UserRegistration):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Verificar si el nombre de usuario ya está registrado
        cursor.execute("SELECT * FROM usuarios WHERE usuario = %s", (user.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
        
        # Registrar el nuevo usuario en la base de datos
        cursor.execute("INSERT INTO usuarios (usuario, contrasena) VALUES (%s, %s)", (user.username, user.password))
        connection.commit()
        
        return {"mensaje": "Usuario registrado con éxito"}
    except Error as err:
        # Manejo de errores de conexión a la base de datos
        raise HTTPException(status_code=500, detail=f"Error en la base de datos: {err}")
    finally:
        # Cerrar la conexión a la base de datos
        cursor.close()
        connection.close()

# Endpoint para iniciar sesión de un usuario
@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Verificar las credenciales del usuario
        query = "SELECT * FROM usuarios WHERE usuario = %s AND contrasena = %s"
        cursor.execute(query, (username, password))
        user_record = cursor.fetchone()
        
        # Respuesta en caso de credenciales correctas o incorrectas
        if user_record:
            return {"mensaje": "Login exitoso"}
        else:
            raise HTTPException(status_code=400, detail="Credenciales inválidas")
    except Error as err:
        raise HTTPException(status_code=500, detail=f"Error en la base de datos: {err}")
    finally:
        cursor.close()
        connection.close()  

# Endpoint para clasificar una imagen
@app.post("/clasificar")
async def clasificar_imagen(file: UploadFile = File(...)):
    try:
        # Leer el archivo de imagen subido
        contents = await file.read()
        image = load_img(BytesIO(contents), target_size=(150, 150))
        image_array = img_to_array(image)
        image_array = np.expand_dims(image_array, axis=0) / 255.0

        # Hacer la predicción utilizando el modelo cargado
        prediction = model.predict(image_array)
        prediction_result = np.argmax(prediction, axis=1)[0]
        predicted_class = label_map[prediction_result]
        predicted_class = predicted_class.strip()

        # Obtener la descripción de la imagen clasificada de la base de datos
        connection = get_db_connection()
        cursor = connection.cursor()
        query = "SELECT descripcion FROM insectos WHERE nombre = %s"
        cursor.execute(query, (predicted_class,))
        description = cursor.fetchone()

        # Respuesta con la clase y descripción de la imagen
        if description:
            description = description[0]
        else:
            description = "Descripción no encontrada."
        
        return {"clase": predicted_class, "descripcion": description}
    except Exception as e:
        # Manejo de cualquier otro error
        return {"error": str(e)}
    finally:
        # Cerrar la conexión a la base de datos
        cursor.close()
        connection.close()

# Comando para correr el servidor usando Uvicorn, un ASGI server para FastAPI
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
