#!/bin/bash

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

now=`date -u +%Y%m%d%H%M%S`
# fname="giveaminute.$now.gpg"
fname="giveaminute.$now.gz"

recipient="cybertoast@gmail.com"	# change this to the correct recipient
s3cfgfile="$HOME/scripts/.lp-cbu.s3cfg"
s3bucket="s3://sandbox-changebyus"
targetpath="/backups/mysql"

usage() {
    echo "$0 dbname"
    exit 0
}

sanity_test() {
    # Check that s3cmd exists
    if [ -z "$1" ];then
        usage
    else
        dbname="$1"
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

sanity_test $1    # make sure the basics are in place

# Run the actual command
# mysqldump giveaminute | gpg -e -r $recipient --output $fname && gzip $fname
mysqldump giveaminute | gzip > $fname
echo "Uploading $fname to $s3bucket$targetpath/$fname"
s3cmd --config="$s3cfgfile" put "$fname" "$s3bucket$targetpath/"
s3cmd --config="$s3cfgfile" ls "$s3bucket$targetpath/"
# s3cmd --config=/Users/sundar/.lp-cbu.s3cfg put --recursive mybkup s3://sandbox-changebyus/
