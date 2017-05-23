;
(function(name, properties) {
    properties = properties || {};

    var slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        logLevel = getLogLevel(properties),
        LOGGER = {
            info: function(msg) {
                if (logLevel < 1)
                    this.log("INFO", msg)
            },
            debug: function(msg) {
                if (logLevel < 2)
                    this.log("DEBUG", msg)
            },
            error: function(msg) {
                if (logLevel < 3)
                    this.log("ERROR", msg)
            },
            log: function(type, msg) {
                console.log("[" + type + "]", ">>>", msg)
            },
            throw: function(msg) {
                throw Error("[ ERROR ] >>> " + msg);
            }
        },
        orange = function() {

        },
        isArray = function(arraylike) {
            return arraylike instanceof Array;
        },
        isPluginKey = function(pluginKeylike) {
            return typeof pluginKeylike === 'string';
        },
        isPlugin = function(pluginlike) {
            return isObject(pluginlike) || isFn(pluginlike);
        },
        isObject = function(objectlike) {
            return typeof objectlike === 'object' && !isArray(objectlike);
        },
        isFn = function(fnlike) {
            return typeof fnlike === 'function';
        }
        /**
         * 获取日志等级
         * @param  {Object} properties 配置文件
         * @return {Number}            日志等级
         */
    function getLogLevel(properties) {
        let level = ((properties.loglevel || "info") + "").toUpperCase();
        if (level === "DEBUG") {
            return 1;
        }
        if (level === "ERROR") {
            return 2;
        }
        return 0;
    }



    function D(ns) {
        let fn = this.fn = new Function("let _fn= this['" + ns + "'];  return this.calls(_fn,arguments);");
        fn.pluginCatch = {}
        fn.variableCatch = {}
            /**
             * 设置已存在的plugin值，如果不存在就报一个错
             * @param {String} pluginKey 组件名称
             * @param {Object} value     需要赋值的内容
             */
        fn.set = function(pluginKey, value) {
                return this(pluginKey, value, true);
            }
            /**
             * 批量执行一组function
             * @param  {String} pluginKey 需要执行的组件名称
             * @return {Boolean}           执行是否成功
             */
        fn.run = function(pluginKey) {
                var object = this(pluginKey);
                try {
                    if (isObject(object)) {
                        for (var i in object) {
                            if (isFn(object[i])) {
                                object[i]();
                            }
                        }
                    } else if (isArray(object)) {
                        for (var i in object) {
                            object[i]();
                        }
                    } else {
                        return false;
                    }
                } catch (e) {
                    console.error(e);
                    return false;
                }
                return true;
            }
            /**
             * 初始化操作，也是后续的操作基本
             * @return {anything} 根据参数不同得到不同执行结果
             */
        fn.init = function() {
            var args = slice.call(arguments), //参数列表
                len = args.length, //参数长度
                last = len - 1, //最后一位index
                first = 0, //首位index
                paramEnd = last - 1, //参数值末尾index
                pluginKey = args[first], //首位参数：组件名称
                registor = args[first + 1], //第二位参数：组件对象
                params = args[first + 2], //注册的参数列表
                cover = args[last], //覆盖注册
                switchKey = len //选项值





            //如果参数的第三位是boolean类型，并且第四位为undefined
            //则表明第三位应该是cover
            //否则如果单单想传递boolean，则必须表明cover值，或者params为Object对象
            if (len > 2 && cover === undefined && typeof params === 'boolean') {
                cover = params;
                switchKey = 3;
            }

            //调整params
            //如果当前参数列表是数组类型从参数开始位置到paramEnd的位置覆盖
            if (len >= 3) {
                if (typeof cover === 'boolean') {
                    paramEnd -= 1;
                }
                if (isArray(params)) {
                    params.concat(splice.call(args, 3, paramEnd));
                } else {
                    params = splice.call(args, 2, paramEnd);
                }
                switchKey = 4;
            }

            //如果args参数个数为1
            //从已经注册的类组中返回一个plugin
            //如果没有查询到已经存在的plugin，则返回一个错误
            //参数的第一位必须是string类型
            try {
                switch (switchKey) {
                    case 1:
                        return __get_component.call(this, pluginKey);
                    case 2:
                        return __regist_component.call(this, pluginKey, registor);
                    case 3:
                        return __regist_component.call(this, pluginKey, registor, undefined, cover);
                    case 4:
                        return __regist_component.call(this, pluginKey, registor, params, cover);
                    default:
                        LOGGER.throw("arguments error");
                }
            } catch (err) {
                console.error(err);
                return orange;
            }

            function __variable_component(pluginKey, registObject) {
                //TODO
            }
            /**
             * 注册组件列表
             * @param  {string} pluginKey    组件名称
             * @param  {function|object} registObject 需要注册的对象或者函数
             * @param  {object|array|subtype} params  传入组件的初始化参数
             * @param  {boolean} cover        是否覆盖写入
             * @return {function|object}      已经注册成功的function或者object
             */
            function __regist_component(pluginKey, registObject, params, cover) {

                if (!isPluginKey(pluginKey)) {
                    LOGGER.throw("plugin key should be string type");
                }

                var _isPlugin = isPlugin(registObject);
                var _plugin = __get_component.call(this, pluginKey, "must");

                if (cover === true) {
                    LOGGER.info("plugin name [ " + pluginKey + " ]  could be cover");
                }

                if ((cover || _plugin === undefined)) {
                    if (params !== undefined) {
                        if (isFn(registObject)) {
                            _plugin = (registObject).apply(this, params);
                        } else {
                            _plugin = registObject;
                        }
                        _isPlugin = isPlugin(_plugin);
                    } else {
                        _plugin = registObject;
                    }
                } else {
                    LOGGER.throw("plugin name [ " + pluginKey + " ]  has been defined");
                }
                if (_isPlugin) {
                    if (isFn(registObject)) {
                        this.pluginCatch[pluginKey] = _plugin.bind(this);
                    } else {
                        this.pluginCatch[pluginKey] = _plugin;
                    }
                } else {
                    this.variableCatch[pluginKey] = _plugin;
                }

                return _plugin;
            }

            /**
             * 获取已经注册的组件，如果没有值则报错
             * @param  {string} pluginKey 组件key
             * @param  {string} must      如果must=must，总是返回一个值，包括undefined
             * @return {function|object} 组件内容
             */
            function __get_component(pluginKey, must) {
                if (must != "must") {
                    must = false;
                }
                if (typeof pluginKey !== 'string')
                    LOGGER.throw("plugin key should be string type");

                var _plugin = this.pluginCatch[pluginKey] || this.variableCatch[pluginKey];

                if (!must && _plugin === undefined)
                    LOGGER.throw("plugin name [ " + pluginKey + " ] should be regist at first");

                return _plugin;
            }
        }

        return this.fn;
    }

    this["calls"] = function(obj, args) {
        return obj.init.apply(obj, args);
    }

    this[name] = function(ns) {
        try {
            if (this[ns] !== undefined) {
                LOGGER.throw("[ " + ns + " ] has already exist in ns")
            }
        } catch (error) {
            console.error(error);
            return;
        }
        this[ns] = new D(ns);
    }

})('ns');
