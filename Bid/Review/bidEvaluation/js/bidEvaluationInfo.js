
var bidSectionId=getUrlParam("bidSectionId");//标段Id
var examType=getUrlParam("examType");//资格审查阶段
var isView=getUrlParam("isView");//资格审查阶段
var urlInfo=config.Reviewhost+"/ReviewSetController/getReviewSetInfo.do";
var choiceJudgesUrl = "Review/bidEvaluation/model/choiceJudges.html";  //选择评委
var addJudgesUrl = "Review/bidEvaluation/model/addJudges.html";  //添加评委
var expertsList=[],representsList,combineData;
$(function(){
	if(isView){
		$('#addTenderer').hide();
	}else{
		$('#addTenderer').show();
	}
	chus()		
})
function chus(){
	$.ajax({
		type:"post",
		url:urlInfo,
		async:false,
		data:{
			'bidSectionId':bidSectionId,
			'examType':examType
		},
		success:function(res){
			if(res.success){
				expertsList=res.data.experts;
				representsList=res.data.represents;
				combineData = expertsList.concat(representsList);				
				expertsdata();
				tendererData();
			}else{
				top.layer.alert('温馨提示：'+res.message)
			}
		}
	})
}
//评委列表
function expertsdata(){
	$('#expertsList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		
		},
		{
			field: "expertName",
			title: "专家姓名",
			align: "left",
			halign: "left",
            width: "200px",
		},
		{
			field: "isChairMan",
			title: "身份",
			align: "left",
			halign: "left",
            width: "200px",
			formatter: function(value, row, index) {
				if(value==1){
					return '评标组长'
				}else{
					return '评标组员'
				}
			},
		},
		{
			field: "phoneNumber",
			title: "评委手机号码",
			align: "left",
			halign: "left",
            width: "200px",
		}
		]
	});
	$('#expertsList').bootstrapTable("load",expertsList); //重载数据
}
//业主评委列表
function tendererData(){
	$('#tendererList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		
		},
		{
			field: "expertName",
			title: "专家姓名",
			align: "left",
			halign: "left",
            width: "200px",
		},
		{
			field: "isChairMan",
			title: "身份",
			align: "left",
			halign: "left",
            width: "200px",
			formatter: function(value, row, index) {
				return '招标人代表（评委）'
			},
		},
		{
			field: "phoneNumber",
			title: "手机号码",
			align: "left",
			halign: "left",
            width: "200px",
		},
		{
			field: "id",
			title: "操作",
			align: "left",
			halign: "left",
            width: "80px",
			formatter: function(value, row, index) {
				return '<button type="button" class="btn btn-danger btn-sm btnDel" data-expertId="'+row.expertId+'" data-id="'+row.id+'"><span class="glyphicon glyphicon-remove"></span>删除</button>'
			}
		}
		]
	});
	$('#tendererList').bootstrapTable("load",representsList); //重载数据
}




$(document).on('click', ".btnDel", function(){
	var ids = $(this).attr("data-id");
	var expertId = $(this).attr("data-expertId");
	testDelete(expertId, function(data){
		var obj = {'id':ids}
		if(data){
			obj.reason = data
		}
		$.ajax({
		    type:"post",
		    url:config.Reviewhost+"/ReviewSetController/deleteExpertInfo.do",
		    async:true,
		    data:obj,
		    success:function(res){
		        if(res.success){
		            chus();
		        }
		    }
		});
	})
    
});
$("#selectionJudges").on('click',function(){
    var expertsIdList=[]
    for(var i=0;i<combineData.length;i++){
        expertsIdList.push(combineData[i].id)
    }
    top.layer.open({
        type: 2,
        title: "选择评委",
        area: ['1000px','600px'],
        resize: false,
        content: choiceJudgesUrl,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.du(expertsIdList,combineData,bidSectionId,2,1)
        },
    });
})
$("#selectionTenderer").on('click',function(){
    var expertsIdList=[]
    for(var i=0;i<combineData.length;i++){
        expertsIdList.push(combineData[i].id)
    }
    top.layer.open({
        type: 2,
        title: "选择招标人代表",
        area: ['1000px','600px'],
        resize: false,
        content: choiceJudgesUrl,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.du(expertsIdList,combineData,bidSectionId,2,2)
        },
    });
})
$("#addJudges").on('click',function(){
    top.layer.open({
        type: 2,
        title: "添加评委",
        area: ['1000px','600px'],
        resize: false,
        content: addJudgesUrl,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.du(combineData,bidSectionId,examType,1)
        },
    });
})
$("#addTenderer").on('click',function(){
    top.layer.open({
        type: 2,
        title: "添加招标人代表（评委）",
        area: ['1000px','600px'],
        resize: false,
        content: addJudgesUrl,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.du(combineData,bidSectionId,examType,2)
        },
    });
})
function testDelete(id, callback){
	$.ajax({
		type:"post",
		url: top.config.Reviewhost + '/ReviewSetController/getSignInFlag.do',
		async:false,
		data:{
			'bidSectionId':bidSectionId,
			'examType':examType,
			'expertId': id
		},
		success:function(res){
			if(res.success){
				if(res.data){
					callback();
				}else{
					top.layer.prompt({title: '请输入删除原因', maxlength: '100', formType: 2}, function(text, index){
						top.layer.close(index);
						callback(text);
					});
				}
			}else{
				top.layer.alert('温馨提示：'+res.message)
			}
		}
	})
}