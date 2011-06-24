# lazy code generator
# doesn't check against db, but will throw key error on attempted duplicate insert

import MySQLdb

def main():
    NUM_CODES = 5000
    codes = []
    
    db = MySQLdb.connect("localhost","root","password","gam_db")
    c = db.cursor()
    
    i = 0
    while (i < NUM_CODES):
        code = random_string(10)
        
        if (code not in codes):
            codes.append(code)
            i += 1
            
            print "add %s" % code
        else: 
            print "skip %s" %code
            
    
    c.executemany("insert into beta_invite_code (code) values (%s)", codes)
    
    c.close()
    db.close()
            
def random_string(length):
    import random
    return ''.join(random.sample("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", length))

if __name__ == '__main__':
    main()