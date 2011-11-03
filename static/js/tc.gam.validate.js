/**
 * File: Validate
 * Defines input validators, mostly used in the Merlin framework.
 *
 * Filename:
 * tc.gam.validate.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 */

/**
 * Variable: tc.validator_regex
 * {Object} Defines an object with properties
 * - email: regex expression for validating emails.
 * - url: regex expression for validating urls.
 */
tc.validator_regex = {
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    url: /^((ht|f)tps?:\/\/)?[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\%"\,\{\}\\|\\\^\[\]`]+)?$/
};

/**
 * Variable: tc.password
 * {Object} Holds valid characters for passwords.  See
 * tc.password_strength().
 */
tc.password = {
    'm_strUpperCase': "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    'm_strLowerCase': "abcdefghijklmnopqrstuvwxyz",
    'm_strNumber': "0123456789",
    'm_strCharacters': "!@#$%^&*?_~"
};

/**
 * Variable: tc.validator_utils
 * {Object} Holds some useful utility function for validating.
 */
tc.validator_utils = {};

/**
 * Function: tc.validator_utils.is_empty
 * Checks if string is empty.
 *
 * Parameters:
 * str - {String} String to check.
 *
 * Returns:
 * {Boolean} Whether string is empty or not.
 */
tc.validator_utils.is_empty = function(str) {
    return tc.jQ.trim(str) ? false : true;
};

/**
 * Function: tc.validator_utils.val_escape_hints
 * Takes an input value and checks against hint.
 *
 * Parameters:
 * elemnt - {Object} jQuery element to check.
 *
 * Returns:
 * {String} The value of the element, or if it is the same as the
 * hint, returns an empty string.
 */
tc.validator_utils.val_escape_hints = function (element) {
    var value = element.val();
    var hint = element.data().input ? element.data().input.hint : null;
    
    if (!hint) {
        return value;
    }
    return (value === hint ? "" : value);
};

/**
 * Function: tc.validate
 * Main validation function.
 *
 * The following are the built in validators
 * - min-X: Where XX is an integer for the minimum number of characters
 *     that the length of the input value can have.
 * - max-X: Where XX is an integer for the maximum number of characters
 *     that the length of the input value can have.
 * - not-STRING: Where STRING is a specific string that the input
 *     value cannot have.
 * - password-X: Where X is the password strength that the input
 *     value has to equal or exceed.  See tc.password_strength().
 * - required: Checks that there is an input value.
 * - csv-email: Checks that input is a comma-separated list of
 *     emails.
 * - email: Checks that input is a valid email address.
 * - csv-url: Checks that input is a comma-separated list of
 *     urls.  This does not handle if URL's have commas in them.
 * - url: Checks that input is a valid URL address.
 * - numeric: Checks that input is a valid number.
 * - selected: Checks that input has been selected.
 *
 * Parameters:
 * element - {Mixed} jQuery element object or jQuery selector.  Not
 *     having a valid element or selector will throw error.
 * validators - {Array} An array of strings.  Each string refers to a
 *     validation call.
 *
 * Return:
 * {Object} An object with the following properties
 * - valid: {Boolean} Whether element validated.
 * - errors: {Array} Array of string validation errors.
 * - data: {Object} The DOM element ??
 */
tc.validate = function(element, validators) {
    var valid = true;
    var required = false;
    var errors = [];
    var empty, value, num_val, i, tempvalue, tempelement, j;
    
    // Accept either selector or jQuery element.
    if (!element instanceof tc.jQ) {
        element = tc.jQ(element);
    }
    value = element.val();

    // If there is no elements to validate, the assumption
    // is that this is an error.
    if (!element.get(0)) {
        return {
            valid: false,
            errors: ['Input not found.'],
            data: element
        };
    }

    // Go through validators array.
    for (i in validators) {
        // Check min.
        if (validators[i].substring(0, 3) == 'min') {
            value = tc.validator_utils.val_escape_hints(element);
            num_val = parseFloat(value);
            
            if (isNaN(num_val)) {
                if (value.length < (validators[i].split('-')[1] * 1.0)) {
                    valid = false;
                    errors.push("Too short.");
                }
            } else {
                if (value < (validators[i].split('-')[1] * 1.0)) {
                    valid = false;
                    errors.push("Too small.");
                }
            }
            continue;
        }
        // check max.
        if (validators[i].substring(0, 3) == 'max') {
            value = tc.validator_utils.val_escape_hints(element);
            num_val = parseFloat(value);
            
            if (isNaN(num_val)) {
                if (value.length > (validators[i].split('-')[1] * 1.0)) {
                    valid = false;
                    errors.push("Too long.");
                }
            } else {
                if (value > (validators[i].split('-')[1] * 1.0)) {
                    valid = false;
                    errors.push("Too big.");
                }
            }
            continue;
        }
        // Not a specfific string
        if (validators[i].substring(0, 3) == 'not') {
            if (value === validators[i].split('-')[1]) {
                valid = false;
                errors.push("Invalid value.");
            }
            continue;
        }
        // Password strength
        if (validators[i].substring(0, 8) == 'password') {
            tempvalue = tc.password_strength(value);
            tempelement = element.filter('.has-been-focused').siblings('.pass-strength');
            if (tempvalue < (validators[i].split('-')[1] * 1.0)) {
                valid = false;
                errors.push("Too Weak.");
                if (tempelement.length) {
                    tempelement.text('Too weak').addClass('weak');
                }
            } else {
                if (tempelement.length) {
                    tempelement.text('Strong').removeClass('weak');
                }
            }
            continue;
        }
        
        // Mutually exclusive validators.
        switch (validators[i]) {
            // Required.
            case 'required':
                required = true;
                if (element.get(0).type == 'checkbox') {
                    if (!element.filter(':checked').length || !element.get(0).checked) {
                        valid = false;
                        errors.push("This is required.");
                    }
                } else {
                    value = tc.validator_utils.val_escape_hints(element);
                    if (!value.length) {
                        empty = true;
                        valid = false;
                        errors.push("This is required.");
                    }
                }
                break;
                
            // Comma separated list of emails.
            case 'csv-email':
                value = value.split(',');
                for (j in value) {
                    if (!tc.validator_regex.email.test(tc.jQ.trim(value[j]))) {
                        valid = false;
                        errors.push("Invalid Email.");
                    }
                }
                break;
                
            // Email address.
            case 'email':
                tempelement = element.filter('.has-attempted-submit').parent().parent().find('.email-error');
                if (!tc.validator_regex.email.test(value)) {
                    valid = false;
                    if (tempelement.length) {
                        tempelement.show();
                    }
                    errors.push("Invalid Email.");
                } else {
                    if (tempelement.length) {
                        tempelement.hide();
                    }
                }
                break;
                
            // Comma separated list of urls.
            case 'csv-url':
                value = value.split(',');
                for (j in value) {
                    if (!tc.validator_regex.url.test(tc.jQ.trim(value[j]))) {
                        valid = false;
                        errors.push("Invalid Url.");
                    }
                }
                break;
                
            // URL
            case 'url':
                if (!tc.validator_regex.url.test(value)) {
                    valid = false;
                    errors.push("Invalid Url.");
                }
                break;
            
            // Numeric value
            case 'numeric':
                if (isNaN(Number(value))) {
                    valid = false;
                    errors.push('Not a number.');
                }
                break;
                
            // Selected
            case 'selected':
                if (value == '-1') {
                    valid = false;
                    errors.push('Must select a value.');
                }
                break;
            }
    }

    // If pass tests, is empty and not required, then valid.
    if (!valid && !required && !tc.jQ.trim(value).length) {
        valid = true;
    }

    // Handle if validity.
    if (valid) {
        element.removeClass('not-valid');
        if (required || tc.jQ.trim(value).length) {
            element.addClass('valid');
        }
        return {
            valid: true
        };
    } else {
        element.removeClass('valid').addClass('not-valid');
        return {
            valid: false,
            errors: errors
        };
    }
};

/**
 * Function: tc.password_strength
 * Password strength meter v2.0.  Measures password strength.
 *
 * Based on code from
 * - <http://www.intelligent-web.co.uk>
 * - <http://www.geekwisdom.com/dyn/passwdmeter>
 *
 * Password Strength Algorithm
 * Password Length
 * - 5 Points: Less than 4 characters
 * - 10 Points: 5 to 7 characters
 * - 25 Points: 8 or more
 *
 * Letters
 * - 0 Points: No letters
 * - 10 Points: Letters are all lower case
 * - 20 Points: Letters are upper case and lower case
 *
 * Numbers
 * - 0 Points: No numbers
 * - 10 Points: 1 number
 * - 20 Points: 3 or more numbers
 *
 * Characters
 * - 0 Points: No characters
 * - 10 Points: 1 character
 * - 25 Points: More than 1 character
 *
 * Bonus
 * - 2 Points: Letters and numbers
 * - 3 Points: Letters, numbers, and characters
 * - 5 Points: Mixed case letters, numbers, and characters
 *
 * Password Text Range
 * - >= 90: Very Secure
 * - >= 80: Secure
 * - >= 70: Very Strong
 * - >= 60: Strong
 * - >= 50: Average
 * - >= 25: Weak
 * - >= 0: Very Weak
 * 
 * Authors:
 * - Matthew R. Miller - 2007 <http://www.codeandcoffee.com>
 *
 * Parameters:
 * {String} Password string.
 *
 * Return:
 * {Integer} Password strength score.
 */
tc.password_strength = function(strPassword) {
    // Reset combination count
    var nScore = 0;

    // Password length
    // -- Less than 4 characters
    if (strPassword.length < 5) {
        nScore += 5;
    }
    // -- 5 to 7 characters
    else if (strPassword.length > 4 && strPassword.length < 8) {
        nScore += 10;
    }
    // -- 8 or more
    else if (strPassword.length > 7) {
        nScore += 25;
    }

    // Letters
    var nUpperCount = tc.countContain(strPassword, tc.password.m_strUpperCase);
    var nLowerCount = tc.countContain(strPassword, tc.password.m_strLowerCase);
    var nLowerUpperCount = nUpperCount + nLowerCount;
    // -- Letters are all lower case
    if (nUpperCount == 0 && nLowerCount != 0) {
        nScore += 10;
    }
    // -- Letters are upper case and lower case
    else if (nUpperCount != 0 && nLowerCount != 0) {
        nScore += 20;
    }

    // Numbers
    var nNumberCount = tc.countContain(strPassword, tc.password.m_strNumber);
    // -- 1 number
    if (nNumberCount == 1) {
        nScore += 10;
    }
    // -- 3 or more numbers
    if (nNumberCount >= 3) {
        nScore += 20;
    }

    // Characters
    var nCharacterCount = tc.countContain(strPassword, tc.password.m_strCharacters);
    // -- 1 character
    if (nCharacterCount == 1) {
        nScore += 10;
    }
    // -- More than 1 character
    if (nCharacterCount > 1) {
        nScore += 25;
    }

    // Bonus
    // -- Letters and numbers
    if (nNumberCount != 0 && nLowerUpperCount != 0) {
        nScore += 2;
    }
    // -- Letters, numbers, and characters
    if (nNumberCount != 0 && nLowerUpperCount != 0 && nCharacterCount != 0) {
        nScore += 3;
    }
    // -- Mixed case letters, numbers, and characters
    if (nNumberCount != 0 && nUpperCount != 0 && nLowerCount != 0 && nCharacterCount != 0) {
        nScore += 5;
    }

    return nScore;
};

/**
 * Function: tc.countContain
 * Counts number of times a string contains another string.
 *
 * Parameters:
 * strPassword - {String} String to check for sub strings in.
 * strCheck - {String} String to look for in strPassword.
 *
 * Returns:
 * {Integer} Number of times that strCheck was found.
 */
tc.countContain = function(strPassword, strCheck) {
    var nCount = 0;
    for (i = 0; i < strPassword.length; i++) {
        if (strCheck.indexOf(strPassword.charAt(i)) > -1) {
            nCount++;
        }
    }
    return nCount;
};