/*
 */ 
/*==========   评审报告   ==========*/
var WORKFLOWTYPE = 'psbg';
$(function(){
    CheckReport()
    findWorkflowCheckerAndAccp(progressList.checkReportId);
})
function CheckReport(){
	$.ajax({
		type: "post",
		url: url + "/ReviewReportController/getCheckReposts.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType:examType,
		},
		async: false,
		success: function (rec) {
			if(!rec.success){
				parent.layer.alert(rec.message);
				$("#"+_THISID).click();
				return
			}
			_THISID=_thisId;
			if (rec.data && rec.data.checkReport != undefined && rec.data.checkReports.length > 0) {
				if (rec.data.checkReport) {
					progressList.checkReport = rec.data.checkReport;
				}
				var isNeedSure=rec.data.isNeedSure;
				if(rec.data.experts){
					var experts=rec.data.experts;		
				}else{
					var experts=new Array()
				}
						
				if(isNeedSure==1){
					$("#isNeedSureShow").show();
					$("#isNeedSure").bootstrapTable({
						//data: repData,
						columns: [{
							title: '序号',
							width: '50px',
							align: 'center',
							formatter: function (value, row, index) {
								return index + 1;
							}
						},{
							title: '评委名称',
							align: 'center',			
							formatter: function (value, row, index) {
								return row.expertName
								
							}
						},{
							title: '签章状态',
							align: 'center',			
							formatter: function (value, row, index) {
								if(row.sureReport==1){
									return "已签章";
								}else if(row.sureReport===0){
									return "不签章";
								}else{
									return "未签章";
								}
								
							}
						},{
							title: '签章时间',
							align: 'center',			
							formatter: function (value, row, index) {
								if(row.sureDate){
									return row.sureDate;
								}else{
									return ''
								}
							}
						}
//						,{
//							title: '确认原因',
//							align: 'center',			
//							formatter: function (value, row, index) {
//								if(row.sureReason){
//									return row.sureReason;
//								}else{
//									return ''
//								}
//							}
//						}
						]
					});
					$('#isNeedSure').bootstrapTable("load", experts);
				}
				//data.data.checkReport == '已完成'
				var repData = rec.data.checkReports;
				if (repData[0].isCheck != undefined && ((repData[0].isCheck == 3 && rec.data.checkReport == '未完成') || (repData[0].isCheck != 3 && rec.data.checkReport == '已完成'))) {
					$("#CheckReportTable").bootstrapTable({
						//data: repData,
						columns: [{
							title: '序号',
							width: '50px',
							align: 'center',							
							formatter: function (value, row, index) {
								return index + 1;
							}
						}, {
							title: (examType==1?'评审报告':'预审报告'),
                            align: 'center',
                            width: '380px',
							
							formatter: function (value, row, index) {
								return progressList.packageName +(examType==1? "_评审报告":'_预审报告');
							}
						}, {
							field: 'operate',
							title: '操作',
							width: '180px',
							align: 'center',							
							events: {
								'click .download': function (e, value, row, index) {
									var str2= progressList.packageName.replace(/[\!\|\~\`\#\$\%\^\&\*\"\?]/g, ' ');
									var newUrl = top.config.FileHost + "/FileController/download.do?ftpPath=" + row.reportUrl + "&fname=" + str2+  (examType==1?"_评审报告.pdf":'_预审报告.pdf');
									window.location.href = $.parserUrlForToken(newUrl);
								},
								'click .viewCheckReport': function (e, value, row, index) {
									previewPdf(row.reportUrl);
								}
							},
							formatter: function (value, row, index) {
								var btn = "<button class='btn btn-xs btn-primary download'><span class='glyphicon glyphicon-save' aria-hidden='true'></span>下载</button>"
									+ "<button class='btn btn-primary btn-xs viewCheckReport' ><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>预览</button>";
								return btn
							}
						}, {
							field: 'isCheck',
							title: '审核',
							width: '150px',
							align: 'center',
							formatter: function (value, row, index) {
								
								if (row.isCheck == 2) {
									return "<div><label class='text-success'>审核通过</label></div>"
								} else if (row.isCheck == 3) {
									return "<div><label class='text-success'>审核不通过</label></div>";
									//return "<div id='submitCheckReport'><button onclick='subAudit(this)' class='btn  btn-primary PriceCheckBtn subAudit btn-xs'>重新提交</button></div>";
								} else if (row.isCheck == 0) {
									if(rec.data.isNeedSignReport == undefined || rec.data.isNeedSignReport === 0 || (rec.data.isNeedSignReport == 1 && rec.data.signReport == '已完成')){
										if(createType!=1){
											return "<div id='submitCheckReport'><button onclick='subAudit(this)' class='btn   btn-primary PriceCheckBtn subAudit btn-xs'><span class='glyphicon glyphicon-saved'></span>提交审核</button></div>";
										}
									}
								} else if (row.isCheck == 4) {
									return "<div><label class='text-warning'>审核中</label></div>"
								}
							}
						}]
					});
					$(".PriceCheckBtn").show();

					$('#CheckReportTable').bootstrapTable("load", repData);

					if (repData[0].isCheck == 3) {
						//审核不通过
						$('#CheckReportTable').bootstrapTable('hideColumn', 'operate');
					}
				}


			}
		}
	});
}
function viewCheckReport(reportUrl){
	previewPdf(reportUrl);
}
//提交审核
function subAudit(button, index) {
	$.ajax({
		url: top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do",
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "psbg"
		},
		success: function (data) {
			var option = ""
			//判断是否有审核人		   	  
			if (data.message == 0) {
				top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function () {
					$.ajax({
						url: top.config.AuctionHost + "/ReviewReportController/saveCheckForCheckReport.do",
						type: "post",
						data: {
							projectId: projectId,
							packageId: packageId,
							examType: examType,
							level: 9
						},
						dataType: "json",
						success: function (data) {
							if (data.success) {								
								$("#"+_THISID).click();
								top.layer.msg("提交成功");
							} else {
								top.layer.alert("提交失败:" + data.message);
							}
						}
					})
				});
			} else if (data.message == 2) {
				parent.layer.alert("找不到该级别的审批人,请在项目审批管理中设置审核人");
				$(button).attr("disabled", true);
			} else if (data.success == true) {
				option = "<option value=''>请选择审核人员</option>"
				for (var i = 0; i < data.data.length; i++) {
					option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
				}
				var html='<table class="table table-bordered">'
                    +'<tr>'
                        +'<td class="th_bg" style="vertical-align: middle;">选择审核人:</td>'
                        +'<td>'
                            +'<select name="" id="employeeId" class="form-control">'+ option +'</select>'
                        +'</td>'
                   +'</tr>'
                +'</table>'
				top.layer.open({
					type: 1,
					title: '请选择审核人',
					area: ['450px', '200px'],
					maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					resize: false, //是否允许拉伸
					closeBtn: 1,
					content: html,
					btn: ['确定', '取消'],
					scrolling: 'no',
					yes: function (index, layero) {						
						var checkerId = layero.find("#employeeId").val();
						if (checkerId == "") {
							top.layer.alert("请选择审核人！");
							return;
						}
						$.ajax({
							url: top.config.AuctionHost + "/ReviewReportController/saveCheckForCheckReport.do",
							type: "post",
							data: {
								employeeId: checkerId,
								projectId: projectId,
								packageId: packageId,
								examType: examType,
								level: 1
							},
							dataType: "json",
							success: function (data) {								
								if (data.success) {									
									$("#"+_THISID).click();
									top.layer.msg("提交成功");
								} else {
									top.layer.alert("提交失败:" + data.message);
								}
								top.layer.close(index);
							}
						})
					}
				});
			}
		}
	});
}
/*==========   评审报告END   ==========*/