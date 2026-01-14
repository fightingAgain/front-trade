var searchUrl = parent.config.AuctionHost + '/AskAnswersController/findPageList.do';
var searchProjectInfo = parent.config.AuctionHost + '/AskAnswersController/findProjectInfoForAskAnswers.do';

var projectId = getQueryString("projectId");
var createType = getQueryString("createType") ;//是否项目创建人  0是  1不是
var tenderType = 1;//竞价
var purchase; //项目信息


$(function() {
	
	//查询项目信息
	$.ajax({
		type: "post",
		url:searchProjectInfo,
		datatype: 'json',
		data:{
			projectId:projectId,
			tenderType:tenderType,
		},
		async: false,
		success: function(data) {
			if(data.success) {
				//项目信息
				purchase = data.data;
				
				//项目数据回显
				setProjectInfo();
				
				//澄清回复列表
				initTable();
			}
		}
	});
	
})

function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	var answersEmployeeId = row.answersEmployeeId;
	var endType = 0; //0接受提问的项目  1已结束答复
	var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	if(purchase.answersEndDate != undefined && NewDate(purchase.answersEndDate) < NewDate(nowDate)){
	 	endType = 1;
	}
	
	
	if(createType != undefined && createType == 1) {
		return [
			'<a href="javascript:void(0)" id="TableEditor" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>&nbsp;&nbsp;',
		].join("")
	} else {

		if(answersEmployeeId == "" || typeof(answersEmployeeId) == "undefined" || answersEmployeeId == null) {
			if(endType == '1') {
				//结束答复的
				return [
					'<a href="javascript:void(0)" id="TableEditor" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>&nbsp;&nbsp;',
				].join("")
			} else {
				return [
					'<a href="javascript:void(0)" id="editAnswer" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon glyphicon-pencil" aria-hidden="true"></span>答复</a>&nbsp;&nbsp;',
					'<a href="javascript:void(0)" id="TableEditor" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>&nbsp;&nbsp;',
				].join("")
			}

		} else {
			return [
				'<a href="javascript:void(0)" id="TableEditor" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>&nbsp;&nbsp;',
			].join("")
		}
	}

}

window.operateEvents = { //添加一个按钮对应的事件

	"click #editAnswer": function(e, value, row, index) {

		parent.layer.open({
			type: 2, //此处以iframe举例
			title: '答复',
			// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			scrollbar: false,
			resize: false, //是否允许拉伸
			area: ["800px", "600px"],
			content: 'Auction/Auction/Purchase/AnswerAsk/CommitAnswer.html',
			// btn: ['提交', '取消'], //确定按钮
			
			yes: function(index, layero) {

				var iframeWin = layero.find('iframe')[0].contentWindow;
				if(iframeWin.$("#answersContent").val().length == 0) {
					parent.layer.msg("答复内容不能为空");
					return;
				}

				//判断答复的长度
				if(iframeWin.$("#answersContent").val().length > 1000) {
					parent.layer.msg("答复内容不能超过1000字");
					return;
				}

				iframeWin.Ti();
				parent.layer.close(index);
				$('#Answertable').bootstrapTable('refresh', {
					url: searchUrl
				});
			},
			btn2: function() {

			},
			success: function(layero, index) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;

				iframeWin.$("#projectName").text(purchase.projectName);
				iframeWin.$("#askTitle").text(row.askTitle);
				iframeWin.$("#askContent").text(row.askContent);
				iframeWin.$("#id").val(row.id);
				iframeWin.findFileList(row.id, function(){
					if(iframeWin.$("#answersContent").val().length == 0) {
						parent.layer.msg("答复内容不能为空");
						return;
					}
					
					//判断答复的长度
					if(iframeWin.$("#answersContent").val().length > 1000) {
						parent.layer.msg("答复内容不能超过1000字");
						return;
					}
					
					iframeWin.Ti();
					parent.layer.close(index);
					$('#Answertable').bootstrapTable('refresh', {
						url: searchUrl
					});
				});
			}
		});
	},

	"click #TableEditor": function(e, value, row, index) {

		parent.layer.open({
			type: 2,
			title: '查看详情',
			area: ["1100px", "600px"],
			scrollbar: false,
			// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			content: 'Auction/Auction/Purchase/AnswerAsk/AskContent.html',
			success: function(layero, index) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.show(row);
			}
		});
	}
}

