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
