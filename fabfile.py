from fabric.api import *
import os
import time

"""
Base configuration

Credits: This fabfile created from a combination of :
    * https://gist.github.com/1011863
    * http://morethanseven.net/2009/07/27/fabric-django-git-apache-mod_wsgi-virtualenv-and-p.html
    * https://gist.github.com/156623
"""

env.project_name = 'gam2'
env.database_password = '$(db_password)'
env.site_media_prefix = "site_media"
env.admin_media_prefix = "admin_media"
env.newsapps_media_prefix = "na_media"
env.local_base_path = os.path.expanduser("~/Projects/LP")

env.scm = "svn"

# repo_path can be either a local
env.repo_path = "http://svn.localprojects.net/gam2"
# env.repo_path = "git@git.assembla.com:lp-cbu"


env.webserver = "lighttpd"

# env.env_path = '%(path)s/env' % env

# env.repo_path = '%(path)s/repository' % env
# env.apache_config_path = '%(base_path)s/sites/apache/%(project_name)s' % env

env.python = 'python2.6'

"""
Environments
"""

def demo():
    """
    Work on demo environment
    """
    env.settings = 'demo'
    env.hosts = ['demo-nyc.changeby.us']
    env.user = 'giveaminute'
    env.s3_bucket = 'demo-nyc.changeby.us'

    # Common stuff to all environments
    common()

def dev():
    """
    Work on dev environment
    """
    env.settings = 'dev'
    env.hosts = ['dev-nyc.changeby.us']
    env.user = 'sraman'
    env.key_filename = [os.path.expanduser("~/.ssh/work/work.id_dsa")]
    env.s3_bucket = 'sandbox.changeby.us'

    # WHich branch do we want to deploy? Keep in mind that this is environment specific
    env.branch = "trunk"

    common()

