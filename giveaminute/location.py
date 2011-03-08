from framework.log import log

def getLocationDictionary(db):
    try:
        sql = "select location_id, name, lat, lon from location order by location_id";
        data = list(db.query(sql))
        
        locations = {}
        
        for item in data:
            locations[item.name] = {'location_id':item.location_id, 'lat':str(item.lat), 'lon':str(item.lon)}
            
        return locations
    except Exception, e:
        log.info("*** couldn't get or write locations")
        log.error(e)
        return None