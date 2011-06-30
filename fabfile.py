from fabric.api import *
import os
import time
import re

"""
Base configuration

Credits: This fabfile created from a combination of :
    * https://gist.github.com/1011863
    * http://morethanseven.net/2009/07/27/fabric-django-git-apache-mod_wsgi-virtualenv-and-p.html
    * https://gist.github.com/156623

Stage-specific interpolation is easy:
   open(lighttpd.conf.stage, 'r').read() % vars[stage]


------------------------------
INSTRUCTIONS:
------------------------------
This fabfile requires a set of parameters to be set in an rcfile, for fabric to load. 

Install fabric:
    pip install fabric

CAVEATS AND NOTES:
    * Do NOT user short if[] syntax, meaning [ -e "foobar.txt' ] && {do_something}, in fabric scripts.
      Go for explicit if [ -e "foobar.txt" ];then do_something; fi
      The short syntax does not return the correct value for success, and this causes scripts to fail
    * ROLES (and other decorators) MUST be on the parent function. 
      Running a child function through a decorator just won't work due to some fabric stupidity!

TODO:
    * Configuration of cron and system-level tasks via fabric deployment 
    
------------------------------
COOKBOOK:
------------------------------
    Create new configuration file:
        fab --config=rcfile.name dev create_config_yaml

    Create stage-specific lighttpd.conf file into the etc/ folder
        fab --config=rcfile.name dev create_lighttpd_conf

    Create (via interpolation) and upload configurations to remote host(s): 
        fab --config=rcfile.dev dev deploy_configurations
        
    Setup a set of web servers
        fab --config=rcfile.dev dev setup

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
        
"""

# PATHS
env.application = 'gam2'

# Repository Information
env.scm = "svn"
env.repository = "http://svn.localprojects.net/gam2"
# env.repository = "/Users/sundar/Projects/LP/gam2"
# env.repository = "git@git.assembla.com:lp-cbu"

# Define ROLES
env.roledefs = {
   'web': ['dev-nyc.changeby.us'],
   'dns': ['ns1', 'ns2']
}

# Webserver Configuration
env.webserver = "lighttpd"

env.venv_path = '%(path)s/.virtualenv' % env

# env.repository = '%(path)s/repository' % env
# env.apache_config_path = '%(deploy_to)s/sites/apache/%(application)s' % env
env.vars = {}

#----- Samples and examples -----
# This section provides some test code for understanding how Fabric works
@roles('web')
def test():
    print "Testing the rcfile"
    # print env.email.keys()
    get_version()

def get_version():
    env.user = 'sraman'
    env.key_filename = [os.path.expanduser("~/.ssh/work/work.id_dsa")]
    run('uname -a')

#----- /samples -----


#----- Decorator(s) -----
def common_config(func):
    """
    Common are the environment variables that need to be evaluated after the others are loaded
    due to dependencies. There has to be a way to inherist this stuff though!!!
    """
    def wrapper():
        # execute the caller to load that set of configurations
        func()

        # Now load all the configurations that were dependent on the caller's var-space
        if env.get('deploy_to') is None:
            env.deploy_to = '/home/%(user)s' % env # The base path should always be the logged-in user

        # System paths are under app_path, so provide the relative paths that we need
        # for system services (like lighttpd, apache, etc.)
        # Thes COULD be specific for each environment/stage, but it's best to have them common
        env.system_paths = ['var/log', 'etc/%(webserver)s' % env, 'run', 'releases', 'shared']

        # The scratch/work space for putting temporary stuff while we deploy from local dev
        env.tmp_path = "/tmp/%(application)s/releases" % env
        env.app_path = '%(deploy_to)s/sites/%(application)s' % env
        env.current_path = "%(app_path)s/current" % env
        env.shared_path = "%(app_path)s/shared" % env

        # Configuration Template Files and config files
        env.etc_path = '%(app_path)s/etc' % env
        env.log_path = '%(app_path)s/var/log' % env
        env.local_etc_path = '%(local_path)s/etc' % env

        env.config_template = '%(local_etc_path)s/config.yaml.sample' % env
        env.config_file = '%(local_path)s/config.yaml' % env     # There's no reason for this to be configurable, but whatever

        # Each webservec can have its own set of configurations
        # Eg. apache, lighttpd, etc.
        env.webserver_template = '%(local_etc_path)s/%(webserver)s/%(webserver)s.conf.sample' % env
        env.webserver_file = '%(local_etc_path)s/%(webserver)s/%(webserver)s.conf' % env

    return wrapper

