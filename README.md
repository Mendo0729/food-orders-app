# Food Orders App

Aplicacion web sencilla para tomar pedidos de comida afroantillana y guardarlos en Google Sheets.

## Tecnologias

- Node.js
- Express.js
- EJS
- Bootstrap 5
- Google Sheets con Google Apps Script

## Instalacion local

1. Instala dependencias:

```bash
npm install
```

2. Copia las variables de entorno:

```powershell
Copy-Item .env.example .env
```

3. Configura `.env`:

```env
PORT=3000
SESSION_SECRET=una-clave-larga-y-segura
ADMIN_USER=admin
ADMIN_PASSWORD=admin123
GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/TU_WEB_APP_ID/exec
```

## Configurar Google Sheets

1. Crea una hoja de calculo en Google Sheets.
2. Ve a **Extensiones > Apps Script**.
3. Pega el contenido de `google-apps-script/Code.gs`.
4. Guarda el proyecto.
5. Ve a **Implementar > Nueva implementacion**.
6. Selecciona tipo **Aplicacion web**.
7. En **Ejecutar como**, selecciona tu usuario.
8. En **Quien tiene acceso**, selecciona **Cualquier usuario**.
9. Copia la URL `/exec` y colócala en `GOOGLE_SHEETS_WEB_APP_URL`.

La primera vez que se guarde o lea un pedido, el script crea una pestaña llamada `Pedidos` con los encabezados necesarios.

## Ejecutar

```bash
npm run dev
```

La app estara disponible en:

```text
http://localhost:3000
```

## Rutas

- `/` redirige a `/pedidos`
- `/pedidos` formulario de pedidos
- `/admin/login` login administrador
- `/admin` dashboard protegido con pedidos leidos desde Google Sheets

## Administrador

El login usa estas variables:

- `ADMIN_USER`
- `ADMIN_PASSWORD`

Cambia esos valores antes de publicar la aplicacion.
