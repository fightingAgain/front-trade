var searchUrl = config.Reviewhost + '/TendereeRecordApplyController/getDetail.do'; //质疑答疑查询根据标段ID接口
var saveUrl = config.Reviewhost + '/TendereeRecordApplyController/saveAndUpdate.do'; //保存
var downUrl = config.Reviewhost + '/TendereeRecordApplyController/exportPdf.do'; //生成pdf
var delUrl = config.Reviewhost + '/TendereeRecordApplyController/deleteItem.do'; //删除item

var editExpert = "Review/expert/model/editTender.html"; 
var viewExpert = "Review/expert/model/viewTender.html";

var packageId; //标段主键ID
var examType;//资格预审方式
var type;
var applyId;
var items;
var fileUploads = null;
var employeeInfo = entryInfo();


$(function() {
	if(getUrlParam("type") && getUrlParam("type") != "undefined") {
	    type = getUrlParam("type");
	}
	if(type == "view"){
		$("#btnDownload").hide();
		$("#btnUpload").hide();
		$("#btnAdd").hide();
	}
	
	//添加招标人代表
	$("#btnAdd").click(function() {
        top.layer.open({
			type: 2,
			title: "添加招标人代表",
			area: ['1100px', '600px'],
			resize: false,
			content: editExpert + "?tendereeRecordApplyId=" + applyId,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.du(function(){
					getDetail();
				});
			}
		});
	});
	
	
	//下载备案申请表
	$("#btnDownload").click(function() {
		if(items.length == 0){
            top.layer.alert("温馨提示：请先添加招标人代表信息！", {icon: 7,title: '提示'});
			return;
		}
		var url = downUrl+'?bidSectionId='+packageId+'&examType='+examType;
		window.location.href =$.parserUrlForToken(url);	
	});
	
	//上传备案申请表
	$("#btnUpload").click(function() {
		initUpload();
		$('#fileLoad').trigger('click');
	});
	
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		window.parent.$('#tableList').bootstrapTable('refresh');
		var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});

});

function passMessage(data){
	$("#projectName").html(data.projectName);
	$("#tendererName").html(data.tendererName);
	$("#tenderAgencyName").html(data.tenderAgencyName);
	packageId=data.bidSectionId;
	examType = data.examType;
	getDetail();
}

//初始化文件上传
function initUpload(){
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			basePath:"/"+employeeInfo.enterpriseId+"/"+applyId+"/801",
			businessId: applyId,
			status:1,
			businessTableName:'T_TENDEREE_RECORD_APPLY',  //立项批复文件（项目审批核准文件）    项目表附件
			attachmentSetCode:'TENDEREE_APPLY_FILE'
		});
	}
}

