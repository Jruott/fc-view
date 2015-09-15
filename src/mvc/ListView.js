/**
 * @file 列表形式的MVC - View
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');

    /**
     * 列表形式的MVC - View
     */
    var overrides = {};

    /**
     * 收集查询参数并触发查询事件
     *
     * @param {mini-event.Event} e 控件事件对象
     */
    overrides.submitSearch = function (e) {
        var args = this.getSearchArgs();
        // 如果是表格排序引发的，把新的排序放进去
        if (e.type === 'sort') {
            args.orderBy = e.orderBy;
            args.order = e.order;
        }

        // 筛选条件
        if (e.type === 'filter') {
            _.extend(args, e.data.filters);
        }
        if (e.type === 'filters') {
            args.filters = JSON.stringify(e.data.filters);
        }

        // er的刷新机制是如果url未发生变化的话不会刷新
        // 如果传了force的话会在url未发生变化的情况下也刷新页面
        if (e && e.data && e.data.force) {
            args.force = true;
        }

        this.fire('search', fc.util.customData(args));
    };

    /**
     * 获取查询参数，默认是取`filter`表单的所有数据，加上表格的排序字段
     *
     * @return {Object}
     */
    overrides.getSearchArgs = function () {

        var pager = this.get('list-table-pager');
        // 准备参数，don't worry，默认参数会被过滤掉
        var args = {
            pageSize: pager.pageSize,
            pageNo: pager.page
        };

        // 加上原本的排序方向和排序字段名
        args.order = this.model.get('order');
        args.orderBy = this.model.get('orderBy');

        // var keyword = this.get('keyword');
        // if (keyword) {
        //     // 关键词去空格
        //     args.keyword = u.trim(keyword.getValue());
        // }

        // // 日期是独立的
        // var range = this.get('range');
        // if (range) {
        //     range = range.getValue().split(',');
        //     args.startTime = moment(range[0]).format('YYYYMMDDHHmmss');
        //     args.endTime = moment(range[1]).format('YYYYMMDDHHmmss');
        // }

        return _.purify(args);
    };

    var ListView = fc.oo.derive(require('./BaseView'), overrides);

    return ListView;
});
