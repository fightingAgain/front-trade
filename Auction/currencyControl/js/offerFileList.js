/*=======报价文件目录的封装js===== 
*========== JIN ===========
*====== 2020-05-07 ========
*/
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        saveurl: config.AuctionHost + '/offerPriceFile/receiveDataList.do',//保存接口
        viewURL: config.AuctionHost + '/offerPriceFile/queryDataList.do',//回显接口
        deleteUrl: '',//删除接口
        offerInfoUrl: '',//报价详情的接口
        downloadUrl: config.FileHost + "/FileController/download.do",//下载接口
        isRecord: true,   //是否显示列表
        Token: $.getToken(),
        parameter: {},//接口调用的基本参数
        status: 1,   //1是编辑，2是查看
        isDefaultData: 1,//1为存在一条默认数据，2为不存在
        custom: true,//是否自定义表格
        headerBtn: 'addOffer',//自定义添加按钮名称
        offerSubmit: 'offerBtn',
        tableName: 'offerfTable',
        copyBtn: 'copy',
        customModal: true,//是否自定义弹出框
        isDoubleEnvelope: 0,//0不是双信封，1是双信封   
        isDarkMark: 0,//0不是暗标，1是暗标 
        isShow: 1,//是否上传分项报价表，0是1否  
        attachmentState: 2,   //1调用接口添加到数据库中，2是添加到数组中
        attachmentData: [], //报价表数组
        formatterAttachment: null,
        hideColumn: [],
        offerData: new Array(),
        fileinput: {
            language: 'zh', //设置语言
            uploadAsync: false,
            uploadUrl: config.FileHost + "/FileController/uploadBatch.do",		//H5上传地址
            autoReplace: false,
            allowedFileExtensions: ['zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'ZIP', 'RAR', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PDF', 'pdf'], //接收的文件后缀
            showUpload: false, //是否显示上传按钮
            showCaption: false, //是否显示标题
            //showCaption: true, //是否显示标题
            dropZoneEnabled: false, //是否显示拖拽区域
            maxFileCount: 1,
            showPreview: false,
            showRemove: false,
            layoutTemplates: {
                actionDelete: "",
                actionUpload: ""
            },
        },
        columns: [
            {
                field: 'xh',
                title: '序号',
                align: 'center',
                width: '50px',
                formatter: function (value, row, index) {
                    return index + 1;  //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
                }
            }
        ],
    };
    function OfferFileList($ele, options) {
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});
        this.topSite = $ele.scrollTop();
        this.init();
    }
    OfferFileList.prototype = {
        constructor: OfferFileList,
        init: function () {
            if (this.$ele.parent()) {//如果有父级去清除父级的内边距；
                this.$ele.parent().css('padding', '0px');
            }
            this.viewAjax();//获取列表信息

            this.renderHtml();//渲染页面 

            // this.offerSubmit();//初始化提交事件    
        },
        renderHtml: function () {
            var options = this.options;
            var _that = this;
            var data = options.attachmentData;
            var column = new Array();
            column = column.concat(options.columns);
            if (options.isDoubleEnvelope == 1) {
                column.push(
                    {
                        field: 'doubleEnvelope',
                        title: '双信封',
                        align: 'center',
                        width: '180px',
                        events: {
                            'change .doubleEnvelope': function (e, value, row, index) {
                                _that.isBlur('doubleEnvelope', index, $(this).val())
                            }
                        },
                        formatter: function (value, row, index) {
                            if (options.status == 1) {
                                if (value) {
                                    var str = '<input type="radio" name="offerPriceFiles[' + index + '].doubleEnvelope" class="doubleEnvelope" value="1" ' + (value == 1 ? 'checked' : '') + '/>第一信封'
                                        + '<input type="radio" name="offerPriceFiles[' + index + '].doubleEnvelope" class="doubleEnvelope" value="2" ' + (value == 2 ? 'checked' : '') + '/>第二信封';
                                } else {
                                    var str = '<input type="radio" name="offerPriceFiles[' + index + '].doubleEnvelope" class="doubleEnvelope" value="1" checked/>第一信封'
                                        + '<input type="radio" name="offerPriceFiles[' + index + '].doubleEnvelope" class="doubleEnvelope" value="2" ' + (value == 2 ? 'checked' : '') + '/>第二信封';
                                }

                            } else {
                                var str = (row.doubleEnvelope == 1 ? '第一信封' : '第二信封');
                            }
                            return str
                        }
                    }
                )
            }
            column.push(
                {
                    field: 'bidFileName',
                    title: '报价文件名称',
                    align: 'center',
                    width: '150px',
                    events: {
                        'change .bidFileName': function (e, value, row, index) {
                            _that.isBlur('bidFileName', index, $(this).val(), '150', '报价文件名称')
                        }
                    },
                    formatter: function (value, row, index) {
                        if (options.status == 1) {
                            var str = '<input type="text" name="offerPriceFiles[' + index + '].bidFileName" class="bidFileName form-control" value="' + (value || '') + '" />';
                        } else {
                            var str = row.bidFileName;
                        }
                        return str
                    }
                }
            )
            column.push(
                {
                    field: 'mustUpload',
                    title: '必须上传',
                    align: 'center',
                    width: '80px',
                    visible: !(Array.isArray(options.hideColumn) && options.hideColumn.indexOf('mustUpload') > -1),
                    events: {
                        'change .mustUpload': function (e, value, row, index) {
                            if (this.checked) {
                                _that.isBlur('mustUpload', index, 1)
                            } else {
                                _that.isBlur('mustUpload', index, 0)
                            }

                        }
                    },
                    formatter: function (value, row, index) {
                        if (options.status == 1) {
                            var str = '<input type="checkbox" name="offerPriceFiles[' + index + '].mustUpload" class="mustUpload" value="1" ' + (value == 1 ? 'checked' : '') + '/>';
                        } else {
                            var str = (row.mustUpload == 1 ? '是' : '否');
                        }
                        return str
                    }
                }
            )
            if (options.isDarkMark == 1) {
                column.push(
                    {
                        field: 'darkMark',
                        title: '暗标',
                        align: 'center',
                        width: '80px',
                        events: {
                            'change .darkMark': function (e, value, row, index) {
                                if (this.checked) {
                                    _that.isBlur('darkMark', index, 1)
                                } else {
                                    _that.isBlur('darkMark', index, 0)
                                }

                            }
                        },
                        formatter: function (value, row, index) {
                            if (options.status == 1) {
                                var str = '<input type="checkbox" name="offerPriceFiles[' + index + '].darkMark" class="darkMark" value="1" ' + (value == 1 ? 'checked' : '') + '/>';
                            } else {
                                var str = (row.darkMark == 1 ? '是' : '否');
                            }
                            return str
                        }
                    }
                )
            }
            column.push(
                {
                    field: 'filePath',
                    title: '文件模板',
                    align: 'left',
                    width: '150',
                    events: {
                        //调用下载
                        'click .download': function (e, value, row, index) {
                            var filesnames = row.tempOfferFile.fileName.substring(row.tempOfferFile.fileName.lastIndexOf(".") + 1);
                            window.location.href = $.parserUrlForToken(options.downloadUrl + '?ftpPath=' + row.tempOfferFile.filePath + '&fname=' + row.bidFileName.replace(/\s+/g, "") + '_模板_' + row.tempOfferFile.fileName)
                        },
                        //调用删除
                        'click .deleteFile': function (e, value, row, index) {
                            _that.deleteFile(row.id, index)
                        },
                    },
                    formatter: function (value, row, index) {
                        var html = [];
                        if (row.tempOfferFile && row.tempOfferFile.filePath) {
                            html.push('<span>' + row.tempOfferFile.fileName + '(' + row.tempOfferFile.fileSize + ')</span>');
                            html.push('<button type="button" class="btn btn-xs btn-default download"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>下载</button>');
                            if (options.status == 1) {
                                html.push('<button type="button" class="btn btn-xs btn-danger deleteFile"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>');
                            }
                        } else {
                            if (options.status == 1) {
                                html.push('<input type="file" class="fileloading" name="files" id="saveFile' + index + '" value="选择" accept=".xlsx,.XLSX,.xls,.XLS,.doc,.DOC,.docx,.DOCX,.zip,.ZIP,.rar,.RAR">');

                            }
                        }
                        return html.join("")
                    }
                }
            );
            if (options.status == 3 || options.status == 4) {
                column.push(
                    {
                        field: 'files',
                        title: '报价文件' + (options.status == 3 ? '<span class="red">(注：请上传文档、表格和压缩文件)</span>' : ''),
                        align: 'left',
                        width: '150',
                        events: {
                            //调用下载
                            'click .download': function (e, value, row, index) {
                                var filesnames = row.offerData.fileName.substring(row.offerData.fileName.lastIndexOf(".") + 1);

                                window.location.href = $.parserUrlForToken(options.downloadUrl + '?ftpPath=' + row.offerData.filePath + '&fname=' + row.bidFileName.replace(/\s+/g, "") + '.' + filesnames)
                            },
                            //调用删除
                            'click .deleteFile': function (e, value, row, index) {
                                _that.deleteFile(row.id, index)
                            },
                        },
                        formatter: function (value, row, index) {
                            var html = [];
                            var offerData = _that.options.offerData
                            for (var i = 0; i < offerData.length; i++) {
                                if (offerData[i].packageCheckListId == row.id) {
                                    row.offerData = offerData[i];
                                }
                            }
                            if (row.offerData && row.offerData.filePath) {
                                html.push('<span>' + row.offerData.fileName + '(' + row.offerData.fileSize + ')</span>');
                                html.push('<button type="button" class="btn btn-xs btn-default download"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>下载</button>');
                                if (options.status == 3) {
                                    html.push('<button type="button" class="btn btn-xs btn-danger deleteFile"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>');
                                }
                                if (options.isShow != 1) {
                                    html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].projectId" value="' + row.projectId + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].packageId" value="' + row.packageId + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].packageCheckListId" value="' + row.id + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].examType" value="1"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].fileName" value="' + row.offerData.fileName + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].filePath" value="' + row.offerData.filePath + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].fileSize" value="' + row.offerData.fileSize + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].subDate" value="' + row.offerData.subDate + '"/>')
                                    html.push('<input type="hidden" class="fileState" name="offerFileList[' + (index + 1) + '].fileState" value="' + row.offerData.fileState + '"/>')
                                } else {
                                    html.push('<input type="hidden" name="offerFileList[' + index + '].projectId" value="' + row.projectId + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + index + '].packageId" value="' + row.packageId + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + index + '].packageCheckListId" value="' + row.id + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + index + '].examType" value="1"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + index + '].fileName" value="' + row.offerData.fileName + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + index + '].filePath" value="' + row.offerData.filePath + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + index + '].fileSize" value="' + row.offerData.fileSize + '"/>')
                                    html.push('<input type="hidden" name="offerFileList[' + index + '].subDate" value="' + row.offerData.subDate + '"/>')
                                    html.push('<input type="hidden" class="fileState" name="offerFileList[' + index + '].fileState" value="' + row.offerData.fileState + '"/>')
                                }
                            } else {
                                if (options.status == 3) {
                                    html.push('<input type="file" class="fileloading" name="files" id="saveFile' + index + '" value="选择"  accept=".xlsx,.XLSX,.xls,.XLS,.doc,.DOC,.docx,.DOCX,.zip,.ZIP,.rar,.RAR,.pdf,.PDF">');

                                    if (row.mustUpload == 1) {
                                        if (options.isShow != 1) {
                                            html.push('<input type="hidden" name="offerFileList[' + (index + 1) + '].filePath" datatype="*" errormsg="报价文件目录第 ' + (index + 1) + ' 行，未上传附件，请上传"/>')
                                        } else {
                                            html.push('<input type="hidden" name="offerFileList[' + index + '].filePath" datatype="*" errormsg="报价文件目录第 ' + (index + 1) + ' 行，未上传附件，请上传"/>')
                                        }

                                    }

                                    html.push('<p style="color:red; font-size: 18px; font-weight: bold;"><strong>温馨提示：</strong>请确认响应文件中是否已按采购文件格式要求完成盖章及签字。</p>')
                                }
                            }
                            return html.join("")
                        }
                    }
                );
            }
            if (options.status == 1) {
                column.push(
                    {
                        field: '',
                        title: '操作',
                        align: 'left',
                        width: '180',
                        events: {
                            //调用删除功能
                            'click .deleteAjax': function (e, value, row, index) {
                                _that.deleteAjax(row.id, index)
                            },
                            //调用删除功能
                            'click .MoveUpward': function (e, value, row, index) {
                                _that.MoveUpward(row.id, index)
                            },
                            //调用删除功能
                            'click .MoveDown': function (e, value, row, index) {
                                _that.MoveDown(row.id, index)
                            },
                        },
                        formatter: function (value, row, index) {
                            var html = [];
                            html.push('<button type="button" class="btn btn-xs btn-danger deleteAjax" data-id="' + row.id + '" data-index="' + index + '"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>');
                            html.push('<button type="button" class="btn btn-xs btn-default MoveUpward" data-id="' + row.id + '" data-index="' + index + '"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>上移</button>');
                            html.push('<button type="button" class="btn btn-xs btn-default MoveDown" data-id="' + row.id + '" data-index="' + index + '"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>下移</button>');
                            return html.join("")
                        }
                    }
                )
            }
            if (!options.custom) {
                _that.$ele.bootstrapTable({
                    columns: column
                });
                _that.$ele.bootstrapTable("load", data);
            } else {
                var html = [];
                html.push('<table class="table table-bordered" style="margin-bottom: 0px;">')
                html.push('<tr>')
                if (options.status == 1) {
                    html.push('<td class="active"><strong>报价文件目录</strong></td>')
                    html.push('<td colspan="3" style="text-align: right;" class="active">')
                    html.push('<input type="button" class="btn btn-sm btn-primary" value="添加" id="' + options.headerBtn + '"/>')
                    html.push('<input type="button" class="btn btn-sm btn-primary" value="评审节点拷贝添加" id="' + options.copyBtn + '"/>')
                    html.push('</td>')
                } else {
                    html.push('<td colspan="4" class="active"><strong>报价文件目录</strong></td>')
                }
                html.push('</tr>')
                if (options.status == 3) {
                    html.push('<tr><td ><span style="float:left;color: red;">提醒：请按每行报价文件模板要求分别上传对应文件，不要将其他文件打包上传</span></td></tr>')
                }
                html.push('<tr>')
                html.push('<td colspan="4">')
                html.push('<table class="table  table-bordered" style="margin-bottom:5px ;" id="' + options.tableName + '"></table>')
                if (options.isDarkMark == 1 && options.status == 3) {
                    html.push('<span class="text-danger"> 暗标文件在任何情况下，不得出现供应商的名称和其它可识别供应商身份的字符、徽标、人员名称等</span> ')
                }
                html.push('</td>')
                html.push('</tr>')
                html.push('</table>')
                _that.$ele.html(html.join(""))
                $("#" + options.tableName).bootstrapTable({
                    columns: column
                });
                $("#" + options.tableName).bootstrapTable("load", data);
            }
            if (_that.topSite) {
                _that.$ele.scrollTop(_that.topSite);
            }
            var _data = options.attachmentData;
            if (options.status == 1 || options.status == 3) {
                for (var i = 0; i < _data.length; i++) {
                    if (!_data[i].filePath) {
                        this.fileOption(i);
                    }
                };
            }
            //添加
            $('#' + options.headerBtn).on('click', function () {
                _that.addAjax()
            })
            //评审节点拷贝添加
            $('#' + options.copyBtn).on('click', function () {
                if (packageCheckListInfo.length == 0) {
                    parent.layer.alert('温馨提示：无评审节点拷贝');
                    return;
                }
                parent.layer.confirm('温馨提示：评审节点拷贝将替换已有的报价文件目录，是否确定拷贝？', {
                    btn: ['是', '否'] //可以无限个按钮
                }, function (index, layero) {
                    _that.options.attachmentData = [];
                    _that.copy()
                    parent.layer.close(index);
                }, function (index) {
                    parent.layer.close(index)
                });

            })

        },
        //添加报价表
        addAjax: function (_dataName, _index, _data) {
            var that = this;

            var data = new Object();
            for (var key in that.options.parameter) {
                data[key] = that.options.parameter[key]
            }
            data.mustUpload = 1;//默认不是必须上传
            if (that.options.isDoubleEnvelope == 1) {
                data.doubleEnvelope = 1
            }
            data.darkMark = 0;//默认不是暗标

            data.orders = that.options.attachmentData.length;
            that.options.attachmentData.push(data);
            that.renderHtml();
        },
        //查看报价表
        viewAjax: function () {
            var that = this;
            $.ajax({
                type: "post",
                url: that.options.viewURL,
                async: false,
                data: that.options.parameter,
                dataType: "json",
                success: function (response) {
                    if (response.success) {
                        if (response.data) {
                            if ($.isFunction(that.options.formatterAttachment)) {
                                that.options.attachmentData = that.options.formatterAttachment(response.data.offerPriceFiles);
                            } else {
                                that.options.attachmentData = response.data.offerPriceFiles;
                            }
                        }
                    }
                }
            });
        },
        //双信封
        isDoubleEnvelope: function (_index) {
            var that = this;
            that.options.isDoubleEnvelope = _index;
            if (_index == 0) {
                for (var i = 0; i < that.options.attachmentData.length; i++) {
                    that.options.attachmentData[i].doubleEnvelope = ""
                }
            } else {
                for (var i = 0; i < that.options.attachmentData.length; i++) {
                    that.options.attachmentData[i].doubleEnvelope = 1
                }
            }
            that.renderHtml();
        },
        //暗标
        isDarkMark: function (_index) {
            var that = this;
            that.options.isDarkMark = _index;
            if (_index == 0) {
                for (var i = 0; i < that.options.attachmentData.length; i++) {
                    that.options.attachmentData[i].darkMark = ""
                }
            } else {
                for (var i = 0; i < that.options.attachmentData.length; i++) {
                    that.options.attachmentData[i].darkMark = 0
                }
            }
            that.renderHtml();
        },
        //删除报价文件目录
        deleteAjax: function (offerId, _index) {
            var that = this;
            parent.layer.confirm('温馨提示：您确定要删除该条报价文件目录吗？', {
                btn: ['是', '否'] //可以无限个按钮
            }, function (index, layero) {
                if (that.options.attachmentState == 1) {//从数据库中删除
                    $.ajax({
                        type: "post",
                        url: that.options.deleteUrl,
                        async: false,
                        data: _data,
                        dataType: "json",
                        success: function (response) {
                            if (response.success) {
                                that.viewAjax();
                            }
                        }
                    });
                } else {//从数组中删除
                    that.options.attachmentData.splice(_index, 1);
                    that.renderHtml()
                }
                parent.layer.close(index);
            }, function (index) {
                parent.layer.close(index)
            });
        },
        //删除文件模板
        deleteFile: function (offerId, _index) {
            var that = this;
            parent.layer.confirm('温馨提示：您确定要删除该文件吗？', {
                btn: ['是', '否'] //可以无限个按钮
            }, function (index, layero) {
                if (that.options.attachmentState == 1) {//从数据库中删除
                    $.ajax({
                        type: "post",
                        url: that.options.deleteUrl,
                        async: false,
                        data: _data,
                        dataType: "json",
                        success: function (response) {
                            if (response.success) {
                                that.viewAjax();
                            }
                        }
                    });
                } else {//从数组中删除
                    if (that.options.status == 1) {
                        that.options.attachmentData[_index].tempOfferFile = new Object();
                    } else if (that.options.status == 3) {
                        for (var i = 0; i < that.options.offerData.length; i++) {
                            if (that.options.offerData[i].packageCheckListId == that.options.attachmentData[_index].id) {
                                that.options.offerData.splice(i, 1);
                            }
                        }
                        that.options.attachmentData[_index].offerData = new Object();
                    }
                    console.log(that.options.offerData)
                    that.renderHtml()
                }
                parent.layer.close(index);
            }, function (index) {
                parent.layer.close(index)
            });
        },
        //上移
        MoveUpward: function (offerId, _index, _this) {
            var that = this;
            if (_index > 0) {
                that.options.attachmentData[_index].orders = _index - 1;
                that.options.attachmentData[_index - 1].orders = _index;
                that.options.attachmentData[_index] = that.options.attachmentData.splice(_index - 1, 1, that.options.attachmentData[_index])[0];
                that.renderHtml()
            } else {
                parent.layer.alert('温馨提示：已经是最上层了！');
                return false;
            }
        },
        //下移
        MoveDown: function (offerId, _index, _this) {
            var that = this;
            if (_index == that.options.attachmentData.length - 1) {
                parent.layer.alert('温馨提示：已经是最下层了！');
                return false;
            } else {
                that.options.attachmentData[_index].orders = _index + 1;
                that.options.attachmentData[_index + 1].orders = _index;
                that.options.attachmentData[_index] = that.options.attachmentData.splice(_index + 1, 1, that.options.attachmentData[_index])[0];
                that.renderHtml()
            }
        },
        //失焦后把对应的值放入对应的数组字段中
        //length   输入的长度限制
        //name 限制长度的名称
        isBlur: function (_dataName, _index, _data, length, name) {
            if (length) {
                if (_data.length > Number(length)) {
                    parent.layer.alert('温馨提示：' + name + '超出长度限制' + length);
                    return false;
                }
            }
            var that = this;
            that.options.attachmentData[_index][_dataName] = _data;
        },
        fileOption: function (_index) {
            var that = this;
            $("#saveFile" + _index).fileinput(that.options.fileinput).on("filebatchselected", function (event, files) {
               
                if (event.currentTarget.files.length > 1) {
                    parent.layer.alert('温馨提示：单次上传文件数只能为1个');
                    $(this).fileinput("reset"); //选择的格式错误 插件重置
                    return;
                }
                if (event.currentTarget.files[0].size > 2 * 1024 * 1024 * 1024 * 1024) {
                    parent.layer.alert('温馨提示：上传的文件不能大于2G');
                    $(this).fileinput("reset"); //选择的格式错误 插件重置
                    return;
                };
                var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
                if (filesnames != 'ZIP' && filesnames != 'RAR' && filesnames != 'DOC' && filesnames != 'DOCX' && filesnames != 'XLSX' && filesnames != 'XLS'&& filesnames != 'pdf'&& filesnames != 'PDF') {
                    parent.layer.alert('温馨提示：只能上传Excel、Word和压缩包文件');
                    $(this).fileinput("reset"); //选择的格式错误 插件重置
                    return;
                };
                $(this).fileinput("upload");
            }).on("filebatchuploadsuccess", function (event, data, previewId, index) {
                if (data.response.success===false) { 
                    parent.layer.alert(data.response.message);
                    $(this).fileinput("reset"); 
                    return;
                }
                if (data.response.success) {
                    var fileData = new Object();
                    for (var key in that.options.parameter) {
                        fileData[key] = that.options.parameter[key]
                    }
                    fileData.fileName = data.files[0].name;
                    if (that.options.status == 3) {
                        if (that.options.attachmentData[_index].bidFileName.indexOf("商务") == -1) {
                            window.top.layer.alert("请不要在非“商务”报价文件中上传涉及价格信息的文件！", {
                                icon: 0,
                                title: "提醒"
                            });
                        }

                    }

                    fileData.fileSize = that.change(data.files[0].size);
                    fileData.filePath = data.response.data[0];
                    fileData.fileState = 1;
                    fileData.subDate = top.$("#systemTime").html() + ' ' + top.$("#sysTime").html()
                    if (that.options.status == 1) {
                        that.options.attachmentData[_index].tempOfferFile = fileData;
                    } else if (that.options.status == 3) {
                        that.options.attachmentData[_index].offerData = fileData;
                    }
                }
                that.renderHtml()
            }).on('filebatchuploaderror', function (event, data, msg) {
                parent.layer.msg("失败");
            });
        },
        //验证
        Verification: function (self) {
            var that = this;
            var _this = self;
            var isSuc = true;
            var dataType = {
                "*": /\S/,  //不能为空
                "mobile": /^1[3456789]\d{9}$/,  //手机号
                "num": /^\d+$/,  //数字               
                "positiveNum": /^[0-9][0-9]*$/,    //正整数              
            };
            var dataMsg = {
                "*": "信息不能为空",
                "num": "只能输入数字",
                "positiveNum": "请输入大于0的正数",
            };
            _this.find("[datatype]").each(function () {
                var dt = $(this).attr("datatype");//必填选项
                var char = $(this).data("char");//限制位数
                var val = $.trim($(this).val());
                var ignore = $(this).attr("ignore");  //忽略必填验证  ignore="ignore"  
                var errormsg = $(this).attr("errormsg");
                errormsg = errormsg ? errormsg : dataMsg[dt];
                ignore = ignore && ignore == "ignore" ? ignore : "";
                val = val ? val : "";
                if (dt && dt != "" && dt != undefined && !(ignore && val == "")) {
                    if (!dataType[dt].test(val)) {
                        var _that = $(this);
                        window.top.layer.alert("温馨提示：" + errormsg, function (index) {
                            top.layer.close(index);
                            if ($(".panel-collapse").length > 0) {
                                //						$('.collapse').collapse('hide');
                                _that.closest('.panel-collapse').collapse('show');
                                _that.closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
                            }
                            _that.focus();
                        });

                        isSuc = false;
                        return false;
                    }
                    if (val.length > char) {
                        var _that = $(this);
                        window.top.layer.alert(errormsg + '，且不能超过' + char + '个字符', function (index) {
                            top.layer.close(index);
                            if ($(".panel-collapse").length > 0) {
                                _that.closest('.panel-collapse').collapse('show');
                                _that.closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
                            }
                            _that.focus();
                        });
                        isSuc = false;
                        return false;
                    }
                }
            });
            return isSuc;
        },
        // 整个提交
        offerSubmit: function (callback) {
            var that = this;
            var pare = new Object();
            if (that.options.attachmentData.length == 0) {
                if (callback) {
                    callback("请添加报价文件目录");
                }
                return;
            }
            var darkMarkNum = 0;
            for (var i = 0; i < that.options.attachmentData.length; i++) {
                var item = that.options.attachmentData[i];
                if ($.trim(item.bidFileName) == "" || item.bidFileName == undefined) {
                    if (callback) {
                        callback("报价文件目录第" + (i + 1) + "行，请输入报价文件名称");
                    }
                    return;
                }
                if (item.mustUpload == 1 && (!item.tempOfferFile || !item.tempOfferFile.fileName)) {
                    if (callback) {
                        callback("报价文件目录第" + (i + 1) + "行，没有上传文件模版");
                    }
                    return;
                }

                if ($(".darkMark").length > 0 && item.darkMark == 1) {
                    darkMarkNum++;
                }
            }
            if ($(".darkMark").length > 0 && darkMarkNum == 0) {
                callback("报价文件目录至少有一个是暗标");
                return;
            }
            pare.offerPriceFiles = that.options.attachmentData;
            $.ajax({
                type: "post",
                url: that.options.saveurl,
                data: pare,
                dataType: "json",
                success: function (response) {
                    if (response.success) {
                        callback();
                    } else {
                        callback(response.message);
                    }
                }
            });
        },
        //评审节点拷贝
        copy: function () {
            var that = this;
            var data = new Object();
            for (var i = 0; i < packageCheckListInfo.length; i++) {
                data = {};
                for (var key in that.options.parameter) {
                    data[key] = that.options.parameter[key]
                }
                data.mustUpload = 1;//默认不是必须上传
                if (that.options.isDoubleEnvelope == 1) {
                    data.doubleEnvelope = packageCheckListInfo[i].envelopeLevel
                }
                data.darkMark = packageCheckListInfo[i].isShadowMark;//默认不是暗标
                data.orders = that.options.attachmentData.length;
                data.bidFileName = packageCheckListInfo[i].checkName;
                that.options.attachmentData.push(data);
            }
            that.renderHtml();
        },
        change: function (limit) {
            var size = "";
            if (limit < 0.1 * 1024) {                            //小于0.1KB，则转化成B
                size = limit.toFixed(2) + "B"
            } else if (limit < 0.1 * 1024 * 1024) {            //小于0.1MB，则转化成KB
                size = (limit / 1024).toFixed(2) + "KB"
            } else if (limit < 0.1 * 1024 * 1024 * 1024) {        //小于0.1GB，则转化成MB
                size = (limit / (1024 * 1024)).toFixed(2) + "MB"
            } else {                                            //其他转化成GB
                size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB"
            }

            var sizeStr = size + "";                        //转成字符串
            var index = sizeStr.indexOf(".");                    //获取小数点处的索引
            var dou = sizeStr.substr(index + 1, 2)            //获取小数点后两位的值
            if (dou == "00") {                                //判断后两位是否为00，如果是则删除00                
                return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
            }
            return size;
        }

    };
    $.fn.offerFileList = function (options) {
        options = $.extend(defaults, options || {});

        return new OfferFileList($(this), options);
    }

})(jQuery, window, document);