from fabric.api import *
import os
import time
import re

"""
------------------------------
INSTRUCTIONS:
------------------------------
This fabfile requires a set of parameters to be set in an rcfile, for fabric to load. 
A minimum of fabric 1.2.0 is required

Install fabric:
    pip install fabric

CAVEATS AND NOTES:
    * Do NOT user short if[] syntax, meaning [ -e "foobar.txt' ] && {do_something}, in fabric scripts.
      Go for explicit if [ -e "foobar.txt" ];then do_something; fi
      The short syntax does not return the correct value for success, and this causes scripts to fail
    * ROLES (and other decorators) MUST be on the parent function. 
      Running a child function through a decorator just won't work due to some fabric stupidity!
    
------------------------------
COOKBOOK:
------------------------------
    A quick way to get the initial system setup
        fab --config=rcfile.demo demo setup_application deploy_configurations bundle_code deploy

    Setup a set of web servers
        fab --config=rcfile.dev dev setup_application

    Create new configuration file:
        fab --config=rcfile.name dev create_config_yaml

    Create stage-specific lighttpd.conf file into the etc/ folder
        fab --config=rcfile.name dev create_lighttpd_conf

    Create (via interpolation) and upload configurations to remote host(s): 
        fab --config=rcfile.dev dev deploy_configurations
        
    Create a new bundle and deploy
        fab --config=rcfile.name dev bundle_code deploy

    Create a new bundle and deploy at a different time
        fab --config=rcfile.name dev bundle_code
        Save the release bundle name (see the ATTENTION line in the output)
        fab --config=rcfile.name dev deploy

    # Webserver related tasks
    Start / stop / restart the webserver
        fab --config=rcfile.environment environment stop_webserver
    
    # Deploy cron tasks
        fab --config=rcfile.dev dev deploy_cron 
        
    # Set up and deploy the database backup script(s) 
        fab --config=rcfile.dev dev setup_db_backup
        
"""

# Expand user home paths if necessary, which is only relevant to some variables
env.local_path = os.path.expanduser(env.local_path)
env.key_filename = os.path.expanduser(env.key_filename)

# We need to make the hosts into a list
env.hosts = env.hosts.split(',')

# Roles for different targets clusters
env.roledefs = {
   'web': env.hosts,
   'database': [],
}

# Miscellaneous options
env.vars = {}
# path = local path where interpolated file is stored temporarily
# Params for config_files are:
#   filename        : post-interpolated filename on the remote host
#   templatename    : name of the template file that interpolation is performed on
#   path:           : path on the remote host to store filename to
# [ {'filename':'config.yaml', 'templatename':'config.yaml.sample', 'path':'etc'} ]
env.config_files = [ {'filename':'config.yaml', 'path': '', 'templatename': 'config.yaml.tmpl'} ]

# Packages required to run the application. Used by system_setup
# The specific package key (os-name) is determined on system setup
env.packages = {'rhel5': { 
                    'required' : 
                        [ 'mysql55', 'mysql55-libs', 'php53', 'php53-cli', 'php53-cgi', 'php53-gd', 'php-pear-Net-Curl',
                          'php53-common', 'php53-mysql', 'php53-xmlrpc', 'php53-pecl-memcache','php53-mysql', 
                          'python26', 'python26-setuptools', 'python26-imaging', 'python26-mysqldb', 'python26-simplejson',
                          'elinks', 'httpd', 'apachetop', 'sendmail', 'exim', 's3cmd' ],
                    'optional' : []  },
                    
                # Ubuntu 10.04 has python2.6.5 by default
                'ubuntu10': { 
                    'required': 
                        [ 'mysql-client', 'php5', 'php5-cli', 'php5-cgi', 'php5-gd',
                          'php5-common', 'php5-mysql', 'php5-xmlrpc', 'php5-memcache', 'php5-curl',
                          'python-setuptools' , 'python-imaging', 'python-mysqldb', 'python-simplejson', 
                          'elinks', 'apache2', 'apachetop', 'apache2-utils', 'libapache2-mod-php5', 'sendmail', 'exim4',
                          's3cmd' ],
                    'optional': [],
                    'additional_commands':['a2enmod php5', 'a2enmod headers'] }
                }


