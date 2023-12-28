############################################################
# Dockerfile that contains SteamCMD
############################################################
FROM node:20-bookworm as build_stage

LABEL maintainer="https://github.com/pcnate/factorio-server-manager"
ARG PUID=1001

# ENV USER steam
ENV USER factorio
# ENV GAMEDIR /home/${USER}/steamcmd
ENV GAMEDIR /opt/factorio

EXPOSE 34197/udp
EXPOSE 3000/tcp

# include the install_steam.sh script
COPY ./scripts/install_steam.sh /root/install_steam.sh
COPY ./scripts/install_factorio.sh /root/install_factorio.sh
COPY ./scripts/prepare_all.sh /root/prepare_all.sh
COPY ./scripts/prepare_webapp.sh /root/prepare_webapp.sh
COPY ./scripts/prepare_factorio.sh /root/prepare_factorio.sh
COPY ./scripts/run_webapp.sh /root/run_webapp.sh

# include the webapp and server
COPY ./dist/webapp /var/www/factorio/dist/webapp
COPY ./src /var/www/factorio/src
COPY ./server /var/www/factorio/server
COPY ./package.json /var/www/factorio/package.json
COPY ./package-lock.json /var/www/factorio/package-lock.json

RUN set -x \
	# Install, update & upgrade packages
  && dpkg --add-architecture i386 \
  && echo "deb http://deb.debian.org/debian bookworm main non-free" >> /etc/apt/sources.list.d/debian.sources \
  && echo "deb-src http://deb.debian.org/debian bookworm main non-free" >> /etc/apt/sources.list.d/debian.sources \
  && apt-get update \
	&& apt-get install -y --no-install-recommends --no-install-suggests \
    libstdc++6:i386 \
    libgcc1:i386 \
    libcurl4-gnutls-dev:i386 \
    locales \
    # dev utils
    sudo htop \
	&& sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
	&& dpkg-reconfigure --frontend=noninteractive locales \
  && adduser --disabled-password --gecos "" --uid "$PUID" "$USER" \
  # && bash ~/install_steam.sh "$USER" \
  && bash ~/install_factorio.sh "$USER" \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
  && chmod +x /root/install_factorio.sh \
  && chmod +x /root/install_steam.sh \
  && chmod +x /root/prepare_all.sh \
  && chmod +x /root/prepare_webapp.sh \
  && chmod +x /root/prepare_factorio.sh \
  && echo "done"

FROM build_stage AS bookworm
USER "root"

# Run prepare_all.sh when the container starts
ENTRYPOINT bash /root/prepare_all.sh $USER

# change to the game user
# USER ${USER}
WORKDIR ${GAMEDIR}

# launch the game
# CMD bash /root/run_webapp.sh $USER
# CMD ["/opt/factorio/bin/x64/factorio", "--start-server-load-latest", "--server-settings", "/opt/factorio/data/server-settings.json"]
