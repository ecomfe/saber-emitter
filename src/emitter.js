/**
 * @file  Event Emitter
 * @author  Firede[firede@firede.us]
 */

define( function() {

    /**
     * Emitter
     * 
     * @exports Emitter
     * @constructor
     */
    function Emitter() {}

    /**
     * Emitter的prototype（为了便于访问）
     * 
     * @inner
     */
    var proto = Emitter.prototype;

    /**
     * 获取事件列表
     * 若还没有任何事件则初始化列表
     * 
     * @private
     * @return {Object}
     */
    proto._getEvents = function() {
        if ( !this._events ) {
            this._events = {};
        }

        return this._events;
    };

    /**
     * 挂载事件
     * 
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.on = function( event, listener ) {
        var events = this._getEvents();
        
        events[ event ] = events[ event ] || [];
        events[ event ].push( listener );

        return this;
    };

    /**
     * 挂载只执行一次的事件
     * 
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.once = function( event, listener ) {
        var me = this;

        function on() {
            me.off( event, on );
            listener.apply( this, arguments );
        }
        // 挂到listener上以方便删除
        listener._off = on;

        this.on( event, on );

        return this;
    };

    /**
     * 注销事件与监听器
     * 任何参数都`不传`将注销当前实例的所有事件
     * 只传入`event`将注销该事件下挂载的所有监听器
     * 传入`event`与`listener`将只注销该监听器
     * 
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.off = function( event, listener ) {
        var events = this._getEvents();

        // 移除所有事件
        if ( 0 === arguments.length ) {
            this._events = {};
            return this;
        }

        var listeners = events[ event ];
        if ( !listeners ) {
            return this;
        }

        // 移除指定事件下的所有监听器
        if ( 1 === arguments.length ) {
            delete events[ event ];
            return this;
        }

        // 移除指定监听器（包括对once的处理）
        var index = listeners.indexOf( listener._off || listener );
        if ( index !== -1 ) {
            listeners.splice( index, 1 );
        }
        return this;
    };

    /**
     * 触发事件
     * 
     * @public
     * @param {string} event 事件名
     * @param {...*} 传递给监听器的参数，可以有多个
     * @return {Emitter}
     */
    proto.emit = function( event ) {
        var events = this._getEvents();
        var listeners = events[ event ];
        var args = Array.prototype.slice.call( arguments, 1 );

        if ( listeners ) {
            listeners = listeners.slice( 0 );
            for ( var i = 0, len = listeners.length; i < len; i++ ) {
                listeners[ i ].apply( this, args );
            }
        }

        return this;
    };

    /**
     * 返回指定事件的监听器列表
     * 
     * @public
     * @param {string} event 事件名
     * @return {Array} 监听器列表
     */
    proto.listeners = function( event ) {
        var events = this._getEvents();
        return events[ event ] || [];
    };

    return Emitter;

});
