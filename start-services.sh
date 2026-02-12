#!/bin/bash

# --- COMMANDES POUR DÉMARRER LES SERVICES (PRODUCTION) ---

# Backend (port 8085)
echo "Démarrage du backend sur le port 8085..."
PORT=8085 node server.js &

# Frontend (port 8080)
echo "Démarrage du frontend sur le port 8080..."
npm run dev -- --port 8080
# ou en production:
# npm run build
# npx vite preview --port 8080
