/**
 * @file Emitter AOP
 * @author zfkun[zfkun@msn.com]
 */

define( function ( require ) {

    var Emitter = require( './emitter' );

    var AOP_BEFORE = 'before';
    var AOP_AFTER = 'after';
    var rpseudo = /(?:\:[before|after]+)$/;

    /**
     * 获取`AOP`列表
     * 若还没有任何`AOP`则初始化列表
     * 
     * @private
     * @param {string=} key 事件名
     * @return {Object|Array.<Function>} [return description]
     */
    Emitter.prototype._getAops = function ( type ) {
        if ( !this._aops ) {
            this._aops = {};
        }

        if ( type ) {
            if ( !this._aops[ type ] ) {
                this._aops[ type ] = {};
            }
            return this._aops[ type ];
        }

        return this._aops;
    };


    var oriOn = Emitter.prototype.on;
    Emitter.prototype.on = function ( type, fn ) {
        var pseudo = type.match( rpseudo );
        if ( pseudo ) {
            type = type.substr( 0, type.length - pseudo[ 0 ].length );
            pseudo = pseudo[ 0 ].substr( 1 );

            var aopListeners = this._getAops( type );
            var maxListeners = this._getMaxListeners();
            if ( maxListeners > 0 ) {
                var aopCount = ( aopListeners[ AOP_BEFORE ] || [] ).length + ( aopListeners[ AOP_AFTER ] || []).length;
                if ( aopCount >= maxListeners ) {
                    throw new RangeError(
                        'Warning: possible Emitter memory leak detected. ' + aopCount + ' aop listeners added.'
                    );
                }
            }

            aopListeners[ pseudo ] = aopListeners[ pseudo ] || [];
            aopListeners[ pseudo ].push( fn );

            return this;
        }
        else {
            return oriOn.apply( this, arguments );
        }
    };


    Emitter.prototype.emit = function( type ) {
        var listeners = this._getEvents()[ type ];
        if ( listeners ) {
            var args = Array.prototype.slice.call( arguments, 1 );

            if ( false === aopCall( AOP_BEFORE, type, this, args ) ) {
                return this;
            }

            listeners = listeners.slice( 0 );
            for ( var i = 0, len = listeners.length; i < len; i++ ) {
                listeners[ i ].apply( this, args );
            }

            if ( false === aopCall( AOP_AFTER, type, this, args ) ) {
                return this;
            }
        }

        return this;
    };


    var oriOff = Emitter.prototype.off;
    Emitter.prototype.off = function ( type, fn ) {
        var args = arguments.length;
        if ( 0 < args ) {
            var pseudo = type.match( rpseudo );
            if ( pseudo ) {
                type = type.substr( 0, type.length - pseudo[ 0 ].length );
                pseudo = pseudo[ 0 ].substr( 1 );

                var aops = this._getAops( type );
                if ( !aops[ pseudo ] ) {
                    return this;
                }

                if ( 1 === args ) {
                    delete aops[ pseudo ];
                    return this;
                }

                var cb;
                for ( var i = 0; i < aops.length; i++ ) {
                    cb = aops[ i ];
                    if ( cb === fn || cb.listener === fn ) {
                        aops.splice( i, 1 );
                        break;
                    }
                }

                return this;
            }
        }

        // 清理对应的全部`AOP`监听器
        delete this._getAops()[ type ];

        return oriOff.apply( this, arguments );
    };


    function aopCall ( aop, type, context, args ) {
        var aops = context._getAops( type )[ aop ];
        if ( aops ) {
            aops = aops.slice( 0 );
            for ( var i = 0, n = aops.length; i < n; i++ ) {
                if ( false === aops[ i ].apply( context, args ) ) {
                    return false;
                }
            }
        }
    }

    return Emitter;
});