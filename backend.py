from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import uvicorn
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import pandas as pd


from fastapi import FastAPI, File, UploadFile, HTTPException
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import numpy as np
import uvicorn
from io import BytesIO

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

model = load_model('mi_modelo.h5')

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "admin": 
        return {"mensaje": "Login exitoso"}
    raise HTTPException(status_code=400, detail="Credenciales inválidas")

# Cargamos el mapeo de etiquetas desde el CSV
df_classes = pd.read_csv('_classes.csv')
label_map = {index - 2: class_name for index, class_name in enumerate(df_classes.columns) if index != 0}


@app.post("/clasificar")
async def clasificar_imagen(file: UploadFile = File(...)):
    try:
        # Convertimos el archivo cargado en un objeto BytesIO.
        contents = await file.read()
        image = load_img(BytesIO(contents), target_size=(150, 150))
        
        # Convertimos la imagen a un array, agregamos una dimensión y normalizamos.
        image_array = img_to_array(image)
        image_array = np.expand_dims(image_array, axis=0) / 255.0

        # Realizamos la predicción y obtenemos el nombre de la clase correspondiente al índice predicho.
        prediction = model.predict(image_array)
        prediction_result = np.argmax(prediction, axis=1)[0]
        predicted_class = label_map[prediction_result]
        
        return {"clase": predicted_class}
    except Exception as e:
        return {"error": str(e)}    

# @app.post("/clasificar")
# async def clasificar_imagen(file: UploadFile = File(...)):
#     # Convertir la imagen para que sea compatible con el modelo
#     try:
#         image = Image.open(file.file)
#         image = image.resize((150, 150)) 
#         image_array = img_to_array(image)
#         image_array = np.expand_dims(image_array, axis=0) / 255.0

#         # Realizar predicción
#         #model = load_model('mi_modelo.h5')
#         prediction = model.predict(image_array)
#         prediction_result = np.argmax(prediction, axis=1)
#         predicted_class = label_map[prediction_result[0]]
        

#         print(predicted_class)
#         return {"clase": predicted_class}
#     except Exception as e:
#         return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

