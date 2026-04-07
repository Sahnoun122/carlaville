# Carlaville Admin (Next.js)

Interface d'administration connectée au backend Carlaville déployé.

## Prérequis

- Node.js 20+
- npm 10+
- Backend Carlaville disponible sur `https://carlaville-ykc8.vercel.app`

## 1) Configuration environnement

Copier le fichier d'exemple:

```powershell
Copy-Item .env.local.example .env.local
```

Valeur attendue:

- `NEXT_PUBLIC_API_URL=https://carlaville-ykc8.vercel.app`

Le code ajoute automatiquement `/api` à cette base, donc il n'est pas nécessaire de le mettre dans la variable d'environnement.

## 2) Installation et lancement

```bash
npm install
npm run dev
```

Application disponible sur `http://localhost:3000`.

## Notes

- Cette app ne dépend pas de Docker pour MongoDB.
- Le backend doit être accessible via l'URL configurée dans `NEXT_PUBLIC_API_URL` avant de tester l'auth et les modules métiers.
