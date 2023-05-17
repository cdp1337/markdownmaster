#!/bin/bash
#
# Installation script for NextCloud on an Debian-based server running nginx

# Prompt the user to enter their domain name
DOMAIN=''
while [ "$DOMAIN" == "" ]; do
	echo -n 'Enter the domain name for your site ex "mysite.com": '
	read DOMAIN

	if [ "$DOMAIN" == "" ]; then
		echo "ERROR, you must enter a domain name"
	fi
done

if [[ $DOMAIN == www.* ]]; then
	WWWALIAS=0
	SERVERLINE="${DOMAIN}"
else
	WWWALIAS=1
	SERVERLINE="${DOMAIN} www.${DOMAIN}"
fi

# Ask of https should be enabled
echo -n 'Enable HTTPS? (Y/n): '
read HTTPS
case "$HTTPS" in
	n*|N* )
		HTTPS=0
		PROTO="http://";;
	* )
		HTTPS=1
		PROTO="https://";;
esac

# Lookup if we can find the path automatically
MATCHES=$(find / -path "*/${DOMAIN}/nginx.conf" | wc -l)
if [ "$MATCHES" -eq 1 ]; then
	SITEPATH="$(find / -path "*/${DOMAIN}/nginx.conf" | xargs dirname)"

	echo "Found site at ${SITEPATH}"
	echo -n 'Press [ENTER] to use detected path or enter a new one if incorrect: '
	read NPATH
	if [ "$NPATH" != "" ]; then
		SITEPATH=$NPATH
	fi
else
	SITEPATH=''
	while [ "$SITEPATH" == "" ]; do
		echo -n 'Enter the full path of your site on the filesystem: '
		read SITEPATH

		if [ ! -e "${SITEPATH}/nginx.conf" ]; then
			echo "ERROR, ${SITEPATH}/nginx.conf not located"
			SITEPATH=""
		fi
	done
fi

cat << EOT
Edit nginx.conf and set the following lines at the start of the file
(replacing the current values):


set \$siteroot $SITEPATH;
set \$sitedomain $DOMAIN;


Save the file and this script will automatically resume when synced.
EOT

READY=0
while [ $READY -eq 0 ]; do
  if grep -q "set \$siteroot $SITEPATH;" "${SITEPATH}/nginx.conf"; then
		if grep -q "set \$sitedomain $DOMAIN;" "${SITEPATH}/nginx.conf" ; then
			READY=1
		fi
	fi

	sleep 5
done


cat << EOT
Edit cgi-bin/config.ini and set the following line under "[site]"
(replacing the current values):


host = ${PROTO}${DOMAIN}


Save the file and this script will automatically resume when synced.
EOT

READY=0
while [ $READY -eq 0 ]; do
	if grep -q "host = ${PROTO}${DOMAIN}" "${SITEPATH}/cgi-bin/config.ini"; then
    READY=1
	fi

	sleep 5
done


echo "Setup ready!  Starting install"
sleep 1

# Configuration complete and ready to proceed!
apt install fcgiwrap

echo "Installing config to /etc/nginx/sites-enabled/${DOMAIN}.conf"
sleep 1
# Setup nginx
if [ $HTTPS -eq 0 ]; then
	cat > /etc/nginx/sites-enabled/${DOMAIN}.conf << EOD
# Virtual host configuration for ${DOMAIN}

server {
	listen 80;
	listen [::]:80;
	server_name ${SERVERLINE};
	root ${SITEPATH};
	include ${SITEPATH}/nginx.conf;
}

EOD
else
	cat > /etc/nginx/sites-enabled/${DOMAIN}.conf << EOD
# Virtual host configuration for ${DOMAIN}

server {
	listen 80;
	listen [::]:80;
	server_name ${SERVERLINE};
	# enforce https
	return 301 https://\$server_name:443\$request_uri;
}

server {
	listen 443 ssl http2;
	listen [::]:443 ssl http2;
	server_name ${SERVERLINE};
	include snippets/snakeoil.conf;
	root ${SITEPATH};
	include ${SITEPATH}/nginx.conf;
}

EOD
fi


echo "Testing config"
sleep 1
/sbin/nginx -t
if [ $? -ne 0 ]; then
	echo "ERROR, something's not right, automated script cannot continue."
	exit 1
fi
systemctl restart nginx

if [ $HTTPS -eq 1 ]; then
	if [ -z "$(which certbot)" ]; then
		snap install --classic certbot
		ln -s /snap/bin/certbot /usr/bin/certbot
	fi

	certbot --nginx
fi

echo ""
echo "Install script done!  If DNS is pointing here your site is accessible via ${PROTO}${DOMAIN}"