var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var filesData = []; //附件上传的数组
var findPurchaseURL = config.AuctionHost + '/AuctionWasteProjectPackageController/findAutionPurchaseInfo.do'; //获取项目信息的接口
var deleteFileUrl = config.AuctionHost + '/PurFileController/delete.do'; //删除已上传文件信息
var importDetailedURL = config.AuctionHost + "/AuctionWasteProjectPackageController/importDetailed.do"; // 明细导入接口
var saveSubmitUrl = config.AuctionHost + "/AuctionWasteProjectPackageController/updateAuctionWasteProjectPackage.do" // 保存+提交接口
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口；
var historyWorkflowUrl = config.AuctionHost + "/WorkflowController/findWorkflowCheckerAndAccp.do"; //项目审核记录
var projectId = getUrlParam('projectId');
var packageId;
var WORKFLOWTYPE = 'fjwz_xsd'; 
var hasHigh = 0;
var edittype = getUrlParam("edittype"); //查看还是审核detailed查看  audit审核
var _cacheMerge;
$(function () {
    // 多个附件上传
    var oFileInput = new FileInput();
    oFileInput.Init("FileName", urlSaveAuctionFile);
    //实例化编辑器
    //建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
 
    // 获取详情
    getDetails();
 
    getWorkFlowPeople();

    //退出
    $("#btnClose").click(function () {
        //	parent.layer.closeAll()
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    })

    // 提交
    $("#btnSubmit").click(function () {
        if(checkInput()){
            // saleState: 0保存，1提交
            updateAuction(1);
        }
    });

    // 保存
    $("#btnSave").click(function () {
        updateAuction(0);
    });

    $("#browserUrl").attr('href',siteInfo.portalSite);
    $("#browserUrl").html(siteInfo.portalSite);
    $("#webTitle").html(siteInfo.sysTitle);

})
// 获取审核记录
function getWorkFlowPeople(){
    findWorkflowCheckerAndAccp(packageId);
}
// 获取传递参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
    var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
    if (r != null) return unescape(r[2]);
    return null; // 返回参数值  
}
// 获取详情
function getDetails() {
    $.ajax({
        url: findPurchaseURL,
        type: 'get',
        async: false,
        data: {
            'projectId': projectId
        },
        success: function (res) {
            if(res.success){
                for(var key in res.data){
                    if(key=='project'){
                        for(var p in res.data.project[0]){
                            $('#'+p).html(res.data.project[0][p]);
                        }
                    }
                    $('#'+key).html(res.data[key]);
                }
                $('#projectType').html('废旧物资');

                if(res.data &&　res.data.autionProjectPackage[0] && res.data.autionProjectPackage[0].bidContent){
                    $('#bidContent').html(res.data.autionProjectPackage[0].bidContent);
                }

                $("#StartDate").html(res.data.noticeStartDate);
                $("#endDate").html(res.data.noticeEndDate);

                packageId = res.data.autionProjectPackage[0].id;
                filesData = res.data.wasteFiles;
                _cacheMerge = res.data.materialDetails;
                $('#materialRelationship').html(res.data.autionProjectPackage[0].materialRelationship==0?'是':'否');
                filesDataView();
                DetailedTab();
                $("#DetailedList").bootstrapTable("load", res.data.materialDetails);
                mergeCells();
                if( res.data && res.data.autionProjectPackage[0] && res.data.autionProjectPackage[0].offerFloat){
                    $('#offerFloat').val(res.data.autionProjectPackage[0].offerFloat);
                }
                // 是否显示顶价浮动
                if(hasHigh>0){
                    $('#priceHigh').show();
                }else{
                    $('#priceHigh').hide();
                }
            }else{

            }
        },
        error: function (data) {

        }
    });
};
 
