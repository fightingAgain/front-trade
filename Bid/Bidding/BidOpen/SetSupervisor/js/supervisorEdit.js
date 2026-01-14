var saveUrl = config.tenderHost + '/SupervisePersonController/insertSupervisePerson.do'; // 点击添加项目保存的接口
var listPage = "Bidding/BidOpen/SetSupervisor/model/supervisorList.html"; // 选择监标人页面
// var listPage = "view/Sys/WorkflowManage/model/GetWorkflowChecker.html"; // 选择监标人页面
 var enterprisId = "";  //企业id
 var idList = [];
 var userData = [];  //监标人数据
var source = "";  //1是编辑  2是查看
var bidId = "";
 $(function(){
 	// 获取连接传递的参数
 	if($.getUrlParam("enterprisid") && $.getUrlParam("enterprisid") != "undefined"){
		enterprisId =$.getUrlParam("enterprisid");
	}
 	if($.getUrlParam("bidid") && $.getUrlParam("bidid") != "undefined"){
		bidId =$.getUrlParam("bidid");
	}
 	
 	if($.getUrlParam("code") && $.getUrlParam("code") != "undefined"){
		$("#interiorBidSectionCode").html($.getUrlParam("code"));
	}
 	if($.getUrlParam("name") && $.getUrlParam("name") != "undefined"){
		$("#bidSectionName").html(decodeURIComponent($.getUrlParam("name")));
	}
 	
 	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
		source =$.getUrlParam("source");
	}
 	if(source == 1) {
 		$("#btnChoose").show();
 		$("#btnSubmit").show();
 	} else {
 		$("#btnChoose").hide();
 		$("#btnSubmit").hide();
 	}
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//保存
	$("#btnSave").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//提交
	$("#btnSubmit").click(function(){
		if(idList.length == 0){
			top.layer.alert("请选择监标人");
			return;
		}
		saveForm();
	});
	
	//选择监标人
	$("#btnChoose").click(function(){
		openList();
	});
	
	//删除监标人
	$("#biderBlock").on("click", ".btnDelUser", function(){
		var index = $(this).attr("data-id");
		userData.splice(index, 1);
		idList.splice(index, 1);
		userHtml();
	});
 });
 
function passMessage(data){
	for(var i = 0; i < data.length; i++){
		data[i].id = data[i].employeeId;
	}
	userData = data;
	userHtml();
}
 
 /*
 * 打开查看窗口
 */
function openList(){

	parent.layer.open({
		type: 2,
		title: "监标人",
		area: ['900px', '600px'],
		content: listPage + "?enterprisid=" + enterprisId,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage({
				isMulti: true,
				idList: idList,
				callback: userCallback
			}); //调用子窗口方法，传参
		}
	});
}

/*
 * 同级页面返回参数
 */
function userCallback(data) {
	userData = data;
	userHtml();
}

/**
 * 供应商
 * @param {Object} data
 */
function userHtml() {
	var data = userData;
	var html = "";
	idList = [];
	if($("#userTab").length == 0) {
		html += '<table id="userTab" class="table table-bordered" style="margin-top: 5px;">\
                	<tr>\
                		<th style="width:50px;">序号</th>\
                		<th>姓名</th>\
                		<th style="width: 150px;text-align:center;">登录帐号</th>\
                		<th style="width: 180px;text-align:center;">手机号</th>';
		if(source == 1) {
        	html += '<th style="width: 120px;">操作</th>';
        }
		html += '</tr>';
	}
	for(var i = 0; i < data.length; i++) {
		idList.push(data[i].id);
		html += '<tr>\
            		<td style="text-align:center;">' + (i+1) + '</td>\
            		<td>' + data[i].userName + '</td>\
            		<td style="text-align:center;">' + (data[i].logCode == undefined ? "-" : data[i].logCode) + '</td>\
            		<td style="text-align:center;">' + (data[i].tel ? data[i].tel : "-") + '</td>';
        if(source == 1) {
        	html += '<td>\
            			<button type="button" data-index="'+i+'" class="btn btn-danger btn-sm btnDelUser"><span class="glyphicon glyphicon-remove"></span>移除</button>\
            		</td>';
         }
         html += '</tr>';
	}

	if($("#userTab").length == 0) {
		html += '</table>';
		$("#biderBlock").html("");
		$(html).appendTo("#biderBlock");
	} else {
		$("#userTab tr:gt(0)").remove();
		$(html).appendTo("#userTab");
	}
}

 /*
  * 表单提交
  * isSave: true保存， false提交  
  */
 function saveForm(isSave) {
 	var arr = [];
 	for(var i = 0; i < idList.length; i++){
 		var item = {employeeId:idList[i]}
 		arr.push(item);
 	}
     $.ajax({
         url: saveUrl,
         type: "post",
         data: {
         	bidSectionId:bidId,
         	supervisePersons:arr
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
            parent.layer.alert("添加成功");
			parent.$("#tableList").bootstrapTable('refresh');
			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
			parent.layer.close(index); //再执行关闭  
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 };
 