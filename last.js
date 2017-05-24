;
(function (name, propertis) {
    var orange = function () {
        Object.defineProperty(this, "pluginCatch", { value: {}, enumerable: true });
        Object.defineProperty(this, "variableCatch", { value: {}, enumerable: true });
        this.fn = fn.bind(this);
        return this.fn;
        function fn() {
            var args = slice.call(arguments), //参数列表
                len = args.length, //参数长度
                last = len - 1, //最后一位index
                first = 0, //首位index
                paramEnd = last - 1, //参数值末尾index
                pluginKey = args[first], //首位参数：组件名称
                plugin = args[first + 1], //第二位参数：组件对象
                params = args[first + 2], //注册的参数列表
                cover = args[last], //覆盖注册
                switchKey = len, //选项值
                o = orange

            if (!o.isPluginKey(pluginKey)) {
                o.LOGGER.throw("pluginKey should be string type and not be empty")
            }
            if (len > 1 && !o.isPlugin(plugin)) {
                o.LOGGER.throw("plugin should not be null")
            }
            if (len > 2) {
                if (!o.isPlugin(cover) && o.isBoolean(params)) {
                    cover = params;
                }
                if (o.isBoolean(cover)) {
                    paramEnd -= 1;
                } else {
                    cover = false;
                }
                if (o.isArray(params)) {
                    params.concat(o.splice.call(args, 3, paramEnd));
                } else {
                    params = o.splice.call(args, 2, paramEnd);
                }
            }
            switch (switchKey) {
                case 1:
                    return this.getVariable(pluginKey);
                case 2:
                    return this.setVariable(pluginKey, plugin, params, cover);
                default:
                    o.LOGGER.throw("arguments error");
            }
        }
    }

    orange.slice = slice = Array.prototype.slice;
    orange.splice = Array.prototype.splice;

    orange.orange = function () { };
    orange.isPluginKey = function (o) {
        return typeof o === 'string' && o.trim() !== "";
    }
    orange.isBoolean = function (o) {
        return typeof o === 'boolean'
    }
    orange.isFunction = function (o) {
        return typeof o === 'function';
    }
    orange.isObject = function (o) {
        return typeof o === 'object' && !orange.isArray(o);
    }
    orange.isArray = function (o) {
        return o instanceof Array;
    }
    orange.isPlugin = function (o) {
        return o != null;
    }
    orange.LOGGER = {
        info: function (msg) {
            this.log("INFO", msg)
        },
        debug: function (msg) {
            this.log("DEBUG", msg)
        },
        error: function (msg) {
            this.log("ERROR", msg)
        },
        log: function (type, msg) {
            console["info" || type.toLowerCase()]("[" + type + "]", ">>>", msg);
        },
        throw: function (msg) {
            throw Error("[ ERROR ] >>> " + msg);
        }
    }
    orange.fn = orange.prototype = {
        get:function(){
            return this.getVariable(this._prekey);
        },
        set:function(plugin,params){
           return this.setVariable (this._prekey,plugin,params,true);
        },
        getVariable: function (pluginKey, must) {
            let val = this.pluginCatch[pluginKey] || this.variableCatch[pluginKey];
            if (val === undefined && must !== 'must') {
                orange.LOGGER.error("[ " + pluginKey + " ] should be define");
            }
            return val;
        },
        setVariable: function (pluginKey, plugin, params, cover) {
            var val = this.getVariable(pluginKey, "must");
            if (orange.isPlugin(val) && !cover) {
                orange.LOGGER.throw("[ " + pluginKey + " ] try to set plugin but it is exist or cover is true")
            }
            if (orange.isArray(params)) {
                return this.setVariableWithParams(pluginKey, plugin, params, cover);
            }
            if(orange.isFunction(plugin)){
                 delete this.variableCatch[pluginKey];
                 this.pluginCatch[pluginKey] = plugin;
            }else{
                delete this.pluginCatch[pluginKey];
                this.variableCatch[pluginKey] = plugin;
            }
            this._prekey = pluginKey;
            return this;
        },
        setVariableWithParams: function (pluginKey, plugin, params, cover) {
            if (orange.isFunction(plugin)) {
                delete this.pluginCatch[pluginKey];
                delete this.variableCatch[pluginKey];
                let val = plugin.apply(this, params);
                if (orange.isFunction(val)) {
                    this.pluginCatch[pluginKey] = val;
                } else {
                    this.variableCatch[pluginKey] = val;
                }
            }
            return this;
        }
    }
    function init(name) {
        var name = name;
        if (this[name] != undefined) {
            try {
                orange.LOGGER.throw("[ " + name + " ] has already exist ,please try another")
            } catch (error) {
                throw error;
            }
        }
        this[name] = function (ns) {
            try {
                if (!orange.isPluginKey(ns)) { orange.LOGGER.throw("[ " + ns + " ] must be string type and not be empty") }
                if (this[ns] !== undefined) { orange.LOGGER.throw("[ " + ns + " ] has already exist in << " + name + " >>") }
            } catch (error) {
                throw error;
            }
            this[ns] = new orange();
        }
    };
    init(name);
})("ns");
ns("test");
console.log(">>",test("test", "1").set(function(a,b){return a+b},[1,2]).get())