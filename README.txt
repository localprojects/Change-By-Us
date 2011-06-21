-------------------------------------------------
Pre-requisites
-------------------------------------------------
Services and applications:
    mysql
    monit
    pcre
    fcgi
    lighttpd
    memcached
    beanstalkd

Python packages:
  These can be installed with pip/easy_install or other means:
    flup
    python-memcached
    simplejson
    python-yaml
    python-mysqld OR MySQL-python
    PIL
    oauth2

    # Make sure that boto is the latest version. If on ubuntu ensure that you're not
    # using the system boto, which is outdated. Remove the apt-installed boto,
    # and install from pip
    boto    # necessary for AWS / SES / S3

    python-dateutil # necessary for digest_emaile.py

Mysql setup for the first time:
    mysql -u root -p
    > create database gam2; grant all on gam2.* to gam@localhost identified by 'gam';
    > exit
    mysql -u root -p gam2 < trunk/sql/models.sql
    mysql -u root -p gam2 < trunk/sql/locations.sql
    mysql -u root -p gam2 < trunk/sql/data.sql


-------------------------------------------------
Web Server Setup 
-------------------------------------------------
Install lighttpd:
    [package-manager] install lighttpd

Launch lighttpd:
    # Create logs folder 
    mkdir -p trunk/logs && chmod -R a+rw trunk/logs
    mkdir -p run    # necessary for the pid file to be stored

    lighttpd -D -f lighttpd.conf
    
AWS configuration:
    If thumbnails are being mirrored to S3, complete the info in the aws and media sections
    of the config file accordingly. Otherwise image uploads will be saved to the local volume only.