#----- /decorator(s) -----

#----- Utility Functions -----
def sudo_as(cmd):
    temp_user = env.user
    env.user = env.sudo_as
    sudo(cmd)
    env.user = temp_user
     
#----- /utility funcs -----

@common_config
def demo():
    """
    Work on demo environment
    """
    if env.rcfile is None:
        env.rcfile = 'rcfile.%s' % env.settings

@common_config
def dev():
    """
    Work on dev environment
    """
    if env.rcfile is None:
        env.rcfile = 'rcfile.%s' % env.settings

    # Todo: This should be changed to be configurable
    env.local_path = os.path.expanduser("~/Projects/LP/%(application)s/trunk" % env)

@common_config
def sundar_dev():
    """
    Work on dev environment
    """
    env.settings = 'dev'
    env.local_path = os.path.expanduser("~/Projects/LP/%(application)s/trunk" % env)


def dump_env():
    for key in env.keys():
        print "%s => %s" % (key, env.get(key))

#------------------------------------------------
# Create Configuration files from rcfile
#------------------------------------------------
def create_config_yaml():
    if not os.path.exists(env.rcfile):
        raise Exception("%(rcfile)s does not exist. See rcfile.sample and run fab --config=rcfile.name <commands>!" % env)

    if not os.path.exists(env.config_template):
        raise Exception("Unable to find configuration template file (%s) to create config from" % env.config_template)
    infile = open(env.config_template, 'r')
    outfile = open(env.config_file, 'w')
    outfile.write(infile.read() % env)
    outfile.close()
    infile.close()

def upload_config_yaml():
    " Upload the interpolated config.yaml to the target servers"
    put(env.config_file, env.shared_path)

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
    create_config_yaml()
    upload_config_yaml()

    create_webserver_conf()
    upload_webserver_conf()

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
            if re.match('/cron', env.temp):
                base = [x for x in env.temp.split('/') if x is not None and x != '']
                temp_path = list(base)
                temp_path.insert(0, env.etc_path)
                remote_path = os.path.join(*temp_path[:-1])
                remote_file = os.path.join(*temp_path) 
                run('mkdir -p %s' % remote_path)
                put(filename, remote_file) 
                
                # Symlink the cron job to the correct place
                temp_path = list(base)
                temp_path.insert(0, '/etc')
                abs_etc_path = os.path.join(*temp_path[:-1])    # assuming the last index is the file
                abs_etc_file = os.path.join(*temp_path)
                # We want the target path to exist, but not the target file
                sudo_as('if [ -d %s ];then if [ ! -e %s ];then sudo ln -s %s %s; else echo "Target file already exists! Will not overwrite"; fi; else echo "Target path is incorrect"; fi' % (abs_etc_path, abs_etc_file, remote_file, abs_etc_file))
            

@roles('web')
def deploy_cron():
    """ Interpolate and upload cron-related files """
    
    _upload_interpolated_files(_interpolate_templates())

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
#    setup_virtualenv()
#    install_lighttpd_conf()
#    install_requirements()

    pass

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

#    clone_repo()
#    checkout_latest()
#    destroy_database()
#    create_database()
#    load_data()
#    deploy_requirements_to_s3()

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
        # Change ownership of paths
        # sudo('chgrp -R www-data %(app_path)s/%(temp_var)s; chmod -R g+w %(app_path)s/%(temp_var)s;' % env)

def setup_virtualenv():
    """
    Setup a fresh virtualenv.
    """
    run('virtualenv -p %(python)s --no-site-packages %(venv_path)s;' % env)
    run('source %(venv_path)s/bin/activate; easy_install -U setuptools; easy_install pip;' % env)

