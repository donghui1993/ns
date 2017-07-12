/**
 * ns.js is a plugin without any of other modules
 * it is just for namespace organize
 * our aim is easier for javascript package
 * 
 * @author:donghui or called phiz
 * Apache License 2.0
 */
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
                yield|global|root|window|";

    var orange = function (params) {
        Object.defineProperty(this, "pluginCatch", { value: {}, enumerable: true });
        Object.defineProperty(this, "variableCatch", { value: {}, enumerable: true });
        Object.assign(orange.params,params);
        function fn() {
            var args = slice.call(arguments),
                len = args.length,
                last = len - 1,
                first = 0,
                paramEnd = last - 1,
                pluginKey = args[first],
                plugin = args[first + 1],
                params = args[first + 2],
                cover = args[last],
                switchKey = len,
                o = orange

            if (!o.isPluginKey(pluginKey)) {
                o.fn.LOGGER.throw("pluginKey should be string type and not be empty")
            }
            if (len > 1 && !o.isPlugin(plugin)) {
                o.fn.LOGGER.throw("plugin should not be null")
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
            if (switchKey === 1) {
                return this.getVariable(pluginKey);
            }
            return this.setVariable(pluginKey, plugin, params, cover);

        }
        this.fn = fn.bind(this);
        this.fn.extra = function (obj) {
            var o = orange;
            if (!o.isObject(obj)) {
                o.fn.LOGGER.error('param should be an object');
                obj = {}
            }
            for (var key in obj) {
                if (o.isFunction(obj[key]) && !(key in o)) {
                    o.fn[key] = obj[key];
                }
            }
            return this;
        }
        return this.fn;
    }
    orange.params = {loglevel:0};
    orange.slice = slice = Array.prototype.slice;
    orange.splice = Array.prototype.splice;
    orange.isPluginKey = function (o) { return typeof o === 'string' && o.trim() !== ""; }
    orange.isBoolean = function (o) { return typeof o === 'boolean' }
    orange.isFunction = function (o) { return typeof o === 'function'; }
    orange.isObject = function (o) { return typeof o === 'object' && !orange.isArray(o); }
    orange.isArray = function (o) { return o instanceof Array; }
    orange.isPlugin = function (o) { return o != null; }

    orange.fn = orange.prototype = {
        constructor: orange,
        LOGGER: {
            debug: function (msg) { if (orange.params.loglevel < 1) this.log("DEBUG", msg) },
            info: function (msg) { if (orange.params.loglevel < 2) this.log("INFO", msg) },
            warn: function (msg) { if (orange.params.loglevel < 3) this.log("WARN", msg) },
            error: function (msg) { if (orange.params.loglevel < 4) this.log("ERROR", msg) },
            throw: function (msg) { if (orange.params.loglevel < 5) throw Error("[ ERROR ] >>> " + msg); },
            log: function (type, msg) { let _type = type.toLowerCase(); _type = _type == "debug" ? "info" : _type; console[_type || "log"]("[" + type + "]", ">>>", msg); }
        },
        exist: function (pluginKey) { return pluginKey in this.pluginCatch || pluginKey in this.variableCatch; },
        get: function (pluginKey) { return this.getVariable(pluginKey || this._prekey); },
        set: function (plugin, params) { return this.setVariable(this._prekey, plugin, params, true); },
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
                this.LOGGER.error("[ " + pluginKey + " ] should be define");
            }
            return val;
        },
        setVariable: function (pluginKey, plugin, params, cover) {
            if (this.exist(pluginKey) && cover != true) {
                this.LOGGER.throw("[ " + pluginKey + " ] try to set plugin but it is exist and cover is false");
            }
            if (orange.isArray(params)) {
                this.setVariableWithParams(pluginKey, plugin, params, cover);
            }
            else if (orange.isFunction(plugin)) {
                delete this.variableCatch[pluginKey];
                this.pluginCatch[pluginKey] = plugin.bind(this);
            } else {
                delete this.pluginCatch[pluginKey];
                this.variableCatch[pluginKey] = plugin;
            }
            this._prekey = pluginKey;
            return this;
        },
        setVariableWithParams: function (pluginKey, plugin, params, cover) {
            if (orange.isFunction(plugin)) {
                this.LOGGER.debug("execute " + pluginKey)
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
        this[name] = function (ns, args) {
            validKeyword(ns, topKey);
            this[ns] = new orange(args);
        }
    };
    function validKeyword(ns, name) {
        if (this[ns] !== undefined && !(this[ns] instanceof HTMLElement)) { orange.fn.LOGGER.throw("[ " + ns + " ] has already exist in << " + name + " >>") }
        if (!orange.isPluginKey(ns) || new RegExp("\\|" + ns + "\\|").test(existKey)) { orange.fn.LOGGER.throw("[ " + ns + " ] is not a valid keyword") }
    }
    init(name);
})("ns");