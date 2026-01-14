function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var projectId=getUrlParam('projectId');
var lunx;
$(function(){
	 initTable();
})

function initTable() {
	var reportData="";
	$.ajax({   	
	   	url:top.config.bidhost+'/ExpertLeaderController/findCheckItemList.do',
	   	type:'get',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'packageId':packageId,
	   		'examType':examType,
	   		'projectId':projectId,	   	
	   	},
	   	success:function(data){			   		
	   		if(data.success==true){
	   			reportData=data.data	
	   			if(reportData.isSetLeader==0){
	   				lunx=setTimeout(function(){
	   					initTable()
	   				},5000)
	   			}else{
	   				clearTimeout(lunx)
	   			}
	   			
	   			
	   		}else{	   			
	   			return false;
	   		}
	   	}   	
	});
	if(reportData.isSetLeader==1){
		$("#btn_submit").hide();
		$("#btn_close").hide();
	}
	
	if(reportData.length>7){
		var auto='304'
	}else{
		var auto='auto';
		
	}
	$('#table' ).bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:auto,
		onCheck:function(row){
          reportId=row.checkerEmployeeId;      
          reportName=row.expertName;
        },
		columns: [			
		    {
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "expertName",
				title: "评委名称",
				align: "center",
				halign: "center",

			},
			{
				field: "expertName",
				title: "得票数",
				align: "center",
				halign: "center",

			}
		]
	});
	$('#table').bootstrapTable("load", reportData); //重载数据
	$('.fixed-table-container').css('padding-bottom','0')
};

//关闭
$("#btn_close").on('click',function(){
	top.layer.closeAll()
})
//关闭
$("#btn_closeAll").on('click',function(){
	top.layer.closeAll()
})
//推荐
$("#btn_submit").click(function() {
	top.layer.closeAll()
	top.layer.open({
		type: 2,
		title: "推荐组长",
		area: ['400px', '600px'],							
		content: "Auction/common/Expert/JudgesScore/vote.html?projectId="+projectId+"&packageId="+packageId+ "&examType="+examType,
	});   	
});