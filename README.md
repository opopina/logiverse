# 🦊 LogiVerse - El Futuro de la Educación Lógica

![LogiVerse](https://img.shields.io/badge/LogiVerse-v1.0.0-orange.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-purple.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
[![DeepSource](https://app.deepsource.com/gh/opopina/logiverse.svg/?label=active+issues&show_trend=true&token=_TBBFOWgSmj1-AjMYCMOAJoq)](https://app.deepsource.com/gh/opopina/logiverse/)

## 🚀 ¿Qué es LogiVerse?

**LogiVerse es el primer juego educativo multijugador con IA que revoluciona el aprendizaje de lógica matemática.** Desde conceptos básicos hasta debates complejos, los estudiantes aprenden jugando en un universo mágico guiados por **Loggie**, un zorrito inteligente powered by OpenAI.

### ✨ Características Únicas

- 🎮 **Multijugador en Tiempo Real** - Batallas lógicas épicas
- 🤖 **Loggie IA** - Tutor inteligente con OpenAI GPT-4o-mini
- 🌍 **6 Mundos Únicos** - Desde Villa Verdad hasta Simulador de Vida
- 🏆 **Sistema ELO** - Rankings competitivos como en ajedrez
- ⚔️ **7 Tipos de Batalla** - Casual, Ranked, Speed, Tournament, etc.
- 📊 **Analytics Avanzados** - Progreso detallado y métricas

## 🎯 Para Quién

- **👧 Estudiantes** de 8-18 años que quieren dominar la lógica
- **👩‍🏫 Educadores** buscando herramientas innovadoras
- **🧠 Entusiastas** de la lógica y el pensamiento crítico
- **🎮 Gamers** que disfrutan desafíos intelectuales

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Styling moderno
- **Framer Motion** - Animaciones fluidas
- **Three.js** - Gráficos 3D
- **Socket.io Client** - Tiempo real

### Backend
- **Node.js** + Express + TypeScript
- **Prisma ORM** - Base de datos type-safe
- **PostgreSQL** - Base de datos robusta
- **Redis** - Cache y sessions
- **Socket.io** - WebSockets tiempo real
- **OpenAI API** - IA conversacional

### DevOps
- **Docker** + Docker Compose
- **npm Workspaces** - Monorepo
- **ESLint** + **Prettier** - Code quality

## 🚀 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/usuario/logiverse.git
cd logiverse
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar entorno
```bash
# Copiar template de variables
cp ENV_TEMPLATE.md packages/backend/api-gateway/.env

# Editar .env con tus claves (OpenAI, JWT, etc.)
nano packages/backend/api-gateway/.env
```

### 4. Iniciar base de datos
```bash
docker-compose up -d
```

### 5. Configurar base de datos
```bash
npm run db:setup
```

### 6. ¡Lanzar LogiVerse!
```bash
npm run dev
```

🎉 **¡Ve a `http://localhost:5173` y disfruta!**

## 🎮 Cómo Jugar

### Modo Individual
1. **🔐 Regístrate** o inicia sesión
2. **🌱 Entra a Villa Verdad** - El primer mundo
3. **🧩 Resuelve puzzles** con la ayuda de Loggie
4. **⭐ Desbloquea mundos** conforme avanzas

### Modo Multijugador
1. **⚔️ Haz clic en "¡BATALLAS LÓGICAS!"**
2. **🏟️ Únete a una sala** o crea la tuya
3. **🤖 Compite** con Loggie como moderador IA
4. **🏆 Escala el ranking** mundial

## 🌍 Los 6 Mundos de LogiVerse

| Mundo | Descripción | Estado |
|-------|-------------|--------|
| 🌱 **Villa Verdad** | Fundamentos de lógica | ✅ Disponible |
| 🕵️ **Ciudad Sherlock** | Deducción avanzada | 🚧 En desarrollo |
| ⚖️ **Corte Real** | Argumentación legal | 📋 Planeado |
| 🌀 **Laberinto Mental** | Lógica compleja | 📋 Planeado |
| 🏛️ **Arena del Pensamiento** | Debates públicos | 📋 Planeado |
| 🌌 **Simulador de Vida** | Aplicaciones reales | 📋 Planeado |

## 🤖 Loggie - Tu Tutor IA

**Loggie es más que un avatar - es un tutor inteligente que:**

- 💬 **Conversa naturalmente** usando OpenAI GPT-4o-mini
- 🎯 **Adapta explicaciones** a tu nivel y progreso
- 🏆 **Celebra tus logros** de manera personalizada
- 💡 **Genera pistas inteligentes** sin dar la respuesta
- ⚔️ **Modera batallas** multijugador en tiempo real

## 🏆 Sistema de Rankings

### ELO Rating System
- 🥇 **1600+** - Gran Maestro de la Lógica
- 🥈 **1400-1599** - Maestro Lógico
- 🥉 **1200-1399** - Experto en Razonamiento
- 📈 **1000-1199** - Pensador Avanzado
- 🌱 **800-999** - Aprendiz de Lógica

### Tipos de Batalla
- 🏆 **Ranked** - Competitivo con ELO
- ⚡ **Speed** - Rápido y frenético
- 🎓 **Educational** - Con más ayuda de Loggie
- 👥 **Cooperative** - Trabajo en equipo
- 🏟️ **Tournament** - Eliminatorias épicas
- 🔒 **Private** - Solo con amigos
- 🎲 **Casual** - Relajado y divertido

## 📊 Métricas y Analytics

### Para Estudiantes
- 📈 **Progreso visual** por competencia lógica
- ⏱️ **Tiempo de resolución** y mejoras
- 🎯 **Áreas de fortaleza** y oportunidad
- 🏅 **Logros desbloqueados** y metas

### Para Educadores
- 👥 **Dashboard grupal** de la clase
- 📊 **Reportes detallados** por estudiante
- 🎯 **Identificación de dificultades** comunes
- 📈 **Seguimiento de progreso** a largo plazo

## 🔧 Desarrollo

### Estructura del Proyecto
```
logiverse/
├── packages/
│   ├── frontend/          # React + Vite
│   ├── backend/
│   │   └── api-gateway/   # Node.js + Express
│   ├── ai-engine/         # Servicios de IA
│   ├── mobile/            # React Native (futuro)
│   └── shared/            # Tipos compartidos
├── infrastructure/        # Docker configs
├── scripts/              # Scripts de desarrollo
└── docs/                 # Documentación
```

### Scripts Disponibles
```bash
# Desarrollo
npm run dev                # Frontend + Backend
npm run dev:frontend      # Solo frontend
npm run dev:backend       # Solo backend

# Base de datos
npm run db:setup          # Configurar DB
npm run db:migrate        # Migrar schema
npm run db:studio         # Prisma Studio

# Testing
npm run test              # Ejecutar tests
npm run test:coverage     # Coverage report

# Build
npm run build             # Build completo
npm run build:frontend    # Build frontend
npm run build:backend     # Build backend
```

## 🤝 Contribuir

¡Queremos que LogiVerse sea aún mejor! 

### 🎯 Áreas donde puedes ayudar:
- 🎮 **Nuevos tipos de juego** lógicos
- 🌍 **Contenido para mundos** adicionales
- 🎨 **Mejoras de UI/UX**
- 🤖 **Optimizaciones de IA**
- 🌐 **Internacionalización**
- 📱 **Desarrollo móvil**

### 📋 Proceso:
1. Fork del repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **OpenAI** - Por hacer posible la IA conversacional
- **Prisma** - Por el ORM más elegante
- **Vercel** - Por las herramientas increíbles
- **Comunidad Open Source** - Por la inspiración constante

## 📞 Contacto

- 📧 **Email**: [tu-email@ejemplo.com]
- 🐦 **Twitter**: [@LogiVerse]
- 💬 **Discord**: [Comunidad LogiVerse]
- 🌐 **Website**: [logiverse.edu]

---

<div align="center">

**🦊 Hecho con ❤️ para revolucionar la educación lógica**

[⭐ Dale una estrella](../../stargazers) | [🐛 Reportar bug](../../issues) | [💡 Solicitar feature](../../issues)

</div>