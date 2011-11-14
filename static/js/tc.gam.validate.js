/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/
if(!tc){ var tc = {}; }

tc.validator_regex = {
	email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	//url: /^((ht|f)tps?:\/\/)?[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/
	url: /^((ht|f)tps?:\/\/)?[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\%"\,\{\}\\|\\\^\[\]`]+)?$/
};

tc.validator_utils = {
	is_empty: function(str) {
		return tc.jQ.trim(str) ? false : true; 
	},
	val_escape_hints: function(element) {
		var value, hint;
		value = element.val();
		hint = element.data().input ? element.data().input.hint : null;
		if (!hint) {
			return value;
		}
		return (value === hint ? "" : value);
	}
};

tc.validate = function(element,validators){
	//tc.util.log('tc.validate');
	//tc.util.dump(element);
	var valid, required, empty, value, errors, i, tempvalue, tempelement, j;
	
	valid = true;
	required = false;
	if(!element instanceof tc.jQ){
		element = tc.jQ(element);
	}
	value = element.val();
	errors = [];
	
	if(!element.get(0)){
		return {
			valid:false,
			errors:['Input not found.'],
			data:element
		};
	}
	
	for(i in validators){
		if(validators[i].substring(0,3) == 'min'){
			value = tc.validator_utils.val_escape_hints(element);
			if(value.length < (validators[i].split('-')[1]*1.0)){
				valid = false;
				errors.push("Too short.");
			}
			continue;
		}
		if(validators[i].substring(0,3) == 'max'){
			value = tc.validator_utils.val_escape_hints(element);
			if(value.length > (validators[i].split('-')[1]*1.0)){
				valid = false;
				errors.push("Too long.");
			}
			continue;
		}
		if(validators[i].substring(0,3) == 'not'){
			if(value === validators[i].split('-')[1]){
				valid = false;
				errors.push("Invalid value.");
			}
			continue;
		}
		if(validators[i].substring(0,8) == 'password'){
			tempvalue = tc.password_strength(value);
			tempelement = element.filter('.has-been-focused').siblings('.pass-strength');
			if(tempvalue < (validators[i].split('-')[1]*1.0)){
				valid = false;
				errors.push("Too Weak.");
				if(tempelement.length){
					tempelement.text('Too weak').addClass('weak');
				}
			} else {
				if(tempelement.length){
					tempelement.text('Strong').removeClass('weak');
				}
			}
			continue;
		}
		switch(validators[i]){
			case 'required':
				required = true;
				if(element.get(0).type == 'checkbox'){
					if(!element.filter(':checked').length || !element.get(0).checked){
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
			case 'password':
				
				break;
			case 'csv-email':
				value = value.split(',');
				for(j in value){
					if (!tc.validator_regex.email.test(tc.jQ.trim(value[j]))) {
						valid = false;
						errors.push("Invalid Email.");
					}
				}
				break;
			case 'email':
				tempelement = element.filter('.has-attempted-submit').parent().parent().find('.email-error');
				if (!tc.validator_regex.email.test(value)) {
					valid = false;
					if(tempelement.length){
						tempelement.show();
					}
					errors.push("Invalid Email.");
				} else {
					if(tempelement.length){
						tempelement.hide();
					}
				}
				break;
			case 'csv-url':
				value = value.split(',');
				for(j in value){
					if (!tc.validator_regex.url.test(tc.jQ.trim(value[j]))) {
						valid = false;
						errors.push("Invalid Url.");
					}
				}
				break;
			case 'url':
				if (!tc.validator_regex.url.test(value)) {
					valid = false;
					errors.push("Invalid Url.");
				}
				break;
			case 'numeric':
				if(isNaN(Number(value))){
					valid = false;
					errors.push('Not a number.')
				}
				break;
			case 'selected':
				if(value == '-1'){
					valid = false;
					errors.push('Must select a value.')
				}
				break;
		}
	}
	
	if(!valid && !required && !tc.jQ.trim(value).length){
		valid = true;
	}
	
	if(valid){
		element.removeClass('not-valid')
		if(required || tc.jQ.trim(value).length){
			element.addClass('valid');
		}
		return {
			valid:true
		};
	} else {
		element.removeClass('valid').addClass('not-valid');
		return {
			valid:false,
			errors:errors
		}
	}
};

// Password strength meter v2.0
// Matthew R. Miller - 2007
// www.codeandcoffee.com
// Based off of code from:
//  http://www.intelligent-web.co.uk
//  http://www.geekwisdom.com/dyn/passwdmeter


/*
	Password Strength Algorithm:
	
	Password Length:
		5 Points: Less than 4 characters
		10 Points: 5 to 7 characters
		25 Points: 8 or more
		
	Letters:
		0 Points: No letters
		10 Points: Letters are all lower case
		20 Points: Letters are upper case and lower case

	Numbers:
		0 Points: No numbers
		10 Points: 1 number
		20 Points: 3 or more numbers
		
	Characters:
		0 Points: No characters
		10 Points: 1 character
		25 Points: More than 1 character

	Bonus:
		2 Points: Letters and numbers
		3 Points: Letters, numbers, and characters
		5 Points: Mixed case letters, numbers, and characters
		
	Password Text Range:
	
		>= 90: Very Secure
		>= 80: Secure
		>= 70: Very Strong
		>= 60: Strong
		>= 50: Average
		>= 25: Weak
		>= 0: Very Weak
		
*/

	tc.password = {
		'm_strUpperCase':"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		'm_strLowerCase':"abcdefghijklmnopqrstuvwxyz",
		'm_strNumber':"0123456789",
		'm_strCharacters':"!@#$%^&*?_~"
	};
		
	// Check password
	tc.password_strength = function(strPassword){
		tc.util.log('tc.password_strength');
		
		// Reset combination count
		var nScore = 0;
	
		// Password length
		// -- Less than 4 characters
		if (strPassword.length < 5)
		{
			nScore += 5;
		}
		// -- 5 to 7 characters
		else if (strPassword.length > 4 && strPassword.length < 8)
		{
			nScore += 10;
		}
		// -- 8 or more
		else if (strPassword.length > 7)
		{
			nScore += 25;
		}

		// Letters
		var nUpperCount = tc.countContain(strPassword, tc.password.m_strUpperCase);
		var nLowerCount = tc.countContain(strPassword, tc.password.m_strLowerCase);
		var nLowerUpperCount = nUpperCount + nLowerCount;
		// -- Letters are all lower case
		if (nUpperCount == 0 && nLowerCount != 0) 
		{ 
			nScore += 10; 
		}
		// -- Letters are upper case and lower case
		else if (nUpperCount != 0 && nLowerCount != 0) 
		{ 
			nScore += 20; 
		}
	
		// Numbers
		var nNumberCount = tc.countContain(strPassword, tc.password.m_strNumber);
		// -- 1 number
		if (nNumberCount == 1)
		{
			nScore += 10;
		}
		// -- 3 or more numbers
		if (nNumberCount >= 3)
		{
			nScore += 20;
		}
	
		// Characters
		var nCharacterCount = tc.countContain(strPassword, tc.password.m_strCharacters);
		// -- 1 character
		if (nCharacterCount == 1)
		{
			nScore += 10;
		}	
		// -- More than 1 character
		if (nCharacterCount > 1)
		{
			nScore += 25;
		}
	
		// Bonus
		// -- Letters and numbers
		if (nNumberCount != 0 && nLowerUpperCount != 0)
		{
			nScore += 2;
		}
		// -- Letters, numbers, and characters
		if (nNumberCount != 0 && nLowerUpperCount != 0 && nCharacterCount != 0)
		{
			nScore += 3;
		}
		// -- Mixed case letters, numbers, and characters
		if (nNumberCount != 0 && nUpperCount != 0 && nLowerCount != 0 && nCharacterCount != 0)
		{
			nScore += 5;
		}
	
		return nScore;
	};
	
	tc.countContain = function(strPassword, strCheck){ 
		var nCount = 0;
		for (i = 0; i < strPassword.length; i++) {
			if (strCheck.indexOf(strPassword.charAt(i)) > -1) { 
				nCount++;
			} 
		}
		return nCount; 
	};