#----- Decorator(s) -----
def common_config(func):
    """
    Common are the environment variables that need to be evaluated after the others are loaded
    due to dependencies. There has to be a way to inherist this stuff though!!!
    """
    def wrapper():
        if env.rcfile is None:
            env.rcfile = 'rcfile.%s' % env.settings

        # execute the caller to load that set of configurations
        func()

        get_remote_host_info()
        
        # Now load all the configurations that were dependent on the caller's var-space
        if env.get('deploy_to') is None:
            env.deploy_to = '/home/%(user)s' % env # The base path should always be the logged-in user
            
        env.deploy_to = env.deploy_to % env

        # System paths are under app_path, so provide the relative paths that we need
        # for system services (like lighttpd, apache, etc.)
        # Thes COULD be specific for each environment/stage, but it's best to have them common
        env.system_paths = ['var/log', 'etc/%(webserver)s' % env, 'run', 'releases', 'shared']

        # The scratch/work space for putting temporary stuff while we deploy from local dev
        env.tmp_path = "/tmp/%(application)s/releases" % env
        env.app_path = '%(deploy_to)s/%(application)s' % env
        env.current_path = "%(app_path)s/current" % env
        env.shared_path = "%(app_path)s/shared" % env
        env.run_path = "%(app_path)s/var/run" % env

        # Configuration Template Files and config files
        env.etc_path = '%(app_path)s/etc' % env
        env.log_path = '%(app_path)s/var/log' % env

        # Some vars may need to be interpolated after we have all the data:
        # TODO: Wonder if this can be done globally (ie on all vars)
        env.script_working_path = env.script_working_path % env
        env.webserver_user = env.webserver_user % env
        env.webserver_docroot = env.webserver_docroot % env
        env.local_path = env.local_path % env
        env.digest_log_file = env.digest_log_file % env
        env.logfile = env.logfile % env
        
        env.local_etc_path = '%(local_path)s/etc' % env

        # Todo: these might need to be moved to a common location
        # for conf in env.config_files:
        #    conf['local_config_template'] = '%s/%s' % (env.local_etc_path, conf.get('templatename'))
        #    conf['local_config_file'] = '%s/%s/%s' % (env.local_path, conf.get('path'), conf.get('filename'))

        # Each webservec can have its own set of configurations
        # Eg. apache, lighttpd, etc.
        env.webserver_template = '%(local_etc_path)s/%(webserver)s/%(application)s.conf.sample' % env
        env.webserver_file = '%(local_etc_path)s/%(webserver)s/%(application)s.conf' % env
        

    return wrapper

def get_remote_host_info():
    """
    Determine the remote host's OS, and based on this set some
    environment options so that we can easily move forward
    """
    # We do this as sudo_as() since it's part of initial setup and the 
    # app user may not yet exist
    uname = sudo_as('uname -a')
    print "Uname is %s" % uname
    
    # TODO; add support for getting the exact target version
    # ver = run('more /etc/issue')
    # .. then parse the resp and convert into ver
    if re.search('el5|fc8', uname):
        env.os_name = 'rhel5'
        env.webuser = 'apache'
    elif re.search('Ubuntu', uname):
        env.os_name = 'ubuntu10'
        env.webuser = 'www-data'
    else:
        raise Exception("Cannot proceed with platform %s. This platform is currently not supported" % uname)
    
    print "Remote host is %s" % env.os_name

#----- /decorator(s) -----

#----- Utility Functions -----
def sudo_as(cmd, **kwargs):
    temp_user = env.user
    env.user = env.sudo_as
    print "sudoing command %s as user %s" % (cmd, env.sudo_as)
    resp = sudo(cmd, **kwargs)
    env.user = temp_user
    return resp
     
#----- /utility funcs -----

# Environments
# Each of these is a simple way of configuring the entire environment with
# any customizations.

@common_config
def live():
    """
    Work on demo environment
    """
    if env.rcfile is None:
        env.rcfile = 'rcfile.%s' % env.settings
        print "Using default rcfile since one was not provided with --config option:" % env.rcfile

@common_config
def demo():
    """
    Work on demo environment
    """
    if env.rcfile is None:
        env.rcfile = 'rcfile.%s' % env.settings
        print "Using default rcfile since one was not provided with --config option:" % env.rcfile

@common_config
def dev():
    """
    Work on dev environment
    """
    if env.rcfile is None:
        env.rcfile = 'rcfile.%s' % env.settings
        print "Using default rcfile since one was not provided with --config option:" % env.rcfile

