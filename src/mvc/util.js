/**
 * @file util
 * This utility model is intend for making array listener
 * @author Hu Jian(hujian02@baidu.com)
 */

define(function (require) {
    var _ = require('underscore');
    var Control = require('esui/Control');

    function getHashId(item) {
        return item && item.__hashKey;
    }

    var uid = 0;

    function nextUid() {
        return 'hash@' + (uid++);
    }

    function arrayListenerMaker(currentComponent, name, ItemComponent, wrap) {
        var lastBlockMap = {};
        var lastBlockOrder = [];
        if (wrap instanceof Control) {
            wrap = wrap.main;
        }

        function modelDispose(itemComponent) {
            itemComponent.dispose();
            var items = currentComponent.model.get(name);
            var item = this.dump();
            var hashId = getHashId(item);
            if (_.isArray(items)) {
                currentComponent.model.set(name, _.filter(items, function (item) {
                    return getHashId(item) !== hashId;
                }));
            }
        }

        function modelChange(itemComponent) {
            var items = currentComponent.model.get(name);
            var item = this.dump();
            var hashId = getHashId(item);
            if (_.isArray(items)) {
                for (var i = 0, len = items.length; i < len; i++) {
                    if (getHashId(items[i]) === hashId) {
                        var toUpdate = [];
                        toUpdate[i] = item;
                        currentComponent.model.update(name, toUpdate);
                        break;
                    }
                }
            }
        }

        return function (newValue, oldValue, event) {
            if (!_.isArray(newValue)) {
                return;
            }
            _.each(newValue, function (item) {
                if (_.isObject(item) && !getHashId(item)) {
                    item.__hashKey = nextUid();
                }
            });
            var diffIndexes = event.changedKeys;
            if (diffIndexes) {
                for (var i = 0, len = diffIndexes.length; i < len; i++) {
                    var diffIndex = diffIndexes[i];
                    var model = lastBlockOrder[diffIndex].model;
                    model.fill(newValue[diffIndex]);
                }
                return;
            }

            var nextBlockMap = {};

            var arrayLength = newValue.length;
            var nextBlockOrder = new Array(arrayLength);
            var block;
            var hashId;

            // locate existing items
            for (var i = 0; i < arrayLength; i++) {
                var item = newValue[i];
                hashId = getHashId(item);
                if (lastBlockMap[hashId]) {
                    // found previously seen block
                    block = lastBlockMap[hashId];
                    delete lastBlockMap[hashId];
                    nextBlockMap[hashId] = block;
                    nextBlockOrder[i] = block;
                }
                else {
                    nextBlockOrder[i] = {
                        id: hashId,
                        rawData: item,
                        model: undefined,
                        component: undefined
                    };
                    nextBlockMap[hashId] = true;
                }
            }

            // remove leftover items
            for (hashId in lastBlockMap) {
                if (lastBlockMap.hasOwnProperty(hashId)) {
                    lastBlockMap[hashId].model.dispose();
                }
            }

            wrap.innerHTML = '';
            for (var i = 0; i < arrayLength; i++) {
                block = nextBlockOrder[i];

                if (block.component) {
                    block.component.control.appendTo(wrap);
                }
                else {
                    var model = currentComponent.model.createChildModel(block.rawData);
                    var compoenentContainer = document.createElement('div');
                    wrap.appendChild(compoenentContainer);

                    var itemComponent = new ItemComponent({
                        viewContext: currentComponent.viewContext,
                        componentContext: currentComponent.componentContext,
                        model: model,
                        container: compoenentContainer
                    });
                    itemComponent.enter();
                    block.component = itemComponent;
                    block.model = model;
                    nextBlockMap[block.id] = block;
                    model.on('dispose', _.bind(modelDispose, model, itemComponent));
                    model.on('change', _.bind(modelChange, model));
                }
            }
            lastBlockMap = nextBlockMap;
            lastBlockOrder = nextBlockOrder;
        };
    }

    return {
        arrayListenerMaker: arrayListenerMaker
    };
});