function setProjectInfo() {
	$('label').each(function() {
		$(this).text(purchase[this.id]);
	});

	if(purchase.projectSource == '1') {
		$("#ppName").html("(重新竞价)");
	} else {
		$("#ppName").html("");
	}
}

/// 表格初始化
function initTable() {
	
	$('#Answertable').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: searchUrl, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 25, 50],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		clickToSelect: true, //是否启用点击选中行
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		//toolbar: '#toolbar', // 工具栏ID
		//toolbarAlign: 'right', // 工具栏对齐方式
		//sortStable:true,
		queryParams: function(params) { // 请求参数，这个关系到后续用到的异步刷新
			var paramData = {
				'pageNumber': params.offset / params.limit + 1, //当前页数
				'pageSize': params.limit, // 每页显示数量
				'offset': params.offset, // SQL语句偏移量	
				'projectId': projectId,
				'tenderType': tenderType
			};
			return paramData;
		},
		queryParamsType: "limit",
		onCheck: function(row) {
			
		},
		columns: [
			[{
				field: 'Id',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#Answertable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#Answertable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'askTitle',
				title: '提问标题',
				align: 'left',

			}, {
				field: 'askDate',
				title: '提问时间',
				align: 'center',

			}, {
				title: '提问人',
				field: 'askEnterpriseName',

			}, {
				field: 'answersDate',
				title: '回复时间',
				align: 'center',
			}, {
				field: 'answerEnterpriseName',
				title: '回复人',

			}, {

				title: '操作',
				align: 'center',
				width: '160px',
				events: operateEvents, //给按钮注册事件
				formatter: AddFunction, //表格中添加按钮
			}]
		],
	});
};

// 搜索按钮触发事件
$("#eventquery").click(function() {
	$('#Answertable').bootstrapTable('destroy'); // 很重要的一步，刷新url！	
	initTable()			
});

function time() {
	layui.use('laydate', function() {
		var laydate = layui.laydate;
		//自定义格式
		laydate.render({
			elem: '#search_2',
			format: 'yyyy年MM月dd日'
		});
	})
}
//格林威治时间转换成北京时间
function GMTToStr(time) {
	var date = new Date(time)
	if(date.getMonth() < 10) {
		var Month = '0' + (date.getMonth() + 1)
	} else {
		var Month = date.getMonth() + 1
	};
	if(date.getDate() < 10) {
		var Dates = '0' + date.getDate()
	} else {
		var Dates = date.getDate()
	};
	if(date.getHours() < 10) {
		var Hours = '0' + date.getHours()
	} else {
		var Hours = date.getHours()
	}
	if(date.getMinutes() < 10) {
		var Minutes = '0' + date.getMinutes()
	} else {
		var Minutes = date.getMinutes()
	};
	if(date.getSeconds() < 10) {
		var Seconds = '0' + date.getSeconds()
	} else {
		var Seconds = date.getSeconds()
	};
	var Str = date.getFullYear() + '-' +
		Month + '-' +
		Dates + ' ' +
		Hours + ':' +
		Minutes + ':' +
		Seconds
	return Str
}

function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
}

function NewDate(str){
	  if(!str){  
	    return 0;  
	  }  
	  arr=str.split(" ");  
	  d=arr[0].split("-");  
	  t=arr[1].split(":");
	  var date = new Date();   
	  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
	  date.setUTCHours(t[0]-8, t[1]);
	  return date.getTime();  
} 