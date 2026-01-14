/*
 * @Author: your name
 * @Date: 2020-09-12 09:15:32
 * @LastEditTime: 2020-11-04 09:21:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\CheckReport.js
 */
/*==========   评审报告   ==========*/
var WORKFLOWTYPE = 'psbg';
var pdfurl= '';//需签章的评标报告路径
var isCloseSign = true;
var getSignUrl = url + '/ReviewReportController/getSign.do';//
var signUrl = url + '/ReviewReportController/sign.do';//签章
$(function() {
	CheckReport()
})

function CheckReport() {
	$.ajax({
		type: "post",
		url: url + "/ReviewReportController/getCheckReposts.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: examType,
			expertId: expertIds,
		},
		async: false,
		success: function(rec) {
			if(!rec.success) {
				parent.layer.alert(rec.message);
				$("#" + _THISID).click();
				return
			}
			_THISID = _thisId;
			if(rec.data && rec.data.checkReport != undefined && rec.data.checkReports.length > 0) {
				var repData = rec.data.checkReports;
				var isNeedSure = rec.data.isNeedSure;
				var sureReport = rec.data.sureReport;
				//需要签名且未签名时显示签名按钮
				if(rec.data.isNeedSignReport == 1 && rec.data.expertSignReport =='未完成'){
					$('#btnSignReport').show();
					pdfurl = rec.data.expertSignReportUrl?rec.data.expertSignReportUrl:'';
				}else{
					$('#btnSignReport').hide()
				}
				if(isNeedSure == 1 && (sureReport != 1 && sureReport !== 0)) {
					$("#isNeedSure").show();
				}
				$("#CheckReportTable").bootstrapTable({
					//data: repData,
					columns: [{
						title: '序号',
						width: '50px',
						align: 'center',
						formatter: function(value, row, index) {
							return index + 1;
						}
					}, {
						title: (examType == 1 ? '评审报告' : '预审报告'),
						align: 'center',
						width: '380px',
						cellStyle: {
							css: {
								"text-align": "center"
							}
						},
						formatter: function(value, row, index) {
							return progressList.packageName + (examType == 1 ? "_评审报告" : '_预审报告');
						}
					}, {
						field: 'operate',
						title: '操作',
						width: '180px',
						align: 'center',
						cellStyle: {
							css: {
								"text-align": "center"
							}
						},

						events: {
							'click .download': function(e, value, row, index) {
								var str2 = progressList.packageName.replace(/[\!\|\~\`\#\$\%\^\&\*\"\?]/g, ' ');
								var newUrl = top.config.FileHost + "/FileController/download.do?ftpPath=" + row.reportUrl + "&fname=" + str2 + (examType == 1 ? "_评审报告.pdf" : '_预审报告.pdf');
								window.location.href = $.parserUrlForToken(newUrl);
							},
							'click .viewCheckReport': function(e, value, row, index) {
								previewPdf(row.reportUrl);
							}
						},
						formatter: function(value, row, index) {
							var btn = "<button type='button' class='btn btn-xs btn-primary download'><span class='glyphicon glyphicon-eye-open'></span>下载</button>" +
								"<button type='button' class='btn btn-primary btn-xs viewCheckReport'><span class='glyphicon glyphicon-eye-open'></span>预览</button>";
							return btn
						}
					}]
				});
				$('#CheckReportTable').bootstrapTable("load", repData);

			}
		}
	});
};
$('#btnSignReport').click(function(){
	if(pdfurl == ''){
		top.layer.alert('无可签章的评审报告！');
		return
	}
	top.layer.open({
	    type: 2,
	    title: "签章 ",
	    area: ['100%','100%'],
	    maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
	    resize: false, //是否允许拉伸
		id:'signReportOfExperts',
	    btn:["签章","关闭"],
	    content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+pdfurl,
	    success: function(layero, index){
	        isCloseSign = false
	    },
	    yes:function(index,layero){
	        customMask =top.layer.load(1, {shade: [0.3, '#000000'],content:'<div style="width:150px;padding-top:46px;">签章中，请稍候...</div>',area: ['100px','150px']});
			let icardno = "";
			if(expertCA){
			    icardno = userInfo.identityCardNum
			}
			new CA().signature(function(publicKey){
	            let data;
				var param = {
					"publicKey":publicKey,
					"expertId": expertIds
				};
				reviewFlowNode(param, getSignUrl, function(res){
					data = res;
				});
	            if(data){
	                return data;
	            }else{
	                throw new Error("");
	            }
	        }, function(params){
	            let data;
				var param = {
					// "nodeType":"signPromise",
					// "method":"sign",
					"pdfId":params.pdfId,
					"sigString":params.sigString,
					"caCode":params.caCode,
					"caDn":params.caDn,
					"expertId": expertIds
				};
				reviewFlowNode(param, signUrl, function(res){
					data = res;
				});
	            if(data){
	                return data;
	            }else{
	                throw new Error("");
	            }
	        }, function(){
	            return {};
	        }, function(url){
	            var iframeWin = layero.find('iframe');
	            iframeWin.attr("src", siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+url);
	            layero.find('.layui-layer-btn0').hide();
	            $("#" + _thisId).click();
	            top.layer.close(customMask);
	            top.layer.msg('温馨提示：签章成功！', {time: 5000});
	            // var inde = top.layer.alert('温馨提示：签章成功！');
	            // setTimeout(function() {
	            // 	top.layer.close(inde);
	            // }, 5000);
	        },icardno);
	    },
	    no:function(index,layero){
	        top.layer.close(index);
	    },
	    end: function(){
	        isCloseSign = true
	    }
	});
})
//签章
$("#isNeedSure").off('click').on('click', function() {
	parent.layer.confirm("温馨提示：是否选择签章？", {
		btn: ['同意', '取消'] //可以无限个按钮
	}, function(index, layero) {
		//小程序
		$.ajax({
			type: "post",
			url: url + "/RecordReviewController/xcxm.do",
			data: {
				//				'projectId': projectId,
				'packageId': packageId,
				'checkExpertId': expertIds,
				'examType': examType,
				'page': "pages/sign/index"
			},
			dataType: "json",
			success: function(response) {
				var arr = response.data;
				var src = '..';
				if(arr) {
					src = $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + arr);
				}
				//				if(response.success) {
				//					parent.layer.close(index);
				//					<div id="imgbox"><div style="background: #00B83F;width: 200px;height: 200px;"></div></div>
				parent.layer.confirm('<img style="width: 200px;height: 200px;" src="' + src + '" id="appletImg" />', {
					btn: ['是'] //可以无限个按钮
				}, function(index, layero) {
					//倒计时
					setTimeout(function() {
						$.ajax({
							type: "post",
							url: url + "/RecordReviewController/findMessageSign",
							data: {
								'projectId': projectId,
								'packageId': packageId,
							},
							dataType: "json",
							success: function(response) {
								if(response.success) {
									parent.layer.alert(response.message);
								}
								parent.layer.close(index);
							}
						});
					}, 10000);
				})

			
			}
		});

	}, function(index) {
		parent.layer.close(index);
	})
})

//评审报告确认
//$("#isNeedSure").on('click',function(){
//	parent.layer.confirm("温馨提示：是否同意项目经理提交评审报告？", {
//		btn: ['同意', '不同意','取消'] //可以无限个按钮
//	}, function(index, layero) {
//		$.ajax({
//			type: "post",
//			url: url+"/CheckReportController/sureReport.do",
//			data:{
//				'projectId':projectId,
//				'packageId':packageId,
//				'examType':examType,
//				'checkerEmployeeId':expertIds,
//				'sureReport':1
//			},
//			dataType: "json",
//			success: function (response) {
//				if(response.success){
//					parent.layer.close(index);
//					$("#isNeedSure").hide();
//				}
//			}
//		});
//	}, function(indexs) {
//		parent.layer.prompt({
//			title: '请输入不同意原因',
//			formType: 2
//		}, function (text, index) {
//			if($.trim(text)==""){
//				parent.layer.alert('温馨提示：原因不能为空')
//				return 
//			}
//			$.ajax({
//				type: "post",
//				url: url+"/CheckReportController/sureReport.do",
//				data:{
//					'projectId':projectId,
//					'packageId':packageId,
//					'examType':examType,
//					'checkerEmployeeId':expertIds,
//					'sureReport':0,
//					'sureReason':text,
//				},
//				dataType: "json",
//				success: function (response) {
//					if(response.success){
//						parent.layer.close(indexs);
//						parent.layer.close(index);
//						$("#isNeedSure").hide();
//					}
//				}
//			});
//		});
//		
//	}, function(index) {
//		parent.layer.close(index);
//	});	
//})
/*==========   评审报告END   ==========*/