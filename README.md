# Huntr

A local-first job application tracker built with Next.js, React, and TypeScript.

It keeps sensitive application notes in `localStorage`, while presenting the search as a real pipeline: evidence of fit, follow-ups, risks, stale applications, and learning rather than just application volume.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Railway

1. Push this directory to GitHub.
2. Create a Railway project from the repository.
3. Railway will build and run the included Dockerfile.
4. No environment variables, database, or authentication are required for v1.

## Privacy model

The hosted app is only the interface. Application data is stored in the browser for that domain and can be exported as JSON. If cross-device sync becomes necessary, add authentication and row-level access controls before introducing a database.
