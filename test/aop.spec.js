define(function() {
    var Emitter = require( 'saber-emitter/aop' );

    describe( 'AOP', function() {

        describe( 'before', function() {
            it( '.on( aop, fn )', function () {
                var emitter = new Emitter();
                var result = [];

                emitter.on( 'foo', function ( value ) {
                    result.push( 'one', value );
                });

                emitter.on( 'foo', function ( value ) {
                    result.push( 'two', value );
                });

                emitter.on( 'foo:before', function ( value ) {
                    result.push( 'b1', value );
                });

                emitter.on( 'foo:before', function ( value ) {
                    result.push( 'b2', value );
                });

                emitter.emit( 'foo', 'test' );
                emitter.emit( 'foo', 1 );
                emitter.emit( 'bar', 2 );

                expect( result ).toEqual(
                    [
                    'b1', 'test', 'b2', 'test',
                    'one', 'test', 'two', 'test',

                    'b1', 1, 'b2', 1,
                    'one', 1, 'two', 1
                    ]
                );
            });
        });

        describe( 'after', function() {
            // TODO
        });

    });

});
