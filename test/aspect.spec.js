define(function() {
    var AspectEmitter = require( 'saber-emitter/aspect' );

    describe( 'AspectEmitter', function() {

        it( 'with :before', function () {
            var emitter = new AspectEmitter();
            var result = [];

            emitter.on( 'foo', function ( value ) {
                result.push( 'one', value );
            });

            emitter.on( 'foo:before', function ( value ) {
                result.push( 'b1', value );
            });

            emitter.on( 'foo', function ( value ) {
                result.push( 'two', value );
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

        it( 'with :after', function () {
            var emitter = new AspectEmitter();
            var result = [];

            emitter.on( 'foo', function ( value ) {
                result.push( 'one', value );
            });

            emitter.on( 'foo:after', function ( value ) {
                result.push( 'a1', value );
            });

            emitter.on( 'foo', function ( value ) {
                result.push( 'two', value );
            });

            emitter.on( 'foo:after', function ( value ) {
                result.push( 'a2', value );
            });

            emitter.emit( 'foo', 'test' );
            emitter.emit( 'foo', 1 );
            emitter.emit( 'bar', 2 );

            expect( result ).toEqual(
                [
                    'one', 'test', 'two', 'test',
                    'a1', 'test', 'a2', 'test',
                    'one', 1, 'two', 1,
                    'a1', 1, 'a2', 1
                ]
            );
        });

        it( 'with :before and :after', function () {
            var emitter = new AspectEmitter();
            var result = [];

            emitter.on( 'foo', function ( value ) {
                result.push( 'one', value );
            });

            emitter.on( 'foo:after', function ( value ) {
                result.push( 'a1', value );
            });

            emitter.on( 'foo', function ( value ) {
                result.push( 'two', value );
            });

            emitter.on( 'foo:before', function ( value ) {
                result.push( 'b1', value );
            });

            emitter.emit( 'foo', 'test' );
            emitter.emit( 'foo', 1 );
            emitter.emit( 'bar', 2 );

            expect( result ).toEqual(
                [
                    'b1', 'test',
                    'one', 'test', 'two', 'test',
                    'a1', 'test',
                    'b1', 1,
                    'one', 1, 'two', 1,
                    'a1', 1
                ]
            );
        });

        it( 'emit :before/:after only', function () {
            var emitter = new AspectEmitter();
            var result = [];

            emitter.on( 'foo', function ( value ) {
                result.push( 'one', value );
            });

            emitter.on( 'foo:after', function ( value ) {
                result.push( 'a1', value );
            });

            emitter.on( 'foo', function ( value ) {
                result.push( 'two', value );
            });

            emitter.on( 'foo:before', function ( value ) {
                result.push( 'b1', value );
            });

            emitter.emit( 'foo:after', 'test' );
            emitter.emit( 'foo:before', 1 );
            emitter.emit( 'bar', 2 );

            expect( result ).toEqual(
                [
                    'a1', 'test',
                    'b1', 1
                ]
            );
        });

    });

});
