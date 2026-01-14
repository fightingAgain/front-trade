var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var projectId=getUrlParam('projectId');
var expertId=getUrlParam('expertId');
var reportId="";
var reportName="";
$(function(){
	 initTable();
})
function initTable() {
	var reportData="";
	$.ajax({   	
	   	url:top.config.bidhost+'/ExpertLeaderController/findCheckItemList.do',//修改包件的接口
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
	   			
	   		}else{
	   			parent.layer.alert(data.message)
	   			return false;
	   		}
	   	}   	
	});
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
			{ radio: true },
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
				align: "left",
				halign: "left",

			}			
		]
	});
	$('#table').bootstrapTable("load", reportData); //重载数据
	$('.fixed-table-container').css('padding-bottom','0')
};


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//关闭
$("#btn_close").on('click',function(){
	top.layer.closeAll()
})
//推荐
$("#btn_submit").click(function() {
	if(reportId==undefined){
		parent.layer.alert("请选择评委推荐为组长");        		     		
		return false;
	};
	parent.layer.confirm('温馨提示：是否确定推荐'+ reportName +'为组长', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		$.ajax({   	
		   	url:top.config.bidhost+'/ExpertLeaderController/saveExpertLeader.do',//修改包件的接口
		   	type:'post',
		   	//dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		'packageId':packageId,
		   		'examType':examType,
		   		'projectId':projectId,
		   		'expertLeaderId':reportId,
		   		'expertId':expertId
		   	},
		   	success:function(data){			   		
		   		if(data.success==true){
		   			top.layer.closeAll();
		   			parent.layer.alert("推荐成功")
		   			parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
		   			voteResult();	
		   		}else{
		   			parent.layer.alert(data.message)
		   			return false;
		   		}
		   	}   	
		});	 		 
	}, function(index){
	   parent.layer.close(index)
	});	
   	
});

function voteResult(){
	top.layer.open({
		type: 2,
		title: "投票结果",
		area: ['400px', '600px'],							
		content: "Auction/common/Expert/JudgesScore/voteResult.html?projectId="+projectId+"&packageId="+packageId+ "&examType="+examType,							
	});
}
