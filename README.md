# STAR Costos

App web para calcular costos y precios sugeridos de productos gastronómicos usando React + Firebase.

## Scripts
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run deploy`

## Firebase
- Authentication Email/Password
- Cloud Firestore
- Escucha en tiempo real con `onSnapshot`
- Timestamps con `serverTimestamp`

## Deploy GitHub Pages
- Base por defecto del proyecto: `/Star-app-Costos/` (Project Pages).
- Si usás dominio personalizado, desplegá con `USE_CUSTOM_DOMAIN=true npm run build`.
- Se incluye fallback SPA con `404.html` + restauración de ruta en `index.html`.
- Incluye workflow `.github/workflows/deploy.yml`.
