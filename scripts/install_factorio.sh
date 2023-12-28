#!/bin/env bash

# log the file name and path of this script
echo "Running ${0}"

# user is the first argument, if not set, use factorio as default
USER="${1:-factorio}"

# https://factorio.com/get-download/stable/headless/linux64
curl -fsSL 'https://factorio.com/get-download/stable/headless/linux64' -o /tmp/factorio.tar.xz
mkdir -p /opt/factorio
cd /opt/
tar -xJf /tmp/factorio.tar.xz
rm -rf /tmp/factorio.tar.xz
apt-get clean
rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
chown -R "$USER":"$USER" /opt/factorio

# check if iptables is installed
if [ -x "$(command -v iptables)" ]; then
  # if iptables is installed, add a rule to allow incoming traffic on port 34197
  iptables -A INPUT -p udp --dport 34197 -j ACCEPT
else
  # if iptables is not installed, log a warning
  echo "WARNING: iptables is not installed, incoming traffic on port 34197 may not be allowed"
fi


# return non zero if anything fails
exit $?
