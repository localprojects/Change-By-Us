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

-------------------------------------------------
DEVELOPMENT RECOMMENDATIONS (not required, but helps)
-------------------------------------------------
Set up virtualenv and virtualenvwrapper so that python libs are easy to version,
and so you don't have conflicts between different python projects:
    http://www.doughellmann.com/projects/virtualenvwrapper/

This allows you to do stuff like:
    workon cbu
which will switch to the cbu virtual environment.

-------------------------------------------------
DEPLOYMENT PROCESS
-------------------------------------------------
The deployment process for CBU uses Fabric:
    pip install fabric

It requires that you have at least fabric Fabric==1.2.0:
    pip freeze | grep -i fabric

Fabric uses a script and different configuration files. The default script 
filename is fabfile.py, and configuration files are called "rcfile". To 
facilitate this naming convention, all configuration files are rcfile.ENV, 
where ENV is the environment to which to deploy. Eg. rcfile.demo would be
the configuration set for the 'demo' environment.

The fabric script is located in the root of the project as of this writing. 
However, this location may change in future, since deployment scripts really 
should be versioned separately from the code project.

Configuration files are NEVER versioned with the project since they contain
sensitive information. Configuration files (rcfiles) are versioned in a private
repository. Please consult with a sysadmin for the location of this repo.

SETTING UP FOR DEPLOYMENT:
The deployment host is assumed to have the following:
    * SSH key (or pem file) to connect to the target environment under the 
      appropriate user contexts. These files are usually in:
        ~/.ssh/localprojects/*.pem or ~/.ssh/localprojects/id_rsa
      The actual file is defined in the rcfile, so it can be changed based on
      user environment.
      However, it is recommended that all deployment administrators use a 
      standardized structure for storage of these files so as to limit
      confusion or inconsistency.
    * A source tree in a standardized location. The git source tree is expected
      to be at ~/Projects/LP/<project-name>:
        ~/Projects/LP/lp-changebyus
      This is also configurable in the RCfile, so can be changed as needed.
      [NOTE: this really should not be required since the deployer should 
      have a way of pulling the code to a working location and creating the 
      final configurations from it. Unfortunately this functionality is not yet
      implemented.]
    * The necessary RCfiles in a separate location. Eg.:
        ~/Projects/LP/configs/lp-changebyus/rcfile.*

Once the system is set up, the deployment steps are:
    fab -f /path/to/fabfile.py \
        --config=/path/to/rcfile.XX ENV \
        <list of tasks>
where:
    /path/to/ : the path to the fabfile.py or rcfile.env. NOTE that fabric 
                does NOT handle ~ (user-path) correctly, so always specify
                full path. Relative paths from current location work fine 
    rcfile.XX : The rcfile to use. Ensure that you provide the /path/to/
                correctly. If you receive an error such as:
                    "AttributeError: local_path"
                this is indication that your rcfile was not read correctly.
                Check your paths!
    ENV       : The environment that the configuration is specific to. This 
                is actually a task which processes all the system and 
                required variables, and is usually one of live, prod, demo, dev.

Deployment TASKS:
The tasks for deployment are generally found at the top of the fabfile.py file,
in the CookBook section. To get detailed information about the function of each
available task, run:
    fab --list

Some of the more common sets of tasks are below.
* Create all the configurations locally, for development purposes:
    fab --config=/path/to/rcfile.developer-name dev \
        create_local_configs
  This will manufacture the config files for you to be able to run the system on your
  local environment, assuming that your local web server points to your source folder.

* Standard deployment of branch defined in rcfile, with webserver restart:
    fab --config=/path/to/rcfile.demo demo \
        bundle_code deploy_webapp deploy_configurations

* Only deploy configuration updates, but not new code
    fab --config=/path/to/rcfile.demo demo \
        deploy_configurations

* Deploy the latest code, change the 'current' symlink, but don't restart 
  webserver. This is useful if you want to just put code up, but don't want
  the webserver to know about it yet. 
    fab --config=/path/to/rcfile.demo demo \
        bundle_code deploy_app
  
  You can then run the
    fab --config=/path/to/rcfile.demo demo \
        restart_webserver
  task to ... um ... restart the webserver.

* Deploy the latest code, but don't symlink, and don't do anything else:
    fab --config=/path/to/rcfile.demo demo \
       bundle_code upload_and_explode_code_bundle

* Rollback the deploment (NOT YET TESTED):
    fab --config=/path/to/rcfile.demo demo \
        rollback
  This will:
    mv current next
    mv previous current

-------------------------------------------------
Troubleshooting and Debugging Notes
-------------------------------------------------
Error:
  On server startup:
  boto.exception.NoAuthHandlerFound: No handler was ready to authenticate. 1 handlers were checked. ['HmacAuthV3Handler'] Check your credentials
Solution:
  This is invariably due to an AWS configuration issue. Either the key or the secret are wrong, or
  incorrectly configured in the config file.