"""
SCM and Code related functions
"""
def bundle_code():
    # Set the timestamp for the release here, and it'll be available to the environment
    env.release = time.strftime('%Y%m%d%H%M%S')

    local('rm -rf %(tmp_path)s' % env)

    if env.scm == 'git':
        "Create an archive from the current Git master branch and upload it"
        local('git clone --depth 0 %(repository)s %(tmp_path)s')
        local('cd %(tmp_path)s && git pull origin && git co %(branch)s' % env)
        local('git remote show origin > REVISION.txt')
        local('git archive --format=tar %(branch)s > %(tmp_path)s/%(release)s.tar' % env)
    elif env.scm == "git-svn":
        # Get repo information and store it to REVISION.txt
        local('cd %(repository)s && git svn info > %(tmp_path)s/REVISION.txt' % env)
    elif env.scm == 'svn':
        local('svn export %(repository)s/%(branch)s %(tmp_path)s' % env)
        local('svn info %(repository)s/%(branch)s > %(tmp_path)s/REVISION.txt' % env)
        local('cd %(tmp_path)s && tar -cf %(release)s.tar .' % env)

    local('cd %(tmp_path)s && gzip %(release)s.tar' % env)

    print "Bundled code is at %(tmp_path)s/%(release)s.tar.gz"
    print "----- ATTENTION -----"
    print "If you plan to run the deployer at a later time, execute this first .."
    print "    echo 'release = %(release)s' >> %(rcfile)s" % env
    print "----- ATTENTION -----"
    # Don't delete the local copy in case we need to debug - that will be done on the next cycle

def upload_and_explode_code_bundle():
    "Upload the local tarball of latest code to the target host"
    put('%(tmp_path)s/%(release)s.tar.gz' % env, '%(app_path)s/releases/' % env)
    run('cd %(app_path)s/releases/ && mkdir -p %(release)s && tar -xvf %(release)s.tar.gz -C %(release)s && if [ -e %(release)s.tar.gz ];then rm -rf %(release)s.tar.gz; fi' % env)

def symlink_current_release():
    "Symlink our current release, and also symlink config.yaml to the shared config"
    require('release', provided_by=[deploy, setup_application])
    run('if [ -e %(app_path)s/previous ];then rm %(app_path)s/previous; fi; if [ -e %(app_path)s/current ];then mv %(app_path)s/current %(app_path)s/previous; fi' % env)
    # Link the shared config file into the current configuration
    run('rm -f %(app_path)s/releases/%(release)s/config.yaml; ln -s %(app_path)s/shared/config.yaml %(app_path)s/releases/%(release)s/' % env)
    run('ln -s %(app_path)s/releases/%(release)s %(app_path)s/current' % env)

def clone_repo():
    """
    Do initial clone of the git repository.
    """
    run('git clone git@tribune.unfuddle.com:tribune/%(application)s.git %(repository)s' % env)

def checkout_latest():
    """
    Pull the latest code on the specified branch.
    """
    run('cd %(repository)s; git checkout %(branch)s; git pull origin %(branch)s' % env)

def install_requirements():
    """
    Install the required packages using pip.
    """
    run('source %(venv_path)s/bin/activate; pip install -E %(venv_path)s -r %(repository)s/requirements.txt' % env)

def install_apache_conf():
    """
    Install the apache site config file.
    """
    sudo('cp %(repository)s/%(application)s/configs/%(settings)s/%(application)s %(apache_config_path)s' % env)

def install_lighttpd_conf():
    """
    Install the lighttpd config file
    """
    sudo('cp %(repository)s/%(application)s/etc/%(settings)s/%(application)s %(apache_config_path)s' % env)

def deploy_assets_to_s3():
    """
    Deploy the latest assets and JS to S3 bucket
    """
#    run('s3cmd del --recursive s3://%(s3_bucket)s/%(application)s/%(admin_media_prefix)s/' % env)
#    run('s3cmd -P --guess-mime-type sync %(venv_path)s/src/django/django/contrib/admin/media/ s3://%(s3_bucket)s/%(application)s/%(site_media_prefix)s/' % env)
#    run('s3cmd del --recursive s3://%(s3_bucket)s/%(application)s/%(newsapps_media_prefix)s/' % env)
#    run('s3cmd -P --guess-mime-type sync %(venv_path)s/src/newsapps/newsapps/na_media/ s3://%(s3_bucket)s/%(application)s/%(newsapps_media_prefix)s/' % env)

