var commonDownloadFileUrl = top.config.FileHost + '/FileController/download.do';//下载文件

// Object.assign
if (typeof Object.assign != 'function') {
	Object.assign = function (target, varArgs) {
		// .length of function is 2
		if (target == null) {
			// TypeError if undefined or null
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);

		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource != null) {
				// Skip over if undefined or null
				for (var nextKey in nextSource) {
					// Avoid bugs when hasOwnProperty is shadowed
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	};
}

function entryInfo() {
    var entryData;
    $.ajax({
        type: "post",
        url: top.config.tenderHost + '/getEmployeeInfo.do',  //获取登录人信息,
        async: false,
        success: function (data) {
            if (data.success) {
                entryData = data.data
            }
        },
        error: function () {

        },
    })
    return entryData
}

function getUrlParamObject(url) {
	url = url || location.href || '';
	var out = {};
	var regex = /([^?=&]+)=([^?=&]*)/g;
	var mather;
	while ((mather = regex.exec(url))) {
		var value = mather[2];
		try {
			value = decodeURIComponent(decodeURIComponent(value));
		} catch (error) {
			console.error(error)
			try {
				value = decodeURIComponent(value);
			} catch (error) {
				console.error(error)
			}
		}
		out[mather[1]] = value;
	}
	return out;
}

function parseUrlParam(obj) {
	var url = [];
	for (var key in obj) {
		url.push(key + '=' + encodeURIComponent(obj[key]));
	}
	return url.join('&');
}

function doPackageView(tenderType) {
    if (isProjectMode(tenderType)) {
        $('.package-view').map(function(index, el) {
            var self = $(el);
            self.text(self.text().replace('包件', '项目'))
			if (self.attr('errormsg')) {
				self.attr('errormsg', self.attr('errormsg').replace('包件', '项目'));
			}
        })
    }
}

function isProjectMode(tenderType) {
	return tenderType == 1 || tenderType == 2;
}

function formatReplyList(list) {
	$('#multiple-reply-list').empty();
	var tableDiv = '';
	list.forEach(function (el) {
		var div = '';
		div += '<table class="table table-bordered ">'
		div += '<tr>'
		div += '<td class="th_bg">回复内容</td>'
		div += '<td colspan="3">'
		div += el.answersContent
		div += '</td>'
		div += '</tr>'
		div += '<tr>'
		div += '<td class="th_bg">附件</td>'
		div += '<td colspan="3">'
		div += formatFileTable(el.files)
		div += '</td>'
		div += '</tr>'
		div += '<tr>'
		div += '<td class="th_bg">回复人</td>'
		div += '<td>'
		div += el.answersEmployeeName;
		div += '</td>'
		div += '<td class="th_bg">回复时间</td>'
		div += '<td>'
		div += el.answersDate
		div += '</td>'
		div += '</tr>'
		div += '</table>'
		tableDiv += div;
	})
	$('#multiple-reply-list').html(tableDiv);
}

function formatFileTable(files) {
	if ((files || []).length == 0) {
		return '';
	}
	var trArr = [];
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var fileName = file.fileName || '';
		var suffix = fileName.substring(fileName.lastIndexOf(".") + 1).toUpperCase();
		var strHtml = "<tr><td style='text-align:center;'>" + (i + 1) + "</td>";
		strHtml += "<td >" + fileName + "</td>"
		strHtml += "<td >" + changeUnit(file.fileSize || '') + "</td>"
		strHtml += "<td >" + file.userName + "</td>"
		strHtml += "<td >" + file.subDate + "</td>"
		strHtml += "<td style='text-align: center;'>";
		if (suffix == 'PNG' || suffix == 'JPG' || suffix == 'JPGE' || suffix == 'PDF') {
			strHtml += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=commonShowImage('" + file.filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>&nbsp;&nbsp;"
		} else {
			strHtml += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=commonDownloadFile('" + file.filePath + "','" + encodeURIComponent(fileName) + "')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>&nbsp;&nbsp;"
		}
		strHtml += "</td></tr>";
		trArr.push(strHtml);
	}

	var tableDiv = '';
	tableDiv += '<table class="table table-bordered" style="margin-bottom: 0;">'
	tableDiv += '<tr>'
	tableDiv += '<td style="width: 50px;">序号</td>'
	tableDiv += '<td>附件名称</td>'
	tableDiv += '<td style="width:120px; text-align:center">文件大小</td>'
	tableDiv += '<td>上传者</td>'
	tableDiv += '<td style="width:150px; text-align:center">上传时间</td>'
	tableDiv += '<td style="width:150px;text-align: center;">操作</td>'
	tableDiv += '</tr>'
	tableDiv += trArr.join('')
	tableDiv += '</table>'
	return tableDiv;
}


function changeUnit(size) {
	var num = Number(size);
	if (num >= 1024 * 1024 * 1024) {
		return (num / 1024 / 1024 / 1024).toFixed(2) + "G";
	} else if (num >= 1024 * 1024 && num < 1024 * 1024 * 1024) {
		return (num / 1024 / 1024).toFixed(2) + "M";
	} else if (num >= 1024 && num < 1024 * 1024) {
		return (num / 1024).toFixed(2) + "KB";
	} else {
		return num + "B";
	}
}

//下载
function commonDownloadFile(filePath, fileName) {
	var newUrl = commonDownloadFileUrl + '?ftpPath=' + filePath + '&fname=' + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}

//预览
function commonShowImage(filePath) {
	openPreview(filePath, "850px", "700px");
}

function formatObjectionTypeView(el, value) {
	var dic = {
		8: '结果公示',
		9: '项目异常公示',
	}
	$(el).text(dic[value] || value);
}
// 异议处理结果下拉选项
var dealResultTypeDict = {
	1:"驳回",
	2:"修改文件",
	3:"招标无效",
	4:"投标无效",
	5:"中标无效",
	6:"未修改文件",
	7:"未变更结果",
}
function dealResultSelect(docEle){
	if(!docEle) docEle = 'results';
	var	selHtml = "<option value=''>请选择</option>";
	for(var key in dealResultTypeDict){
		if(key!=1){
			selHtml += '<option value="' + key + '">' + dealResultTypeDict[key] + '</option>'
		}
	}
	$("#"+docEle).html(selHtml)
}
$("input[name='isOver']").click(function(){
	var overVal = $(this).val();
	if(overVal == 0){
		$(".deal_sel").hide();
		$("#results").attr("ignore","ignore");
		$("#results").attr("disabled","disabled");
	}else{
		$(".deal_sel").show();
		$("#results").removeAttr("ignore");
		$("#results").removeAttr("disabled");
	}
})