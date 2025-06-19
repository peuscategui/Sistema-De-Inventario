# Inventario EFC

Sistema de gestión de inventario para EFC desarrollado con NestJS (backend) y React (frontend).

## 🚀 Tecnologías

### Backend
- **NestJS** - Framework de Node.js
- **TypeScript** - Lenguaje de programación
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **Jest** - Testing

### Frontend (Próximamente)
- **React** - Biblioteca de JavaScript
- **TypeScript** - Lenguaje de programación
- **Vite** - Build tool
- **Tailwind CSS** - Framework de CSS

## 📁 Estructura del Proyecto

```
Inventario EFC/
├── backend/                 # Servidor NestJS
│   ├── src/
│   │   ├── inventory/       # Módulo de inventario
│   │   ├── clasificacion/   # Módulo de clasificación
│   │   ├── colaboradores/   # Módulo de colaboradores
│   │   ├── inventario-relacional/ # Vista relacional
│   │   └── scripts/         # Scripts de migración
│   ├── prisma/              # Esquema y migraciones de BD
│   └── package.json
├── frontend/                # Cliente React (próximamente)
└── README.md
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- PostgreSQL
- Git

### Backend

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd Inventario EFC/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con las credenciales de tu base de datos
```

4. **Configurar la base de datos**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Ejecutar el servidor**
```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3002`

## 📊 Endpoints API

### Inventario
- `GET /inventory` - Obtener todos los elementos del inventario
- `GET /inventory/:id` - Obtener elemento por ID
- `POST /inventory` - Crear nuevo elemento
- `PUT /inventory/:id` - Actualizar elemento
- `DELETE /inventory/:id` - Eliminar elemento

### Clasificación
- `GET /clasificacion` - Obtener todas las clasificaciones
- `GET /clasificacion/:id` - Obtener clasificación por ID
- `POST /clasificacion` - Crear nueva clasificación
- `PUT /clasificacion/:id` - Actualizar clasificación
- `DELETE /clasificacion/:id` - Eliminar clasificación

### Colaboradores
- `GET /colaboradores` - Obtener todos los colaboradores
- `GET /colaboradores/:id` - Obtener colaborador por ID
- `POST /colaboradores` - Crear nuevo colaborador
- `PUT /colaboradores/:id` - Actualizar colaborador
- `DELETE /colaboradores/:id` - Eliminar colaborador

### Inventario Relacional
- `GET /inventario-relacional` - Vista relacional del inventario
- `GET /inventario-relacional/search` - Búsqueda en inventario
- `GET /inventario-relacional/:id` - Obtener elemento relacional por ID

## 🗄️ Base de Datos

El proyecto utiliza PostgreSQL con Prisma como ORM. Las principales entidades son:

- **inventory** - Elementos del inventario
- **clasificacion** - Clasificaciones de equipos
- **empleado** - Información de colaboradores

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests e2e
npm run test:e2e

# Ejecutar tests con coverage
npm run test:cov
```

## 📝 Scripts Disponibles

- `npm run start:dev` - Servidor en modo desarrollo
- `npm run build` - Compilar el proyecto
- `npm run start` - Servidor en modo producción
- `npm run lint` - Ejecutar ESLint
- `npm run lint:fix` - Corregir errores de ESLint

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [TuGitHub](https://github.com/tuusuario)

## 🙏 Agradecimientos

- NestJS por el excelente framework
- Prisma por el ORM intuitivo
- La comunidad de desarrolladores 