"""
Commands - deployment
"""
@roles('web')
def deploy():
    """
    Deploy the latest version of the site to the server and restart Apache2.

    Does not perform the functions of load_new_data().
    """
    # require('settings', provided_by=[production, staging])
    # require('branch', provided_by=[stable, master, branch])

    # with settings(warn_only=True):
    #    maintenance_up()

    upload_and_explode_code_bundle()
    # maintenance_up()
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
    Install the Apache maintenance configuration.
    """
    pass
    # sudo('cp %(repository)s/%(application)s/configs/%(settings)s/%(application)s_maintenance %(apache_config_path)s' % env)
    # reboot()

def gzip_assets():
    """
    GZips every file in the assets directory and places the new file
    in the gzip directory with the same filename.
    """
    run('cd %(repository)s; python gzip_assets.py' % env)

def deploy_to_s3():
    """
    Deploy the latest project site media to S3.
    """
    env.gzip_path = '%(path)s/repository/%(application)s/gzip/assets/' % env
    run(('s3cmd -P --add-header=Content-encoding:gzip --guess-mime-type --rexclude-from=%(path)s/repository/s3exclude sync %(gzip_path)s s3://%(s3_bucket)s/%(application)s/%(site_media_prefix)s/') % env)

def refresh_widgets():
    """
    Redeploy the widgets to S3.
    """
    run('source %(venv_path)s/bin/activate; cd %(repository)s; ./manage refreshwidgets' % env)

def reboot():
    """
    Restart the Apache2 server.
    """
    sudo('/mnt/apps/bin/restart-all-apache.sh')

def maintenance_down():
    """
    Reinstall the normal site configuration.
    """
    install_apache_conf()
    reboot()

"""
Commands - rollback
"""
def rollback(commit_id):
    """
    Rolls back to specified git commit hash or tag.

    There is NO guarantee we have committed a valid dataset for an arbitrary
    commit hash.
    """
    require('settings', provided_by=[production, staging])
    require('branch', provided_by=[stable, master, branch])

    maintenance_up()
    checkout_latest()
    git_reset(commit_id)
    gzip_assets()
    deploy_to_s3()
    refresh_widgets()
    maintenance_down()

def git_reset(commit_id):
    """
    Reset the git repository to an arbitrary commit hash or tag.
    """
    env.commit_id = commit_id
    run("cd %(repository)s; git reset --hard %(commit_id)s" % env)

"""
Commands - data
"""
def load_new_data():
    """
    Erase the current database and load new data from the SQL dump file.
    """
    require('settings', provided_by=[production, staging])

    maintenance_up()
    pgpool_down()
    destroy_database()
    create_database()
    load_data()
    pgpool_up()
    maintenance_down()

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

def pgpool_down():
    """
    Stop pgpool so that it won't prevent the database from being rebuilt.
    """
    sudo('/etc/init.d/pgpool stop')

def pgpool_up():
    """
    Start pgpool.
    """
    sudo('/etc/init.d/pgpool start')

"""
WebServer related commands
For now this works with modified lighttpd init.d scripts. It does NOT 
work with other servers yet. 
"""
def stop_webserver():
    sudo_as('/etc/init.d/%(webserver)s stop %(app_path)s' % env)

def start_webserver():
    sudo_as('/etc/init.d/%(webserver)s start %(app_path)s' % env)

def restart_webserver():
    sudo_as('/etc/init.d/%(webserver)s restart %(app_path)s' % env)

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

"""
Deaths, destroyers of worlds
"""
def shiva_the_destroyer():
    """
    Remove all directories, databases, etc. associated with the application.
    """
    with settings(warn_only=True):
        run('rm -Rf %(path)s' % env)
        run('rm -Rf %(log_path)s' % env)
        run('dropdb %(application)s' % env)
        run('dropuser %(application)s' % env)
        sudo('rm %(apache_config_path)s' % env)
        reboot()
        run('s3cmd del --recursive s3://%(s3_bucket)s/%(application)s' % env)


# EC2 bundling, scaling and other such tasks
def put_ec2_credentials_for_bundling():
    pass

def bundle_and_upload_image():
    pass

def update_ec2_instances_list():
    """
    Get a list of all the currently running instances and their versions so that
    we know what's out of date
    """
    pass

"""
Utility functions (not to be called directly)
"""
def _execute_psql(query):
    """
    Executes a PostgreSQL command using the command line interface.
    """
    env.query = query
    run(('cd %(path)s/repository; psql -q %(application)s -c "%(query)s"') % env)