#------------------------------------------------
# Create Configuration files from rcfile
#------------------------------------------------
def create_config_yaml():
    if not os.path.exists(env.rcfile):
        raise Exception("%(rcfile)s does not exist. See rcfile.sample and run fab --config=rcfile.name <commands>!" % env)

    for item in env.config_files:
        if not os.path.exists(item.get('local_config_template')):
            raise Exception("Unable to find configuration template file (%s) to create config from" % item.get('local_config_template'))
        else:
            print("Interpolating %s => %s" % (item.get('local_config_template'), item.get('local_config_file')))
            
        infile = open(item.get('local_config_template'), 'r')
        outfile = open(item.get('local_config_file'), 'w')
        outfile.write(infile.read() % env)
        outfile.close()
        infile.close()

def upload_config_yaml():
    " Upload the interpolated config.yaml to the target servers"
    for item in env.config_files:
        put(item.get('local_config_file'), env.shared_path)

def create_webserver_conf():
    if not os.path.exists(env.webserver_template):
        raise Exception("Unable to find configuration template file (%(webserver_template)s) to create config from" % env)
    infile = open(env.webserver_template, 'r')
    outfile = open(env.webserver_file, 'w')
    outfile.write(infile.read() % env)
    outfile.close()
    infile.close()

def upload_webserver_conf():
    put(env.webserver_file, "%(etc_path)s/%(webserver)s" % env)

@roles('web')
def deploy_configurations():
    """
    Interpolate configuration templates into the final config files and deploy to target hosts
    Deploy config.yaml and other webserver-related configurations 
    """
    # create_config_yaml()
    # upload_config_yaml()

    _upload_interpolated_files(_interpolate_templates())
    # create_webserver_conf()
    # upload_webserver_conf()
    stop_webserver()
    start_webserver()
    
#---- /create-config-files ----------------------

#----- CRON related tasks -----    

def _interpolate_templates():
    """ Translate the cron file template into a "real" cron file.
    
    Should never be called directly, since the purpose of this function is
    to perform the first step of cron-file deployment
    """
    if not os.path.exists(env.rcfile):
        raise Exception("%(rcfile)s does not exist. See rcfile.sample and run fab --config=rcfile.name <commands>!" % env)

    interpolated_files = []
    # Get a list of all template files in /etc/ that we needt o interpolate
    for root, dirs, files in os.walk(env.local_etc_path):
        for name in files:
            infilename = os.path.join(root, name)
            if re.search('.tmpl$', infilename):
                print "Processing template file %s" % infilename
                
                outfilename = os.path.splitext(infilename)[0]
                infile = open(infilename, 'r')
                outfile = open(outfilename, 'w')
                outfile.write(infile.read() % env)
                outfile.close()
                infile.close()
                interpolated_files.append(outfilename)
                
    return interpolated_files

def _upload_interpolated_files(files):
    """ Uploads cron files after interpolation 
    
    Expects to have interpolation run initially, so this function should 
    not be called directly.
    """
    for filename in files:
        print "filename to search for is %s" % filename
        if not re.search('.tmpl$', filename):
            # TODO: This is a bit sketchy to do hard-coded 'etc' check, but 
            # we can't split on the entire path either!
            # Get the relative path to the interpolated etc file with 
            env.temp = filename.split('etc')[1]
            base = [x for x in env.temp.split('/') if x is not None and x != '']
            temp_path = list(base)
            temp_path.insert(0, env.etc_path)
            remote_path = os.path.join(*temp_path[:-1])
            remote_file = os.path.join(*temp_path)
            run('mkdir -p %s' % remote_path)
            put(filename, remote_file)
            # sudo_as('chgrp %s %s' % (env.webserver_group, remote_file))
        
            if re.match('/cron', env.temp):
                # Set the cron script to be executable
                run('chmod +x %s' % remote_file)
                
                # Symlink the cron job to the correct place
                temp_path = list(base)
                temp_path.insert(0, '/etc')
                abs_etc_path = os.path.join(*temp_path[:-1])    # assuming the last index is the file
                abs_etc_file = os.path.join(*temp_path)
                # We want the target path to exist, but not the target file
                sudo_as('if [ -d %s ];then if [ ! -e %s ];then sudo ln -snf %s %s; else echo "Target file already exists! Will not overwrite"; fi; else echo "Target path is incorrect"; fi' % (abs_etc_path, abs_etc_file, remote_file, abs_etc_file))
                

#----- /CRON related tasks -----

