
var projectId=getUrlParam("projectId");
var id=getUrlParam("id");
var projectURL=top.config.Syshost +  '/projectEntrustController/findProjectItem.do';
var projectAppointURL=top.config.Syshost +  '/projectEntrustController/findProjectAppoint.do';
var projectBidAppointURL=top.config.tenderHost +  '/ProjectAttachmentFileController/getAttachFileListByOldProjectId.do';
var fileDownloadUrl =  config.FileHost + "/FileController/download.do";//下载文件
$(function(){
    // 项目包件信息
    $.ajax({
        type: "post",
        url:projectURL,
        data: {
            id:id
        },
        async:false,
        dataType: "json",
        success: function (response) {
            if(response.success){
                for(key in response.data){
                    if(key=='tenderType'){
                        if(response.data[key]==0){
                            $("#"+key).html('询比采购')
                        }
                        if(response.data[key]==1){
                            $("#"+key).html('竞价采购')
                        }
                        if(response.data[key]==2){
                            $("#"+key).html('竞卖采购')
                        }
                        if(response.data[key]==4){
                            $("#"+key).html('招标采购')
                        }
                        if(response.data[key]==6){
                            $("#"+key).html('单一来源')
                        }
                    }else if(key=='examType'){
                        if(response.data[key]==0){
                            $("#"+key).html('资格预审')
                        }
                        if(response.data[key]==1){
                            $("#"+key).html('资格后审')
                        }                       
                    }
                    // 0为综合评分法，1为最低价法
                    else if(key=='checkPlan'){
                        if(response.data[key]==0){
                            $("#"+key).html('综合评分法')
                        }
                        if(response.data[key]==1){
                            $("#"+key).html('最低价法')
                        }                       
                    }
                    else if(key=="isAgent"){
                        if(response.data[key]==0){
                            $("#"+key).html('否')
                        }
                        if(response.data[key]==1){
                            $("#"+key).html('是')
                        }  
                    } else if(key=="isOfferDetailedItem"){
                        if(response.data[key]==0){
                            $("#"+key).html('需要')
                        }
                        if(response.data[key]==1){
                            $("#"+key).html('不需要')
                        }  
                    }else if(key=="isPublic"){
                        // 0为所有供应商，1为所有本公司认证供应商，2为仅限邀请供应商，3为仅邀请本公司认证供应商
                        if(response.data[key]==0){
                            $("#"+key).html('所有供应商')
                        }
                        if(response.data[key]==1){
                            $("#"+key).html('所有本公司认证供应商')
                        } 
                        if(response.data[key]==2){
                            $("#"+key).html('仅限邀请供应商')
                        }
                        if(response.data[key]==3){
                            $("#"+key).html('仅邀请本公司认证供应商')
                        } 
                    }else {
                        $("#"+key).html(response.data[key]) 
                    }
                }
            }
        }
    });
    attachFiletable();
    $.ajax({
        type: "post",
        url:projectAppointURL,
        data: {
            id:id
        },
        async:false,
        dataType: "json",
        success: function (response) {
            if(response.success){
                for(key in response.data){
                    if (key == 'projectManagerName') {
                        $("#projectManagerName").html(response.data[key]);
                    }else if(key == 'projectBidName'){
                        $("#projectBidName").html(response.data[key]);
                    }else if(key == 'enterpriseId'){
                        var selectVal = response.data[key];
                        $("#agencyDetail option[value="+selectVal+"]").prop("selected", true);
                        $("#agencyDetail").attr("disabled","disabled");
                    }
                }
            }
        }
    });
});
function attachFiletable(){
    $("#attachFiletable").bootstrapTable({
        url: projectBidAppointURL,
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: false, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList:[10,15,20,25],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        //showRefresh : true, // 显示刷新按钮
        silent: true, // 必须设置刷新事件
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable:true,
        queryParamsType: "limit",
        queryParams: function(params) {
            var para = {/*
                "pageNumber": params.offset / params.limit + 1,
                "pageSize": params.limit,*/
                "oldProjectId": projectId,
            }
            return para;
        },
        columns: [{
            field: 'attachmentFileName',
            title: '附件名称'
        }, {
            field: 'createDate',
            title: '附件大小'/*url*/
        },
        {
                field:'url',
                title:'操作',
                align: 'center',
                width: '100',
                formatter:function(value, row, index){

                     /*   ?ftpPath='+road+'&fname='+fileName+'*/


                   /*     <a target="_blank" data-index="0" data-suffix="undefined" class="btn-primary btn-sm btnDownload"
                    style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>*/
                    var Tdr='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none"' +
                        ' onclick=downloadFile(\"'+ value +'\",\"'+ row.attachmentFileName +'\")><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>'

                    return Tdr
                }
            }
        ]
    });
}
/**
 * 附件下载
 */
function  downloadFile(path,fileName){
    alert(path+"==="+fileName);
    var newUrl = fileDownloadUrl+"?ftpPath="+path+"&fname="+fileName;
    window.location.href = $.parserUrlForToken(newUrl);
}
/*关闭*/
$('#btnClose').click(function(){
    var index=top.parent.layer.getFrameIndex(window.name);
    top.parent.layer.close(index);
});