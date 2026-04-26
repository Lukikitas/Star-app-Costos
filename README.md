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

### Checklist para que funcione (incluye rama NO-main)
1. En GitHub > **Settings > Pages**:
   - Source: **GitHub Actions**.
2. En GitHub > **Settings > Actions > General**:
   - Workflow permissions: **Read and write permissions**.
3. Como desplegás desde una rama distinta de `main`:
   - Este repo ya quedó configurado para disparar deploy desde **cualquier rama** por push.
   - También podés lanzarlo manualmente desde **Actions > Deploy to GitHub Pages > Run workflow**.
4. En Firebase Console > Authentication > Settings:
   - Agregá tu dominio de GitHub Pages como Authorized domain (ej: `lukikitas.github.io`).
5. En Firebase Console > Firestore:
   - Publicá las reglas de `firestore.rules`.
