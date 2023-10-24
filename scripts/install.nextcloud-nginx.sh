#!/bin/bash
#
# Installation script for NextCloud on an Debian-based server running nginx

heading() {
  echo ''
  echo -e "\e[37m+=============================================================\e[0m"
  echo -e "\e[37m| \e[35m${1}\e[0m"
  echo -e "\e[37m+=============================================================\e[0m"
}

debug () {
  echo -e "\e[37m ${1}\e[0m"
}

success () {
  echo -e "\e[32m✓ ${1}\e[0m"
}

error () {
  echo -e "\e[31m❌ ${1}\e[0m"
}



STEPS=5


heading "Configuration 1 of ${STEPS}"
echo 'This should match your directory name containing the site and nginx.conf file'
echo ''
# Prompt the user to enter their domain name
DIRECTORY=''
while [ "$DIRECTORY" == "" ]; do
	echo -n 'Enter the domain name for your site ex "mysite.com": '
	read DIRECTORY

	if [ "$DIRECTORY" == "" ]; then
		echo 'ERROR, you must enter a domain name'
	fi
done


heading "Configuration 2 of ${STEPS}"
echo '"www" aliasing'
echo ''
if [[ $DIRECTORY == www.* ]]; then
  # Site starts with "www.", ask if the user wants to include the naked domain too.
  DOMAINALIAS="${DIRECTORY:4}"
else
  # Site does not start with 'www', so prompt the user if they want to use it.
	DOMAINALIAS="www.${DIRECTORY}"
fi

echo -n "Enable listening for ${DOMAINALIAS} also? (Y/n): "
read Q
case "$Q" in
  n*|N* )
    DOMAINALIAS="";;
esac


heading "Configuration 3 of ${STEPS}"
echo 'Default domain'
echo ''
if [ -n "$DOMAINALIAS" ]; then
  # Allow the user to pick which the primary domain should be,
  # ie: they may have example.com as the directory but prefer www.example.com to be used
  # or www.example.com as domain but prefer example.com for the public URL.
  echo 'Which is the primary domain, ie: the URL users should get?'
  echo "1) $DIRECTORY"
  echo "2) $DOMAINALIAS"
  echo -n 'Enter 1-2: '
  read Q

  if [ "$Q" == "2" ]; then
    DOMAIN="$DOMAINALIAS"
    DOMAINALIAS="$DIRECTORY"
  else
    DOMAIN="$DIRECTORY"
  fi

  # Server listen has multiple entries
  SERVERLINE="$DOMAIN $DOMAINALIAS"
else
  # No alias requested, just use the primary.
  echo '(skipping, only one domain being used)'
  DOMAIN="$DIRECTORY"
  # Server listen only has a single entry
  SERVERLINE="$DOMAIN"
fi


heading "Configuration 4 of ${STEPS}"
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


heading "Configuration 5 of ${STEPS}"
# Lookup if we can find the path automatically
debug "Searching for ${DIRECTORY}/nginx.conf..."
MATCHES=$(find / -path "*/${DIRECTORY}/nginx.conf" | wc -l)
if [ "$MATCHES" -eq 1 ]; then
	SITEPATH="$(find / -path "*/${DIRECTORY}/nginx.conf" | xargs dirname)"

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
			error "${SITEPATH}/nginx.conf not located"
			SITEPATH=""
		fi
	done
fi


heading 'Install Configuration 1 of 1'
cat << EOT
Edit cgi-bin/config.ini and set the following line under "[site]"
(replacing the current values):


host = ${PROTO}${DOMAIN}


Save the file and this script will automatically resume when synced.
EOT

READY=0
while [ $READY -eq 0 ]; do
	sleep 2
	if grep -q "host = ${PROTO}${DOMAIN}" "${SITEPATH}/cgi-bin/config.ini"; then
    READY=1
    success 'config.ini configuration detected'
	fi
done


success "Setup ready!  Starting install"
sleep 1

# Configuration complete and ready to proceed!
heading 'Setting Up CGI Application'
apt install fcgiwrap python3 python3-venv
python3 -m venv /opt/markdownmaster
/opt/markdownmaster/bin/pip3 install Markdown beautifulsoup4 python-frontmatter lxml
chmod +x "${SITEPATH}/cgi-bin/crawler.py"
chmod +x "${SITEPATH}/cgi-bin/sitemap.py"
chmod +x "${SITEPATH}/cgi-bin/meta.py"

debug "Installing config to /etc/nginx/sites-enabled/${DIRECTORY}.conf"
sleep 1
if [ -e "/etc/nginx/sites-enabled/${DIRECTORY}.conf" ]; then
  error "${DIRECTORY}.conf already exists, NOT overwriting (but resuming install)"
else
  # Setup nginx
  if [ $HTTPS -eq 0 ]; then
    cat > /etc/nginx/sites-enabled/${DIRECTORY}.conf << EOD
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
    cat > /etc/nginx/sites-enabled/${DIRECTORY}.conf << EOD
# Virtual host configuration for ${DOMAIN}

server {
	listen 80;
	listen [::]:80;
	server_name ${SERVERLINE};
	# enforce https
	return 301 https://${DOMAIN}\$request_uri;
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
fi

heading 'Testing Config'
sleep 1
/sbin/nginx -t
if [ $? -ne 0 ]; then
	error "something's not right, automated script cannot continue."
	exit 1
fi

heading 'Restarting Services'
systemctl restart nginx

if [ $HTTPS -eq 1 ]; then
  heading 'Installing Certbot/SSL'
	if [ -z "$(which certbot)" ]; then
		snap install --classic certbot
		ln -s /snap/bin/certbot /usr/bin/certbot
	fi

	certbot --nginx
fi

echo ""
success 'Install script complete'
echo "If DNS is pointing here your site is accessible via ${PROTO}${DOMAIN}"
