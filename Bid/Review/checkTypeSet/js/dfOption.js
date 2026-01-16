(function ( $, window, document) {
    var optionUrl = config.Syshost + '/SysDictController/findOptionsByName.do';	// 获取下拉框

    //获取字典缓存
    var dfOptions;
    var options;
    var customOptions = {};
    var defaultOptions = {
        // 项目类型
        projType: {val:{"0":"无", "1":"融资"}},

        //性别
        sex: {val:{"0":"男","1": "女"}},

        // 审核状态
        auditingState: {val:{"0":"未提交", "1":"审核中", "2":"审核通过", "3":"审核未通过","4":"已撤回"}},

        // 项目状态
        projState: {val:{"0":"未提交", "1":"审核中", "2":"审核通过", "3":"审核未通过","4":"已撤回"}},

        // 标室预约状态
        appointmentState: {val:{"0":"未提交", "1":"审核中", "2":"审核通过", "3":"审核未通过"}},

        //招标方式
        tenderType: {val:{"1":"公开招标", "2":"邀请招标", "9":"其他"}},

        //招标组织形式
        tenderOrgForm: {val:{"1":"自行招标", "2":"委托招标", "9":"其他"}},

        //资格审查方式
        examType:{val:{"1":"资格预审", "2":"资格后审"}},

        //开标方式
        bidOpenMethod:{val:{"1":"线上开标", "2":"线下开标"}},

        //公告性质
        noticeNature:{val:{"1":"正常公告", "2":"更正公告", "3":"重发公告", "9":"其他"}},

        //公告类型
        bulletinType:{val:{"1":"招标公告", "2":"资格预审公告", "3":"中标结果公告", "9":"其他"}},

        //接收状态
        receiveState:{val:{"0":"未接收", "1":"已接收", "2":"拒绝", "3":"驳回"}},

        //招标方式
        tenderMode:{val:{"1":"公开招标", "2":"邀请招标"}},

        //招标组织形式
        tenderOrganizeForm:{val:{"1":"自行招标", "2":"委托招标"}},

        //是否公共资源项目
        isPublicProject:{val:{"0":"否", "1":"是"}},

        //市场类型
        marketType:{val:{"SH":"社会市场", "DF":"内部市场"}},

        //市场类型
        sysType:{val:{"SH":"社会", "DF":"内部", "CA":"长安"}},

        //标室所在区域
        areaCode:{val:{"4206":"襄阳市", "4203":"十堰市", "4201":"武汉市", "6101":"西安市", "1101":"北京市", "1306":"保定市", "4401":"广州市", "5001":"重庆市", "3301":"杭州市", "4101":"郑州市", "5101":"成都市"}},

        //行政监督部门名称
        superviseDeptCode:{optionName:"SUPERVISE_DEPT_CODE"},

        //审核部门名称
        approveDeptCode:{optionName:'APPROVE_DEPT_CODE'},

        //资金来源
        fundSource:{optionName:"MONEY_FROM"},

        //襄樊行政区域
        regionCode:{optionName:"REGION_CODE"},

        //企业类别
        tendererCodeType:{optionName:"TENDERER_CODE_TYPE"},

        //行业分类
        industriesType:{optionName:"INDUSTRIES_TYPE"},

        //招标项目类型
        tenderProjectType:{optionName:"TENDER_PROJECT_TYPE"},
        //不进场招标项目分类
        tenderProjectType0:{optionName:"TENDER_PROJECT_0TYPE"},

        //标段分类
        tenderProjectClassifyCode:{optionName:"TENDER_PROJECT_CLASSIFY_CODE"},

        //不进厂标段分类
        tenderProjectClassifyCode0:{optionName:"TENDER_PROJECT_CLASSIFY_0CODE"},

        //评标办法
        checkTypeA:{optionName:'CHECK_TYPE_A'},
        checkTypeB:{optionName:'CHECK_TYPE_B'},
        checkTypeC:{optionName:'CHECK_TYPE_C'},

        //证件类型
        identityCardType:{optionName:'ID_CARD_TYPE'},

        //保证金收取人
        depositCollect:{optionName:'DEPOSIT_COLLECT'},

        //异议阶段
        objectionType:{val:{"1":"资格预审文件","2":"资格文件开启","3":"资格评审","4":"招标文件","5":"开标","6":"评审","7":"中标候选人公示"}},
//      objectionType:{val:{"1":"资格预审文件","4":"招标文件","5":"开标","7":"中标候选人公示"}},

        //项目类别
        relateCode:{val:{'0':'无','1':'固定资产类项目'}},

        //民族
        nation:{optionName:'NATION'},

        //政治面貌
        politicCountenance:{optionName:'POLITIC_COUNTENANCE'},

        //健康状况
        healthyStatu:{optionName:'HEALTHY_STATU'},

        //学历
        education:{optionName:'EDUCATION'},

        //学位
        academicDegree:{optionName:'ACADEMIC_DEGREE'},

        //职称
        professional:{optionName:'PROFESSIONAL'},

        //职业资格
        qualType:{optionName:'QUAL_TYPE'},

        //经济类型
        economicType:{optionName:'Economic'},

        //金额单位
        regCapCurrency:{optionName:'CURRENCY'},

        //企业行业分类
        industryType1:{optionName:'CATEGORY_CODE_LEVEL1'},
        industryType2:{optionName:'CATEGORY_CODE_LEVEL2'},
        industryType3:{optionName:'CATEGORY_CODE_LEVEL3'},

        //境外企业
        countryRegion:{optionName:'COUNTRY_CODE'},

        //媒体类型
        mediaName:{optionName:'PUBLISH_MEDIA_NAME'},

        //公司类型
        corpType:{optionName:'CORP_TYPE'},

        //项目交易分类
        transactionClass:{optionName:'TRANSACTION_CLASS'},

        //标段状态 0.编辑  1.生效 2.撤回 3.招标完成 4.流标 5.重新招标 6.终止 7.暂停 8.暂停审核中 9.恢复审核中
        bidStates: {val:{"0":"编辑","1":"生效","2":"撤回","3":"招标完成","4":"流标","5":"重新招标","6":"终止","7":"暂停","8":"暂停审核中","9":"恢复审核中"}, isCustom:true},
    };

    //如果可以获取到顶层窗口则使用顶层窗口
    try{
        if(window.top.dfOptions){
            options = window.top.dfOptions;
        }else{
            window.top.dfOptions = defaultOptions;
            options = defaultOptions;
        }
    }catch (e) {
        options = defaultOptions;
    }

    /**
     * 获取下拉框的值
     * @param name
     * @returns {*}
     */
    function getOptionValues(name){
        return getOptions(name).val;
    }

    //下拉框反显
    function getOptions(name){
        if(customOptions && customOptions[name] && customOptions[name].val){
            return customOptions[name];
        }else if(!options[name].val){
            $.ajax({
                type:"post",
                url:optionUrl,
                async:false,
                data:{"optionName":options[name].optionName},
                success: function(data){
                    if(data.success){
                        if(data.data){
                            //optionValue ： optionText
                            options[name].val={};
                            //id主键key的数据
                            options[name].sourceData = {};
                            //optionValue为KEY的数据
                            options[name].valMap = {};
                            //树数据
                            options[name].tree = [];

                            for(var i in data.data){
                                if(data.data[i].optionValue){
                                    var key = data.data[i].optionValue +"";
                                    options[name].val[key] = data.data[i].optionText
                                    options[name].sourceData[data.data[i].id] = data.data[i];
                                    options[name].valMap[key] = data.data[i];
                                    data.data[i].sub=[];
                                    if(!data.data[i].pid || data.data[i].pid == '0'){
                                        options[name].tree.push(data.data[i]);
                                    }
                                }
                            }

                            for (var i in options[name].sourceData) {
                                var opt = options[name].sourceData[i];
                                var pid = options[name].sourceData[i].pid;
                                if(pid && pid != '0'){
                                    options[name].sourceData[pid].sub.push(opt);
                                }
                            }
                        }
                    }
                }
            })
        }
        return options[name];
    }

    /*
     * 获取option值对应的描述
     * name: 下拉框的名称
     * val:字段的值
     * isMult:是否多级联动
    */
    function getOptionText(name, val, multistage){
        var text = "";
        if(options[name]||customOptions[name]){
            if(val){
                if(multistage){//多级联动显示父级
                    var data = getMultOptionValue(name,val);
                    for (var i = 0; i < data.length; i++) {
                        if(text){
                            text = text +"-"+ data[i].optionText;
                        }else{
                            text =  data[i].optionText;
                        }
                    }
                }else{
                    var optionValues = getOptionValues(name);
                    text = optionValues[val];
                }

            }
        }else{
            alert("温馨提示：请配置字典信息."+name);
        }
        return text;
    }

    /*
     * 获取option值对应的描述
     * name: 下拉框的名称
     * val:字段的值
     * isMult:是否多级联动
    */
    function getMultOptionValue(name, val){
        var vals = [];
        var data = getOptions(name);
        var currOpt = data.valMap[val];
        while (currOpt){

            vals.unshift(currOpt);
            var pid = currOpt.pid;
            if(pid && pid != '0'){
                currOpt =  data.sourceData[pid];
                if(currOpt == null){
                    break;
                }
            }else{
                break;
            }
        }

        return vals;
    }


    function multSelect(obj,val,multistage){
        var optionName = obj.attr("optionName");
        var name = obj.attr("name");
        var calssName = obj.attr("class");
        //验证
        var datatype = obj.attr("datatype");
        var errormsg = obj.attr("errormsg");
        var id = name + new Date().getTime();
        var warp = $('<span id="'+id+'" class="select_'+name+'"></span>');
        obj.after(warp);
        var hidObj = $('<input type="hidden" value="'+(val || val == 0?val:"")+'" name="'+name+'" '+(datatype?'datatype="'+datatype+'"':'')+(errormsg?'errormsg="'+errormsg+'"':'')+'>');
        warp.append(hidObj);
        var html = '';(datatype?'datatype="'+datatype+'"':'')
        var selects=[];
        var data = getMultOptionValue(optionName,val);
        if(val){
            for (var i = 0; i < multistage; i++) {
                selects.push(name+i);
                if(data.length > i){
                    html += '<select class="'+(name+i)+' form-control select" data-value="'+data[i].optionValue+'"></select>';
                }else{
                    html += '<select class="'+(name+i)+' form-control select" ></select>';
                }

            }
        }else{
            for (var i = 0; i < multistage; i++) {
                selects.push(name+i);
                html += '<select class="'+(name+i)+' form-control select"></select>';
            }
        }
        warp.append(html);
        var treeData = getOptions(optionName).tree;
        $('#'+id).cxSelect({
            selects: selects,
            data:treeData,
            emptyStyle:'none',
            //required: true,
            jsonName: 'optionText',
            jsonValue: 'optionValue',
            jsonSub: 'sub'
        });

        $('#'+id).on('change', 'select', function(event){
            hidObj.val($(event.target).val());
        });

        obj.remove();
    }

    function select(obj,val){

        //多级联动
        var multistage = obj.attr("multistage");
        if(multistage){
            multSelect(obj,val,multistage);
        }else{
            var optionName = obj.attr("optionName");
            var name = obj.attr("name");
            var calssName = obj.attr("class");
            var eleStyle = obj.attr("style");
            //验证
            var datatype = obj.attr("datatype");
            var errormsg = obj.attr("errormsg");

            var options = getOptionValues(optionName);
            var  optionHtml = '<select class="'+calssName+'" style="'+eleStyle+'" name="'+name+'" '+(datatype?'datatype="'+datatype+'"':'')+(errormsg?'errormsg="'+errormsg+'"':'')+'>';
            if(options){
                var selected = "";
                for(var i in options){
                    if(val == i){
                        selected = 'selected';
                    } else {
                        selected = "";
                    }
                    optionHtml += '<option ' + selected + ' value="'+i+'">' + options[i] + '</option>';
                }

                optionHtml += '</select>';
                obj.after(optionHtml);
                obj.remove();
            }
        }

    }

    function radio(obj, val){

    }

    function view(obj, val){
        //多级联动
        var multistage = obj.attr("multistage");
        var calssName = obj.attr("class");
        var optionName = obj.attr("optionName");
        obj.after('<span class="'+calssName+'">'+getOptionText(optionName, val, multistage)+'</span>');
        obj.remove();
    }

    $.fn.options = function (setting) {
        var defaultSetting = {}
        if(setting){
            setting = $.extend(defaultSetting,setting);

            if(setting.options){
                customOptions = setting.options ;
            }
        }

        this.each(function () {
            var that = $(this);
            var optionType = that.attr("optionType");
            var optionValue = that.attr("optionValue");
            var isShowOption = that.attr("isShowOption");

            if(isShowOption){
                view(that,  optionValue);
            }else if(optionType == "select"){//下拉框
                select(that, optionValue);
            }else if(optionType == "radio"){//单选框
                radio(that, optionValue);
            }
        });
    };

    window.getOptionText = getOptionText;


}(jQuery, window, document));

