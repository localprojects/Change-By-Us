"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from helpers.custom_filters import filters as custom_filters

# Put model-specific filters here.

def register_filters():
    custom_filters.update({
        # ... and add the name->filter mapping here.
    })
