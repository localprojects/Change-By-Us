# find keywords in a string
def getKeywords(db, s):
    sql = "select keyword from keyword"
    data = list(db.query(sql))
    
    words = []
    
    for d in data:
        if (d.keyword in s):
            words.append(d.keyword)
            
    return words