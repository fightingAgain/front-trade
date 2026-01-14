/**
*  wdb 
*  2020-6-17 
*/
var getDetailUrl = config.offlineHost + "/OfflineMandateContractController/selectById";
var saveContracUrl = config.offlineHost + '/OfflineMandateContractController/save'
var getTenderDeptUrl = config.offlineHost + '/DepartmentController/findSysDepartmentList'
var departUrl = top.config.Syshost + '/DepartmentController/list.do';  //归属部门
var enterpriseUrl = "Bidding/Model/enterpriseList.html";  //招标人页面
var linkUrl = "Bidding/Project/model/contactsList.html";  //合同


var contracId = '' //合同id
var employeeInfo = null; //当前登录人信息
var departId = '' // 部门id
var isMulti = false;  //是否多选
var fileUploads = null;
$(function () {
    // 引用util.js文件中的manageEle方法初始化表单容器
    manageEle('#formName');
    initValidator() //初始化表单验证规则
    insertDept() //获取部门树形图
    employeeInfo = entryInfo();//当前登录人信息

    initFormEvent()    // 初始化时间选择组件的事件绑定
    if ($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
        contracId = $.getUrlParam("id");
        getDetail();
    } else {
        // 新建则获取代理机构的数据
        $('#tenderAgencyCode').val(employeeInfo.enterpriseCode);
        $("[name='agencyEnterprisName']").val(employeeInfo.enterpriseName);
        $("[name='agencyEnterprisLinkmen']").val(employeeInfo.userName);
        $("[name='agencyEnterprisPhone']").val(employeeInfo.tel);
    }
})

// 保存按钮点击事件
$('#btnSave').click(function () {
    // 展开表单
    $.each($('.panel-collapse'), function () {
        $(this).collapse('show')
    });
    $('#formName').bootstrapValidator('resetForm');

    $('#formName').bootstrapValidator('validate');
    notTestEmpty('#formName', false);

    if ($("#formName").data('bootstrapValidator').isValid()) {
        parent.layer.confirm('确定保存?', {
            icon: 3,
            title: '询问'
        }, function (index) {
            parent.layer.close(index);
            saveForm(true, true);
        })
    } else {
        invalidNot("#formName")
    }
});
// 提交按钮点击事件
$('#btnSubmit').click(function () {
    $.each($('.panel-collapse'), function () {
        $(this).collapse('show')
    });
    $('#formName').bootstrapValidator('resetForm');
    notTestEmpty('#formName', true);
    $('#formName').bootstrapValidator('validate');

    if ($("#formName").data('bootstrapValidator').isValid()) {
        parent.layer.confirm('确定提交?', {
            icon: 3,
            title: '询问'
        }, function (index) {
            parent.layer.close(index);
            saveForm(false, true);
        })
    } else {
        invalidNot("#formName")
    }
});

//关闭当前窗口
$("#btnClose").click(function () {
    var index = parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
});


// 获取页面数据
function getDetail() {
    $.ajax({
        url: getDetailUrl,
        type: 'post',
        data: { id: contracId },
        success: function (data) {
            contracData = data.data;
            // contracId = contracData.id;
            if (data.success == false) {
                parent.layer.alert(data.message);
                return;
            }
            for (var key in contracData) {
                var dom = $('#formName [name=' + key + ']');
                if (dom && dom != undefined) {
                    dom.val(data.data[key])
                }
            }
            initUpload();
            fileUploads.fileList();
        },
        error: function (data) {
            parent.layer.alert("加载失败");
        }
    });
};
// 上传表单数据
function saveForm(isSave, isAlert, callback) {
    var formdata = $("#formName").serialize();
    var confirmtext = '保存成功';

    if (contracId && contracId != '') {
        formdata = formdata + '&id=' + contracId;
    }
    if (!isSave) {
        formdata = formdata + '&isSubmit=1';
        confirmtext = '提交成功'
    }
    $.ajax({
        url: saveContracUrl,
        type: 'post',
        async: false,
        dataType: 'json',
        data: formdata,
        success: function (data) {
            if (data.success) {

                if (isAlert) {
                    parent.layer.closeAll();
                    parent.layer.alert(confirmtext, { icon: 1, title: "提示" });
                }
                contracId = data.data;
                if (callback) {
                    callback();
                }
                parent.$("#table").bootstrapTable('refresh');

            } else {
                parent.layer.alert("保存失败", { icon: 2, title: "提示" });
            }
        },
        error: function (data) {
            parent.layer.alert("请求错误", { icon: 2, title: "提示" });
        }
    });
}

