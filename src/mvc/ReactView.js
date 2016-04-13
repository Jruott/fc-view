/** 
 * @file 针对React的 er/View封装。
 * @author lihaitao03@baidu.com
 */

define(function (require) {


    var override = {};


    // ER 导入的控制数据，需要删除
    var dropField = ['container', 'isChildAction', 'referrer', 'url'];


    /**
     * 制作React组件使用的props
     *
     * @param {ER.Model} ER model 对象
     * @return {Object} 包含model中所有数据对象，并含有一个dispatch闭包方法
     */
    function propsFactory(model) {
        var data = model.dump();
        for (var i = 0; i < dropField.length; i++) {
            delete data[dropField[i]];
        }
        data.dispatch = dispatchFactory(model);
        return data;
    }


    /**
     * 制作dispatch闭包
     *
     * @param {ER.Model} ER model 对象
     * @return {function} 分发命令的闭包
     */
    function dispatchFactory(model) {
        return function () {
            if (arguments.length === 0) return;
            var args = [].slice.apply(arguments);
            var handler = args.shift();
            if (typeof handler !== 'string') {
                args.unshift(handler);
                handler = typeof handler.type === 'string' ? handler.type : '';
            }
            if (typeof model[handler] === 'function') {
                model[handler].apply(model, args);
            }
        }
    }


    /**
     * 初始化React组件
     *
     * @override
     */
    override.enterDocument = function () {
        if (typeof this.app !== 'function') return;
        var model = this.model;
        try {
            this.reactContext = React.render(
                React.createElement(this.app, propsFactory(model)),
                this.getContainerElement()
            );
        }
        catch (e) {
            console.error('Create React Component Failed!');
        }  
        model.on('change', function (e) {
            //if (!this.reactContext) return;
            //this.reactContext.setProps(propsFactory(e.target));
            this.reactContext = React.render(
                React.createElement(this.app, propsFactory(model)),
                this.getContainerElement()
            );
        }, this);
    };


    /**
     * 销毁view
     */
    override.dispose = function () {
        var container = this.getContainerElement();
        container && ReactDOM.unmountComponentAtNode(container);
        this.reactContext = null;
        this.$super(arguments);
    };


    return require('eoo').create(require('er/View'), override);
});
