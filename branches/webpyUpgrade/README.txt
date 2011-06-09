mysql
monit
pcre
fcgi
lighttpd
memcached
beanstalkd
flup
python-memcached
simplejson
python-yaml
python-mysqld
PIL

INSTALLATION AND EXECUTION

pip-2.6 install python-memcached
python main.py
pip-2.6 install PIL
python main.py
pip-2.6 search mysql
pip-2.6 install MySQL-python
python main.py
pip-2.6 install virtualenv
pip-2.6 install flup
mvim trunk/sql/models.sql
# %s/\r/\r/g
mysql -u gam -p gam2 < trunk/sql/models.sql
pip-2.6 install oauth2

mkdir -p logs; chmod a+rw logs
