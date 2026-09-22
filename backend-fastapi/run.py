"""
Punto de entrada de la API.

Ejecutar desde la carpeta backend-fastapi:

    python run.py

El servidor queda disponible en http://127.0.0.1:8000
Documentación automática (Swagger): http://127.0.0.1:8000/docs
"""
import uvicorn

from app.config import PORT

if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=PORT, reload=True)