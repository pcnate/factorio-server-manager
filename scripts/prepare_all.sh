#!/bin/env bash

# log the file name and path of this script
echo "Running ${0}"

# user is the first argument, if not set, use factorio as default
USER="${1:-factorio}"

# execute /root/prepare_webapp.sh with user as first argument
/root/prepare_webapp.sh "${USER}"

# execute /root/prepare_factorio.sh with user as first argument
/root/prepare_factorio.sh "${USER}"

# execute /root/run_webapp.sh with user as first argument
/root/run_webapp.sh "${USER}"

# return non zero if anything fails
exit $?