//加载树形文本框
function insertDept() {
    departId = departId;
    $.ajax({
        type: "Post",
        url: departUrl,
        data: {
            menuState: "0",
            isShow: "0",
            isDel: "0",
        },
        async: false,
        success: function (result) {
            var data = new Array(),
                checkedNodes = {
                    names: [],
                    ids: []
                };
            var onedata;
            // 处理返回数据至数组
            for (var i = 0; i < result.data.length; i++) {
                if (result.data[i].parentDeptId == "0") {
                    onedata = {
                        "text": result.data[i].departmentName,
                        "id": result.data[i].id,
                        "selectable": false,
                        "state": {}
                    };
                    var nodes = Totreeview(result.data[i].id, result.data);
                    if (nodes.length) onedata.nodes = nodes;
                    data.push(onedata);
                }
            }

            $.each(departId, function (index, item) {
                var node = data.findElem('id', item, 'nodes');
                checkedNodes.names.push(node.text);
                checkedNodes.ids.push(node.id);
                node.state = { checked: true };
            });
            $('#agencyEnterprisDept').val(checkedNodes.names.join(','));
            $('#agencyEnterprisDeptId').val(checkedNodes.ids.join(','));
            var nodeId_temp = null;
            $('#treeview-checkable').treeview({
                data: data,
                collapsed: true,
                showIcon: true,
                showCheckbox: true,
                multiSelect: false,
                levels: 1,
                onNodeChecked: function (event, node) {
                    var names = $('#agencyEnterprisDept').val() ? $('#agencyEnterprisDept').val().split(',') : [],
                        ids = $('#agencyEnterprisDeptId').val() ? $('#agencyEnterprisDeptId').val().split(',') : [];
                    //					names.push(node.text);
                    //					ids.push(node.id);

                    if (nodeId_temp != null) {
                        $('#treeview-checkable').treeview('uncheckNode', [nodeId_temp, { slient: true }]);
                    }
                    nodeId_temp = node.nodeId;
                    names = node.text;
                    ids = node.id
                    $('#agencyEnterprisDept').val(names);
                    $('#agencyEnterprisDeptId').val(ids);
                    $('#agencyEnterprisDept').change();
                },
                onNodeUnchecked: function (event, node) {
                    var names = $('#agencyEnterprisDept').val() ? $('#agencyEnterprisDept').val().split(',') : [],
                        ids = $('#agencyEnterprisDeptId').val() ? $('#agencyEnterprisDeptId').val().split(',') : [];
                    names.remove(node.text);
                    ids.remove(node.id);
                    $('#agencyEnterprisDept').val(names.join(','));
                    $('#agencyEnterprisDeptId').val(ids.join(','));
                }
            });
        },
        error: function () {
            top.layer.alert("部门结构加载失败！")
        }
    });
}

//treeview格式化数据
function Totreeview(id, data) {
    var list = new Array();
    for (var i = 0; i < data.length; i++) {
        var one;
        if (data[i].parentDeptId == id) {
            one = {
                "text": data[i].departmentName,
                "id": data[i].id,
                "selectable": false
            };
            var nodes = Totreeview(data[i].id, data);
            if (nodes.length) one.nodes = nodes;
            list.push(one);
        }
    }
    return list;
};

/*
  * 打开招标人页面
  */
function openEnterprise() {
    var width = $(parent).width() * 0.8;
    var height = $(parent).height() * 0.9;
    parent.layer.open({
        type: 2,
        title: "招标人",
        area: [1000 + 'px', 650 + 'px'],
        resize: false,
        content: enterpriseUrl,
        success: function (layero, index) {
            var iframeWin = layero.find('iframe')[0].contentWindow;

            iframeWin.passMessage({ isMulti: isMulti, callback: enterpriseCallback });  //调用子窗口方法，传参

        }
    });
}

/*
  * 打开联系人页面
  */
function openLink() {
    if ($.trim($("[name='tendererEnterprisId']").val()) == "") {
        parent.layer.alert("请选择招标人");
        return;
    }
    var width = $(parent).width() * 0.9;
    var height = $(parent).height() * 0.9;
    parent.layer.open({
        type: 2,
        title: "联系人",
        area: [1000 + 'px', 650 + 'px'],
        resize: false,
        content: linkUrl + "?enterpriseId=" + $("[name='tendererEnterprisId']").val(),
        success: function (layero, index) {
            var iframeWin = layero.find('iframe')[0].contentWindow;

            iframeWin.passMessage({ isMulti: false, callback: linkCallback });  //调用子窗口方法，传参

        }
    });
}
// 联系人返回数据处理
function linkCallback(data) {
    // $("[name='tendererEnterprisLinkmen']").val(data[0].id);
    $("[name='tendererEnterprisLinkmen']").val(data[0].userName);
    $("[name='tendererEnterprisPhone']").val(data[0].tel);
    $("[name='tendererEnterprisLinkmen']").change();
    $("[name='tendererEnterprisPhone']").change();
    choseTendererEnterprisDept(data[0].id)
}

