// 异议处理结果下拉选项
var dealResultTypeDict = {
	1:"驳回",
	2:"修改文件",
	3:"招标无效",
	4:"投标无效",
	5:"中标无效",
	6: "未修改文件",
	7: "未变更结果",
}
function dealResultSelect(docEle){
	if(!docEle) docEle = 'results';
	var	selHtml = "<option value=''>请选择</option>";
	for(var key in dealResultTypeDict){
		if (key != 1) {
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