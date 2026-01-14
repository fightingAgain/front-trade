var CheckItemsave = config.bidhost + '/CheckItemHistoryController/save.do'//评价项添加
var CheckItemupdate = config.bidhost + '/CheckItemHistoryController/update.do'//评价项修改
var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
var id = getUrlParam("id");
var packageCheckListInId = getUrlParam("packageCheckListInId");
var checkType = getUrlParam("checkType");
var flagType = getUrlParam("flagType");
var _index = getUrlParam("index");
var scores = "";//每次添加的分值
var Score_Total_num = dcmt.Score_Total_num;
$(function () {
	if (checkType == 1 || checkType == 3) {
		$('.Score').removeClass('none')
		$('.IsKey').addClass('none')
	} else {
		$('.Score').addClass('none')
		$('.IsKey').removeClass('none')
	}
	// 关闭
	$("#btnClose").on('click', function () {
		var index = top.parent.layer.getFrameIndex(window.name);
		top.parent.layer.close(index);
	})
	// 提交，修改
	$("#btnSave").on('click', function () {
		if (test()) {
			parent.layer.alert(test());
			return false;
		}
		var pare = {
			'checkTitle': $("#checkTitle").val(),
			'checkStandard': $("#checkStandard").val(),
			'remark': $("#remark").val(),
			'packageCheckListId': packageCheckListInId,
			'sort': $("#sort").val(),
			'flagType': flagType
		}
		//评分制
		if (checkType == 1 || checkType == 3) {
			pare.score = $("#score").val();
			pare.itemScoreType=$("#itemScoreType").val();
		} else {
			pare.isKey = $("input[name='isKey']:checked").val()
		}
		//当主键id存在时，修改评审项
		if (id) {
			pare.id = id
			pare.sort = $("#sort").val()
			$.ajax({
				type: "post",
				url: CheckItemupdate,
				data: pare,
				dataType: "json",
				success: function (response) {
					if (response.success) {
						dcmt.checkListData(_index)
						dcmt.setpackageCheckListInfo(_index);
						if (checkType == 1 || checkType == 3) {
							dcmt.getOne(_index)
						}
						var index = top.parent.layer.getFrameIndex(window.name);
						top.parent.layer.close(index);
					} else {
						parent.layer.alert(response.message)
					}
				}
			});
		} else {//当id不存在时，添加评审项
			pare.sort = (dcmt.PackageCheckItemLists.length + 1)
			$.ajax({
				type: "post",
				url: CheckItemsave,
				data: pare,
				dataType: "json",
				success: function (response) {
					if (response.success) {
						dcmt.checkListData(_index)
						dcmt.setpackageCheckListInfo(_index);
						if (checkType == 1 || checkType == 3) {
							dcmt.getOne(_index)
						}
						var index = top.parent.layer.getFrameIndex(window.name);
						top.parent.layer.close(index);
					} else {
						parent.layer.alert(response.message)
					}
				}
			});
		}
	})
})
function duData(data) {
	$("#checkTitle").val(data.checkTitle);
	$("#checkStandard").val(data.checkStandard);
	$("#score").val(data.score);
	$('#itemScoreType').val(data.itemScoreType);
	$("#remark").val(data.remark);
	$("input[name='isKey'][value='" + data.isKey + "']").prop('checked', true);
	Score_Total_num = parseInt(Score_Total_num) - parseInt(data.score);
}
function test() {
	if ($("#checkTitle").val() == "") {
		return "温馨提示：请填写评价内容"
	}
	if ($("#checkStandard").val() == "") {
		return "温馨提示：请填写评价标准"
	}
	if (checkType == 1 || checkType == 3) {
		if ($("#score").val() == "") {
			return "温馨提示：请填写分值"
		}
		if (!(/^[1-9]\d*$/.test($("#score").val()))) {
			return '温馨提示：分值须为正整数';
		}
		if (checkType == 1) {
			if (parseInt(Score_Total_num) + parseInt($("#score").val()) > 100) {
				return '温馨提示：分值之和不能大于100';
			}
		}
		if($("#itemScoreType").val()==""){
			return "温馨提示：请选择打分类型"
		}
	}
}