"""
Branches
"""
def stable():
    """
    Work on stable branch.
    """
    env.branch = 'stable'

def master():
    """
    Work on development branch.
    """
    env.branch = 'master'

def branch(branch_name):
    """
    Work on any specified branch.
    """
    env.branch = branch_name

"""
SETUP AND INITIALIZATION TASKS
"""
@roles('web')
def setup_system():
    """ Set up a new system """
    # Install pre-requisites with package manager
    install_requirements()
    # Create user and target paths as necessary
    create_app_context()
    # Validate that requisites are in place
    check_system()


@roles('web')
def setup_application():
    """
    Set up the application path and all the application specific things

    Does NOT perform the functions of deploy().
    """
    require('settings', provided_by=[dev, demo])
    # require('branch', provided_by=[stable, master, branch])

    setup_directories()
    deploy_configurations()

def setup_directories():
    """
    Create directories necessary for deployment.
    """
    # First set up the system paths for the server/services
    run('mkdir -p %(app_path)s' % env)

    #----
    # Server paths (for web/other servers)
    #----
    for path in env.system_paths:
        env.temp_var = path
        run('mkdir -p %(app_path)s/%(temp_var)s' % env)
        # Change ownership of paths.
        sudo_as('chgrp -R %(webserver_group)s %(app_path)s/%(temp_var)s; chmod -R g+w %(app_path)s/%(temp_var)s;' % env)

"""
SCM and Code related functions
"""
def bundle_code():
    # Set the timestamp for the release here, and it'll be available to the environment
    "Bundling Code"
    env.release = time.strftime('%Y%m%d%H%M%S')

    # We want the parent paths to the temporary location ...
    if not os.path.exists(env.tmp_path):
        os.makedirs(env.tmp_path)

    # .. but not the actual releases path since that's where we'll put new code
    local('rm -rf %(tmp_path)s' % env)

    if env.scm == 'git':
        "Create an archive from the current Git master branch and upload it"
        local('git clone --depth 0 %(repository)s %(tmp_path)s' % env)
        local('cd %(tmp_path)s && git pull origin %(branch)s && git checkout %(branch)s' % env)
        local('cd %(tmp_path)s && git rev-parse %(branch)s > REVISION.TXT' % env)
        env.release = local('cd %(tmp_path)s && git rev-parse %(branch)s | cut -c 1-9' % env, capture=True)
        local('cd %(tmp_path)s && git archive --format=tar %(branch)s > %(tmp_path)s/%(release)s.tar' % env)
    elif env.scm == "git-svn":
        # Get repo information and store it to REVISION.txt
        local('cd %(repository)s && git svn info > %(tmp_path)s/REVISION.txt' % env)
    elif env.scm == 'svn':
        local('svn export %(repository)s/%(branch)s %(tmp_path)s' % env)
        local('svn info %(repository)s/%(branch)s > %(tmp_path)s/REVISION.txt' % env)
        local('cd %(tmp_path)s && tar -cf %(release)s.tar .' % env)
    else:
        raise "Unknown SCM type %s" % env.scm

    local('cd %(tmp_path)s && gzip %(release)s.tar' % env)

    print "Bundled code is at %(tmp_path)s/%(release)s.tar.gz" % env
    print "----- ATTENTION -----"
    print "If you plan to run the deployer at a later time, execute this first .."
    print "    echo 'release = %(release)s' >> %(rcfile)s" % env
    print "----- ATTENTION -----"
    # Don't delete the local copy in case we need to debug - that will be done on the next cycle

def upload_and_explode_code_bundle():
    "Upload the local tarball of latest code to the target host"
    put('%(tmp_path)s/%(release)s.tar.gz' % env, '%(app_path)s/releases/' % env)
    run('cd %(app_path)s/releases/ && mkdir -p %(release)s && tar -xvf %(release)s.tar.gz -C %(release)s && if [ -e %(release)s.tar.gz ];then rm -rf %(release)s.tar.gz; fi' % env)
    sudo_as('chgrp -R %(webuser)s %(app_path)s/releases/%(release)s' % env)

