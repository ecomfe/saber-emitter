/**
 * @file Emitter With AOP
 * @author zfkun[zfkun@msn.com]
 */

define( function ( require ) {

    var Emitter = require( './emitter' );

    var AOP_BEFORE = 'before';
    var AOP_AFTER = 'after';
    var rpseudo = /(?:\:[before|after]+)$/;


    /**
     * 支持`AOP`的`Emitter`
     * 
     * @constructor
     */
    function EmitterAop () {
        Emitter.apply( this, arguments );
    }

    Emitter.mixin( EmitterAop.prototype );


    var proto = EmitterAop.prototype;


    /**
     * 获取`AOP`列表
     * 若还没有任何`AOP`则初始化列表
     * 
     * @private
     * @param {string=} type 事件名
     * @return {Object|Array.<Function>}
     */
    proto._getAops = function ( type ) {
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


    /**
     * 挂载事件
     * 
     * @public
     * @param {string} type 事件名
     * @param {Function} fn 监听器
     * @return {EmitterAop}
     */
    proto.on = function ( type, fn ) {
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
        
        return Emitter.prototype.on.apply( this, arguments );
    };

    /**
     * 挂载只执行一次的事件
     * 
     * @public
     * @param {string} type 事件名
     * @param {Function} fn 监听器
     * @return {EmitterAop}
     */
    proto.once = function( type, fn ) {
        var me = this;

        function on() {
            me.off( type, on );
            fn.apply( this, arguments );

            // TODO
            // me.emit.apply( me, [ 'after' ].concat( arguments ) );
        }

        // 挂到on上以方便删除
        on.listener = fn;

        this.on( type, on );

        return this;
    };


    /**
     * 触发事件
     * 
     * @public
     * @param {string} type 事件名
     * @param {...*} 传递给监听器的参数，可以有多个
     * @return {EmitterAop}
     */
    proto.emit = function( type ) {
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


    /**
     * 注销事件与监听器以及AOP
     * 任何参数都`不传`将注销当前实例的所有事件和全部AOP
     * 只传入`type`将注销该事件下挂载的所有监听器和所有AOP
     * 传入`type`与`fn`将只注销该监听器和对应AOP
     * 
     * @public
     * @param {string} type 事件名
     * @param {Function} fn 监听器
     * @return {EmitterAop}
     */
    proto.off = function ( type, fn ) {
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

        return Emitter.prototype.off.apply( this, arguments );
    };


    /**
     * 执行指定`EmitterAop实例`的指定`aop`方法
     * 
     * @inner
     * @param {string} aop AOP名
     * @param {string} type 事件名
     * @param {EmitterAop} instance EmitterAop实例
     * @param {Array} args 传递给监听器的参数
     * @return {boolean} 停止后续的AOP和事件执行返回`false`,仅执行AOP不做干预则返回`true`
     */
    function aopCall ( aop, type, instance, args ) {
        var aops = instance._getAops( type )[ aop ];

        if ( aops ) {
            aops = aops.slice( 0 );
            for ( var i = 0, n = aops.length; i < n; i++ ) {
                if ( false === aops[ i ].apply( instance, args ) ) {
                    return false;
                }
            }
        }

        return true;
    }

    return EmitterAop;
});