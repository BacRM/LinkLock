#!/bin/bash

# --- SCRIPT DE DÉMARRAGE PRODUCTION ---
# Projet: /var/www/vhosts/smart-btp.com/linklock.smart-btp.com

PROD_DIR="/var/www/vhosts/smart-btp.com/linklock.smart-btp.com"
DEV_DIR="/home/beyrem/S-management/LinkLock"

echo "=== Étape 1: Synchroniser le build depuis dev ==="
# Option A: Si le build existe déjà en dev, le copier
# cp -r $DEV_DIR/build $PROD_DIR/

# Option B: Cloner/synchroniser depuis Git
# cd $PROD_DIR
# git pull origin main

echo "=== Étape 2: Démarrer le backend (port 8085) ==="
cd $PROD_DIR
PORT=8085 node server.js &

echo "=== Backend démarré sur le port 8085 ==="
echo "API Health: http://127.0.0.1:8085/api/health"

echo "=== Étape 3: Servir le frontend (via Apache) ==="
# Apache sert directement le build depuis $PROD_DIR
