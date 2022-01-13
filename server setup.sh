#! /bin/sh
#
# author: Nathan Baker (unr34l-dud3)
# date: June 15th, 2017
# desc: setup users, install packages and add some scripts

# grab scripts
wget https://raw.githubusercontent.com/pcnate/server-setup/master/bin/apt-update.sh -O /usr/local/bin/apt-update
wget https://raw.githubusercontent.com/pcnate/server-setup/master/bin/ratom.sh -O /usr/local/bin/ratom
wget https://raw.githubusercontent.com/pcnate/server-setup/master/bin/la.sh -O /usr/local/bin/la

# allow executing scripts
chmod +x /usr/local/bin/apt-update
chmod +x /usr/local/bin/ratom
chmod +x /usr/local/bin/la

# update and install some basic packages
apt-get update
apt-get dist-upgrade -y
apt-get install sudo git htop bwm-ng sudo wget apt-show-versions fail2ban screen autossh open-vm-tools -y

# create my user
USER=pcnate
echo "Creating user: $USER"
adduser --quiet --gecos "" $USER --disabled-password
echo "$USER:Hunterway*" | chpasswd
usermod -aG sudo $USER
usermod -aG www-data $USER

# generate ssh keys and move the authorized keys to my user
su -c "ssh-keygen -f /home/$USER/.ssh/id_rsa -t rsa -b 8192 -N ''" $USER
mv /root/.ssh/authorized_keys /home/$USER/.ssh/authorized_keys
chown $USER:$USER /home/$USER/.ssh/authorized_keys



# force a password change
chage -d 0 $USER


# need to ensure that export GPG_TTY=$(tty) happens in .bashrc
