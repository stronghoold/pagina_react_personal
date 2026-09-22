"""
Configuración central de la API.
Las variables sensibles se leen desde el archivo .env (nunca se exponen en el código).
"""
import os

from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# ─── Base de datos ───
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'techpc_db')
DB_PORT = int(os.getenv('DB_PORT', '3306'))

# URL de conexión SQLAlchemy con PyMySQL
DATABASE_URL = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4'

# ─── Servidor ───
PORT = int(os.getenv('PORT', '8000'))

# ─── CORS ───
# Orígenes permitidos separados por coma.
CORS_ORIGINS = [o.strip() for o in os.getenv('CORS_ORIGINS', '*').split(',') if o.strip()]
# El comodín '*' no puede combinarse con allow_credentials=True.
CORS_ALLOW_ALL = '*' in CORS_ORIGINS

# ─── Seguridad (JWT) ───
JWT_SECRET = os.getenv('JWT_SECRET', 'cambia_este_secreto_en_produccion')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_MINUTES = 60 * 24  # 24 horas

# ─── Chatbot con Inteligencia Artificial ───
# La clave se mantiene privada en el .env y nunca se escribe en el código fuente.
IA_API_KEY = os.getenv('IA_API_KEY', '').strip()
IA_BASE_URL = os.getenv('IA_BASE_URL', 'https://api.openai.com/v1').rstrip('/')
IA_MODEL = os.getenv('IA_MODEL', 'gpt-4o-mini')
IA_TIMEOUT = int(os.getenv('IA_TIMEOUT', '20'))
IA_ENABLED = bool(IA_API_KEY)

# ─── Parámetros comerciales ───
# Impuesto aplicado a las ventas (IVA Colombia).
IMPUESTO_PORCENTAJE = float(os.getenv('IMPUESTO_PORCENTAJE', '19'))
# Nombre e identificación del proyecto (usados en reportes y facturas).
NOMBRE_PROYECTO = os.getenv('NOMBRE_PROYECTO', 'TechPC - Tienda de Tecnología')
IDENTIFICACION_PROYECTO = os.getenv('IDENTIFICACION_PROYECTO', 'Ficha 3406204 - Trimestre 03')
