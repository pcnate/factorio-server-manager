#!/bin/env bash 

# user is the first argument, if not set, use steam as default
USER="${1:-steam}"
HOMEDIR="/home/${USER}"
STEAMCMDDIR="${HOMEDIR}/steamcmd"

# Install steamcmd

su "${USER}" -c "mkdir -p \"${STEAMCMDDIR}\" \
  && curl -fsSL 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz' | tar xvzf - -C \"${STEAMCMDDIR}\" \
  && \"${STEAMCMDDIR}/steamcmd.sh\" +quit \
  && ln -s \"${STEAMCMDDIR}/linux32/steamclient.so\" \"${STEAMCMDDIR}/steamservice.so\" \
  && mkdir -p \"${HOMEDIR}/.steam/sdk32\" \
  && ln -s \"${STEAMCMDDIR}/linux32/steamclient.so\" \"${HOMEDIR}/.steam/sdk32/steamclient.so\" \
  && ln -s \"${STEAMCMDDIR}/linux32/steamcmd\" \"${STEAMCMDDIR}/linux32/steam\" \
  && mkdir -p \"${HOMEDIR}/.steam/sdk64\" \
  && ln -s \"${STEAMCMDDIR}/linux64/steamclient.so\" \"${HOMEDIR}/.steam/sdk64/steamclient.so\" \
  && ln -s \"${STEAMCMDDIR}/linux64/steamcmd\" \"${STEAMCMDDIR}/linux64/steam\" \
  && ln -s \"${STEAMCMDDIR}/steamcmd.sh\" \"${STEAMCMDDIR}/steam.sh\"" \

# Symlink steamclient.so; So misconfigured dedicated servers can find it
ln -s "${STEAMCMDDIR}/linux64/steamclient.so" "/usr/lib/x86_64-linux-gnu/steamclient.so" \
rm -rf /var/lib/apt/lists/*

# return non zero if anything fails
exit $?
