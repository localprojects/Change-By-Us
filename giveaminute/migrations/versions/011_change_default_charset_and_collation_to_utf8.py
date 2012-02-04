"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from sqlalchemy import *
from migrate import *

# TODO: The alter database statements assume the CBU db is named `changebyus`.  This should be
# dynamically determined from the sqla engine. 

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata 
    meta = MetaData(migrate_engine)
    
    # change db defaults
    sql_update_db = "alter database `changebyus` DEFAULT CHARACTER SET = 'utf8' DEFAULT COLLATE = 'utf8_general_ci'"
    migrate_engine.execute(sql_update_db)
    
    # populate ALL tables in metadata
    meta.reflect(migrate_engine)
    
    #change table defaults
    tbls = meta.tables.keys()
    
    for item in tbls:
        sql_update_table = "alter table `%s` CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'" % item
        migrate_engine.execute(sql_update_table)
    
    
def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    meta = MetaData(migrate_engine)
    
    #revert everything back to latin1 and latin1_swedish_ci 
    
    # change db defaults
    sql_update_db = "alter database `changebyus` DEFAULT CHARACTER SET = 'latin1' DEFAULT COLLATE = 'latin1_swedish_ci'"
    migrate_engine.execute(sql_update_db)
    
    # populate ALL tables in metadata
    meta.reflect(migrate_engine)
    
    #change table defaults
    tbls = meta.tables.keys()

    for item in tbls:
        sql_update_table = "alter table `%s` DEFAULT CHARACTER SET 'latin1' DEFAULT COLLATE 'latin1_swedish_ci'" % item
        migrate_engine.execute(sql_update_table)

    
