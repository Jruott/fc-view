/** 
 * @file 针对React的 er/Model封装。
 * @author lihaitao03@baidu.com
 */

define(function (require) {


    var override = {};

    override.set = function (name, value, options) {
        options = options || {};
        this.store[name] = value;
        if (!options.silent) this.fire('change');
        return value;
    };

    override.fill = function (extension, options) {
        options = options || {};
        for (var name in extension) {
            if (!extension.hasOwnProperty(name)) continue;
            this.store[name] = extension[name];
        }
        if (!options.silent) this.fire('change');
        return extension;
    };

    return require('eoo').create(require('er/Model'), override);

});
