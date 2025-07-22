# Guía de Referencia Rápida - IDs

## 🏷️ **CLASIFICACIONES (clasificacionId)**

### Computadoras (1-7)
- `1` - Compatibles (5 años, $500.00)
- `2` - Desktop SFF (5 años, $760.00)  
- `3` - Desktop Mini (5 años, $760.00)
- `4` - All-in-One (5 años, $400.00)
- `5` - Laptop Básica (4 años, $760.00)
- `6` - Laptop Estándar (4 años, $800.00)
- `7` - Laptop Avanzada (4 años, $1400.00)

### Tablets (8-9)
- `8` - Tablets (3 años, $150.00)
- `9` - iPad (3 años, $700.00)

### Servidores (10-12)
- `10` - Servidor Rack (5 años, $10000.00)
- `11` - Servidor Torre (5 años, $5000.00)
- `12` - Servidor Ensamblado (5 años, $3000.00)

### Redes (13-17)
- `13` - Switch de Acceso (7 años, $2000.00)
- `14` - Switch Core (7 años, $4000.00)
- `15` - Hub (5 años, $300.00)
- `16` - Access Point (3 años, $200.00)
- `17` - Router (5 años, $800.00)

### Impresoras (18-24)
- `18` - Impresora Láser (3 años, $600.00)
- `19` - Impresora de Inyección (3 años, $200.00)
- `20` - Impresora Matricial (5 años, $400.00)
- `21` - Impresora Portátil (3 años, $300.00)
- `22` - Multifuncional Láser (3 años, $800.00)
- `23` - Multifuncional Inyección (3 años, $350.00)
- `24` - Plotters (5 años, $2000.00)

### Protección Eléctrica (25-27)
- `25` - UPS Básico (3 años, $150.00)
- `26` - UPS Avanzado (5 años, $500.00)
- `27` - ATS (10 años, $2000.00)

### Colaboración (28-34)
- `28` - Proyectores (5 años, $800.00)
- `29` - Pantallas (8 años, $1500.00)
- `30` - Audio (3 años, $300.00)
- `31` - Video (3 años, $400.00)
- `32` - Telefonía IP (5 años, $200.00)
- `33` - Videoconferencia (3 años, $1200.00)
- `34` - Telepresencia (5 años, $5000.00)

### Otros (35-38)
- `35` - Mini UPS (3 años, $100.00)
- `36` - UPS Industrial (7 años, $1000.00)
- `37` - Aire Acondicionado (8 años, $1200.00)
- `38` - Refrigeración (10 años, $3000.00)

## 👨‍💼 **EMPLEADOS COMUNES (empleadoId)**

### Gerencia y Dirección
- `184` - Ermes Melinchon (Director Ejecutivo)
- `159` - David Alfonso Melinchon Espinosa (Gerente General)
- `381` - Pierina Emma Consuelo Foppiano Rabinovi (Gerencia General Adjunto)

### Tecnología y Sistemas  
- `7` - Alann Ernesto Reyes Jauregui (Gerente De Proyectos Y Sistemas)
- `24` - Angela Felicitas Caceres Zevallos (Jefe De Gestion De La Informacion)
- `158` - David Abraham Taipe Silva (Asistente De Sistemas)
- `266` - Jose Enrique Rengifo Lopez (Jefe De Tic)

### Comercial
- `326` - Mauricio Melinchon (Gerente Comercial)
- `282` - Katherine Esther Lozada Flores (Gerente De Ventas Y Sac)
- `183` - Erickson Huapaya Villegas (Gerente De Desarollo De Negocios)

### Operaciones
- `399` - Rodolfo Antonio Villasante Martinez (Gerente De Operación Logistica)
- `300` - Luis Alberto Huaman Fuentes (Jefe De Logistica De Salida)
- `398` - Rocio Del Carmen Medina Ninacondor (Jefe De Logistica De Entrada)

### Administración y Finanzas
- `305` - Luz Marina Rondon Soto (Jefe De Finanzas)
- `261` - Jorge Flores (Coordinador De Administracion)
- `285` - Laura Rosa Aranda Chavez (Coordinadora De Facturacion)

## 📝 **Consejos de Uso:**

### Para Equipos SIN ASIGNAR:
- Dejar `empleadoId` **VACÍO**
- Usar `status = "libre"` o `status = "operativo"`
- Ejemplos: Servidores, impresoras compartidas, equipos de stock

### Para Equipos ASIGNADOS:
- Completar `empleadoId` con ID válido (1-439)
- Usar `status = "asignado"`
- Completar `ubicacionEquipo` con ubicación específica

### Códigos EFC Sugeridos:
- **EFC-LT-###** - Laptops
- **EFC-DS-###** - Desktops  
- **EFC-TB-###** - Tablets
- **EFC-SRV-###** - Servidores
- **EFC-IMP-###** - Impresoras
- **EFC-NET-###** - Equipos de red
- **EFC-UPS-###** - UPS y energía
- **EFC-MON-###** - Monitores 