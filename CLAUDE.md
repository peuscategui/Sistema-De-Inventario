# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Inventario EFC is a full-stack inventory management system for EFC developed with NestJS (backend) and Next.js (frontend). The system manages equipment inventory, classifications, employees, donations, and low-value items.

## Architecture

### Backend (NestJS + PostgreSQL + Prisma)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Port**: 3002
- **Main modules**: inventory, clasificacion, colaboradores, inventario-relacional, dashboard

### Frontend (Next.js + React + Tailwind)
- **Framework**: Next.js 15.3.4 with React 19
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Hook Form with Zod validation
- **Port**: 3000 (dev), 3005 (production)

### Database Schema
Key entities:
- `inventory`: Main equipment/items table with status field and foreign keys
- `clasificacion`: Equipment classifications with financial data  
- `empleado`: Employee/collaborator information
- Relationships: inventory -> clasificacion, inventory -> empleado

## Development Commands

### Backend (run from `/backend` directory)
```bash
# Development
npm run start:dev          # Start in watch mode
npm run build             # Build for production
npm run start:prod        # Start production build

# Database
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma client
npx prisma studio         # Open database GUI

# Testing
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Test coverage

# Code Quality
npm run lint              # ESLint
npm run format            # Prettier
```

### Frontend (run from `/frontend` directory)
```bash
# Development  
npm run dev               # Development server with Turbopack
npm run build             # Production build
npm run start             # Start production build
npm run lint              # Next.js linting
```

### Docker Deployment
```bash
# Full stack
docker-compose up -d      # Start all services
docker-compose down       # Stop all services

# Individual services
docker-compose up postgres    # Database only
docker-compose up backend     # Backend only
```

## Key Implementation Details

### API Configuration
- Centralized API configuration in `frontend/src/config/api.ts`
- Production URLs hardcoded for EasyPanel deployment (192.168.40.79:3002)
- Environment variables: `NEXT_PUBLIC_API_URL` for frontend
- CORS enabled for localhost:3000 and production URLs

### Database Connection
- Prisma client generated to `backend/generated/prisma/` (non-standard location)
- Connection string in schema.prisma points to 192.168.40.129:5432
- Uses PostgreSQL with custom field mappings

### Status Field Management
- Inventory items have `status` field with default "libre"
- Status options typically: libre, asignado, baja, donado
- Critical for filtering and business logic

### Form Validation
- React Hook Form with Zod schemas
- DTOs in backend with class-validator
- Form components in `frontend/src/components/` organized by module

### Authentication & CORS
- No authentication system currently implemented
- CORS configured for development (localhost) and production IPs
- Global validation pipe with `whitelist: true` in backend

## File Structure Notes

### Backend Key Files
- `src/main.ts`: Bootstrap with CORS, validation, and file size limits
- `src/app.module.ts`: Module imports and global providers
- `src/prisma.service.ts`: Database service
- `src/scripts/`: Migration and data manipulation scripts
- `prisma/schema.prisma`: Database schema with custom output path

### Frontend Key Files
- `src/app/`: Next.js App Router pages
- `src/components/`: Reusable components organized by feature
- `src/config/api.ts`: Centralized API configuration
- `next.config.ts`: Next.js config with Docker optimizations
- `tailwind.config.ts`: Custom theme with CSS variables

## Production Deployment

### EasyPanel Configuration
- Backend deployed at `https://titinventario.efc.com.pe`
- Frontend uses hardcoded production URLs in api.ts
- Docker configurations in multiple Dockerfile variants
- Environment variables for database and API URLs

### Testing Commands
Always run both linting and type checking before deployment:
```bash
# Backend
cd backend && npm run lint && npm run build

# Frontend  
cd frontend && npm run lint && npm run build
```

## Common Issues

### API Connectivity
- If frontend can't reach backend, check `frontend/src/config/api.ts`
- Verify CORS settings in `backend/src/main.ts`
- Check hardcoded URLs match deployment environment

### Database Issues
- Prisma client path is non-standard: `backend/generated/prisma/`
- Run `npx prisma generate` after schema changes
- Check connection string in schema.prisma for correct IP/port

### Build Failures
- ESLint disabled during builds (`eslint.ignoreDuringBuilds: true`)
- TypeScript strict mode may cause issues with form components
- Ensure all imports use correct paths and extensions