// 序号 品种 总称 竞卖底价/顶价 竞卖方式 数量 单位 权重 服务费 报价方式
//明细表格初始化
function DetailedTab() {
    $("#DetailedList").bootstrapTable({
        pagination: false,
        showLoading: false, //隐藏数据加载中提示状态
        mergeCells:{
            field: 'genItemName'
        },
        columns: [
            {
                field: 'xh',
                title: '序号',
                align: 'center',
                width: '50',
                formatter: function (value, row, index) {
                    var pageSize = $('#DetailedList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
                    var pageNumber = $('#DetailedList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
                    return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
                }
            }, {
                field: 'genItemName',
                title: '总称',
                align: 'left',
                formatter: function (value, row, index) {
                    if(value){
                        return '<b>'+value+'</b>'
                    }else{
                        return '-'
                    }
                }
            }, {
                field: 'detailedName',
                title: '品种',
                align: 'left',
            }, {
                field: 'salesPrice',
                title: '竞卖底价/顶价',
                align: 'left'
            }, {
                field: 'priceType',
                title: '竞卖方式',
                align: 'center',
                formatter: function (value, row, index) {
                    if (row.priceType == 1) {
                        return '竞高价';
                    } else if (row.priceType == 0) {
                        hasHigh ++;
                        return '竞低价';
                    }
                }
            }, {
                field: 'detailedCount',
                title: '数量',
                align: 'right',
            }, {
                field: 'detailedUnit',
                title: '单位',
                align: 'left'
            }, {
                field: 'proportion',
                title: '权重',
                align: 'right',
                formatter: function (value, row, index) {
                    if(value){

                        return (+value*100).toFixed(2)+"%";
                    }
                }
            },
            {
                field: 'servicePrice',
                title: '服务费',
                align: 'right'
            },
            {
                field: 'offerType',
                title: '报价方式',
                align: 'center',
                formatter: function (value, row, index) {
                    if (value == 1) {
                        return '正常报价';
                    } else if (value == 0) {
                        return '10的整数倍';
                    }
                }
            }
        ]
    });
}
// IE兼容 ES7 的 includes 方法
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (valueToFind, fromIndex) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0) {
                return false;
            }
            var n = fromIndex | 0;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }
            while (k < len) {
                if (sameValueZero(o[k], valueToFind)) {
                    return true;
                }
                k++;
            }
            return false;
        }
    });
}
// 合并
function mergeCells(){
    var length = _cacheMerge.length; //总计多少条数据
    var FlagList = [];  // 多少条itemFlag
    var index = []; // 0 , 2
    var count = []  // 2 , 2
	for(let i=0; i<length; i++){
		if(_cacheMerge[i].itemFlag){ 
			var item = _cacheMerge[i].itemFlag;
			if (!FlagList.includes(item)) {
				FlagList.push(item);
				index.push(i);
			}
		}
    }
    for(let i=0; i<FlagList.length; i++){
        let num = 0;
        for(let c=0; c<_cacheMerge.length; c++){
            if(_cacheMerge[c].itemFlag == FlagList[i]){
                num++;
            }
        }
        count.push(num);
    }
    // 需要 index 和 count
    for(let r = 0; r < index.length; r++){
        $('#DetailedList').bootstrapTable('mergeCells',{index:index[r], field:"genItemName", colspan: 1, rowspan: count[r]});
    }

}

