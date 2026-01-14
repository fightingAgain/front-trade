var expertListUrl = url + '/ExpertSignInController/findSignInList.do';//签到情况
var recordUrl = url + '/ExpertSignInController/findAllSignInLogs.do';//签订记录
var reSignUrl = url + '/ExpertSignInController/resetSignIn.do';//重签
$(function(){
	getPromise()
})
function getPromise(){
	$.ajax({
		url: expertListUrl,
		type: "POST",
		data: {
			'packageId': packageId,
			'examType': examType
		},
		async: true,
		success: function (data) {
			if(data.success){
				signHtml(data.data);
			}else{
				parent.layer.alert('温馨提示：' + data.message)
			}
		},
		error: function (data) {
			parent.layer.alert("温馨提示：加载失败");
		}
	})
	$.ajax({
		url: recordUrl,
		type: "POST",
		data: {
			'packageId': packageId,
			'examType': examType
		},
		async: true,
		success: function (data) {
			if(data.success){
				signRecord(data.data);
			}else{
				parent.layer.alert('温馨提示：' + data.message)
			}
		},
		error: function (data) {
			parent.layer.alert("温馨提示：加载失败");
		}
	})
}
function signHtml(expertList){
	$("#expertSignPtomiseList").bootstrapTable({
		columns: [{
			title: '序号',
			width: '50px',
			align: 'center',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return index + 1;
			}
		},{
			field: 'expertName',
			title: '评委姓名',
			width: '100',
		},{
			field: 'expertType',
			title: '类型',
			width: '100',
			align: 'center',
			formatter: function(value, row, index) {
				if(value == 1){
					return '专家评委'
				}else if(value == 2){
					return '业主评委'
				}
			}
		},{
			field: 'idCard',
			title: '身份证号',
			width: '200',
			align: 'center',

		},{
			field: 'signTel',
			title: '联系方式',
			width: '150',
			align: 'center',
		},{
			field: 'signTime',
			title: '签到时间',
			width: '150',
			align: 'center'
		},{
			field: 'isAvoid',
			title: '有无回避条款情况(有/无)',
			width: '80',
			align: 'center',
			formatter: function(value, row, index) {
				if(value == '1'){
					return '有'
				}else if(value == '0'){
					return '无'
				}
			}
		},{
			field: 'signResult',
			title: '状态',
			width: '80',
			align: 'center',
			formatter: function(value, row, index) {
				if(value == 1){
					return '<span class="text-success">已签到</span>'
				}else {
					if(row.singUrl){
						return '<span class="text-success" style="color:orange">重签中</span>'
					}else{
						return '未签到'
					}
				}
			}
		},{
			field: 'singUrl',
			title: '操作',
			width: '200',
			align: 'center',
			events: {
				'click .btnPromiseView': function(e,value, row){
					parent.openPreview(value, "100%", "100%");
				},
				//重新签订
				'click .reSignPromise': function(e,value, row){
					var html = '<div style="padding:10px;"><div style="margin-bottom:10px;"><i class="red">*</i>重签原因：</div><div><textarea rows="5" cols="" style="resize: none;width: 100%;border-radius: 4px !important;padding:5px;" name="reason"></textarea></div></div>';
					top.layer.open({
						type: 1,
						title: '重签原因',
						area: ['500px', '400px'],
						resize: false,
						content: html,
						btn:['确定','取消'],
						success: function(layero, index) {
							//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
						},
						yes: function(index, layero) {
							// var iframeWin = layero.find('iframe')[0].contentWindow;
							var reason = $.trim(layero.find('[name=reason]').val());
							if(reason == ''){
								top.layer.alert('温馨提示：请输入重签原因！');
								return
							};
							if(reason.length > 100){
								top.layer.alert('温馨提示：重签原因不得超过100个字！');
								return
							};
							var postData = {
								'packageId': packageId,
								'examType': examType,
								'expertId': row.expertId,
								'resetRemarks':reason
							};
							setReSign(postData, getPromise);
							top.layer.close(index);
						},

					})
				}
			},
			formatter: function(value, row, index) {
				var view = '<button type="button" class="btn btn-primary btnPromiseView" style="display: inline-block;">查看</button>';
				var reSign = '<button type="button" class="btn btn-warning reSignPromise" style="display: inline-block;">重新签订</button>';
				if(row.signResult == 1){
					if(progressList.isShowSignIn == 1 && createType == 0){//是否展示重新签订承诺书按钮
						return view + reSign
					}else{
						return view
					}
				}else{
					if(value){
						return view
					}else{
						return ''
					}
				}
			}
		},
		]
	});
	$("#expertSignPtomiseList").bootstrapTable('load',expertList)
};
function signRecord(expertLists){
	$("#expertSignRecordList").bootstrapTable({
		columns: [{
			title: '序号',
			width: '50px',
			align: 'center',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return index + 1;
			}
		},{
			field: 'expertName',
			title: '评委姓名',
			width: '100',
			formatter: function(value, row, index) {
				if(row.isAbandon == 1){
					return value + '<span class="red">（已废弃）</span>'
				}else{
					return value
				}
			}
		},{
			field: 'signTel',
			title: '联系方式',
			width: '150',
			align: 'center',
		},{
			field: 'signTime',
			title: '签订时间',
			width: '200',
			align: 'center',

		},{
			field: 'resetRemarks',
			title: '说明',
			width: '200',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.abandonReason){
					return value + '<span>；'+ row.abandonReason +'</span>'
				}else{
					return value
				}
			}
		},{
			field: 'singUrl',
			title: '操作',
			width: '80',
			align: 'center',
			events: {
				'click .btnPromiseView': function(e,value, row){
					parent.openPreview(value, "100%", "100%");
				},
			},
			formatter: function(value, row, index) {
				var view = '<button type="button" class="btn btn-primary btnPromiseView" style="display: inline-block;">查看</button>';
				return view
			}
		},
		]
	});
	$("#expertSignRecordList").bootstrapTable('load',expertLists)
}
/* 重签 */
function setReSign(data, callback){
	$.ajax({
		url: reSignUrl,
		type: "POST",
		data: data,
		async: true,
		success: function (data) {
			if(data.success){
				callback();
			}else{
				parent.layer.alert('温馨提示：' + data.message)
			}
		},
		error: function (data) {
			parent.layer.alert("温馨提示：加载失败");
		}
	});
}