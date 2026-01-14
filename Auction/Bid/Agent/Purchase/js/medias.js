//添加媒体
var typeIdLists = "";//媒体的ID
var typeNameLists = "";//媒体名字
var typeCodeLists = "";//媒体编号
var itemTypeIds = []//媒体ID
var itemTypeNames = []//媒体名字
var itemTypeCodes = []//媒体编号
var sendUrl = top.config.Syshost + "/OptionsController/list.do"; //获取媒体的数据
var optiondata = []
medias();
function medias() {
	$.ajax({
		url: sendUrl,
		type: "post",
		async: false,
		dataType: "json",
		data: {
			"optionName": "PUBLISH_MEDIA_NAME"
		},
		success: function (result) {
			var op = "";
			if (result.success) {
				optiondata = result.data;
				for (var i = 0; i < result.data.length; i++) {
					op += '<option class="' + result.data[i].optionValue + '" value="' + result.data[i].optionText + '" data-tokens="' + result.data[i].id + '">' + result.data[i].optionText + '</option>'
				}
				$("#optionName").html(op)
			}
		}
	})

};
//取出选择的任务执行人的方法
function getOptoions() {
	var optionId = [], optionValue = [], optionName = [];
	//循环的取出插件选择的元素(通过是否添加了selected类名判断)
	for (var i = 0; i < $("li.selected").length; i++) {
		optionValue.push($("li.selected").eq(i).find("a").attr("class"));
		optionId.push($("li.selected").eq(i).find("a").attr("data-tokens"));
		optionName.push($("li.selected").eq(i).find(".text").text());

	}
	typeIdLists = optionId.join(",")//媒体ID
	typeNameLists = optionName.join(",")//媒体名字
	typeCodeLists = optionValue.join(",")//媒体编号
	//赋值给隐藏的Input域	
	$("#optionNames").val(typeNameLists);
	$("#optionId").val(typeIdLists);
	$("#optionValue").val(typeCodeLists);
}
