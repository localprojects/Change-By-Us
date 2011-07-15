//Load the file that is being tested
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.validate.js');

describe('GAM Validate', function () {
    it('finds two capital letters', function () {
        var c = tc.countContain('Code for America', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        expect(c).toEqual(2);
    });
});
