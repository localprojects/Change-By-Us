if (window.EnvJasmine){
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.topbar.js');
}

describe('tc.gam.topbar.js', function () {

    var topbar;
    beforeEach(function() {
        topbar = tc.top_bar(tc.jQ('<div></div>'), {});
    });

    describe('_getTagsMarkup', function () {
        it('returns the innerHTML for the list of popular tags in the top bar', function() {
            var html = topbar._getTagsMarkup([ {name: 'Foo', count:5}, {name:'Bar', count:3}]),
                expected = '<a href="/search?terms=Foo">Foo</a> (5), <a href="/search?terms=Bar">Bar</a> (3)';
            
            expect(html).toEqual(expected);
        });
    });
});