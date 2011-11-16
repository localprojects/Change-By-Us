"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import cgi, os
import framework.filters as filters
from lib import jinja2
from framework.config import *
from framework.log import log

log.info("____________________________________________________________________________")

class render_jinja:

    def __init__(self, *a, **kwargs):
        extensions = kwargs.pop('extensions', [])
        globals = kwargs.pop('globals', {})

        from jinja2 import Environment, FileSystemLoader
        self._lookup = Environment(loader=FileSystemLoader(*a, **kwargs), extensions=extensions)
        self._lookup.globals.update(globals)
        
    def __getitem__(self, name):	# bh added
        t = self._lookup.get_template(name)
        return t.render

def render(template_name, template_values=None, suffix="html"):
    if template_values is None: template_values = {}        
    log.info("TEMPLATE %s: %s" % (template_name, template_values))
    config = Config.get_all()       
    config['base_url'] = Config.base_url()
    for key in config:      
        if type(config[key]) is list:
            for param in config[key][0]:
                template_values[key + "_" + param] = config[key][0][param]
        else:
            template_values[key] = config[key]              
    template_values['template_name'] = template_name
    renderer = render_jinja(os.path.dirname(__file__) + '/../')      
    renderer._lookup.filters.update(filters.filters)
    print("Content-Type: text/plain\n")
    log.info("200: text/html (%s)" % template_name)
    print(renderer[template_name + "." + suffix](template_values))
    
def json(data):
    output = json.dumps(data, indent=4)               
    print("Content-Type: text/plain\n")
    log.info("200: text/plain (JSON)")                                
    print(output)
    
def xml(data):    
    print("Content-Type: application/xml\n")
    output = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n"
    output += data                                          ## should make this use a real library
    log.info("200: application/xml")                        
    print(output)

def html(html):
    print("Content-Type: text/html\n")
    doc = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" /></head><body>"
    doc += html
    doc += "</body></html>"
    log.info("200: text/html")                
    print(doc)
    
def text(string):
    print("Content-Type: text/plain\n")
    log.info("200: text/plain")        
    print(string)

def csv(string, filename):
    print("Content-Type: text/csv\n")
    print("Content-Disposition attachment; filename=%s" % filename)
    log.info("200: text/csv")
    print(string)
    
def image(image):
    print("Content-Type: image/png\n")
    print("Expires Thu, 15 Apr 2050 20:00:00 GMT")
    log.info("200: image/png")        
    print(image)

def temp_image(image):
    print("Content-Type: image/png\n")     
    print("Cache-Control no-cache")
    log.info("200: image/png (temporary)")        
    print(image)

# def error(message):
#     log.error("400: %s" % message)
#     return web.BadRequest(message)

# def not_found(self):
#     log.error("404: Page not found")
#     return web.NotFound()
#     
# def redirect(url):
#     log.info("303: Redirecting to " + url)      
#     return web.SeeOther(url)
# 
# def refresh(self):
#     url = web.ctx.path
#     log.info("303: Redirecting to " + url + " (refresh)")
#     return web.SeeOther(url)    