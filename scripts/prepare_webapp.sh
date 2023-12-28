#!/bin/env bash

# log the file name and path of this script
echo "Running ${0}"

# user is the first argument, if not set, use factorio as default
USER="${1:-factorio}"

# create /volume/factorio/.env file if it doesn't exist
if [ ! -f /volume/factorio/.env ]; then
  touch /volume/factorio/.env
  ln -s /volume/factorio/.env /var/www/factorio/.env

  # add entries to .env file
  # adminUser=<ADMIN_USERNAME or admin>
  [ ! -z "$ADMIN_USERNAME" ] && $ADMIN_USERNAME="admin"
  echo "adminUser=${ADMIN_USERNAME}" >> /var/www/factorio/.env

  # adminPassword=<ADMIN_PASSWORD or admin>
  [ ! -z "$ADMIN_PASSWORD" ] && $ADMIN_PASSWORD="admin"
  echo "adminPassword=${ADMIN_PASSWORD}" >> /var/www/factorio/.env

  # useDistFolder=<USE_DIST_FOLDER or true>
  [ ! -z "$USE_DIST_FOLDER" ] && $USE_DIST_FOLDER="true"
  echo "useDistFolder=${USE_DIST_FOLDER}" >> /var/www/factorio/.env

  # environment=<ENVIRONMENT or production>
  [ ! -z "$ENVIRONMENT" ] && $ENVIRONMENT="production"
  echo "environment=${ENVIRONMENT}" >> /var/www/factorio/.env

  # autoStart=<AUTO_START or true>
  [ ! -z "$AUTO_START" ] && $AUTO_START="true"
  echo "autoStart=${AUTO_START}" >> /var/www/factorio/.env

  # listenAddress=<LISTEN_ADDRESS or bind to all interfaces>
  [ ! -z "$LISTEN_ADDRESS" ] && $LISTEN_ADDRESS="0.0.0.0"
  echo "listen_address=${LISTEN_ADDRESS}" >> /var/www/factorio/.env

else
  ln -s /volume/factorio/.env /var/www/factorio/.env
fi

# change ownership of /var/www/factorio to game user
chown -R "${USER}":"${USER}" /var/www/factorio

# run npm install as game user
su "${USER}" -c "cd /var/www/factorio && npm ci --omit=dev"

# check if iptables is installed
if [ -x "$(command -v iptables)" ]; then
  # if iptables is installed, add a rule to allow incoming traffic on port 3000
  iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
else
  # if iptables is not installed, log a warning
  echo "WARNING: iptables is not installed, incoming traffic on port 3000 may not be allowed"
fi

# return non zero if anything fails
exit $?
