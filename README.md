# Food Orders App

Aplicacion web en Node.js, Express, PostgreSQL y EJS para vender comida durante una actividad o evento. Incluye formulario de pedidos, panel administrador con sesion, dashboard de pedidos y scripts SQL para Supabase.

## Tecnologias

- Node.js
- Express.js
- PostgreSQL
- EJS
- Bootstrap 5
- dotenv
- pg
- express-session
- bcrypt

## Instalacion local

1. Instala dependencias:

```bash
npm install
```

2. Copia las variables de entorno:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Configura `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
SESSION_SECRET=una-clave-larga-y-segura
ADMIN_USER=admin
ADMIN_PASSWORD=admin123
```

4. Crea las tablas ejecutando `db/schema.sql` en PostgreSQL.

5. Carga datos iniciales ejecutando `db/seed.sql`.

6. Inicia el proyecto:

```bash
npm run dev
```

La app estara disponible en `http://localhost:3000`.

## Conexion con Supabase

1. Crea un proyecto en Supabase.
2. Entra a **Project Settings > Database**.
3. Copia el connection string de PostgreSQL, preferiblemente el modo URI.
4. Reemplaza la contrasena y colocalo en `DATABASE_URL`.
5. Abre **SQL Editor** en Supabase.
6. Ejecuta primero `db/schema.sql`.
7. Ejecuta despues `db/seed.sql`.

Supabase suele requerir SSL. La configuracion de `config/db.js` activa SSL automaticamente cuando `DATABASE_URL` existe.

## Despliegue en Render

1. Sube este proyecto a GitHub.
2. En Render, crea un nuevo **Web Service**.
3. Conecta el repositorio.
4. Usa esta configuracion:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Agrega variables de entorno en Render:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
   - `NODE_ENV=production`
6. Despliega el servicio.

## Rutas

- `/` pagina principal
- `/pedidos` marketplace de comida con carrito
- `/about` informacion de la actividad
- `/admin/login` login administrador
- `/admin` dashboard protegido
- `/admin/logout` cerrar sesion

## Administrador inicial

El seed crea un administrador:

- Usuario: `admin`
- Password: `admin123`

Cambia estas credenciales para produccion. El login tambien puede validar contra `ADMIN_USER` y `ADMIN_PASSWORD` desde variables de entorno.
