"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
import os, yaml
from os import environ

class Config():

    data = None

    @classmethod
    def load(cls):
        try:
            c = open(os.path.dirname(__file__) + "/../config.yaml")
        except Exception:
            c = open(os.path.dirname(__file__) + "/config.yaml")
        cls.data = yaml.load(c)            
    
    @classmethod
    def get(cls, key):
        if cls.data is None:
            cls.load()
        try:
            d = cls.data[key]
            return d
        except KeyError:
            raise KeyError

    @classmethod
    def get_all(cls):
        if cls.data is None:
            cls.load()
        return cls.data

    @classmethod
    def dev(cls):
        try:
            return cls.get('dev')
        except KeyError, e:
            return False
        
    @classmethod
    def base_url(cls):
        try:
            from lib import web
        except ImportError:
            return None
        try:
            return "http://%s%s" % (web.ctx.environ['HTTP_HOST'], os.path.dirname(web.ctx.environ['SCRIPT_NAME']))
        except (KeyError, AttributeError):
            return None
            