//上传附件
var FileInput = function () {
    var oFile = new Object();
    //初始化fileinput控件（第一次初始化）
    oFile.Init = function (ctrlName, uploadUrl) {
        $("#FileName").fileinput({
            language: 'zh', //设置语言
            uploadUrl: uploadUrl, //上传的地址
            uploadAsync: false,
            autoReplace: false,
            // allowedFileExtensions: ['docx', 'pdf', 'xlsx','xls'], //接收的文件后缀
            // showUpload: false, //是否显示上传按钮  
            showCaption: false, //是否显示标题  
            // showCaption: true, //是否显示标题  
            browseClass: "btn btn-primary", //按钮样式       
            dropZoneEnabled: false, //是否显示拖拽区域  
            // maxFileCount: 1, //表示允许同时上传的最大文件个数
            showPreview: false,
            showRemove: false,
            layoutTemplates: {
                actionDelete: "",
                actionUpload: ""
            }
        }).on("filebatchselected", function (event, files) {
            if (event.currentTarget.files.length > 1) {
                parent.layer.alert('单次上传文件数只能为1个');
                $(this).fileinput("reset"); //选择的格式错误 插件重置
                return;
            }
            if (event.currentTarget.files[0].size > 2 * 1024 * 1024 * 1024) {
                parent.layer.alert('上传的文件不能大于2G');
                $(this).fileinput("reset"); //选择的格式错误 插件重置
                return;
            };
            $(this).fileinput("upload");
        }).on("filebatchuploadsuccess", function (event, data, previewId, index) {
            filesData.push({
                id: new Date().getTime(),
                fileName: data.files[0].name,
                fileSize: data.files[0].size / 1000 + "KB",
                filePath: data.response.data[0]
            })
            filesDataView()
        }).on('filebatchuploaderror', function (event, data, msg) {
            parent.layer.msg("失败");
        });
    }
    return oFile;
};

function filesDataView() {
    var tr = ""
    for (var i = 0; i < filesData.length; i++) {
        tr += '<input type="hidden" name="project.purFiles[' + i + '].fileName" value="' + filesData[i].fileName + '"/>' +
            '<input type="hidden" name="project.purFiles[' + i + '].filePath" value="' + filesData[i].filePath + '"/>' +
            '<input type="hidden" name="project.purFiles[' + i + '].fileSize" value="' + filesData[i].fileSize + '"/>'
    };
    $("#filesDatas").html(tr);
    if (filesData.length > 7) {
        var height = '304'
    } else {
        var height = ''
    }
    $('#filesData').bootstrapTable({
        pagination: false,
        undefinedText: "",
        height: height,
        columns: [{
            title: "序号",
            align: "center",
            halign: "center",
            width: "50px",
            formatter: function (value, row, index) {
                return index + 1;
            }
        },
        {
            field: "fileName",
            title: "文件名称",
            align: "left",
            halign: "left",

        },
        {
            field: "fileSize",
            title: "文件大小",
            align: "center",
            halign: "center",
            width: '100px',

        }, {
            field: "cz",
            title: "操作",
            halign: "center",
            width: '180px',
            align: "center",
            events: {
                'click .download': function (e, value, row, index) {
                    var newUrl = top.config.FileHost + "/FileController/download.do?ftpPath=" + row.fileUrl + "&fname=" + row.fileName;
                    window.location.href = $.parserUrlForToken(newUrl);
                }
            },
            formatter: function (value, row, index) {
 
                var str = '';
                var fileExtension = row.fileName.substring(row.fileName.lastIndexOf('.') + 1);
                if (fileExtension == "jpg" || fileExtension == "png" || fileExtension == "gif" || fileExtension == "pdf" || fileExtension == 'bmp') {
                    str += '<a href="javascript:void(0)" class="btn btn-primary btn-sm" onclick="openPreview(\'' + row.fileUrl + '\')"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span> 预览</a>';
                }
                str += "<a href='javascript:void(0)' class='btn btn-sm btn-primary download' style='text-decoration:none;margin-right:5px'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span> 下载</a>";
                return str;
            }
        }
        ]
    });
    $('#filesData').bootstrapTable("load", filesData);
}

function fileDetel(i, uid) {
    parent.layer.confirm('确定要删除该附件', {
        btn: ['是', '否'] //可以无限个按钮
    }, function (index, layero) {
        var itemList = new Array();
        filesData = itemList.concat(filesData);
        filesData.splice(i, 1)
        if (uid.length == 32) {
            $.ajax({
                type: "post",
                url: deleteFileUrl,
                async: false,
                dataType: 'json',
                data: {
                    "id": uid,
                },
                success: function (data) { }
            });
        }
        filesDataView()
        parent.layer.close(index);
    }, function (index) {
        parent.layer.close(index)
    });

};