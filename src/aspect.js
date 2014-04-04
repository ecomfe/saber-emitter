/**
 * @file  Aspect Emitter
 * 
 * @author  Firede[firede@firede.us],
 *          zfkun[zfkun@msn.com]
 */

define(function ( require ) {

    var Emitter = require( './emitter' );

    /**
     * 判断字符串是否包含 :after、:before
     * 
     * @inner
     * @type {RegExp}
     */
    var regSuffix = /(?:\:[before|after]+)$/;

    /**
     * AspectEmitter
     * 
     * @exports AspectEmitter
     * @constructor
     */
    function AspectEmitter() {}

    Emitter.mixin( AspectEmitter.prototype );

    /**
     * 触发事件
     * 
     * @param {string} event 事件名
     * @param {...*} 传递给监听器的参数，可以有多个
     * @return {AspectEmitter}
     */
    AspectEmitter.prototype.emit = function ( event ) {

        // 加了 :before、:after 的事件直接触发
        if ( event.match( regSuffix ) ) {
            return Emitter.prototype.apply( event, arguments );
        }

        var events = this._getEvents();
        var args = Array.prototype.slice.call( arguments, 1 );

        emitListeners( events[ event + ':before' ], args );
        emitListeners( events[ event ], args );
        emitListeners( events[ event + ':after' ], args );

        return this;
    };

    /**
     * 触发监听器列表
     * 
     * @inner
     * @param {Array} listeners 监听器列表
     * @param {Array} args 参数数组
     */
    function emitListeners( listeners, args ) {
        if ( listeners ) {
            listeners = listeners = listeners.slice( 0 );
            for ( var i = 0, len = listeners.length; i < len; i++ ) {
                listeners[ i ].apply( this, args );
            }
        }
    }

    return AspectEmitter;
});