// 获取选择的联系人的部门
function choseTendererEnterprisDept(id) {
    $.ajax({
        type: "post",
        url: getTenderDeptUrl,
        data: { employeeId: id },
        success: function (res) {
            $("[name='tendererEnterprisDept']").val(res.data[0].departmentName);
            $("[name='tendererEnterprisDeptId']").val(res.data[0].id);
            $("[name='tendererEnterprisDept']").change();
        }
    });
}

/*
 * 同级页面返回参数
 */
function enterpriseCallback(data) {
    if (!data || data.length == 0) {
        return;
    }
    if (isMulti) {
        // 选择其他招标人时为多选，向数组tendererArr中添加选中的招标人信息，想数组tendererId中添加选中招标人的id
        for (var i = 0; i < data.length; i++) {
            if ($.inArray(data[i].id, tendererId) == -1 && data[i].id !== mainTenderId) {
                tendererId.push(data[i].id);
                tendererArr.push({
                    tendererName: data[i].enterpriseName,
                    tendererEnterprisId: data[i].id,
                    tendererCode: data[i].enterpriseCode,
                    legalPerson: data[i].legalPerson,
                    agentName: data[i].agentName,
                    agentTel: data[i].agentTel,
                    enterpriseAddress: data[i].taxAddress,
                    agentEmail: data[0].legalEmail,
                    id: ""
                })
            }
        }
        enterpriseHtml(tendererArr);

    } else {
        var tendererData = data[0];
        var resdatatype = [
            { target: 'tendererEnterprisName', valname: 'legalName' },  // 代理人名称
            { target: 'tendererEnterprisId', valname: 'id' },           // 代理人id
            { target: 'tendererEnterprisLinkmen', valname: '' },        // 代理人联系人
            { target: 'tendererEnterprisPhone', valname: '' },        // 代理人电话
            { target: 'tendererEnterprisDept', valname: '' },         // 代理人部门
            { target: 'tendererEnterprisTel', valname: '' },          // 代理人座机
        ]
        resdatatype.forEach((key) => {
            var dom = $('#formName [name=' + key.target + ']');
            if(dom.val()!=tendererData[key.valname]){
                dom.val('')
                dom.change()
            }
            if (dom && dom != undefined&& //dom元素存在
                tendererData[key.valname]&&tendererData[key.valname] != ''&&tendererData[key.valname] != null&&tendererData[key.valname]!=undefined //所需元素存在
                ) {
                dom.val(tendererData[key.valname])
                dom.change()
            }
        })
    }
}

