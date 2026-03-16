# Carlaville Admin (Next.js)

Interface d'administration connectée au backend local.

## Prérequis

- Node.js 20+
- npm 10+
- Backend Carlaville démarré sur `http://localhost:3009/api`

## 1) Configuration environnement

Copier le fichier d'exemple:

```powershell
Copy-Item .env.local.example .env.local
```

Valeur attendue:

- `NEXT_PUBLIC_API_URL=http://localhost:3009/api`

## 2) Installation et lancement

```bash
npm install
npm run dev
```

Application disponible sur `http://localhost:3000`.

## Notes

- Cette app ne dépend pas de Docker pour MongoDB.
- Le backend doit être lancé avant de tester l'auth et les modules métiers.
