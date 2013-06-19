saber-emitter
===

一个适用于移动端的事件发射器。

Usage
---

通过`edp`引入模块：

    edp import saber-emitter

简单使用示例：

```javascript
require( [ 'saber-emitter'], function( Emitter ) {
    var emitter = new Emitter;

    emitter.on( 'greeting', function( name ) {
        console.log( 'Hello, ' + name + '!' );
    });

    emitter.emit( 'greeting', 'Firede' );
});
```
