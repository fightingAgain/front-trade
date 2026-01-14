//页面初始化
var bidSectionId = $.getUrlParam("bidSectionId");	//标段id
var states = $.getUrlParam("states");	//标段id
$(document).ready(function(){
	listTable(); //初始化
	$("#btnSearch").click(function(){ //查询
		listTable();
	});
	
	if(states == 4){
		$("#btnSave").hide();
	}
	
	//新增
	$("#btnSave").click(function(){
		layer.open({
			type: 2,
			title: '新增异议',
			area: ['80%', '80%'],
			content: 'objectionEdit.html?bidSectionId='+bidSectionId,
			resize: false,
		});
	});

});

// 查询参数
function getQueryParams() {
	var projectData = {
		bidSectionId:bidSectionId,
		objectionTitle: $("#objectionTitle").val(), //异议标题
	};
	return projectData;
};
	
//分页列表展示
function listTable(){
	$.ajax({
		type: "get",
		url: config.openingHost+"/ObjectionAnswersController/findBidderGroupList",
		data:getQueryParams(),
		async: false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
		},
		success: function(rsp) {
			$("#listRecords tr").remove();
			if(rsp.data.length>0){
				rsp.data.forEach(function(item,index){
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm" onclick="openEdit(\''+item.id+'\')"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
					var strView = '<button  type="button" class="btn btn-primary btn-sm" onclick="openView(\''+item.id+'\',\''+item.status+'\')"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					var strBack = '<button  type="button" class="btn btn-primary btn-sm" onclick="openBack(\''+item.id+'\')"><span class="glyphicon glyphicon-repeat"></span>申请撤回</button>';
					var strDel = '<button  type="button" class="btn btn-danger btn-sm" onclick="cutOff(\''+item.id+'\')"><span class="glyphicon glyphicon-remove"></span>删除</button>';
					var btn = '';
					var str = '';
					
					switch(parseInt(item.status)) {
						case 0: str = "未提交"; btn = strEdit+strView+strDel ; break;
				    	case 1: str = "未签收"; btn = strBack+strView ; break;
				    	case 2: str = "已签收"; btn = strView; break;
				    	case 3: str = "未受理"; btn = strView; break;
				    	case 4: str = "已受理"; btn = strView; break;
				    	case 5: str = "不予受理"; btn = strEdit+strView;break;
				    	case 6: str = "未答复"; btn = strView; break;
				    	case 7: str = "已答复"; btn = strView; break;
				    	case 8: str = "申请撤回"; btn = strView;break;
				    	case 9: str = "已撤回"; btn = strEdit+strView; break;
				    }
					
					var tr = "<tr>"
						   + "<td>" + (index+1) + "</td>"
						   + "<td>" + item.interiorBidSectionCode + "</td>"
						   + "<td>" + item.bidSectionName + "</td>"
						   + "<td>" + item.objectionTitle + "</td>"
						   + "<td>" + objectTypeStr(parseInt(item.objectionType)) + "</td>"
						   + "<td>" + str + "</td>"
						   + "<td>" + btn + "</td>"
						   + "</tr>";
					$("#listRecords").append(tr);
				});
			}
		}
	});	
}

//异议类型
function objectTypeStr(str){
	var result = null;
	switch(str){
		case 1:
			result = "资格预审文件";
			break;
		case 2:
			result = "资格文件开启";
			break;
		case 3:
			result = "资格评审";
			break;
		case 4:
			result = "招标文件";
			break;
		case 5:
			result = "开标";
			break;
		case 6:
			result = "评审";
			break;
		default:
			result = "";
			break;
	}
	return result;
}

//编辑
function openEdit(id){
	layer.open({
		type: 2,
		title: '编辑异议',
		area: ['80%', '80%'],
		resize: false,
		content: 'objectionEdit.html?dataId=' + id,
	});
};

//查看
function openView(id,state){
	layer.open({
		type: 2,
		title: '查看异议',
		area: ['80%', '80%'],
		content: 'objectionView.html?dataId='+id + '&state=' + state,
		resize: false,
	});
};

//删除
function cutOff(id){
	$.ajax({
		type:"post",
		url:config.openingHost + "/BidSuccessFulPublicityController/deleteByPrimaryKey.do",
		async:true,
		data: {
			'id': id
		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
		},
		success: function(data){
			if(data.success){
				layer.alert('删除成功!',{icon:6,title:'提示'},function(ind){
					listTable();
					layer.close(ind);
				});
			}else{
				layer.alert('删除失败!',{icon:5,title:'提示'});
			}
		}
	});
};

//撤回
function openBack(id){
	layer.alert('是否要撤回申请？',{icon:3,title:'询问'},function(ask){
		layer.close(ask);
		layer.prompt({
			formType: 2,
			title: '请输入撤回说明',
			resize: false,
			area: ['400px', '200px'] //自定义文本域宽高
		}, function(value, ind, elem){
		  	layer.close(ind);
		  	//保存数据
			$.ajax({
				type:"post",
				url:config.openingHost + '/ObjectionAnswersController/revocation.do',
				async:true,
				data: {
					'id': id,
					'instructions': value
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
				},
				success: function(data){
					if(data.success){
						layer.alert(data.data,{icon:6,title:'提示'},function(ind){
							listTable();
							layer.close(ind)
						});
					}else{
						layer.alert(data.message,{icon:5,title:'提示'});
					}
				}
			});  	
		});	
	})
}