//上传按钮
$('#fileUp').click(function () {
    var obj = $(this);
    if ($("[name='contractName']").val() == "") {
        parent.layer.alert("请填写委托合同名称", { icon: 7, title: '提示' });
        $('#collapseOne').collapse('show');
        return;
    }

    if (!(contracId && contracId != "")) {
        saveForm(true, false, () => {
            initUpload();
            $('#fileLoad').trigger('click');
        });
    } else {
        initUpload();
        $('#fileLoad').trigger('click');
    }
});
//初始化文件上传
function initUpload() {
    if (!fileUploads) {
        fileUploads = new StreamUpload("#fileContent", {
            basePath: "/" + employeeInfo.enterpriseId + "/" + contracId + "/911",
            businessId: contracId,
            status: 1,
            isPreview:true,
            extFilters: [".pdf",  ".png", ".jpg", ".gif", ".bmp"],  
            businessTableName: 'T_PROJECT',  //立项批复文件（项目审批核准文件）    项目表附件
            attachmentSetCode: 'PROJECT_APPROVAL_FILE'
        });
    }
}
// 初始化表单验证相关代码
function initValidator() {
    $('#formName').bootstrapValidator({
        // live: 'disabled',
        // message: 'This value is not valid',
        feedbackIcons: {
            // valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            contractName: {
                validators: {
                    notEmpty: {
                        message: '合同名称不能为空'
                    },
                    stringLength: {
                        max: 50,
                        message: '合同名称长度不能大于50字'
                    },
                }
            },
            contractEffectiveDate: {
                trigger: 'change',
                validators: {
                    notEmpty: {
                        message: '开始时间不能为空'
                    },
                    different: {
                        field: 'contractEndDate',
                        message: '开始时间不能与结束时间相同'
                    }
                }
            },
            contractEndDate: {
                trigger: 'change',
                validators: {
                    notEmpty: {
                        message: '结束时间不能为空'
                    },
                    different: {
                        field: 'contractEffectiveDate',
                        message: '结束时间不能与开始时间相同'
                    }
                }
            },
            contractContent: {
                validators: {
                    notEmpty: {
                        message: '委托合同基本内容不能为空'
                    },
                    stringLength: {
                        max: 150,
                        message: '委托合同基本内容长度不能大于150字'
                    },
                }
            },
            paySituation: {
                validators: {
                    notEmpty: {
                        message: '收费情况描述不能为空'
                    },
                    stringLength: {
                        max: 200,
                        message: '收费情况描述长度不能大于200字'
                    },
                }
            },

            agencyEnterprisLinkmen: {
                validators: {
                    notEmpty: {
                        message: '联系人不能为空'
                    },
                }
            },
            agencyEnterprisDept: {
                trigger:'change',
                validators: {
                    notEmpty: {
                        message: '所属部门不能为空'
                    },
                }
            },
            agencyEnterprisTel: {
                validators: {
                    // notEmpty: {
                    //     message: '座机号码不能为空'
                    // },
                    regexp: {
                        regexp: /^(\d{3,4}-)?\d{7,8}$/,
                        message: '请输入正确的座机号码'
                    },
                }
            },
            agencyEnterprisPhone: {
                validators: {
                    notEmpty: {
                        message: '手机号码不能为空'
                    },
                    regexp: {
                        regexp: /^1[3456789]\d{9}$/,
                        message: '请输入正确的手机号码'
                    },
                }
            },
            agencyRange: {
                validators: {
                    notEmpty: {
                        message: '招标代理范围描述不能为空'
                    },
                    stringLength: {
                        max: 200,
                        message: '招标代理范围描述长度不能大于200字'
                    },
                }
            },
            agencyAuthority: {
                validators: {
                    notEmpty: {
                        message: '招标代理权限描述不能为空'
                    },
                    stringLength: {
                        max: 200,
                        message: '招标代理权限描述长度不能大于200字'
                    },
                }
            },
            tendererEnterprisName: {
                trigger:'change',
                validators: {
                    notEmpty: {
                        message: '请选择招标人'
                    }
                }
            },
            tendererEnterprisLinkmen: {
                trigger:'change',
                validators: {
                    notEmpty: {
                        message: '请选择联系人'
                    },
                    
                }
            },
            tendererEnterprisPhone: {
                trigger:'change',
                validators: {
                    notEmpty: {
                        message: '手机号码不能为空'
                    },
                    regexp: {
                        regexp: /^1[3456789]\d{9}$/,
                        message: '请输入正确的手机号码'
                    },
                }
            },
            tendererEnterprisDept: {
                trigger:'change',
                validators: {
                    notEmpty: {
                        message: '所属部门不能为空'
                    },
                }
            },
            tendererEnterprisTel: {
                validators: {
                    regexp: {
                        regexp: /^(\d{3,4}-)?\d{7,8}$/,
                        message: '请输入正确的座机号码'
                    },
                }
            }
        }
    })
}

// 表单验证中所需的加工会影响绑定的事件 将时间组件初始化写入方法
function initFormEvent() {
    // 获取当前时间时间并对时间选择进行初始化
    var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
    //开始时间
    $('#contractEffectiveDate').click(function () {
        WdatePicker({
            el: this,
            dateFmt: 'yyyy-MM-dd HH:mm',
            onpicked: function () {
                $dp.$('contractEndDate').click();
                $('#contractEffectiveDate').change();
            },
            minDate: nowDate,
            maxDate: '#F{$dp.$D(\'contractEndDate\')}'
        })
    });
    //结束时间
    $('#contractEndDate').click(function () {
        if ($('#contractEffectiveDate').val() == '') {
            WdatePicker({
                el: this,
                dateFmt: 'yyyy-MM-dd HH:mm',
                onpicked: function () {
                    $('#contractEndDate').change();
                },
                minDate: nowDate
            })
        } else {
            WdatePicker({
                el: this,
                dateFmt: 'yyyy-MM-dd HH:mm',
                onpicked: function () {
                    $('#contractEndDate').change();
                },
                minDate: '#F{$dp.$D(\'contractEffectiveDate\')}'
            })
        }
    });

    // 代理 部门按钮
    $("#agencyEnterprisDept").click(function (e) {
        $("#treeview-checkable").slideToggle();
    })
    $("#treeview-checkable").on("click", ".check-icon", function () {
        if ($("#treeview-checkable").is(':visible')) {
            $("#treeview-checkable").slideToggle();
        }
    });

    //选择招标人
    $("#choseTendererEnterpris").click(function () {
        isMulti = false;
        openEnterprise();
    });

    //选择联系人
    $("#btnLink").click(function () {
        isMulti = false;
        openLink();
    });
}
