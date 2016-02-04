/** 
 * @file 针对React的 er/Action封装。
 * @author lihaitao03@baidu.com
 */

define(function (require) {

    var override = {};

    override.dispatch = function () {
        if (arguments.length === 0) return;
        var args = [].slice.apply(arguments);
        var handler = args.shift();
        var model = this.model;
        if (typeof handler !== 'string') {
            args.unshift(handler);
            handler = typeof handler.type === 'string' ? handler.type : '';
        }
        if (typeof model[handler] === 'function') {
            model[handler].apply(model, args);
        }
    };

    return require('eoo').create(require('er/Action'), override);
});
