-- LogiVerse PostgreSQL Initialization Script
-- Este script se ejecuta automáticamente cuando se crea el contenedor por primera vez

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas de texto más eficientes

-- Configuraciones de base de datos
ALTER DATABASE logiverse SET timezone TO 'UTC';

-- Crear usuario adicional para desarrollo (opcional)
-- CREATE USER logiverse_dev WITH PASSWORD 'dev_password';
-- GRANT ALL PRIVILEGES ON DATABASE logiverse TO logiverse_dev;

-- Mostrar información
SELECT 'LogiVerse Database initialized successfully!' as status;
