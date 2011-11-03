from fabric.api import *
from fabric.contrib import files as files
import os
import time
import re
from boto.ec2.connection import EC2Connection
from boto.ec2.autoscale import AutoScaleConnection
from boto.ec2.autoscale import LaunchConfiguration
from boto.ec2.autoscale import AutoScalingGroup
# from boto.ec2.autoscale import Trigger

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

TODO:
    * Easy way to install pip/pear/cpan packages when RHEL does not have them:
        * easy_install-2.6 install pip
        * pip-2.6 install pyyaml
    
------------------------------
COOKBOOK:
------------------------------
    The general format of a command is:
        fab --config=<rcfile> <environment> <tasks ...>
        environment : the environment to launch. This is mandatory.
                      value is one of dev, prod, demo

    Setup the initial system with prerequisites
        fab --config=rcfile.dev dev setup_system

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
# GLOBALS
DEBUG = True

# WHether to clean the build_path folder before the build. This is set
# using the clean_build option
env.clean_build = False

# SSH Key configuration
env.key_filename = os.path.expanduser(env.key_filename)
env.ssh_port = 48022

# We need to make the hosts into a list
env.hosts = env.hosts.split(',')

# Interpolate the build_path if necessary
env.build_path = env.build_path % env
# if len(env.build_path) == 0 or not os.path.exists(env.build_path):
#     raise Exception("Option build_path (%(build_path)s is incorrect, or the target folder does not exist. Please correct it before proceeding" % env)

if not env.get('home_path'):
    env.home_path = "/home"

# Roles for different targets clusters
env.roledefs = {
   'web': env.hosts,
}

# Miscellaneous options
env.vars = {}

# Params for config_files are:
#   filename        : post-interpolated filename on the remote host
#   templatename    : name of the template file that interpolation is performed on
#   path:           : path on the remote host to store filename to
# CAVEAT: Don't link anything into the web/ path unless you want it visible to the public!
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

# Protected folders are those under .htaccess control, and are always relative to the document root
env.protected_folders = []

# Template paths will be interpolated. This is any folder that contains a 
# template file, but in addition to the etc_path folder. SO DO NOT ADD
# etc_path to this list!
env.template_paths = []

# Should we minify?
env.run_minifier = True
env.minifier_cmd = 'python %(build_path)s/scripts/minifier/minifier.py -v -c %(build_path)s/scripts/minifier.conf --force'

#------------------------------------------------
# AWS related tasks require some configurations
#------------------------------------------------
# env.ec2Conn = EC2Connection(env.aws_access_key_id, env.aws_secret_access_key)
# env.asConn  = AutoScaleConnection(env.aws_access_key_id, env.aws_secret_access_key)

# Production Alias is the alias/tag that all production instances use
env.production_alias = '911memorial_names_'

