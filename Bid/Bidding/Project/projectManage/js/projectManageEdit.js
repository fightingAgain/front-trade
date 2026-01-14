/**
*  zhouyan 
*  2019-4-23
*  编辑项目管理
*  方法列表及功能描述
*/
var membersHtml = "Bidding/Project/projectManage/model/memberList.html";//选取成员

var saveUrl = config.tenderHost + '/ProjectGroupController/saveProjectMembers.do';//保存
var detailUrl = config.tenderHost + '/ProjectGroupController/findListByTenderProjectId.do';//组员详情

var members = [];//成员信息
var memberId = [];//成员id
var id = '';//招标项目id
var loginInfo = entryInfo();//当前登录人信息
$(function(){
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		id = $.getUrlParam('id');
		$('#tenderProjectId').val(id);
		getDetail(id);
	}
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//选择项目成员
	$("#btnMembers").click(function(){
		var notIds = [];
		var haveMembers = $('#table_member tbody tr')
		for(var i=0;i<haveMembers.length;i++){
			notIds.push($(haveMembers).eq(i).find('.btnDel').attr('data-id'))
		};
		notIds.push(loginInfo.id);
//		console.log(notIds)
		parent.layer.open({
			type: 2,
			title: '选择项目成员',
			area: ['800px','650px'],
			resize: false,
			content: membersHtml,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.formFather(notIds,formChild);  //调用子窗口方法，传参
			}
		})
	});
	//删除
	$("#table_member").on('click','.btnDel',function(){
		parent.layer.confirm('确定删除该成员？',{icon:3,title:'询问'},function(ind){
			parent.layer.close(ind);
			var delId = $(this).attr('data-id');
			var index = $.inArray(delId,memberId)
			memberId.splice(index,1);
			members.splice(index,1);
			memberTable(members)
		})
		
	});
	//确认
	/*$('#btnSave').click(function(){
		 saveForm()
	});*/
})
function formChild(row){
//	console.log(row)
	for(var i = 0;i<row.length;i++){
		if($.inArray(row[i].id,memberId) == -1){
			memberId.push(row[i].id);
			members.push(row[i]);
		}
	}
	memberTable(members)
};
function passMember(callback,id){
	$('#tenderProjectId').val(id)
	//确认
	$('#btnSave').click(function(){
		saveForm(callback,id)
	});
}
/*成员列表
 * 
 */
function memberTable(data){
	$('#table_member tbody').html('');
	var html = '';
	for(var i = 0;i<data.length;i++){
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+data[i].userName+'<input type="hidden"  name="projectGroups['+i+'].employeeId" value="'+data[i].id+'"></td>'
			+'<td  style="width: 150px;text-align: center;">'+data[i].tel+'<input type="hidden" name="projectGroups['+i+'].employeeName" value="'+data[i].userName+'"></td>'
			+'<td style="width: 100px;text-align: center;">'
				+'<button  type="button" class="btn btn-danger btn-sm btnDel" data-id="'+data[i].id+'"><span class="glyphicon glyphicon-remove"></span>删除</button>'
			+'</td>'
		+'</tr>'
	};
	$(html).appendTo('#table_member tbody');
};
function saveForm(callback,id){
	$.ajax({
		type:"post",
		url:saveUrl,
		async:true,
		data: $('#formName').serialize(),
		success: function(data){
			if(data.success){
				parent.layer.alert('设置成功！',{icon:6,title:'提示'},function(index){
					parent.$("#tableList").bootstrapTable("refresh");
					var ind = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(ind); //再执行关闭  
					parent.layer.close(index);
					
				});
				if(callback){
					callback(id)
				}
			}
		}
	});
};
function getDetail(dataId){
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'tenderProjectId': dataId
		},
		success: function(data){
			if(data.success){
				var row = data.data;
				memberTable(row);
				for(var i = 0;i<row.length;i++){
//					row[i].id = row[i].employeeId;
					if($.inArray(row[i].id,memberId) == -1){
						memberId.push(row[i].id);
						members.push(row[i]);
					}
				}
			}
		}
	});
}
