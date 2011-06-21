#!/bin/bash

set -x

# Overview
# 
# The purpose if this script is to:
#  * mysqldump a defined database
#  * gpg the dump
#  * gzip the dump
#  * Upload the dump to a defined S3 repository
#
#-----------------------------
# Pre-Requisites:
#-----------------------------
# 1. ~/.my.cnf
# Ensure that ~/.my.cnf exists. It should have this format:
# 
# [client]
# user=gam
# password=gam
# 
# 2. gpg with associated key
# 
# 3. S3 sync
# Ensure that s3cmd is installed, and configured
#     apt-get install s3cmd
# Ensure that s3cmd —config=~/s3.cfg can be loaded
# To generate the config file just run s3cmd --configure
# and you'll be prompted to fill out all the parameters
#
# 


#----- CONFIGURABLES ----
# The s3cmd configuration file. See example.s3cfg
s3cfgfile="$HOME/.lp-cbu.s3cfg"

# S3 bucket to which the upload should go. This MUST be changed for production!
s3bucket="s3://sandbox-changebyus"

# Target path on S3 to which to upload the backed-up file
s3path="/backups/mysql"

# GPG is disabled by default. Uncomment the next line to use it
# use_gpg=true

# The recipient for whom to sign the content. Only used if use_gpg=true
recipient="admin@changeby.us"	# change this to the correct recipient

# List of tables to exclude from the dump
exclude_tables=(user facebook_user twitter_user)

#-----------

usage() {
    echo "$0 dbname"
    exit 0
}

sanity_test() {
    # Check that s3cmd exists
    if [ -z "$dbname" ];then
        usage
    else
        echo "Will process $dbname"
    fi

    if [ -z `which s3cmd` ]; 
    then 
        echo "s3cmd is not installed. Please install it before proceeding"
        exit 1
    fi
    if [ ! -e "$s3cfgfile" ]; then
        echo "Cannot find s3cmd's configuration file $s3cfgfile"
        exit 1
    fi

    # Test all the gpg stuff
}

do_mysqldump() {
    # Run the actual command
    if [ $use_gpg ];then
        fname="$dbname.$now.gpg"
        # Tables to ignore/exclude

        index=0
        exclusion=""
        excl_size=${#exclude_tables[@]}
        while [ "$index" -lt "$excl_size" ];do
            exclusion="$exclusion --ignore_table=${exclude_tables[$index]}"
            ((index++))
        done

        resp=$(mysqldump $exclusion $dbname | gpg -e -r $recipient --output $fname && gzip $fname)
    else
        fname="$dbname.$now.gz"
        resp=$(mysqldump $dbname | gzip > $fname)
    fi

    # Verify that the mysqldump worked
    [ $resp ] && exit 1
}

upload_to_s3() {
    echo "Uploading $fname to $s3bucket$s3path/$fname"
    s3cmd --config="$s3cfgfile" put "$fname" "$s3bucket$s3path/"

    # ls just gets the list so that we can verify that the file was uploaded
    # s3cmd --config="$s3cfgfile" ls "$s3bucket$s3path/"
}

# The code ...

dbname="$1"
now=`date -u +%Y%m%d%H%M%S`
sanity_test $dbname    # make sure the basics are in place
do_mysqldump
upload_to_s3

now=`date -u +%Y%m%d%H%M%S`
echo "Completed $0 at $now"
