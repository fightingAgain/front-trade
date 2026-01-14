
var projectId=getUrlParam("projectId");
var id=getUrlParam("id");
var projectURL = top.config.Syshost +  '/projectEntrustController/findProjectItem.do';

$(function(){
    intntable()
    $("#agency").on('change',function(){
        $('#managerList').bootstrapTable('destroy'); // 很重要的一步，刷新url！	
        intntable();
        $('#biddingProjectList').bootstrapTable('destroy');
        intProjectTable();
    });
    // 搜索按钮触发事件
    $("#btnSearch").click(function() {
        $('#managerList').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
        intntable()			
    });
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
               var attachments =  response.data.attachments;
                loadAttachFiles(attachments);
            }
        }
    });
    intProjectTable();
    $("#projectBidName").on('change',function(){
        $('#biddingProjectList').bootstrapTable('destroy'); // 很重要的一步，刷新url！
        intProjectTable();
    });
    // 搜索按钮触发事件
    $("#btnProjectSearch").click(function() {
        $('#biddingProjectList').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
        intProjectTable()
    });
})
/*关闭*/
$('#btnClose').click(function(){
    var index=top.parent.layer.getFrameIndex(window.name);
    top.parent.layer.close(index);
});
function intntable(){
    $("#managerList").bootstrapTable({
        url: top.config.Syshost + '/EmployeeController/pageView.do',
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
        sortStable:true,
        queryParamsType: "limit",
        queryParams: function(params) {
            var para = {
                "userInformation.userName": $("#username").val(),
                "pageNumber": params.offset / params.limit + 1,
                "pageSize": params.limit,
                "enterpriseId":$("#agency").val(),
                'roleId': 200002,
            }
            return para;
        },
        columns: [{
                radio: true
            }, {
                field: 'userName',
                title: '姓名'
            }, {
                field: 'tel',
                title: '手机号码'
            }, {
                field: 'enterpriseName',
                title: '所属企业'
            }
        ]
    });
}

/*查询招标项目信息*/
function intProjectTable(){
    $("#biddingProjectList").bootstrapTable({
        url: top.config.tenderHost + '/ProjectController/findEffectiveProjectPageList.do',
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList:[10,15,20,25],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        //showRefresh : true, // 显示刷新按钮
        silent: true, // 必须设置刷新事件
        toolbar: '#toolbar2', // 工具栏ID
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable:true,
        queryParamsType: "limit",
        queryParams: function(params) {
            var para = {
                "projectName": $("#projectBidName").val(),
                "pageNumber": params.offset / params.limit + 1,
                "pageSize": params.limit,
                "agencyEnterprisId":$("#agency").val(),
                'roleId': 200002,
            }
            return para;
        },
        columns: [{
            radio: true
        }, {
            field: 'projectName',
            title: '项目名称'
        }, {
            field: 'interiorProjectCode',
            title: '项目编号'
        }
        ]
    });
}

/*查询招标项目信息*/

//挂载采购文件撤回记录
function loadAttachFiles(data) {
    $("#projectListAttach").bootstrapTable({
        undefinedText: "",
        pagination: false,
        columns: [{
            title: "序号",
            align: "center",
            width: "50px",
            formatter:
                function(value, row, index) {
                    return index + 1;
                }
            },
            {
                field: "name",
                align: "left",
                title: "文件名称",
            }, {
                field: "dataTime",
                align: "center",
                title: "时间"
            }
        ]
    });
    $("#projectListAttach").bootstrapTable('load', data);
    $(".fixed-table-loading").hide();
}
/*提交*/
$('#btnSave').click(function(){
   var raData=$("#managerList").bootstrapTable('getSelections');
   var raBidData=$("#biddingProjectList").bootstrapTable('getSelections');
   if(raData.length==0){
       parent.layer.alert('温馨提示，请选择项目经理');
       return false
   }
    if(raBidData.length==0){
        parent.layer.alert('温馨提示，请选择招标项目');
        return false
    }
   $.ajax({
       type: "post",
       url: config.Syshost+'/projectEntrustController/saveAppoint.do',
       data: {
           'enterpriseId':$("#agency").val(),
           'subType':0,
           'buildProjectId':id,
           'projectManagerId':raData[0].id,
           'projectBidId':raBidData[0].id,
           'projectBidName':raBidData[0].projectName
       },
       dataType: "json",
       success: function (response) {
           if(response.success){
                parent.layer.alert('委托成功');
                parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
                var index=top.parent.layer.getFrameIndex(window.name);
                top.parent.layer.close(index);
           }
       }
   });
});