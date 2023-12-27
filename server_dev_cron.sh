#! /bin/env bash
#
# author: Nathan Baker (pcnate)
# date: February 19th, 2022
# desc: start the dev server in disconnected screen sessions

cd /var/www/factorio
/usr/bin/npm ci

/usr/bin/screen -dmS factorio-frontend bash -c '/usr/bin/npm run start -- --disable-host-check true --host 0.0.0.0 --proxy-config proxy.conf.json'
/usr/bin/screen -dmS factorio-backend  bash -c '/usr/bin/nodemon --watch ./server ./server/index.js'