/*!
* jQuery cxSelect
* @name jquery.cxselect.js
* @version 1.4.2
* @date 2017-09-26
* @author ciaoca
* @email ciaoca@gmail.com
* @site https://github.com/ciaoca/cxSelect
* @license Released under the MIT license
*/
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(window.jQuery || window.Zepto || window.$);
    };
}(function($) {
    var cxSelect = function() {
        var self = this;
        var dom, settings, callback;

        // 分配参数
        for (var i = 0, l = arguments.length; i < l; i++) {
            if (cxSelect.isJquery(arguments[i]) || cxSelect.isZepto(arguments[i])) {
                dom = arguments[i];
            } else if (cxSelect.isElement(arguments[i])) {
                dom = $(arguments[i]);
            } else if (typeof arguments[i] === 'function') {
                callback = arguments[i];
            } else if (typeof arguments[i] === 'object') {
                settings = arguments[i];
            };
        };

        var api = new cxSelect.init(dom, settings);

        if (typeof callback === 'function') {
            callback(api);
        };

        return api;
    };

    cxSelect.isElement = function(o){
        if (o && (typeof HTMLElement === 'function' || typeof HTMLElement === 'object') && o instanceof HTMLElement) {
            return true;
        } else {
            return (o && o.nodeType && o.nodeType === 1) ? true : false;
        };
    };

    cxSelect.isJquery = function(o){
        return (o && o.length && (typeof jQuery === 'function' || typeof jQuery === 'object') && o instanceof jQuery) ? true : false;
    };

    cxSelect.isZepto = function(o){
        return (o && o.length && (typeof Zepto === 'function' || typeof Zepto === 'object') && Zepto.zepto.isZ(o)) ? true : false;
    };

    cxSelect.getIndex = function(n, required) {
        return required ? n : n - 1;
    };

    cxSelect.getData = function(data, space) {
        if (typeof space === 'string' && space.length) {
            space = space.split('.');
            for (var i = 0, l = space.length; i < l; i++) {
                data = data[space[i]];
            };
        };
        return data;
    };

    cxSelect.init = function(dom, settings) {
        var self = this;

        if (!cxSelect.isJquery(dom) && !cxSelect.isZepto(dom)) {return};

        var theSelect = {
            dom: {
                box: dom
            }
        };

        self.attach = cxSelect.attach.bind(theSelect);
        self.detach = cxSelect.detach.bind(theSelect);
        self.setOptions = cxSelect.setOptions.bind(theSelect);
        self.clear = cxSelect.clear.bind(theSelect);

        theSelect.changeEvent = function() {
            cxSelect.selectChange.call(theSelect, this.className);
        };

        theSelect.settings = $.extend({}, $.cxSelect.defaults, settings, {
            url: theSelect.dom.box.data('url'),
            emptyStyle: theSelect.dom.box.data('emptyStyle'),
            required: theSelect.dom.box.data('required'),
            firstTitle: theSelect.dom.box.data('firstTitle'),
            firstValue: theSelect.dom.box.data('firstValue'),
            jsonSpace: theSelect.dom.box.data('jsonSpace'),
            jsonName: theSelect.dom.box.data('jsonName'),
            jsonValue: theSelect.dom.box.data('jsonValue'),
            jsonSub: theSelect.dom.box.data('jsonSub')
        });

        var _dataSelects = theSelect.dom.box.data('selects');

        if (typeof _dataSelects === 'string' && _dataSelects.length) {
            theSelect.settings.selects = _dataSelects.split(',');
        };

        self.setOptions();
        self.attach();

        // 使用独立接口获取数据
        if (!theSelect.settings.url && !theSelect.settings.data) {
            cxSelect.start.apply(theSelect);

            // 设置自定义数据
        } else if ($.isArray(theSelect.settings.data)) {
            cxSelect.start.call(theSelect, theSelect.settings.data);

            // 设置 URL，通过 Ajax 获取数据
        } else if (typeof theSelect.settings.url === 'string' && theSelect.settings.url.length) {
            $.getJSON(theSelect.settings.url, function(json) {
                cxSelect.start.call(theSelect, json);
            });
        };
    };

    // 设置参数
    cxSelect.setOptions = function(opts) {
        var self = this;

        if (opts) {
            $.extend(self.settings, opts);
        };

        // 初次或重设选择器组
        if (!$.isArray(self.selectArray) || !self.selectArray.length || (opts && opts.selects)) {
            self.selectArray = [];

            if ($.isArray(self.settings.selects) && self.settings.selects.length) {
                var _tempSelect;

                for (var i = 0, l = self.settings.selects.length; i < l; i++) {
                    _tempSelect = self.dom.box.find('select.' + self.settings.selects[i]);

                    if (!_tempSelect || !_tempSelect.length) {break};

                    self.selectArray.push(_tempSelect);
                };
            };
        };

        if (opts) {
            if (!$.isArray(opts.data) && typeof opts.url === 'string' && opts.url.length) {
                $.getJSON(self.settings.url, function(json) {
                    cxSelect.start.call(self, json);
                });

            } else {
                cxSelect.start.call(self, opts.data);
            };
        };
    };

    // 绑定
    cxSelect.attach = function() {
        var self = this;

        if (!self.attachStatus) {
            self.dom.box.on('change', 'select', self.changeEvent);
        };

        if (typeof self.attachStatus === 'boolean') {
            cxSelect.start.call(self);
        };

        self.attachStatus = true;
    };

    // 移除绑定
    cxSelect.detach = function() {
        var self = this;
        self.dom.box.off('change', 'select', self.changeEvent);
        self.attachStatus = false;
    };

    // 清空选项
    cxSelect.clear = function(index) {
        var self = this;
        var _style = {
            display: '',
            visibility: ''
        };

        index = isNaN(index) ? 0 : index;

        // 清空后面的 select
        for (var i = index, l = self.selectArray.length; i < l; i++) {
            self.selectArray[i].empty().prop('disabled', true);

            if (self.settings.emptyStyle === 'none') {
                _style.display = 'none';
            } else if (self.settings.emptyStyle === 'hidden') {
                _style.visibility = 'hidden';
            };

            self.selectArray[i].css(_style);
        };
        $(self.selectArray[index]).closest('td').find('.test_tips').css('display','none');
    };

    cxSelect.start = function(data) {
        var self = this;

        if ($.isArray(data)) {
            self.settings.data = cxSelect.getData(data, self.settings.jsonSpace);
        };

        if (!self.selectArray.length) {return};

        // 保存默认值
        for (var i = 0, l = self.selectArray.length; i < l; i++) {
            if (typeof self.selectArray[i].attr('data-value') !== 'string' && self.selectArray[i][0].options.length) {
                self.selectArray[i].attr('data-value', self.selectArray[i].val());
            };
        };

        if (self.settings.data || (typeof self.selectArray[0].data('url') === 'string' && self.selectArray[0].data('url').length)) {
            cxSelect.getOptionData.call(self, 0);
        } else if (self.selectArray[0][0].options.length && typeof self.selectArray[0].attr('data-value') === 'string' && self.selectArray[0].attr('data-value').length) {
            self.selectArray[0].val(self.selectArray[0].attr('data-value'));
            cxSelect.getOptionData.call(self, 1);
        } else {
            self.selectArray[0].prop('disabled', false).css({
                'display': '',
                'visibility': ''
            });
        };
    };

    // 获取选项数据
    cxSelect.getOptionData = function(index) {
        var self = this;

        if (typeof index !== 'number' || isNaN(index) || index < 0 || index >= self.selectArray.length) {return};

        var _indexPrev = index - 1;
        var _select = self.selectArray[index];
        var _selectData;
        var _valueIndex;
        var _dataUrl = _select.data('url');
        var _jsonSpace = typeof _select.data('jsonSpace') === 'undefined' ? self.settings.jsonSpace : _select.data('jsonSpace');
        var _query = {};
        var _queryName;
        var _selectName;
        var _selectValue;

        cxSelect.clear.call(self, index);

        // 使用独立接口
        if (typeof _dataUrl === 'string' && _dataUrl.length) {
            if (index > 0) {
                for (var i = 0, j = 1; i < index; i++, j++) {
                    _queryName = self.selectArray[j].data('queryName');
                    _selectName = self.selectArray[i].attr('name');
                    _selectValue = self.selectArray[i].val();

                    if (typeof _queryName === 'string' && _queryName.length) {
                        _query[_queryName] = _selectValue;
                    } else if (typeof _selectName === 'string' && _selectName.length) {
                        _query[_selectName] = _selectValue;
                    };
                };
            };

            $.getJSON(_dataUrl, _query, function(json) {
                _selectData = cxSelect.getData(json, _jsonSpace);

                cxSelect.buildOption.call(self, index, _selectData);
            });

            // 使用整合数据
        } else if (self.settings.data && typeof self.settings.data === 'object') {
            _selectData = self.settings.data;

            for (var i = 0; i < index; i++) {
                _valueIndex = cxSelect.getIndex(self.selectArray[i][0].selectedIndex, typeof self.selectArray[i].data('required') === 'boolean' ? self.selectArray[i].data('required') : self.settings.required);

                if (typeof _selectData[_valueIndex] === 'object' && $.isArray(_selectData[_valueIndex][self.settings.jsonSub]) && _selectData[_valueIndex][self.settings.jsonSub].length) {
                    _selectData = _selectData[_valueIndex][self.settings.jsonSub];
                } else {
                    _selectData = null;
                    break;
                };
            };

            cxSelect.buildOption.call(self, index, _selectData);
        };
    };

    // 构建选项列表
    cxSelect.buildOption = function(index, data) {
        var self = this;

        var _select = self.selectArray[index];
        var _required = typeof _select.data('required') === 'boolean' ? _select.data('required') : self.settings.required;
        var _firstTitle = typeof _select.data('firstTitle') === 'undefined' ? self.settings.firstTitle : _select.data('firstTitle');
        var _firstValue = typeof _select.data('firstValue') === 'undefined' ? self.settings.firstValue : _select.data('firstValue');
        var _jsonName = typeof _select.data('jsonName') === 'undefined' ? self.settings.jsonName : _select.data('jsonName');
        var _jsonValue = typeof _select.data('jsonValue') === 'undefined' ? self.settings.jsonValue : _select.data('jsonValue');

        if (!$.isArray(data)) {return};

        var _html = !_required ? '<option value="' + String(_firstValue) + '">' + String(_firstTitle) + '</option>' : '';

        // 区分标题、值的数据
        if (typeof _jsonName === 'string' && _jsonName.length) {
            // 无值字段时使用标题作为值
            if (typeof _jsonValue !== 'string' || !_jsonValue.length) {
                _jsonValue = _jsonName;
            };

            for (var i = 0, l = data.length; i < l; i++) {
                _html += '<option value="' + String(data[i][_jsonValue]) + '">' + String(data[i][_jsonName]) + '</option>';
            };

            // 数组即为值的数据
        } else {
            for (var i = 0, l = data.length; i < l; i++) {
                _html += '<option value="' + String(data[i]) + '">' + String(data[i]) + '</option>';
            };
        };

        _select.html(_html).prop('disabled', false).css({
            'display': '',
            'visibility': ''
        });

        // 初次加载设置默认值
        if (typeof _select.attr('data-value') === 'string') {
            _select.val(String(_select.attr('data-value'))).removeAttr('data-value');

            if (_select[0].selectedIndex < 0) {
                _select[0].options[0].selected = true;
            };
        };

        if (_required || _select[0].selectedIndex > 0) {
            _select.trigger('change');
        };

    };

    // 改变选择时的处理
    cxSelect.selectChange = function(name) {
        var self = this;

        if (typeof name !== 'string' || !name.length) {return};

        var index;

        name = name.replace(/\s+/g, ',');
        name = ',' + name + ',';

        // 获取当前 select 位置
        for (var i = 0, l = self.selectArray.length; i < l; i++) {
            if (name.indexOf(',' + self.settings.selects[i] + ',') > -1) {
                index = i;
                break;
            };
        };

        if (typeof index === 'number' && index > -1) {
            index += 1;
            cxSelect.getOptionData.call(self, index);
        };
    };

    $.cxSelect = function() {
        return cxSelect.apply(this, arguments);
    };

    // 默认值
    $.cxSelect.defaults = {
        selects: [],            // 下拉选框组
        url: null,              // 列表数据文件路径（URL）或数组数据
        data: null,             // 自定义数据
        emptyStyle: null,       // 无数据状态显示方式
        required: false,        // 是否为必选
        firstTitle: '请选择',    // 第一个选项的标题
        firstValue: '',         // 第一个选项的值
        jsonSpace: '',          // 数据命名空间
        jsonName: 'n',          // 数据标题字段名称
        jsonValue: '',          // 数据值字段名称
        jsonSub: 's'            // 子集数据字段名称
    };

    $.fn.cxSelect = function(settings, callback) {
        this.each(function(i) {
            $.cxSelect(this, settings, callback);
        });
        return this;
    };
}));

