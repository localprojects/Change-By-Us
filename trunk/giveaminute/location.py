from framework.log import log

def getLocationDictionary(db):
    locations = {}

    try:
        # TODO
        # this is temporary until actual scoring is determined
        sql = """select l.location_id, l.name, l.lat, l.lon, t.score from location l
                left join temp_scores t on t.location_id = l.location_id
                order by l.location_id""";
        data = list(db.query(sql))
        
        for item in data:
            locations[item.name] = {'location_id':item.location_id, 'lat':str(item.lat), 'lon':str(item.lon), 'score': (item.score if item.score else 0)}
    except Exception, e:
        log.info("*** couldn't get or write locations")
        log.error(e)

    return locations
  
def getLocationsWithScoring(db):
    data = []

    try:
        # TODO
        # this is temporary until actual scoring is determined
        sql = """select l.location_id, l.name, l.lat, l.lon, t.score from location l
                left join temp_scores t on t.location_id = l.location_id
                order by l.location_id""";
        data = list(db.query(sql))
    except Exception, e:
        log.info("*** couldn't get locations")
        log.error(e)

    return data 
        
def getLocations(db):
    data = []

    try:
        sql = """select l.location_id, l.name, l.lat, l.lon from location l
                order by l.location_id""";
        data = list(db.query(sql))
    except Exception, e:
        log.info("*** couldn't get locations")
        log.error(e)

    return data 

def getSimpleLocationDictionary(db):
    data = getLocations(db)
    
    locations = []
    
    for item in data:
        locations.append({'name':item.name, 'location_id':item.location_id})
        
    return locations
    
    