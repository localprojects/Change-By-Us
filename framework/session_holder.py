"""
<<<<<<< HEAD
Singleton allows the session object to be passed between classes
Putting it here means we wont lose it if webpy reloads controller classes

"""
class SessionHolder():

    session = None
    
    @classmethod
    def set(cls, _session):
        cls.session = _session
        
    @classmethod
    def get_session(cls):
=======
Simple module to handle persistent sessions.

"""
class SessionHolder():
    """
    Singleton allows the session object to be passed between classes.
    Putting it here means we wont lose it if webpy reloads controller classes.
    
    """
    
    session = None
    """ Persistent session property. """
    
    @classmethod
    def set(cls, _session):
        """
        Set session value.
        
        @type   _session: ??
        @param  _session: Session data to set.
        
        @rtype: ??
        @returns: The current session data.
        
        """
        cls.session = _session
        return cls.session
        
    @classmethod
    def get_session(cls):
        """
        Get current session value.
        
        @rtype: ??
        @returns: The current session data.
        
        """
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        return cls.session