function getDetail() {
	$.ajax({
		url: searchUrl,
		type: "post",
		data: {
			bidSectionId: packageId,
			examType:examType
		},
		success: function(data) {
			if(data.success == false) {
                top.layer.alert('温馨提示：'+data.message);
				return;
			}
			var arr = data.data;
			if(arr){
				applyId = arr.id;
				items= arr.tendereeRecordItems|| "";
				getList(items);
				var viewStatus;
				if(type == "view"){
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							businessId: applyId,
							status:2
						});
					}
				}else{
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							basePath:"/"+employeeInfo.enterpriseId+"/"+applyId+"/111",
							businessId: applyId,
							status:1,
							businessTableName:'T_TENDEREE_RECORD_APPLY',  //立项批复文件（项目审批核准文件）    项目表附件
							attachmentSetCode:'TENDEREE_APPLY_FILE'
						});
					}
				}
				if(arr.projectAttachmentFiles){
	          		fileUploads.fileHtml(arr.projectAttachmentFiles);
	          	}
			}else{
				//没有则默认生成一条申请主表初始记录
				$.ajax({
					url: saveUrl,
					type: "post",
					data: {
						bidSectionId: packageId,
						examType:examType,
						status:0
					},
					success: function(rowdata) {
						if(rowdata.success == false) {
                            top.layer.alert('温馨提示：'+rowdata.message);
							return;
						}else{
							getDetail();
						}
					},
					error: function(rowdata) {
                        top.layer.alert("温馨提示：加载失败", {icon: 3,title: '提示'});
					}
				});
			}
		},
		error: function(data) {
            top.layer.alert("温馨提示：加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};

function getList(arr) {
	$("#expertList").bootstrapTable('removeAll');
    $("#expertList").bootstrapTable({
		columns: [{
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'tendereeName',
				title: '姓名	',
				width:'180',
			}, {
				field: 'sex',
				title: '性别	',//性别   1 男    2 女 
				width:'100',
				align: "center",
				formatter: function(value, row, index){
					if(value==1){
						return  '男';
					}else if(value==2){
						return  '女';
					}
				}
			},
			{
				field: 'age',
				title: '年龄',	
				width:'100',
				align: "center",
			},{
				field: 'telNumber',
				title: '手机号码',	
				width:'100',
				align: "center",
			},{
				field: 'idCard',
				title: '身份证号码',	
				width:'100',
				align: "center",
			},
			/*{
				field: 'company',
				title: '工作单位',	
				width:'200',
				align: "left",
			},{
				field: 'technicalTitle',
				title: '技术职称',
				width:'180',
				align: "left",
			},*/{
				field: 'workYears',
				title: '从事专业年限',
				width:'180',
				align: "center",
			},/*{
				field: 'credentialsNumber',
				title: '注册资格证书编号',
				width:'180',
				align: "left",
			},{
				field: 'educationMajor',
				title: '学历及专业',
				width:'180',
				align: "left",
			},*/{
				field: 'isHasBid',
				title: '有无评标经历',//有无评标经历  0：无 1：有
				width:'180',
				align: "center",
				formatter: function(value, row, index){
					if(value==0){
						return  '无';
					}else if(value==1){
						return  '有';
					}
				}
			},/*{
				field: 'remark',
				title: '备注',//0为否，1为是
				align: "left",
			},*/
			{
				field: "CAOZ",
				title: "操作",
				align: "center",
				width:'200',
				events:{
					/*'click .btnAnswer':function(e,value, row, index){
						top.layer.open({
							type: 2,
							title: "回复",
							area: ['1000px', '600px'],
							resize: false,
							content: editAnswer + "?id=" + row.id+ "&examType=" + examType + '&bidSectionId='+packageId,
							success: function(layero, index) {
							},
							end:function(layero, index){
								getDetail();
							}
						});
					},*/
					'click .viewExpert':function(e,value, row, index){
                        top.layer.open({
							type: 2,
							title: "查看详情",
							area: ['1000px', '600px'],
							resize: false,
							content: viewExpert,
							success: function(layero, index) {
								var iframeWin = layero.find('iframe')[0].contentWindow;
								iframeWin.passMessage(row); //调用子窗口方法，传参*/
							}
						});
					},
					'click .delExpert':function(e,value, row, index){
						$.ajax({
							url: delUrl,
							type: "post",
							data: {
								id: row.id
							},
							success: function(data) {
								if(data.success == false) {
                                    top.layer.alert('温馨提示：'+data.message);
									return;
								}else{
									getDetail();
                                    top.layer.alert("温馨提示：删除成功", {
										icon: 1,
										title: '提示'
									});
									
								}
							},
							error: function(data) {
                                top.layer.alert("温馨提示：加载失败", {
									icon: 3,
									title: '提示'
								});
							}
						});
					},
				},
				formatter: function(value, row, index) {
					//var strAnswer = '<button  type="button" class="btn btn-primary btn-sm btnAnswer"><span class="glyphicon glyphicon-eye-open"></span>回复</button>'; 
					var strView = '<button  type="button" class="btn btn-primary btn-sm viewExpert"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					var strDel = '<button  type="button" class="btn btn-danger btn-sm delExpert"><span class="glyphicon glyphicon-remove"></span>删除</button>';
					if(type == "view"){
						return strView;
					}else{
						return strView + strDel;
					}
				}
			}
		]
	});
	$("#expertList").bootstrapTable('load',arr);
};

