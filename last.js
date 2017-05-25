;
(function (name, propertis) {
    var topKey = "window" in this ? "window" : "global" in this ? "global" : "basic";
    var existKey = "|break|do|instanceof|typeof|\
                case|else|new|var|\
                catch|finally|return|void|\
                continue|for|switch|while|\
                debugger|function|this|with|\
                default|if|throw|delete|\
                in|try|abstract|enum|int|\
                short|boolean|export|interface|static\
                byte|extends|long|super|\
                char|final|native|synchronized|\
                class|float|package|throws|\
                const|goto|private|transient|\
                debugger|implements|protected|volatile|\
                double|import|public|\
                class|enum|extends|super|\
                const|export|import|\
                implements|package|public|interface|\
                private|static|let|protected|\
                yield|";

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
                } else if (switchKey == 3 && params == cover) {
                    params = null;
                } else {
                    params = o.splice.call(args, 2, paramEnd);
                }
            }
            switch (switchKey) {
                case 1:
                    return this.getVariable(pluginKey);
                default:
                    return this.setVariable(pluginKey, plugin, params, cover);
            }
        }
    }

    orange.slice = slice = Array.prototype.slice;
    orange.splice = Array.prototype.splice;

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
    orange.prototype = {
        exist: function (pluginKey) {
            return pluginKey in this.pluginCatch || pluginKey in this.variableCatch;
        },
        get: function () {
            return this.getVariable(this._prekey);
        },
        set: function (plugin, params) {
            return this.setVariable(this._prekey, plugin, params, true);
        },
        exec: function () {
            var object = this.get(), o = orange, params = o.slice.call(arguments), index = 0;
            try {
                if (o.isObject(object) || o.isArray(object)) {
                    for (var i in object) {
                        if (o.isFunction(object[i])) {
                            object[i].call(this, params[index++]);
                        }
                    }
                } else if (o.isFunction(object)) {
                    object.apply(this, params);
                } else {
                    return false;
                }
            } catch (e) {
                console.error(e);
                return false;
            }
            return true;
        },
        getVariable: function (pluginKey, must) {
            let val = this.pluginCatch[pluginKey] || this.variableCatch[pluginKey];
            if (!this.exist(pluginKey)) {
                orange.LOGGER.error("[ " + pluginKey + " ] should be define");
            }
            return val;
        },
        setVariable: function (pluginKey, plugin, params, cover) {
            if (this.exist(pluginKey) && !cover) {
                orange.LOGGER.throw("[ " + pluginKey + " ] try to set plugin but it is exist and cover is false")
            }
            if (orange.isArray(params)) {
                this.setVariableWithParams(pluginKey, plugin, params, cover);
            }
            else if (orange.isFunction(plugin)) {
                delete this.variableCatch[pluginKey];
                this.pluginCatch[pluginKey] = plugin;
            } else {
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
        }
    }
    function init(name) {
        var name = name;
        validKeyword(name, topKey);
        this[name] = function (ns) {
            validKeyword(ns, topKey);
            this[ns] = new orange();
        }
    };
    function validKeyword(ns, name) {
        if (this[ns] !== undefined) { orange.LOGGER.throw("[ " + ns + " ] has already exist in << " + name + " >>") }
        if (!orange.isPluginKey(ns) || new RegExp("\\|" + ns + "\\|").test(existKey)) { orange.LOGGER.throw("[ " + ns + " ] is not a valid keyword") }
    }

    init(name);
})("ns");