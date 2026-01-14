var searchUrl = config.Reviewhost + '/ExpertControll/getAllSectionExpert.do'; //质疑答疑查询根据标段ID接口
var saveExcelUrl = config.Reviewhost + '/ExpertControll/importData.do'; 
var delUrl = config.Reviewhost + '/ExpertControll/deleteExpertById.do'; 

var editExpert = "Review/expert/model/editExpert.html"; 
var viewExpert = "Review/expert/model/viewExpert.html";
var packageId; //标段主键ID
var examType;//资格预审方式
var type;
$(function() {
	if(getUrlParam("type") && getUrlParam("type") != "undefined") {
	    type = getUrlParam("type");
	}
	if(type == "view"){
		$(".importAccept").hide();
		$(".addExpert").hide();
	}
	
	//添加评委
	$("#addExpert").click(function() {
        top.layer.open({
			type: 2,
			title: "添加评委",
			area: ['1100px', '600px'],
			resize: false,
			content: editExpert + "?bidSectionId=" + packageId+ "&examType=" + examType,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.du(function(){
					getDetail();
				});
			}
		});
	});
	
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});

});

function passMessage(data){
	$("#bidSectionCode").html(data.bidSectionCode);
	$("#bidSectionName").html(data.bidSectionName);
	packageId=data.bidSectionId;
	examType = data.examType;
	getDetail();
}

/**
 *评委信息模版下载
 */
function  excelDownload(){
    var newUrl = excelDownloadUrl+"?fname=评委信息&filePath=expert.xlsx";
    window.location.href = $.parserUrlForToken(newUrl);
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
			getList(arr);
            top.$("#tableList").bootstrapTable("refresh");
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
				field: 'expertName',
				title: '专家姓名	',
				width:'180',
			}, {
				field: 'phoneNumber',
				title: '手机号码	',
				width:'150',
				align: "center",
			},
			{
				field: 'idCard',
				title: '身份证件号',		
				width:'200',
				align: "center",		
			},
			{
				field: 'expertType',
				title: '专家类别',	
				width:'200',
				align: "center",
				formatter: function(value, row, index) {//专家类别 1为在库专家，2为招标人代表
					if(value ==1){
						return '在库专家';
					}else{
						return '招标人代表';
					}					
				}
			},/*{
				field: 'isChairMan',
				title: '是否为评标组长',//0为否，1为是
				width:'180',
				align: "center",
				formatter: function(value, row, index) {
					if(value ==0){
						return '否';
					}else{
						return '是';
					}
				}
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
							title: "查看",
							area: ['1100px', '600px'],
							resize: false,
							content: viewExpert + "?id=" + row.id,
							success: function(layero, index) {
								/*var iframeWin = layero.find('iframe')[0].contentWindow;
								iframeWin.passMessage(callback); //调用子窗口方法，传参*/
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
                                    top.layer.alert("温馨提示：删除成功", {
										icon: 1,
										title: '提示'
									});
									getDetail()
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
	$("#expertList").bootstrapTable('load',arr)
};


//Excel导入
function importAccept(obj){
	  	var f = obj.files[0];
	  	if(f!=null){
		 	var fileName = f.name;
		 	var fileExtension = fileName.substring(fileName.lastIndexOf('.'));//文件后缀
			if(fileExtension.toLowerCase() != ".xls" && fileExtension.toLowerCase() != ".xlsx") {
                top.layer.alert("温馨提示：只支持:xls,xlsx格式文件!",{icon:2});
			    return;
			}
		  	var formFile = new FormData();
		  	formFile.append("file", f); //加入文件对象
		  	formFile.append("bidSectionId", packageId); 
		  	formFile.append("examType", examType); 
		  	var data=formFile;
			//data.bidSectionId = packageId;
			//data.examType = examType;
		    $.ajax({
				type: "post",
				url: saveExcelUrl,
				async: false,
				dataType: 'json',
				cache: false,//上传文件无需缓存
		        processData: false,//用于对data参数进行序列化处理 这里必须false
		        contentType: false, //必须
				data: data,
					//formFile+"?bidSectionId="+packageId+"&examType="+examType,
				error: function(data) {
					layer.alert("温馨提示：系统异常,请联系管理员",{icon:2});
				},
				success: function(data) {	
					var list = data.data;
	                if(list.length==0){
	                	layer.alert("温馨提示：全部导入成功!");
	                }else{
	                    layer.alert('温馨提示：'+list);
	                }
					getDetail()
				}
			});
		}
}

