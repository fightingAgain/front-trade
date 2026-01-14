var dataFilingUrl=top.config.AuctionHost+'/ProjectArchiveGXController/findProjectArchivePageList.do';
var recallUrl=top.config.AuctionHost+'/WorkflowController/updateProjectDate.do'

var EnterpriseName ="guangxuan/cartogram/model/EnterpriseName.html";//企业名称页面
var organNo = "";
$(function(){
    //查询按钮
	$("#btnQuery").click(function() {
		$('#DataFilingTable').bootstrapTable('refresh');
    });
    //两个下拉框事件
	$("#itemState,#tenderType").change(function() {	
		$('#DataFilingTable').bootstrapTable('refresh');
	});
	
	if(top.enterpriseId == "AAA999" || top.enterpriseId == "AAA888"){
		$("#EntName").show();
		$("#QYMC").val("全部");
	} else {
		$("#EntName").hide();
	}
	
    intable()
})
//设置查询参数
function queryParams(params) {
	var para = {
		'pageNumber': params.offset / params.limit + 1,
        'pageSize': params.limit,
        'offset':params.offset, // SQL语句偏移量
        'tenderType':$("#tenderType").val(),
		'checkState': $("#itemState").val(),
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		organNo:organNo
	};
	return para;
}
function intable(){
    $("#DataFilingTable").bootstrapTable({
        url: dataFilingUrl,
        dataType: 'json',
        method: 'get',
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        locale: "zh-CN",
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 15, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [10, 15,20,25],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        clickToSelect: true, //是否启用点击选中行
        classes: 'table table-bordered', // Class样式
        //showRefresh : true, // 显示刷新按钮
        silent: true, // 必须设置刷新事件
        queryParams: queryParams, //查询条件参数
        striped: true,
        columns: [{
                title: '序号',
                align: 'center',
                width: "50px",
                formatter: function(value, row, index) {
                    var pageSize = $('#DataFilingTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
                    var pageNumber = $('#DataFilingTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
                    return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
                }
            },{
                field: 'projectCode',
                title: '项目编号',
                align: 'left'
            },{
                field: 'projectName',
                title: '项目名称',
                align: 'left',
                formatter: function(value, row, index) {
                    if(row.projectSource == 1) {
                        var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新采购)</span>'
                    } else {
                        var projectName = row.projectName;
                    }
                    return projectName;
                }
            },
            {
                field: 'packageNum',
                title: '包件编号',
                align: 'left'
            },
            {
                field: 'packageName',
                title: '包件名称',
                align: 'left',              
            },
            {
                field: 'tenderType',
                title: '项目类型',
                align: 'center',
                width: '120',
                //0为询比采购，1为竞价采购，2为竞卖，3为询比报价，4为招标采购，5为谈判采购，6为单一来源采购，7为框架协议采购，8为战略协议采购
                formatter: function(value, row, index) {
                    switch(value) {
                        case 0:
                        if(row.examType==0){
                            return "<div>询比采购-预审</div>";
                        }else{
                            return "<div>询比采购-后审</div>";
                        }					 		  
                            break;
                        case 1:
                            return "<div>竞价采购</div>";
                            break;
                        case 2:
                            return "<div>竞卖</div>";
                            break;
                        case 3:
                            return "<div>询比报价</div>";
                            break;
                        case 4:
                            return "<div>招标采购</div>";
                            break;
                        case 5:
                            return "<div>谈判采购</div>";
                            break;
                        case 6:
                            return "<div>单一来源采购</div>";
                            break;
                        case 7:
                            return "<div>框架协议采购</div>";
                            break;
                        case 8:
                            return "<div>战略协议采购</div>";
                            break;
                    }
                }
            },         
            {
                field: 'purchaserName',
                title: '企业名称',
                align: 'center',
                width: '140'
            },
            {
                field: 'filingState',
                title: '审核状态',
                align: 'center',
                width: '140',
                formatter: function(value, row, index) {
                    if(value == "1") {
                        return "<div class='text-warning'>待审核</div>"
                    } else if(value == "2") {
                        return "<div class='text-success'>审核通过</div>"
                    } else if(value == "3") {
                        return "<div class='text-danger'>审核未通过</div>"
                    }
                }
            },
            {
                field: '#',
                title: '操作',
                align: 'center',
                width: '150',
                events:{
                    'click .detailed':function(e,value, row, index){
                        var type=$(this).data('type');
                        switch (row.tenderType) {
                            case 0://询比
                                if(row.examType==0){//预审
                                    var Infourl = 'bidPrice/DataFiling/model/examTypeDataFilingInfo.html?packageId='+row.packageId+'&tenderType='+row.tenderType+'&projectId='+row.projectId+'&type='+type+'&uid='+row.id;
                                }else{//后审
                                    var Infourl = 'bidPrice/DataFiling/model/DataFilingInfo.html?packageId='+row.packageId+'&tenderType='+row.tenderType+'&projectId='+row.projectId+'&type='+type+'&uid='+row.id;
                                }                               
                                break;
                            case 1://竞价
                                var Infourl = 'bidPrice/DataFiling/model/auctionDataFilingInfo.html?packageId='+row.packageId+'&tenderType='+row.tenderType+'&projectId='+row.projectId+'&type='+type+'&uid='+row.id;
                                break;
                            case 2://竞卖
                                var Infourl = 'bidPrice/DataFiling/model/SaleDataFilingInfo.html?packageId='+row.packageId+'&tenderType='+row.tenderType+'&projectId='+row.projectId+'&type='+type+'&uid='+row.id;
                                break;
                            default:
                                break;
                        }
                        parent.layer.open({
                            type: 2 //此处以iframe举例
                            ,title: '查看资料归档'
                            ,area: ['100%', '100%']
                            ,maxmin: true//开启最大化最小化按钮
                            ,content:Infourl
                            ,success:function(layero,index){    
                                var iframeWind=layero.find('iframe')[0].contentWindow;                                       
                            }
                        });
                    },
                    'click .filing':function(e,value, row, index){
                        var type=$(this).data('type');
                        switch (row.tenderType) {
                            case 0://询比
                                if(row.examType==0){//预审
                                    var Infourl = 'bidPrice/DataFiling/model/examTypeDataFilingInfo.html?packageId='+row.packageId+'&tenderType='+row.tenderType+'&projectId='+row.projectId+'&type='+type+'&uid='+row.id;
                                }else{//后审
                                    var Infourl = 'bidPrice/DataFiling/model/DataFilingInfo.html?packageId='+row.packageId+'&tenderType='+row.tenderType+'&projectId='+row.projectId+'&type='+type+'&uid='+row.id;
                                }                               
                                break;
                            case 1://竞价
                                var Infourl = 'bidPrice/DataFiling/model/auctionDataFilingInfo.html?packageId='+row.packageId+'&tenderType='+row.tenderType+'&projectId='+row.projectId+'&type='+type+'&uid='+row.id;
                                break;
                            case 2://竞卖
                                var Infourl = 'bidPrice/DataFiling/model/SaleDataFilingInfo.html?packageId='+row.packageId+'&tenderType='+row.tenderType+'&projectId='+row.projectId+'&type='+type+'&uid='+row.id;
                                break;
                            default:
                                break;
                        }
                        parent.layer.open({
                            type: 2 //此处以iframe举例
                            ,title: '查看资料归档'
                            ,area: ['100%', '100%']
                            ,maxmin: true//开启最大化最小化按钮
                            ,content:Infourl
                            ,success:function(layero,index){    
                                var iframeWind=layero.find('iframe')[0].contentWindow;                                       
                            }
                        });
                    },
                    'click .recall':function(e,value, row, index){
                        parent.layer.confirm('确定要撤回该资料归档', {
                            btn: ['是', '否'] //可以无限个按钮
                            }, function(indexs, layero){
                                $.ajax({
                                     url:recallUrl,
                                     type:'post',
                                     //dataType:'json',
                                     async:false,
                                     //contentType:'application/json;charset=UTF-8',
                                     data:{
                                         "businessId":row.id,
                                         'accepType' :'zlgd',                                        
                                     },
                                     success:function(data){	 
                                         if(data.success){
                                             $('#DataFilingTable').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
                                             parent.layer.close(indexs);					
                                         }else{
                                             parent.layer.alert(data.message)
                                         }
                                         
                                     },
                                     error:function(data){
                                         parent.layer.alert("撤回失败")
                                     }
                                });                             
                           		 
                            }, function(indexs){
                                 parent.layer.close(indexs)
                        });
                    },
                },
                formatter: function(value, row, index) {
                    var btn="";                        
//                  if(row.filingFinish==0){
//                      btn+="<button type='button' data-type='edit' class='btn btn-xs btn-primary filing'><span class='glyphicon glyphicon-print' aria-hidden='true'></span>资料归档</button>";
//                  }else{                     
//                      if(row.filingState==1){        
//                          btn+="<button type='button' data-type='view' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";                  
//                      }else if(row.filingState==2){
//                          btn+="<button type='button' data-type='view' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
//                      }else if(row.filingState==3){
//                          btn+="<button type='button' data-type='edit' class='btn btn-xs btn-primary filing'><span class='glyphicon glyphicon-print' aria-hidden='true'></span>重新归档</button>";
//                      }else{
//                          btn+="<button type='button' data-type='edit' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-edit' aria-hidden='true'></span>提交审核</button>";
//                      }
//                      
//                  }                          
					btn+="<button type='button' data-type='view' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>"; 
                    return '<div class="btn-group">' +btn+'</div>'
                }
                
            }
        ]
    });
}

function nameChange(id,ecode){//登录人用户企业为集团时,当选择企业改变时事件-显示选择企业的统计图
	nian=$("#YEAR").val();
	var name=$("#QYMC").val();
	$("#enterpriseId").val(id);
	organNo=ecode;
	$('#DataFilingTable').bootstrapTable('refresh');

}

//获取企业名称
function getEnterpriseName(){
	layer.open({
		type: 2 ,
		title: '选择企业',
		area: ['25%', '70%'],//树形结构展示时页面大小
		content:EnterpriseName//企业名称页面
	})
}