def symlink_current_release():
    "Symlink our current release, and also symlink config.yaml to the shared config"
    require('release', provided_by=[deploy_webapp, setup_application])
    run('if [ -e %(app_path)s/previous ];then rm %(app_path)s/previous; fi; if [ -e %(app_path)s/current ];then mv %(app_path)s/current %(app_path)s/previous; fi' % env)
    # Link the shared config file into the current configuration
    
    for item in env.config_files:
        run('rm -f %s' % (os.path.join(env.app_path, 'releases', env.release, item.get('path'), item.get('filename'))))
        # TODO:
        # This needs some help
        run('ln -s %s %s' % (os.path.join(env.app_path, 'etc', item.get('filename')), os.path.join(env.app_path, 'releases', env.release, item.get('path'), item.get('filename'))))

        # run('rm -f %(app_path)s/releases/%(release)s/%(config_path)s/%(config_filename)s;\
        #     ln -s %(app_path)s/shared/%(config_filename)s %(app_path)s/releases/%(release)s/%(config_path)s/%(config_filename)s' % env)

    run('ln -s %s %s' % (os.path.join(env.app_path, 'releases', env.release), os.path.join(env.app_path, 'current')))

def install_requirements():
    """
    Figure out what the target platform is to set the package manager
    """
    if env.os_name == 'rhel5':
        install_rhel5_packages()
    elif env.os_name == 'ubuntu10':
        install_ubuntu10_packages()
    else:
        raise "Unable to proceed - don't know os_name = %s" % env.os_name
    
    # Set up python's default encoding as utf-8
    sudo_as('echo -e "import sys\nsys.setdefaultencoding(\'utf-8\')\n" > /usr/lib/python2.6/site-packages/sitecustomize.py')
    
def install_rhel5_packages():
    """
    Install the required packages using yum. We can assume that security and other "core"
    system updates have already been applied. So no need to run "yum update"
    """
    # First install the IUS Community repo to get RHEL5 up to date with the newer requirements
    sudo_as('cd /tmp && rm -f *.rpm*')  # initial cleanup
    with settings(warn_only=True):
        result = sudo_as('wget')
    if result.failed:
        sudo_as("yum -y install wget")
    sudo_as('cd /tmp && wget http://dl.iuscommunity.org/pub/ius/stable/Redhat/5/x86_64/ius-release-1.0-8.ius.el5.noarch.rpm')
    sudo_as('cd /tmp && wget http://dl.iuscommunity.org/pub/ius/archive/Redhat/5/x86_64/epel-release-1-1.ius.el5.noarch.rpm')
    
    with settings(warn_only=True):
        sudo_as('cd /tmp && rpm -Uhv epel-release-1-1.ius.el5.noarch.rpm && rpm -Uhv ius-release-1.0-8.ius.el5.noarch.rpm')
    if result.failed:
        print "IUS community may already have been installed. Ignoring and continuing"
        
    # Now that IUS Community in installed let's clean things up and continue
    sudo_as('yum clean all && yum -y upgrade')
    # Remove existing mysql if it exists, so that there's no conflict
    sudo_as('yum -y remove mysql mysql-libs')
    
    # Python dependencies - these don't seem to want to work without a good repo :(
    if len(env.packages.get('rhel5').get('required')) > 0:
        try:
            sudo_as('yum -y --skip-broken install %s' % ' '.join(env.packages.get('rhel5').get('required')))
        except Exception, e:
            print "Required packages installation process failed. Cannot proceed!"
            raise
    
    # Python dependencies - these don't seem to want to work without a good repo :(
    if len(env.packages.get('rhel5').get('optional')) > 0:
        try:
            sudo_as('yum -y --skip-broken install %s' % ' '.join(env.packages.get('rhel5').get('optional')))
        except Exception, e:
            print "Optional packages installation process failed. But proceeding nevertheless. Assuming it'll be fixed manually!"
            print "Error was %s", e
        
    # Disable firewall on RHEL5 since EC2 configuration should be managed by security groups
    print "Please ensure that you've disabled SELinux and any Firewalls via system-config-securitylevel-tui"

def install_ubuntu10_packages():
    """
    Install the defined packages on Ubuntu
    """
    sudo_as('aptitude clean && aptitude update')
    try:
        sudo_as('aptitude -y install %s' % ' '.join(env.packages.get('ubuntu10').get('required')))
    except Exception, e:
        print "Required packages installation process failed. Cannot proceed!"
        raise
        
    try:
        sudo_as('aptitude -y install %s' % ' '.join(env.packages.get('ubuntu10').get('optional')))
    except Exception, e:
        print "Optional packages installation process failed. But proceeding nevertheless. Assuming it'll be fixed manually!"
        print "Error was %s", e  

    for action in env.packages.get('ubuntu10').get('additional_commands'):
        try:
            sudo_as(action)
        except Exception, e:
            print "Additional_command %s failed. Continuing anyway!" % action
            print "Error was %s", e
            continue
    
