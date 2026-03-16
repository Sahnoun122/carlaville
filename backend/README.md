# Carlaville Backend (NestJS)

Backend API pour Carlaville avec MongoDB en local (sans Docker).

## Prérequis

- Node.js 20+
- npm 10+
- MongoDB Community Server installé en service Windows

## 1) Démarrage MongoDB local (Windows)

Vérifier que le service tourne:

```powershell
Get-Service MongoDB
```

Si nécessaire, démarrer le service:

```powershell
Start-Service MongoDB
```

Le backend attend MongoDB sur `127.0.0.1:27017`.

## 2) Configuration environnement

Copier le fichier d'exemple:

```powershell
Copy-Item .env.example .env
```

Variables principales dans `.env`:

- `PORT=3009`
- `DATABASE_URI=mongodb://127.0.0.1:27017/carlaville`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=1d`

## 3) Installation et lancement

```bash
npm install
npm run start:dev
```

API disponible sur `http://localhost:3009/api`.

## 4) Seed initial

```bash
npm run seed
```

Le seed crée les rôles de base et des comptes utilisateurs par défaut.

## Scripts utiles

- `npm run start:dev` : mode développement (watch)
- `npm run build` : build TypeScript
- `npm run start:prod` : exécution buildée
- `npm run test` : tests unitaires
- `npm run test:e2e` : tests end-to-end

## Notes d'exploitation

- En local, on utilise MongoDB natif Windows (pas de conteneur).
- Garder `.env` hors versioning; utiliser `.env.example` comme référence d'équipe.
