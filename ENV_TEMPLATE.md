# 🔐 Variables de Entorno para LogiVerse

## Crear archivo `.env` en `packages/backend/api-gateway/`

```bash
# 🦊 LogiVerse Environment Variables
# Database Configuration
DATABASE_URL="postgresql://logiverse:logiverse@localhost:5432/logiverse?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-this"
JWT_EXPIRES_IN="24h"
BCRYPT_SALT_ROUNDS=12

# OpenAI Configuration - ¡Loggie Inteligente! 🤖
OPENAI_API_KEY="your-openai-api-key-here"
OPENAI_MODEL="gpt-4o-mini"
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Server Configuration
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"
```

## ⚠️ IMPORTANTE

**NUNCA subas tu archivo .env real a GitHub**. Solo sube este template.

**Para configurar tu entorno:**
1. Copia este contenido a `packages/backend/api-gateway/.env`
2. Reemplaza `your-openai-api-key-here` con tu clave real de OpenAI
3. Cambia `your-super-secret-jwt-key-here-change-this` por una clave secreta fuerte