def common():
    """
    Common are the environment variables that need to be evaluated after the others are loaded
    due to dependencies. There has to be a way to inherist this stuff though!!!
    """
    env.base_path = '/home/%(user)s' % env # The base path should always be the logged-in user
    env.app_path = '%(base_path)s/sites/%(project_name)s' % env
    # The scratch/work space for putting temporary stuff while we deploy from local dev
    env.tmp_path = "/tmp/%(project_name)s/releases" % env
    env.app_path = '%(base_path)s/sites/%(project_name)s' % env



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
Commands - setup
"""
def setup():
    """
    Setup a fresh virtualenv, install everything we need, and fire up the database.

    Does NOT perform the functions of deploy().
    """
    require('settings', provided_by=[dev, demo])
    # require('branch', provided_by=[stable, master, branch])

    setup_directories()
#    setup_virtualenv()
#    clone_repo()
#    checkout_latest()
#    destroy_database()
#    create_database()
#    load_data()
#    install_requirements()
#    install_apache_conf()
#    deploy_requirements_to_s3()

def setup_directories():
    """
    Create directories necessary for deployment.
    """
    # First set up the system paths for the server/services
    run('mkdir -p %(')
    run('mkdir -p %(app_path)s' % env)
    run('mkdir -p %(app_path)s/releases' % env)

    # Server paths (for web/other servers)
    run('mkdir -p %(app_path)s/var/log' % env)
    run('mkdir -p %(app_path)s/etc' % env)

    # sudo('chgrp -R www-data %(log_path)s; chmod -R g+w %(log_path)s;' % env)
    # run('ln -s %(log_path)s %(path)s/logs' % env)

def setup_virtualenv():
    """
    Setup a fresh virtualenv.
    """
    run('virtualenv -p %(python)s --no-site-packages %(env_path)s;' % env)
    run('source %(env_path)s/bin/activate; easy_install -U setuptools; easy_install pip;' % env)

"""
SCM and Code related functions
"""
def export_latest_code():
    # Set the timestamp for the release here, and it'll be available to the environment

    local('rm -rf %(tmp_path)s' % env)

    if env.scm == 'git':
        "Create an archive from the current Git master branch and upload it"
        local('git clone --depth 0 %(repo_path)s %(tmp_path)s')
        local('cd %(tmp_path)s && git pull origin && git co %(branch)s' % env)
        local('git remote show origin > REVISION.txt')
        local('git archive --format=tar %(branch)s | gzip > %(tmp_path)s/%(release)s.tgz' % env)
    elif env.scm == "git-svn":
        # Get repo information and store it to REVISION.txt
        local('cd %(repo_path)s && git svn info > %(tmp_path)s/REVISION.txt' % env)
    elif env.scm == 'svn':
        local('svn export %(repo_path)s/%(branch)s %(tmp_path)s' % env)
        local('svn info %(repo_path)s/%(branch)s > %(tmp_path)s/REVISION.txt' % env)
        local('cd %(tmp_path)s && tar -czf %(release)s.tgz .' % env)

    put('%(tmp_path)s/%(release)s.tgz' % env, '%(app_path)s/releases/' % env)
    run('cd %(app_path)s/releases/ && tar -xvf %(release)s.tgz && rm rf %(release)s.tgz' % env)

    # Don't delete the local copy in case we need to debug - that will be done on the next cycle

def upload_code():
    pass

def symlink_current_release():
    "Symlink our current release"
    require('release', provided_by=[deploy, setup])
    run('cd $(path); rm releases/previous; mv releases/current releases/previous;', fail='ignore')
    run('cd $(path); ln -s $(release) releases/current')

def clone_repo():
    """
    Do initial clone of the git repository.
    """
    run('git clone git@tribune.unfuddle.com:tribune/%(project_name)s.git %(repo_path)s' % env)

def checkout_latest():
    """
    Pull the latest code on the specified branch.
    """
    run('cd %(repo_path)s; git checkout %(branch)s; git pull origin %(branch)s' % env)

def install_requirements():
    """
    Install the required packages using pip.
    """
    run('source %(env_path)s/bin/activate; pip install -E %(env_path)s -r %(repo_path)s/requirements.txt' % env)

def install_apache_conf():
    """
    Install the apache site config file.
    """
    sudo('cp %(repo_path)s/%(project_name)s/configs/%(settings)s/%(project_name)s %(apache_config_path)s' % env)

def install_lighttpd_conf():
    """
    Install the lighttpd config file
    """
    sudo('cp %(repo_path)s/%(project_name)s/configs/%(settings)s/%(project_name)s %(apache_config_path)s' % env)

def deploy_assets_to_s3():
    """
    Deploy the latest newsapps and admin media to s3.
    """
    run('s3cmd del --recursive s3://%(s3_bucket)s/%(project_name)s/%(admin_media_prefix)s/' % env)
    run('s3cmd -P --guess-mime-type sync %(env_path)s/src/django/django/contrib/admin/media/ s3://%(s3_bucket)s/%(project_name)s/%(site_media_prefix)s/' % env)
    run('s3cmd del --recursive s3://%(s3_bucket)s/%(project_name)s/%(newsapps_media_prefix)s/' % env)
    run('s3cmd -P --guess-mime-type sync %(env_path)s/src/newsapps/newsapps/na_media/ s3://%(s3_bucket)s/%(project_name)s/%(newsapps_media_prefix)s/' % env)

"""
Commands - deployment
"""
def deploy():
    """
    Deploy the latest version of the site to the server and restart Apache2.

    Does not perform the functions of load_new_data().
    """
    # require('settings', provided_by=[production, staging])
    # require('branch', provided_by=[stable, master, branch])
    env.release = time.strftime('%Y%m%d%H%M%S')

    with settings(warn_only=True):
        maintenance_up()

    checkout_latest()
    gzip_assets()
    deploy_to_s3()
    refresh_widgets()
    maintenance_down()

def maintenance_up():
    """
    Install the Apache maintenance configuration.
    """
    sudo('cp %(repo_path)s/%(project_name)s/configs/%(settings)s/%(project_name)s_maintenance %(apache_config_path)s' % env)
    reboot()

def gzip_assets():
    """
    GZips every file in the assets directory and places the new file
    in the gzip directory with the same filename.
    """
    run('cd %(repo_path)s; python gzip_assets.py' % env)

def deploy_to_s3():
    """
    Deploy the latest project site media to S3.
    """
    env.gzip_path = '%(path)s/repository/%(project_name)s/gzip/assets/' % env
    run(('s3cmd -P --add-header=Content-encoding:gzip --guess-mime-type --rexclude-from=%(path)s/repository/s3exclude sync %(gzip_path)s s3://%(s3_bucket)s/%(project_name)s/%(site_media_prefix)s/') % env)

def refresh_widgets():
    """
    Redeploy the widgets to S3.
    """
    run('source %(env_path)s/bin/activate; cd %(repo_path)s; ./manage refreshwidgets' % env)

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
    run("cd %(repo_path)s; git reset --hard %(commit_id)s" % env)

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
    run('echo "CREATE USER %(project_name)s WITH PASSWORD \'%(database_password)s\';" | psql postgres' % env)
    run('createdb -O %(project_name)s %(project_name)s -T template_postgis' % env)

def destroy_database():
    """
    Destroys the user and database for this project.

    Will not cause the fab to fail if they do not exist.
    """
    with settings(warn_only=True):
        run('dropdb %(project_name)s' % env)
        run('dropuser %(project_name)s' % env)

def load_data():
    """
    Loads data from the repository into PostgreSQL.
    """
    run('psql -q %(project_name)s < %(path)s/repository/data/psql/dump.sql' % env)
    run('psql -q %(project_name)s < %(path)s/repository/data/psql/finish_init.sql' % env)

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
"""
def lighttpd_stop():
    run('sudo /etc/init.d/%(webserver)s stop' % env)

def lighttpd_start():
    run('sudo /etc/init.d/%(webserver)s start' % env)

def lighttpd_restart():
    run('sudo /etc/init.d/%(webserver)s restart' % env)

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
        run('dropdb %(project_name)s' % env)
        run('dropuser %(project_name)s' % env)
        sudo('rm %(apache_config_path)s' % env)
        reboot()
        run('s3cmd del --recursive s3://%(s3_bucket)s/%(project_name)s' % env)


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
    run(('cd %(path)s/repository; psql -q %(project_name)s -c "%(query)s"') % env)