# Security groups that are given access to newly generated production AMIs
env.aws = { 'security_groups': ['ns11_multiplatform_prod'],
            'key_pair': 'ns11_0630', 'as_group': 'n11asgroup', 
            'balancers': ['n11loadbalancer'], 'instance_type':'m1.large',
            'availability_zones': ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d'] }
            # 'min_size': 3, 'max_size': 12 }

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
            env.deploy_to = '%(home_path)s/%(user)s' % env # The base path should always be the logged-in user
            
        env.deploy_to = env.deploy_to % env

        # System paths are under app_path, so provide the relative paths that we need
        # for system services (like lighttpd, apache, etc.)
        # Thes COULD be specific for each environment/stage, but it's best to have them common
        env.system_paths = ['var/log', 'etc/%(webserver)s' % env, 'run', 'releases', 'shared']

        # The scratch/work space for putting temporary stuff while we deploy from local dev
        env.app_path = '%(deploy_to)s/%(application)s' % env
        env.current_path = "%(app_path)s/current" % env
        env.releases_path = "%(app_path)s/releases" % env
        env.shared_path = "%(app_path)s/shared" % env
        env.run_path = "%(app_path)s/run" % env
        env.previous_path = "%(app_path)s/previous" % env
        env.next_path = "%(app_path)s/next" % env

        # Configuration Template Files and config files
        env.etc_path = '%(app_path)s/etc' % env
        env.log_path = '%(app_path)s/var/log' % env
        env.local_etc_path = '%(build_path)s/etc' % env

        # Todo: these might need to be moved to a common location
        for conf in env.config_files:
            conf['local_config_template'] = '%s/%s' % (env.local_etc_path, conf.get('templatename'))
            conf['local_config_file'] = '%s/%s/%s' % (env.build_path, conf.get('path'), conf.get('filename'))
        
        # Each webservec can have its own set of configurations
        # Eg. apache, lighttpd, etc.
        env.webserver_template = '%(local_etc_path)s/%(webserver)s/%(application)s.conf.sample' % env
        env.webserver_file = '%(local_etc_path)s/%(webserver)s/%(application)s.conf' % env
        
        # Some vars may need to be interpolated after we have all the data:
        # TODO: Wonder if this can be done globally (ie on all vars)
        for item in env:
            if type(env[item]) == str:
                # We may have to recursively keep interpolating
                while '%(' in env[item]:
                    env[item] = env[item] % env
                debug("Interpolated %s to %s" % (item, env[item]))

        # for item in ['deploy_to', 'build_path', 'script_working_path', 'media_store_path', 'webserver_docroot', 'media_url',
        #              'app_path', 'current_path', 'shared_path', 'run_path', 'log_path', 'local_etc_path', ]:
        #     # We may have to recursively keep interpolating
        #     while '%(' in env[item]:
        #         env[item] = env[item] % env
        #     print "Interpolated %s to %s" % (item, env[item])

        # Template paths are the folders to be interpolated in addition to etc
        env.template_paths = [x % env for x in env.template_paths]
        
    return wrapper

def get_remote_host_info():
    """
    Determine the remote host's OS, and based on this set environment options
    """
    # We do this as sudo_as() since it's part of initial setup and the 
    # app user may not yet exist
    uname = sudo_as('uname -a')
    debug("Uname is %s" % uname)
    
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
    
    debug("Remote host is %s" % env.os_name)

#----- /decorator(s) -----

#----- Utility Functions -----
def sudo_as(cmd, **kwargs):
    """
    Perform sudo as a higher-rights user
    """
    temp_user = env.user
    env.user = env.sudo_as
    debug("sudoing command %s as user %s" % (cmd, env.sudo_as))
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
    Work on live environment
    """
    if env.rcfile is None:
        env.rcfile = 'rcfile.%s' % env.settings
        debug("Using default rcfile since one was not provided with --config option:" % env.rcfile)

@common_config
def demo():
    """
    Work on demo environment
    """
    if env.rcfile is None:
        env.rcfile = 'rcfile.%s' % env.settings
        debug("Using default rcfile since one was not provided with --config option:" % env.rcfile)

@common_config
def dev():
    """
    Work on dev environment
    """
    if env.rcfile is None:
        env.rcfile = 'rcfile.%s' % env.settings
        debug("Using default rcfile since one was not provided with --config option:" % env.rcfile)

def clean_build():
    """
    Force clean out the build_path folder prior to building
    """
    env.clean_build = True

def dump_env():
    """
    Test function for dumping all current environment variables
    """
    for key in env.keys():
        debug("%s => %s" % (key, env.get(key)))

#------------------------------------------------
# Create Configuration files from rcfile
#------------------------------------------------
def create_config_files():
    """
    Create configuration files from templates, as defined in the env.config_files option
    """
    if not os.path.exists(env.rcfile):
        raise Exception("%(rcfile)s does not exist. See rcfile.sample and run fab --config=rcfile.name <commands>!" % env)

    # Make sure that the code is the latest in the build_path
    with lcd(env.build_path):
        local('git fetch origin && git pull origin && git checkout %(branch)s' % env)
    for item in env.config_files:
        if not os.path.exists(item.get('local_config_template')):
            raise Exception("Unable to find configuration template file (%s) to create config from" % item.get('local_config_template'))

        infilename = item.get('local_config_template')
        outfilename = item.get('local_config_file')
        _interpolate_file(infilename, outfilename)
        
def _interpolate_file(infilename=None, outfilename=None):
    infile = open(infilename, 'r')
    outfile = open(outfilename, 'w')

    for line in infile:
        if line.strip().startswith('#'):
            continue
        else:
            try:
                outfile.write(line % env)
            except:
                print "Unable to write line %s" % line
                raise
    outfile.close()
    infile.close()

def upload_config_files():
    " Upload the interpolated config.yaml to the target servers"
    for item in env.config_files:
        put(item.get('local_config_file'), env.shared_path)

@roles('web')
def deploy_app_configurations():
    """
    Interpolate templates into final config files and deploy to targets, but do NOT restart webserver
    """
    create_config_files()
    upload_config_files()

    _upload_interpolated_files(_interpolate_templates())
    
    # Load the cronfile for the current user
    if files.exists('%(shared_path)s/etc/cron/cron_table' % env):
        run('crontab %(shared_path)s/etc/cron/cron_table' % env)
    

@roles('web')
def deploy_configurations():
    """
    Perform deploy_app_configurations, create the media-link for the web apps, and restart webserver
    """
    deploy_app_configurations()
    # Serve the media folder if necessary
    # _create_media_link()
    restart_webserver()
    
#---- /create-config-files ----------------------

#----- CONFIGURATION related tasks -----    

def create_local_configs():
    """
    Create all configuration files in the local environment. Useful only for development.
    """
    print "Local configuration files will be generated in %(build_path)s" % env
    create_config_files()
    _interpolate_templates()
    
def _interpolate_templates():
    """
    Translate template files to replace all python string-substitution points
    
    Should never be called directly, since the purpose of this function is
    to perform the first step of config-file deployment
    """
    if not os.path.exists(env.rcfile):
        raise Exception("%(rcfile)s does not exist. See rcfile.sample and run fab --config=rcfile.name <commands>!" % env)

    interpolated_files = []
    # Get a list of all template files in /etc/ that we need to interpolate
    template_paths = []
    template_paths.extend(env.template_paths)
    template_paths.append(env.local_etc_path)

    for template_path in template_paths:        
        for root, dirs, files in os.walk(template_path):
            for name in files:
                infilename = os.path.join(root, name)
                if re.search('.tmpl$', infilename):
                    debug("Processing template file %s" % infilename)
                
                    outfilename = os.path.splitext(infilename)[0]
                    _interpolate_file(infilename, outfilename)
                    # infile = open(infilename, 'r')
                    # outfile = open(outfilename, 'w')
                    # try:
                    #     outfile.write(infile.read() % env)
                    # except TypeError, e:
                    #     if re.search("not enough arguments for format string", e[0]):
                    #         # We can safely ignore this since it means that there's nothing to interpolate
                    #         print e[0]
                    #         print "Continuing by using the template file (%s) as the target (ie no interpolation)" % infilename
                    #         # Remember that we have to go back to the top due to read() being at eof
                    #         infile.seek(0)
                    #         outfile.write(infile.read())
                    #     else:
                    #         raise
                    #     
                    # outfile.close()
                    # infile.close()
                    interpolated_files.append(outfilename)
                
    return interpolated_files

def _upload_interpolated_files(files):
    """ 
    Uploads template files after interpolation 
    
    Expects to have interpolation run initially, so this function should 
    not be called directly.
    """
    # Get a list of all template files in /etc/ that we need to interpolate
    template_paths = []
    template_paths.extend(env.template_paths)
    template_paths.append(env.local_etc_path)

    for filename in files:
        env.temp = None
        if not re.search('.tmpl$', filename):
            # Get the relative path to the interpolated file. The template
            # is either at etc/... or current/...
            for tmplpath in template_paths:
                if re.search(tmplpath, filename):
                    if re.match(env.local_etc_path, tmplpath):
                        env.temp = filename.split(env.local_etc_path)[1]
                    elif re.match(env.build_path, tmplpath):
                        # We want everything except the build_path
                        env.temp = filename.split(env.build_path)[1]
                    else:
                        raise Exception("Unknown root path - not etc or build_path. Please check your configs!")
                    
                    # Now that we found something, we can move on    
                    break
                    
            base = [x for x in env.temp.split('/') if x is not None and x != '']
            temp_path = list(base)  # redundant, but helps
            # Template file are either in the etc/ or under the current/
            if re.match(env.local_etc_path, filename):
                temp_path.insert(0, env.etc_path)
            elif re.match(env.build_path, filename):
                temp_path.insert(0, env.current_path)
            
            remote_path = os.path.join(*temp_path[:-1])
            remote_file = os.path.join(*temp_path)
            # debug("remote_path: %s; remote_file: %s" % (remote_path, remote_file))
            
            run('mkdir -p %s' % remote_path)
            put(filename, remote_file)
            # sudo_as('chgrp %s %s' % (env.webserver_group, remote_file))
        
            if re.match('/cron', env.temp) or re.match('/logrotate.d', env.temp):
                # Set the cron script to be executable
                run('chmod +x %s' % remote_file)
                
                # # Symlink the cron job to the correct place
                # temp_path = list(base)
                # temp_path.insert(0, '/etc')
                # abs_etc_path = os.path.join(*temp_path[:-1])    # assuming the last index is the file
                # abs_etc_file = os.path.join(*temp_path)
                # # We want the target path to exist, but not the target file
                # sudo_as('if [ -d %s ];then if [ ! -e %s ];then sudo ln -snf %s %s; else echo "Target file already exists! Will not overwrite"; fi; else echo "Target path is incorrect"; fi' % (abs_etc_path, abs_etc_file, remote_file, abs_etc_file))
   
def _create_media_link():
    """
    Create symlink for local media path as a URL in web docroot
    """

    if env.get('serve_media') and env.serve_media == "True":
        src = env.media_store_path % env
        
        if re.match('s3://', env.media_store_path):
            raise Exception("Cannot create a media link to an S3 resource. Terminating due to risk of other misconfigurations.")
        link = "%(webserver_docroot)s/_store" % env
        with settings(warn_only=True):
            if files.exists(src):
                run('ln -s %s %s' % (src, link))
    else:
        print "This environment does not need media to be served"
        
#----- /configuration related tasks -----

"""
Branches
"""
def stable():
    """
    Work on stable branch.
    """
    branch('stable')

def master():
    """
    Work on development branch.
    """
    branch('master')

def branch(branch_name):
    """
    Work on any specified branch.
    """
    env.branch = branch_name
    print "Branch has been manually overridden to %(branch)s" % env

"""
SETUP AND INITIALIZATION TASKS
"""
@roles('web')
def setup_system():
    """ 
    Set up a new system with all pre-requisites and a target user context
    """
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
    """
    require('branch')

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
    """
    Pull the latest code from the SCM and bundle for deployment
    """
    # env.release = time.strftime('%Y%m%d%H%M%S')

    # We want the parent paths to the temporary location ...
    if not env.get('build_path'):
        raise "Need a build_path to build code to"
    if not os.path.exists(env.build_path):
        os.makedirs(env.build_path)

    # And if the code path already exists, let's update it with the latest code
    # Unless we've been asked to do a clean-build in which case remove all old content
    if env.clean_build:
        local('rm -rf %(build_path)s' % env)

    if env.scm == 'git':
        if not os.path.exists(env.build_path):
            "Create an archive from the current Git master branch and upload it"
            local('git clone --depth 0 %(repository)s %(build_path)s' % env)
        else:
            with lcd(env.build_path):
                local('if [ $(git config --get remote.origin.url) != "%(repository)s" ];then echo "Existing repository is not the one requested. Deleting build path."; rm -rf %(build_path)s; fi' % env)
            
        try:
            with lcd(env.build_path):
                local('git clean -d -x -f' % env)
        except:
            local('rm -rf %(build_path)s' % env)
            "Create an archive from the current Git master branch and upload it"
            local('git clone --depth 0 %(repository)s %(build_path)s' % env)
            
        with lcd(env.build_path):
            local('git clean -d -x -f && git pull origin && git checkout %(branch)s' % env)
            local('git submodule init && git submodule update' % env)
            env.release = local('git rev-parse %(branch)s | cut -c 1-9' % env, capture=True)
            # Save the revision information to a file for post-deployment info
            local('git rev-parse %(branch)s > REVISION.txt' % env)
            # To be safe, remove any newline characters
            env.release = re.sub('[\r\n]', '', env.release)
            # Archive the bundle for upload
            local('git archive --format=tar %(branch)s > %(build_path)s/%(release)s.tar' % env)

            if env.run_minifier == True and env.get('minifier_cmd') is not None: 
                with settings(warn_only=True):
                    # If minification fails, we only want to warn about it, not crash
                    local(env.minifier_cmd) # 'python %(build_path)s/scripts/minifier/minifier.py -v -c %(build_path)s/scripts/minifier.conf --force' % env)
                    local('git status -s | grep -i "^ M" | tr -s " " | cut -d\  -f 3 | xargs tar -v --append --file=%(release)s.tar ' % env)

            # Add any updated files
            local('tar --append --file=%(release)s.tar REVISION.txt' % env)
    elif env.scm == "git-svn":
        # Get repo information and store it to REVISION.txt
        local('cd %(repository)s && git svn info > %(build_path)s/REVISION.txt' % env)
        local('cd %(build_path)s && tar --append --file=%(release)s.tar REVISION.txt' % env)
    elif env.scm == 'svn':
        local('svn export %(repository)s/%(branch)s %(build_path)s' % env)
        local('svn info %(repository)s/%(branch)s > %(build_path)s/REVISION.txt' % env)
        local('cd %(build_path)s && tar -cf %(release)s.tar .' % env)
    else:
        raise "Unknown SCM type %s" % env.scm

    # Keep in mind that the .gitattributes file might ignore certain files from the archive 
    local('cd %(build_path)s && gzip %(release)s.tar' % env)

    print "Bundled code is at %(build_path)s/%(release)s.tar.gz" % env
    print "----- ATTENTION -----"
    print "If you plan to run the deployer at a later time, execute this first .."
    print "    echo 'release = %(release)s' >> %(rcfile)s" % env
    print "----- ATTENTION -----"
    # Don't delete the local copy in case we need to debug - that will be done on the next cycle

def upload_and_explode_code_bundle():
    """
    Upload the local tarball of latest code to the target host
    """
    put('%(build_path)s/%(release)s.tar.gz' % env, '%(releases_path)s' % env)
    
    with settings(warn_only=True):
        result = run('cd %(releases_path)s/ && mkdir -p %(release)s && tar -xf %(release)s.tar.gz -C %(release)s' % env)
    if result.failed:
        print "Ignoring as though everything is good"
    run('cd %(releases_path)s/ && if [ -e %(release)s.tar.gz ];then rm -rf %(release)s.tar.gz; fi' % env)
    sudo_as('chgrp -R %(webuser)s %(releases_path)s/%(release)s' % env)

def symlink_current_release():
    """
    Symlink the current release, and also symlink all shared configuration files (from env.config_files)
    """
    require('release', provided_by=[deploy_webapp, setup_application])
    # if exists('%(app_path)s/previous' % env):
    run('if [ -e %(app_path)s/previous ];then rm %(app_path)s/previous; fi; if [ -e %(app_path)s/current ];then mv %(app_path)s/current %(app_path)s/previous; fi' % env)
    # Link the shared config file into the current configuration
    for item in env.config_files:
        run('rm -f %s/%s/%s/%s' % (env.releases_path, env.release, item.get('path'), item.get('filename')))
        run('ln -nsf %s %s' % (os.path.join(env.etc_path, item.get('filename')), os.path.join(env.releases_path, env.release, item.get('path'), item.get('filename'))))

    run('ln -s %(releases_path)s/%(release)s %(app_path)s/current' % env)

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
    Install the required packages using yum. 
    We can assume that security and other "core" system updates have already been applied. So no need to run "yum update"
    """
    # First install the IUS Community repo to get RHEL5 up to date with the newer requirements
    sudo_as('cd /tmp && rm -f *.rpm*')  # initial cleanup
    print "Checking if wget is installed. Ignore any errors here ..."
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
    env.tmpuser = env.user
    try:
        sudo_as('useradd -d %(home_path)s/%(tmpuser)s -m %(tmpuser)s' % env)
    except SystemExit:
        print "WARNING: Failed to create app context since it probably already exists. Continuing."

    try:
        sudo_as('mkdir %(home_path)s/%(tmpuser)s/.ssh/ && cp ~/.ssh/authorized_keys %(home_path)s/%(tmpuser)s/.ssh/ && chown -R %(tmpuser)s %(home_path)s/%(tmpuser)s/.ssh' % env)
        sudo_as('chmod 755 %(home_path)s/%(tmpuser)s && chgrp -R %(webuser)s %(home_path)s/%(tmpuser)s' % env)
    except:
        print "WARNING: something failed in copying SSH keys into user %(tmpuser)s context" % env
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
    """
    # require('settings', provided_by=[production, staging])
    # require('branch', provided_by=[stable, master, branch])

    # with settings(warn_only=True):
    #    maintenance_up()

    upload_and_explode_code_bundle()
    # Apply requirements.txt, if it exists
    # _install_pip_requirements()
    
    # Restart the web server with the latest code
    stop_webserver()
    symlink_current_release()
    # maintenance_down()
    start_webserver()

def _install_pip_requirements():
    '''
    If there is a pip requirement file, apply it under a root context
    TODO: This should be moved to a virtualenv context
    '''
    if files.exists('%(releases_path)s/%(release)s/requirements.txt' % env):
        sudo_as('pip install -r %(releases_path)s/%(release)s/requirements.txt' % env)
        
def _db_migrations():
    '''
    Apply database migrations as necessary
    '''
    pass
        
@roles('web')
def deploy_webapp_and_configs():
    """
    Convenience: deploy_webapp and deploy_configurations rolled into one
    """
    deploy_webapp()
    deploy_configurations()
    
@roles('web')
def deploy_app():
    """
    Deploy the latest application bundle, and symlink current. But do NOT restart the web server
    
    NOTE: The reason this is not called by deploy_webapp is due to lack of decorator
    inheritance is Fabric, so roles will not pass down
    """
    upload_and_explode_code_bundle()
    symlink_current_release()

@roles('web')
def deploy_app_and_configs():
    """
    Convenience: deploy_app and deploy_app_configurations rolled into one
    """
    deploy_app()
    deploy_app_configurations()

"""
WebServer related tasks
"""
def stop_webserver():
    """ Stop the webserver. 
    Note that some web servers allow for command-line definition of the configuration file to use. Others don't
    """
    _webserver_do('stop')
    
def start_webserver():
    """ Start the webserver """
    _webserver_do('start')
    
def restart_webserver():
    """Restart the webserver """
    _webserver_do('restart')
    
def _webserver_do(action=''):
    """
    Helper function to perform an action on the webserver (start, stop, restart, etc).
    """
    params = {}
    params['webserver'] = env.webserver
    params['action'] = action
    params['app_path'] = env.app_path
    
    with settings(warn_only=True):
        # If we get an exception here it's probably not catastrophic

        if env.webserver == 'lighttpd':
            # Keep in mind that this has to be configured for the new lighttpd init script
            sudo_as('/etc/init.d/%(webserver)s %(action)s %(app_path)s' % params, shell=False, pty=False)
        elif env.webserver == 'apache':
            if env.os_name == 'rhel5':
                sudo_as('/usr/sbin/apachectl %(action)s' % params)
            elif env.os_name == 'ubuntu10':
                sudo_as('/usr/sbin/apache2ctl %(action)s' % params)
                
def secure_website():
    """
    Apply htaccess (basicAuth) to folders defined by env.protected_folders
    """
    if env.webserver == 'apache':
        # Symlink the .htaccess file to the webserver root
        run ('if [ ! -e %(etc_path)s/htpasswd ];then touch %(etc_path)s/htpasswd; fi && htpasswd -b %(etc_path)s/htpasswd %(webserver_auth_user)s %(webserver_auth_password)s ' % env)
        for path in env.get('protected_folders'):
            env.temp = path
            run('ln -snf %(etc_path)s/%(webserver)s/htaccess %(webserver_docroot)s/%(temp)s/.htaccess' % env)
    else:
        raise "Cannot set security parameters for webserver %(webserver)s yet. Please contact the developer." % env
        
"""
Rollback deployed code tasks
"""
def rollback(commit_id=None):
    """
    Rolls back to specified git/svn commit hash or tag or timestamp.
    Deployments should be to timestamp-commitTag.
    If commit_id is not provided, move current to next and previous to current

    Obviously there is NO guarantee we have deployed this commit-hash!
    """
    if commit_id is not None:
        raise Exception('Rolling back to a specific commit-id is not yet supported')
    
    run('if [ [ -e %(previous_path)s ] && [ -e %(current_path)s ] ];then mv %(current_path)s %(next_path)s && mv %(previous_path)s %(current_path)s; fi' % env)

    stop_webserver()
    start_webserver()
    
"""
Database Related Tasks 
"""
def setup_db_backup():
    """  """
    pass

def create_mycnf():
    """
    Create the remote ~/.my.cnf file with appropriate content and permissions 
    """
    # First escape any weird characters in the password
    env.temp = re.sub('\$', '\\$', env.database_password)
    # env.temp = env.database_password
    run('echo "[client]\nuser=%(database_user)s\npassword=%(temp)s\n" > $HOME/.my.cnf && chmod 600 $HOME/.my.cnf' % env)
    

"""
Miscellaneaus Tasks
"""

def echo_host():
    """
    Echo the current host to the command line.
    """
    run('echo %(settings)s; echo %(hosts)s' % env)

@roles('web')
def test():
    """
    Test and dump the rcfile
    """
    print "Testing the rcfile"
    for item in env.keys():
        print "%s => %s" % (item, env.get(item))

@roles('web')
def disable_cron():
    """
    Remove all cron tasks from the current user's context
    """
    run('crontab -r')

"""
AWS, EC2 AND CLOUD-RELATED TASKS
"""
# EC2 bundling, scaling and other such tasks
def _put_ec2_credentials_for_bundling():
    pass

def aws_create_ami_from():
    """
    Provides a list of instances matching the ProdAlias, and allows
    user to select the instance to create an AMI from
    """
    hosts = _get_ec2_prod_instances()
    print "------------------------------------------------------------------------"
    print "  This is a DESTRUCTIVE AND DANGEROUS tool! "
    print "  Please think before you proceed! After you finish, check the following: "
    print "    * The Launch Configuration and AMI - to make sure that the AMI is healthy "
    print "    * The AutoScaling Group's configs. They may have been violated/corrupted"
    print "  Consider yourself WARNED!"
    print "Please select the instance number to create an AMI from the list below. "
    for i in range(0, len(hosts)):
        print "    %s. %s" % (i+1, hosts[i].dns_name)
    ans = prompt("Instance number to create AMI from: ", validate=int)
    ami_host = hosts[int(ans)-1]
    print "\nYou selected instance %s" % ami_host.id

    # Let's actually create the AMI
    dt = time.strftime('%Y%m%d%H%M', time.gmtime())
    
    ami_id = env.ec2Conn.create_image(ami_host.id, 'ns11rhel5_%s' % dt, description='Autogenerated by Fabric', no_reboot=False)
    print "Created AMI ID %s" % ami_id
    return ami_id

def aws_update_autoscaler():
    """
    Update auto-scaling configuration for the configured (see env.aws) scaler
    """
    ami_id = aws_create_ami_from()
    cur_date = time.strftime('%Y%m%d', time.gmtime())
    lcName = 'ns11-%s' % cur_date
    lc = LaunchConfiguration(name=lcName, 
                             image_id=ami_id, instance_type=env.aws.get('instance_type'),
                             key_name=env.aws.get('key_pair'), 
                             security_groups=env.aws.get('security_groups'))
    env.asConn.create_launch_configuration(lc)
    print "Created launchConfiguration %s" % lcName
    
    ag = AutoScalingGroup(
            connection=env.asConn,
            launch_config=lc, 
            group_name=env.aws.get('as_group'), load_balancers=env.aws.get('balancers'),
            availability_zones=env.aws.get('availability_zones'))
            # min_size=env.aws.get('min_size'), max_size=env.aws.get('max_size'))
    ag.update()
    # env.asConn.create_auto_scaling_group(ag)    
    print "Added launchConfiguration %s to group %s (updated AutoScaleGroup)" % (lcName, env.aws.get('as_group'))

def aws_update_ec2_instances():
    """
    Set the new list of hosts in the env.hosts option
    """
    hosts = _get_ec2_prod_instances()
    hosts_dns = ["%s:%s" % (host.dns_name, env.ssh_port) for host in hosts]
    print "Updated EC2 instances list is: %s" % ', '.join(hosts_dns)
    env.hosts = hosts_dns
    env.roledefs['web'] = env.hosts
    
def _get_ec2_prod_instances():
    print "current hosts are: %(hosts)s" % env
    hosts = []
    for tag in env.ec2Conn.get_all_tags():
        if tag.name != 'Name':
            continue
        if re.match(env.production_alias, tag.value):
            # Get the reservation id, then figure out the instance id
            tag.res_id
            res = env.ec2Conn.get_all_instances(filters={'tag:Name':tag.value})
            hosts.append(res[0].instances[0])
    return hosts
    
def mount_ephemeral_storage():
    """
    If ephemeral storage is not mounted, create a mount point, initialize the block and mount it
    """
    sudo_as("if [ ! $(mount | grep -i 'mnt') ];then mkfs.ext3 /dev/sdf && mount /dev/sdf /mnt; mkdir -p /mnt/%(application)s/var; chmod -R a+rw /mnt/%(application)s; fi" % env)
    run('mkdir -p %(script_working_path)s' % env)
    
def debug(msg=None):
    """
    Print the input message based on the current DEBUG status
    """
    if DEBUG:
        print msg

def cleanup():
    """
    Clean up old releases. By default, the last 5 releases are kept on each
    server (though you can change this with the keep_releases variable). All
    other deployed revisions are removed from the servers. By default, this 
    will use sudo to clean up the old releases, but if sudo is not available 
    for your environment, set the :use_sudo variable to false instead.
    """
    if not env.get('keep_releases'):
        env.keep_releases = 5
    # Get the list of folders in reverse time order (oldest last)
    releases = run('ls -xtrF %(releases_path)s' % env).split()
    # We only care about folders
    releases = [x for x in releases if x[-1] == '/']
    if int(env.keep_releases) >= len(releases):
        print "No old releases to clean up"
    else:
        print "Keeping %s of %s deployed releases" % (env.keep_releases, len(releases))
        for release in releases[0:0-int(env.keep_releases)]:
            print "Will rm -rf %s/%s" % (env.releases_path, release)
            run('rm -rf %s/%s' % (env.releases_path, release))
