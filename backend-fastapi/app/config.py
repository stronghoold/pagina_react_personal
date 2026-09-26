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

# ─── Envío de correos (SMTP) ───
# Notificaciones de compra, facturas y recuperación de contraseña.
# Con Gmail: activa la verificación en dos pasos y crea una "contraseña de
# aplicación" (16 caracteres) que se pega en SMTP_PASSWORD.
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '').strip()
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '').strip()
# Remitente visible; si está vacío se usa SMTP_USER.
SMTP_FROM = os.getenv('SMTP_FROM', '').strip() or SMTP_USER
SMTP_FROM_NAME = os.getenv('SMTP_FROM_NAME', 'TechPC - Tienda de Tecnología').strip()
# STARTTLS (587) activado por defecto; para el puerto 465 usa SMTP_SSL.
SMTP_TLS = os.getenv('SMTP_TLS', 'true').lower() in {'1', 'true', 'si', 'sí', 'yes'}
SMTP_SSL = os.getenv('SMTP_SSL', 'false').lower() in {'1', 'true', 'si', 'sí', 'yes'}
SMTP_TIMEOUT = int(os.getenv('SMTP_TIMEOUT', '20'))
# El servicio solo intenta enviar cuando hay credenciales configuradas.
EMAIL_ENABLED = bool(SMTP_USER and SMTP_PASSWORD)
# Correo de contacto que recibe copia de cada compra (opcional).
EMAIL_COPIA_VENTAS = os.getenv('EMAIL_COPIA_VENTAS', '').strip()

# URL pública del Frontend (usada en los enlaces de los correos).
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')

# ─── Parámetros comerciales ───
# Impuesto aplicado a las ventas (IVA Colombia).
IMPUESTO_PORCENTAJE = float(os.getenv('IMPUESTO_PORCENTAJE', '19'))
# Nombre e identificación del proyecto (usados en reportes y facturas).
NOMBRE_PROYECTO = os.getenv('NOMBRE_PROYECTO', 'TechPC - Tienda de Tecnología')
IDENTIFICACION_PROYECTO = os.getenv('IDENTIFICACION_PROYECTO', 'Ficha 3406204 - Trimestre 03')
# Correo de contacto que se muestra al cliente.
EMAIL_CONTACTO = os.getenv('EMAIL_CONTACTO', 'contacto@techpc.com')
