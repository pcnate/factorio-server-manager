#!/bin/env bash

# log the file name and path of this script
echo "Running ${0}"

# create /volume/factorio that rancher/k3s will create a persistent volume for
mkdir -p /volume/factorio/saves
mkdir -p /volume/factorio/mods
mkdir -p /volume/factorio/config

# create symlinks for the saves and configuration files in the persistent volume
# so that they are available in the factorio directory
ln -s /volume/factorio/saves /opt/factorio/saves
ln -s /volume/factorio/mods /opt/factorio/mods
ln -s /volume/factorio/config /opt/factorio/config

# create empty files for the config files in the persistent volume if they don't exist
if [ ! -f /volume/factorio/server-settings.json ]; then
  cp -n /opt/factorio/data/server-settings.example.json /volume/factorio/server-settings.json

  # replace the line containing `\s+"name":\s".*",$` with the SERVER_NAME environment variable in the empty quotes if it is set
  if [ ! -z "$SERVER_NAME" ]; then
    sed -i "s/\s\+\"name\":\s\".*\",/\"name\": \"${SERVER_NAME}\",/g" /volume/factorio/server-settings.json
  fi

  # replace the line containing `\s+"description":\s".*",$` with the SERVER_DESCRIPTION environment variable in the empty quotes if it is set
  if [ ! -z "$SERVER_DESCRIPTION" ]; then
    sed -i "s/\s\+\"description\":\s\".*\",/\"description\": \"${SERVER_DESCRIPTION}\",/g" /volume/factorio/server-settings.json
  fi

  # replace the line containing `\s+"username":\s"",` with the ADMIN_USERNAME environment variable in the empty quotes if it is set
  if [ ! -z "$ADMIN_USERNAME" ]; then
    sed -i "s/\s\+\"username\":\s\"\",/\"username\": \"${ADMIN_USERNAME}\",/g" /volume/factorio/server-settings.json
  fi
  
  # replace the line containing `\s+"token":\s"",` with the SERVER_TOKEN environment variable in the empty quotes if it is set
  if [ ! -z "$SERVER_TOKEN" ]; then
    sed -i "s/\s\+\"token\":\s\"\",/\"token\": \"${SERVER_TOKEN}\",/g" /volume/factorio/server-settings.json
  fi

  # replace the line containing `\s+"password":\s"",` with the GAME_PASSWORD environment variable in the empty quotes if it is set
  if [ ! -z "$GAME_PASSWORD" ]; then
    sed -i "s/\s\+\"password\":\s\"\",/\"password\": \"${GAME_PASSWORD}\",/g" /volume/factorio/server-settings.json
  fi
fi
if [ ! -f /volume/factorio/map-gen-settings.json ]; then
  cp -n /opt/factorio/data/map-gen-settings.example.json /volume/factorio/map-gen-settings.json
fi
if [ ! -f /volume/factorio/map-settings.json ]; then
  cp -n /opt/factorio/data/map-settings.example.json /volume/factorio/map-settings.json
fi
if [ ! -f /volume/factorio/player-data.json ]; then
  # create a blank json file with {}
  echo "{}" > /volume/factorio/player-data.json
fi
if [ ! -f /volume/factorio/server-banlist.json ]; then
  # create a blank json file with []
  echo "[]" > /volume/factorio/server-banlist.json
fi
if [ ! -f /volume/factorio/server-adminlist.json ]; then
  # grab the admin username from the environment variable
  # and set it in the server-settings.json file [\n  "username"\n]
  # if the environment variable is not set, create a blank json file with [\n]
  if [ ! -z "$ADMIN_USERNAME" ]; then
    echo "[\n  \"${ADMIN_USERNAME}\"\n]" > /volume/factorio/server-adminlist.json
  else
    echo "[\n]" > /volume/factorio/server-adminlist.json
  fi
fi
if [ ! -f /volume/factorio/server-id.json ]; then
  # create a blank json file with {}
  touch /volume/factorio/server-id.json
fi
if [ ! -f /volume/factorio/achievements.dat ]; then
  # create a blank json file with {}
  touch /volume/factorio/achievements.dat
fi

# create a symlink for the config files in the factorio directory
# so that they are available in the persistent volume
ln -s /volume/factorio/server-settings.json /opt/factorio/data/server-settings.json
ln -s /volume/factorio/map-gen-settings.json /opt/factorio/data/map-gen-settings.json
ln -s /volume/factorio/map-settings.json /opt/factorio/data/map-settings.json
ln -s /volume/factorio/player-data.json /opt/factorio/data/player-data.json
ln -s /volume/factorio/server-banlist.json /opt/factorio/data/server-banlist.json
ln -s /volume/factorio/server-adminlist.json /opt/factorio/data/server-adminlist.json
ln -s /volume/factorio/server-id.json /opt/factorio/data/server-id.json
ln -s /volume/factorio/achievements.dat /opt/factorio/data/achievements.dat

# change ownership of the game and persistent volume directories to the game user
chown -R "$USER":"$USER" /volume/factorio
chown -R "$USER":"$USER" /opt/factorio

# if there are no zip files in the saves folder excluding _autosave\d+\.zip
# create a new one from the map-gen-settings.json and map-settings.json files
# using the bin/x64/factorio executable running as the factorio user
if [ -z "$(find /opt/factorio/saves/ -maxdepth 1 -type f -name '*.zip' -not -name '_autosave[0-9]*.zip')" ]; then
  SAVE_NAME=$(date +%Y-%m-%d)
  echo "Creating new save file /opt/factorio/saves/${SAVE_NAME}.zip}"
  cd /opt/factorio/
  su "$USER" -c "/opt/factorio/bin/x64/factorio \
    --create /opt/factorio/saves/${SAVE_NAME} \
    --map-gen-settings /opt/factorio/data/map-gen-settings.json \
    --map-settings /opt/factorio/data/map-settings.json"
  chown "$USER":"$USER" /opt/factorio/saves/"${SAVE_NAME}".zip
fi

# run the factorio executable as the factorio user for testing
# cd /opt/factorio/
# su "$USER" -c "/opt/factorio/bin/x64/factorio \
#   --start-server-load-latest \
#   --server-settings /opt/factorio/data/server-settings.json"
