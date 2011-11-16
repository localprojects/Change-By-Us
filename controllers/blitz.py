"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

"""
Module to handle integration with Bltiz.io.  The service
requires that a specific route give back a specific value.
This is important so that it is not used on sites
unknowingly.

"""
import framework.util as util
from framework.config import Config

class Blitz():
    """
    Controller class to handle Bltiz.io routes.
    
    """
    
    def GET(self, action = None):
        """
        Get for Blitz.io route
        
        """
        response = Config.get('blitz_io').get('response')
        return response