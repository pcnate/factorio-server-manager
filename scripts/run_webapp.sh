#!/bin/env bash

# log the file name and path of this script
echo "Running ${0}"

# user is the first argument, if not set, use factorio as default
USER="${1:-factorio}"

cd /var/www/factorio/
su "${USER}" -c "node /var/www/factorio/server/index.js"

# return non zero if anything fails
exit $?
