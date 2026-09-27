# VISION WHITOUT LIMITS

Tienda en línea de bastones guía y lentes especializados, construida como
proyecto full-stack con **React (Vite)**, **Node.js/Express** y **PostgreSQL**,
con la accesibilidad para lectores de pantalla como requisito central.

> El checkout es una **demostración**: registra pedidos en la base de datos
> pero no procesa pagos reales. Para producción, integra una pasarela como
> Stripe o Mercado Pago en `backend/routes/orders.js`.

## Estructura del proyecto

```
VISION WHITOUT LIMITS/
├── backend/     # API REST (Express + PostgreSQL)
└── frontend/    # Aplicación React (Vite)
```

## 1. Requisitos previos

- Node.js 18 o superior
- PostgreSQL 13 o superior corriendo localmente (o accesible por red)

## 2. Configurar la base de datos

```bash
createdb vision_without_limits
cd backend
cp .env.example .env
psql -d vision_without_limits -f db/schema.sql
npm install
npm run seed   # carga el catálogo inicial de bastones y lentes
npm run create-admin -- Tu Nombre TuApellido tu-correo@ejemplo.com unaContraseñaSegura  
```

> ⚠️ Si ya tenías una tabla `users` de antes de que se agregara nombre/apellido y foto de
> perfil, bórrala primero (`DROP TABLE users CASCADE;` en psql) y vuelve a correr
> `schema.sql` — es más simple que migrar datos de prueba.

### Inicio de sesión con Google (opcional)

1. Ve a [Google Cloud Console → Credenciales](https://console.cloud.google.com/apis/credentials).
2. Crea un "ID de cliente de OAuth" tipo "Aplicación web", con `http://localhost:5173` como
   origen autorizado.
3. Copia el Client ID en `backend/.env` (`GOOGLE_CLIENT_ID=...`) y en `frontend/.env`
   (`VITE_GOOGLE_CLIENT_ID=...`) — debe ser el mismo valor en ambos.

Si no configuras esto, el botón de Google se muestra deshabilitado; el resto del sitio
funciona normal con correo y contraseña.

## 3. Levantar el backend

```bash
cd backend
npm run dev     # http://localhost:4000
```

Prueba que responde: `curl http://localhost:4000/api/health`

## 4. Levantar el frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

Copia `frontend/.env.example` a `frontend/.env` y ajusta `VITE_API_URL` si tu API corre en
otra URL, o `VITE_GOOGLE_CLIENT_ID` si configuraste el login con Google.

## 5. Compilar para producción

```bash
cd frontend
npm run build   # genera frontend/dist, listo para servir estático
```

El backend puede desplegarse tal cual (por ejemplo con `pm2` o un contenedor)
en cualquier proveedor que soporte Node.js + PostgreSQL (Railway, Render,
Fly.io, un VPS, etc.).

## Accesibilidad: qué se implementó y por qué

- **HTML semántico real**: `header`, `nav`, `main`, `footer`, encabezados en
  orden jerárquico, tablas con `<th scope>` para el carrito y el resumen del
  pedido.
- **Enlace "Saltar al contenido"** visible al recibir foco por teclado.
- **Foco de teclado siempre visible** (`:focus-visible` con anillo de alto
  contraste) — nunca se usa `outline: none` sin reemplazo.
- **Texto alternativo descriptivo** en cada producto (`image_alt` viene de la
  base de datos, no es genérico ni redundante con el nombre).
- **Región `aria-live="polite"`** que anuncia cuando se agrega o elimina un
  producto del carrito, sin mover el foco del usuario.
- **Formularios accesibles**: cada campo tiene `<label>` asociado, errores con
  `aria-invalid` + `aria-describedby`, y un resumen de errores con enlaces a
  cada campo que recibe el foco automáticamente al fallar la validación
  (patrón recomendado por WCAG para formularios largos).
- **Objetivos táctiles de al menos 44×44 px** en botones e inputs.
- **`prefers-reduced-motion` respetado** globalmente.
- **Tipografía**: el cuerpo de texto usa Atkinson Hyperlegible, tipografía
  diseñada por el Braille Institute específicamente para maximizar la
  legibilidad en baja visión.
- **Contraste alto** en la paleta de color (fondo oscuro, texto claro, acentos
  probados contra el fondo).

Recomendación antes de publicar: valida con axe DevTools o Lighthouse, y haz
al menos una prueba real con VoiceOver (macOS/iOS) o TalkBack (Android) además
de un lector de escritorio como NVDA.

## Catálogo incluido

El seed carga 6 productos de ejemplo (3 bastones, 3 pares de lentes). Edita
`backend/db/seed.js` para reemplazarlos por tu inventario real; el campo
`image_alt` es obligatorio en el esquema porque cada producto debe tener una
descripción de imagen específica, no un texto genérico.
