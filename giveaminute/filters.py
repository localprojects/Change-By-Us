from helpers.custom_filters import filters as custom_filters

def display_name(user):
    from giveaminute import project
    
    return project.userNameDisplay(
        user.first_name, user.last_name, user.affiliation,
        project.isFullLastName(user.group_membership_bitmask))

def register_filters():
    custom_filters.update({
        'display_name': display_name
    })

