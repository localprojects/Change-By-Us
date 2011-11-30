"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

"""
Module to handle config values.  Config is defined at config.yaml.

"""
import os
import yaml
from os import environ

class Config():
    """
    Class to handle config.  All methods are class methods.
    
    """

    data = None
    """ Data to hold config values """

    @classmethod
    def load(self):
        """
        Load config.  Reads config file and loads into data property.  This
        assumes that the config file (config.yaml) is either in the current 
        directory or one directory above it.
        
        """
        try:
            c = open(os.path.dirname(__file__) + "/../etc/config.yaml")
        except Exception:
            c = open(os.path.dirname(__file__) + "/config.yaml")

        self.data = yaml.load(c)           
    
    @classmethod
    def get(self, key):
        """
        Get specific configuration value
        
        @type   key: string
        @param  key: Index of item.
        
        @rtype: *
        @returns: The value of the configuration item.
        
        """
        if self.data is None:
            self.load()
            
        try:
            d = self.data[key]
            return d
        except KeyError:
            raise KeyError

    @classmethod
    def get_all(self):
        """
        Get all values
        
        @rtype: dict
        @returns: The full dictionary of configuration values
        
        """
        if self.data is None:
            self.load()
            
        return self.data

    @classmethod
    def dev(self):
        """
        Get value of 'dev' configuration
        
        @rtype: bool
        @returns: The value of dev

        """
        try:
            dev = self.get('dev')
            if isinstance(dev, bool):
                return dev
            else:
                return False
        except KeyError, e:
            return False
        
    @classmethod
    def base_url(self):
        """
        Determine base URL from WebPy application values.
        
        TODO: This assumes http, should support https.  Maybe just make it configurable.
        
        @rtype: string
        @returns: Calculated base URL or None if lib from web is not available.
        
        """
        try:
            from lib import web
        except ImportError:
            return None

        try:
            return "http://%s%s" % (web.ctx.environ['HTTP_HOST'], os.path.dirname(web.ctx.environ['SCRIPT_NAME']))
        except (KeyError, AttributeError):
            return None
            