def create_app_context():
    """
    Create the user context under which the application will run
    """
    try:
        sudo_as('useradd -d %(home_path)s/%(user)s -m %(user)s && mkdir %(home_path)s/%(user)s/.ssh/ && cp ~/.ssh/authorized_keys %(home_path)s/%(user)s/.ssh/ && chown -R %(user)s:%(user)s %(home_path)s/%(user)s/.ssh' % env)
        sudo_as('chmod 755 %(home_path)s/%(user)s && chgrp -R %(webuser)s %(home_path)s/%(user)s' % env)
    except SystemExit:
        print "WARNING: Failed to create app context since it probably already exists. Continuing."

    return True
    
def check_system():
    """
    Ensure that the prerequisites and system locations exist
    """
    sudo_as('php --version | grep -i "php 5"')
    sudo_as('python2.6 --version')
    # sudo_as('mysql --version | grep -i "distrib 5"')
    if env.os_name == 'rhel5':
        sudo_as('apachectl -v | grep -i "apache\/2"')
    elif env.os_name == 'ubuntu10':
        sudo_as('apache2ctl -v | grep -i "apache\/2"')
    
"""
Deployment Related Tasks
"""
def deploy_assets_to_s3():
    """
    Deploy the latest assets and JS to S3 bucket
    """
#    run('s3cmd del --recursive s3://%(s3_bucket)s/%(application)s/%(admin_media_prefix)s/' % env)
#    run('s3cmd -P --guess-mime-type sync %(venv_path)s/src/django/django/contrib/admin/media/ s3://%(s3_bucket)s/%(application)s/%(site_media_prefix)s/' % env)
#    run('s3cmd del --recursive s3://%(s3_bucket)s/%(application)s/%(newsapps_media_prefix)s/' % env)
#    run('s3cmd -P --guess-mime-type sync %(venv_path)s/src/newsapps/newsapps/na_media/ s3://%(s3_bucket)s/%(application)s/%(newsapps_media_prefix)s/' % env)
    pass

@roles('web')
def deploy_webapp():
    """
    Deploy the latest version of the site to the server and restart Apache2.

    Does not perform the functions of load_new_data().
    """
    # require('settings', provided_by=[production, staging])
    # require('branch', provided_by=[stable, master, branch])

    # with settings(warn_only=True):
    #    maintenance_up()

    upload_and_explode_code_bundle()
    if env.get('upload_only'):
        # This indicates that we don't want to update current
        # or restart the web server, so bail at this point
        return

    # Restart the web server with the latest code
    stop_webserver()
    symlink_current_release()
    # maintenance_down()
    start_webserver()

    # checkout_latest()
    # gzip_assets()
    # deploy_to_s3()
    # refresh_widgets()
    # maintenance_down()

def maintenance_up():
    """
    Execute maintenance configuration.
    """
    # sudo('cp %(repository)s/%(application)s/configs/%(settings)s/%(application)s_maintenance %(apache_config_path)s' % env)
    # reboot()
    pass

def maintenance_down():
    """
    Reinstall the normal site configuration.
    """
    # install_apache_conf()
    # reboot()
    pass

def stop_webserver():
    """
    Stop the webserver. Note that some web servers allow for command-line definition
    of the configuration file to use. Others don't
    """
    _webserver_do('stop')
    
def start_webserver():
    _webserver_do('start')
    
def restart_webserver():
    _webserver_do('restart')
    
def _webserver_do(action=''):
    """
    Act on the webserver (start, stop, restart, etc).
    """
    params = {}
    params['webserver'] = env.webserver
    params['action'] = action
    params['app_path'] = env.app_path
    
    if env.webserver == 'lighttpd':
        # Keep in mind that this has to be configured for the new lighttpd init script
        # Also, because of the way /etc/init.d/lighttpd works, we need to ensure theres no
        # shell (ie bash -l -c) or pseudo-terminal 
        sudo_as('/etc/init.d/%(webserver)s %(action)s %(app_path)s' % params, shell=False, pty=False)
    elif env.webserver == 'apache':
        if env.os_name == 'rhel5':
            sudo_as('/usr/sbin/apachectl %(action)s' % params)
        elif env.os_name == 'ubuntu10':
            sudo_as('/usr/sbin/apache2ctl %(action)s' % params)
                        
