/*
 * zhouyan
 * 2020-3-13
 * 
 * 录入信用分时查询的投标人
 * */
var bidderUrl = config.OpenBidHost + '/BidCreditScoreController/findBidderCreditScore.do';//获取投标人列表
var saveUrl = config.OpenBidHost + '/BidCreditScoreController/saveCreditScore.do';//保存
var bidSectionId = '';//标段id
var special = '';
var CAcf = null;  //实例化CA
$(function(){
	bidSectionId = $.getUrlParam('id');
	special = $.getUrlParam('special');
	if(special == 'EDIT'){
		$('#btnSave').show();
		$('#btnSubmit').show();
	}
	$('#bidSectionId').val(bidSectionId)
	getList(bidSectionId);
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	$('#bidder_list').on('click','.btnEdit',function(){
		var dataIndex = $(this).attr('data-index');
		parent.layer.prompt({title: '请输入信用分', formType: 0}, function(score, index){
			var reg=/^\d+(\.\d{0,2})?$/;
			if(!reg.test($.trim(score))){
				parent.layer.alert('请正确输入信用分！')
			}else{
				$('.table_score').eq(dataIndex).html($.trim(score))
				$('.bidder_score').eq(dataIndex).val($.trim(score))
				parent.layer.close(index);
			}
		  	
		});
	})
});
function passMessage(data,callback){
	$('#interiorBidSectionCode').html(data.interiorBidSectionCode);
	$('#bidSectionName').html(data.bidSectionName);
	$("#btnSave").click(function(){
		var ele = $('.test_data');
		for(var i=0;i<ele.length;i++){
			if(ele.eq(i).find('.bidder_score').val() == '' || ele.eq(i).find('.bidder_score').val() == undefined){
				$.each(ele.eq(i).find('input'), function() {
					$(this).prop('name','');
				});
			}
		}
		var param =parent.serializeArrayToJson($("#formName").serializeArray())
//		param.isSubmit = 0;
		save(param,false,callback);
		for(var j=0;j<ele.length;j++){
			$.each(ele.eq(j).find('input'), function() {
				$(this).prop('name',$(this).attr('data-name'));
			});
		}
	});
	$("#btnSubmit").click(function(){
		var isAll = true;
		$.each($('.table_score'), function() {
			if($.trim($(this).html()) == ''){
				isAll = false;
			}
		});
		if(!isAll){
			parent.layer.alert('请检查是否所有投标人的信用分都已输入！')
		}else{
			parent.layer.confirm('确认生效?', {icon: 3,title: '询问'},function(index){
				saveCA(callback)
				parent.layer.close(index);
			})
		}
	});
};
function saveCA(callback){
		if(!CAcf){
			CAcf = new CA({
				target:"#formName",
				confirmCA:function(flag){ 
					if(!flag){  
						return;
					}
					var param =parent.serializeArrayToJson($("#formName").serializeArray());
//					param.isSubmit = 1;
					save(param,true,callback);
				}
			});
		}
		CAcf.sign();
	}
function save(arr,isSub,callback){
	if(isSub){
		arr.isSubmit = 1;
	}
	$.ajax({
		type:"post",
		url: saveUrl,
        dataType: "json",//预期服务器返回的数据类型
        async:false,
        data: arr,
        success: function(data){
        	if (data.success) {
        		if(isSub){
        			var index=parent.layer.getFrameIndex(window.name);
    				parent.layer.close(index);
        			parent.layer.alert("提交成功！", {icon: 6,title: '提示'});
        			
        		}else{
        			parent.layer.alert("保存成功！", {icon: 6,title: '提示'});
        		}
        		if(callback){
        			callback()
        		}
            }else{
            	parent.layer.alert(data.message, {icon: 5,title: '提示'});
            }
        },
        error: function() {
        	parent.layer.alert("保存失败！");
        }
	});
}
function getList(id){
	$.ajax({
		type:"post",
		url:bidderUrl,
		async:true,
		data: {
			'bidSectionId':id
		},
		success: function(data){
			if(data.success){
				if(data.data){
					bidderList(data.data)
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
function bidderList(data){
	var html = '';
	$('#bidder_list').html('');
	html += '<thead>';
		html += '<tr>';
			html += '<th style="width: 50px;text-align: center;">序号</th>';
			html += '<th style="max-width: 300px;">投标人名称</th>';
			html += '<th style="max-width: 300px;">企业编码</th>';
			html += '<th style="width: 100px;text-align: center;">信用分</th>';
			if(special == 'EDIT'){
				html += '<th style="width: 100px;text-align: center;">操作</th>';
			}
		html += '</tr>';
	html += '</thead><tbody>';
	for(var i = 0;i < data.length;i++){
		html += '<tr>';
			html += '<td style="width: 50px;text-align: center;">'+(i+1)+'</td>';
			html += '<td style="max-width: 300px;" class="test_data">'+data[i].enterpriseName;
				html += '<input type="hidden" name="creditScoreItems['+i+'].enterpriseId" data-name="creditScoreItems['+i+'].enterpriseId" value="'+data[i].enterpriseId+'" />';
				html += '<input type="hidden" name="creditScoreItems['+i+'].enterpriseCode" data-name="creditScoreItems['+i+'].enterpriseCode" value="'+data[i].enterpriseCode+'" />';
				html += '<input type="hidden" name="creditScoreItems['+i+'].enterpriseName" data-name="creditScoreItems['+i+'].enterpriseName" value="'+data[i].enterpriseName+'" />';
				html += '<input type="hidden" name="creditScoreItems['+i+'].score" data-name="creditScoreItems['+i+'].score" value="'+((data[i].score || data[i].score == 0)?data[i].score:'')+'" class="bidder_score"/>';
			html += '</td>';
			html += '<td style="max-width: 300px;">'+data[i].enterpriseCode+'</td>';
			html += '<td style="width: 100px;text-align: center;" class="table_score">'+((data[i].score || data[i].score == 0)?data[i].score:'')+'</td>';
			if(special == 'EDIT'){
				html += '<td style="width: 100px;text-align: center;">';
					html += '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + i + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>'
				html += '</td>'
			}
		html += '</tr>';
	}
	html += '</tbody>';
	$(html).appendTo('#bidder_list')
}
