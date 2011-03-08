from framework.log import log

def getLocationDictionary(db):
    try:
        # TODO
        # this is temporary until actual scoring is determined
        sql = """select l.location_id, l.name, l.lat, l.lon, t.score from location l
                inner join temp_scores t on t.location_id = l.location_id
                order by location_id""";
        data = list(db.query(sql))
        
        locations = {}
        
        for item in data:
            locations[item.name] = {'location_id':item.location_id, 'lat':str(item.lat), 'lon':str(item.lon)}
            
        return locations
    except Exception, e:
        log.info("*** couldn't get or write locations")
        log.error(e)
        return None