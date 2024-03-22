from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow import keras
from keras.models import load_model
from keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np
import uvicorn


app = FastAPI()

origins = [
    "http://localhost:8000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite cualquier origen
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos
    allow_headers=["*"],  # Permite todos los headers
)


#Este es el modelo que creee de 0. El modelo con transfer learning que saca el error es el modelo "mi_modelo.h5"
model = load_model('mi_modeloprueba.h5')

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "admin": 
        return {"mensaje": "Login exitoso"}
    raise HTTPException(status_code=400, detail="Credenciales inválidas")

@app.post("/clasificar")
async def clasificar_imagen(file: UploadFile = File(...)):
    # Convertir la imagen para que sea compatible con el modelo
    try:
        image = Image.open(file.file)
        image = image.resize((150, 150)) 
        image_array = img_to_array(image)
        image_array = np.expand_dims(image_array, axis=0) / 255.0

        # Realizar predicción
        #model = load_model('mi_modelo.h5')
        prediction = model.predict(image_array)
        prediction_result = np.argmax(prediction, axis=1)
        

        return {"clase": str(prediction_result[0])}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

