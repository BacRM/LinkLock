#!/bin/bash

# --- SCRIPT DE DÉMARRAGE PRODUCTION ---
# Projet: /var/www/vhosts/smart-btp.com/linklock.smart-btp.com

PROD_DIR="/var/www/vhosts/smart-btp.com/linklock.smart-btp.com"
DEV_DIR="/home/beyrem/S-management/LinkLock"

echo "=== Étape 1: Installer les dépendances (si nécessaire) ==="
cd $PROD_DIR
npm install

echo "=== Étape 2: Builder le frontend ==="
cd $DEV_DIR
npm run build

echo "=== Étape 3: Copier le build en prod ==="
rm -rf $PROD_DIR/build
cp -r $DEV_DIR/build $PROD_DIR/

echo "=== Étape 4: Démarrer le backend (port 8085) ==="
cd $PROD_DIR
PORT=8085 node server.js &

echo "=== Backend démarré sur le port 8085 ==="
echo "API Health: curl http://127.0.0.1:8085/api/health"

echo "=== Étape 5: Activer la config Apache ==="
a2ensite linklock-apache-config.conf
systemctl restart apache2

echo "=== Terminé! ==="
echo "Site: https://linklock.smart-btp.com"
