/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

if (window.EnvJasmine){
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.validate.js');
}

/**
 * Tests: GAM Validate Tests
 */
describe('GAM Validate', function () {

    /**
     * Test Function: tc.countContain
     */
    it('finds two capital letters', function () {
        var c = tc.countContain('Code for America', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        expect(c).toEqual(2);
    });
});