def secure_webserver():
    """
    Apply htaccess (basicAuth) to the web server
    """
    if env.webserver == 'apache':
        # Symlink the .htaccess file to the webserver root
        run('ln -s %(etc_path)s/%(webserver)s/htaccess %(webserver_docroot)s/.htaccess' % env)
        run ('if [ ! -e %(etc_path)s/htpasswd ];then htpasswd -b -c %(etc_path)s/htpasswd %(webserver_auth_user)s %(weberver_auth_password)s; fi' % env)
    else:
        raise "Cannot set security parameters for webserver %(webserver)s yet. Please contact the developer." % env
        
"""
Rollback deployed code tasks
"""
def rollback(commit_id):
    """
    Rolls back to specified git/svn commit hash or tag or timestamp.
    Deployments should be to timestamp-commitTag

    There is NO guarantee we have committed a valid dataset for an arbitrary
    commit hash.
    """
#    require('settings', provided_by=[production, staging])
#    require('branch', provided_by=[master, branch])
#
#    maintenance_up()
#    checkout_latest()
#    git_reset(commit_id)
#    gzip_assets()
#    deploy_to_s3()
#    refresh_widgets()
#    maintenance_down()
    pass

"""
Database Related Tasks 
"""
def setup_db_backup():
    pass

def create_mycnf():
    """
    Create the remote ~/.my.cnf file with appropriate content and permissions 
    """
    # First escape any weird characters in the password
    env.temp = re.sub('\$', '\\$', env.database_password)
    # env.temp = env.database_password
    run('echo "[client]\nuser=%(database_user)s\npassword=%(temp)s\n" > $HOME/.my.cnf && chmod 600 $HOME/.my.cnf' % env)
    
def load_new_data():
    """
    Erase the current database and load new data from the SQL dump file.
    """
    require('settings', provided_by=[production, staging])

#    maintenance_up()
#    destroy_database()
#    create_database()
#    load_data()
#    maintenance_down()
    pass

def create_database():
    """
    Creates the user and database for this project.
    """
    run('echo "CREATE USER %(application)s WITH PASSWORD \'%(database_password)s\';" | psql postgres' % env)
    run('createdb -O %(application)s %(application)s -T template_postgis' % env)

def destroy_database():
    """
    Destroys the user and database for this project.

    Will not cause the fab to fail if they do not exist.
    """
    with settings(warn_only=True):
        run('dropdb %(application)s' % env)
        run('dropuser %(application)s' % env)

def load_data():
    """
    Loads data from the repository into PostgreSQL.
    """
    run('psql -q %(application)s < %(path)s/repository/data/psql/dump.sql' % env)
    run('psql -q %(application)s < %(path)s/repository/data/psql/finish_init.sql' % env)


"""
Commands - miscellaneous
"""

def clear_cache():
    """
    Restart memcache, wiping the current cache.
    """
    sudo('/mnt/apps/bin/restart-memcache.sh')

def echo_host():
    """
    Echo the current host to the command line.
    """
    run('echo %(settings)s; echo %(hosts)s' % env)

@roles('web')
def debug_dump_env():
    """
    Dump all the environment variables
    """
    print "Testing the rcfile"
    for item in env.keys():
        print "%s => %s" % (item, env.get(item))


"""
EC2 AND CLOUD-RELATED TASKS
"""
# EC2 bundling, scaling and other such tasks
def put_ec2_credentials_for_bundling():
    pass

def bundle_and_save_image():
    """
    Make sure that this instance is not in the load-balancer
    Stop the webserver on this instance
    Clean this instance's log files
    Upload the ec2 credentials to the defined target instance (the bundler)
    Ren the bundler, which uploads image to S3. The bundler will inform us when it's done
    """
    pass

def update_ec2_instances_list():
    """
    Get a list of all the currently running instances and their versions so that
    we know what's out of date
    """
    pass

def mount_ephemeral_storage():
    """
    If ephemeral storage is not mounted, create a mount point, initialize the block and mount it
    """
    sudo_as("if [ ! $(mount | grep -i 'mnt') ];then mkfs.ext3 /dev/sdf && mount /dev/sdf /mnt; mkdir -p /mnt/%(application)s/var; chmod -R a+rw /mnt/%(application)s; fi" % env)
    run('mkdir -p %(script_working_path)s' % env)
    
