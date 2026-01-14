var sendMsgUrl = config.tenderHost + "/InFormController/inFormUser";//满意度调查发送短信的接口
var progressUrl=config.Reviewhost+"/ReviewControll/getProgress.do";		//获取评标进度
var resetCheckUrl=config.Reviewhost+"/ReviewControll/reset.do";
var backHistoryUrl=config.Reviewhost+'/CheckBackController/findBackHistory.do';

/**
 * 评标流程详情
 * @returns {boolean}
 */
function progress(){
	var flag = false;
	$.ajax({
		type:"get",
		url:progressUrl,
		async:false,
		data:{
			'bidSectionId':bidSectionId,
			'examType':examType
		},
		success:function(res){
			if(res.success){
                $('#content').load('model/progress/content.html',function(){
                    progressList(res.data);
                    showResetHis();
				});

                setButton("");
                flag = true;
			}else{
				top.layer.alert('温馨提示：'+res.message);
			}
		}
	});
	return flag;
};

/**
 * 显示评标进度详情
 * @param progressData
 */
function progressList(progressData){
	var experts=progressData.experts;//评委
	var nodes=progressData.nodes;//节点
	var progreswsList = [{title: '序号', type:'numbers', fixed: 'left'}];
	var columsNames = [];//需要合并的列名称
	var columsIndex = [];//需要合并的列索引值
	var expertNum = experts.length;
	var parm = new Object();
	var isEndReport = false;
	parm.field = 'expertName';
	parm.title = '评委名称';
	parm.fixed = 'left';
	parm.width = '150';
	progreswsList.push(parm);
	for(var j = 0;j<nodes.length;j++){
		var col = {};
		col.field = 'nodeName_'+j;
		col.title = nodes[j].nodeName;
		col.width = '150';
		progreswsList.push(col);
		if(!nodes[j].subStatus){
			columsNames.push('nodeName_'+j);
			columsIndex.push(j+2)
		}
		if(nodes[j].nodeType == 'reviewReport' && nodes[j].status == 3){
			isEndReport = true;
		}
	}
	//最后一列
	var endCol = {};
	endCol.field = 'nodeName_end';
	endCol.title = '结束评标';
	endCol.width = '150';
	/*endCol.templet = function(){
		if (progressData.isEnd == 1) {
            return "<span class='text-danger'>已结束</span>";
        } else {
            return "<span class='text-danger'>未结束</span>";
        }
	};*/
	columsNames.push('nodeName_end');
	columsIndex.push(nodes.length+2)
	progreswsList.push(endCol);
	//最后一行的回退
	if(progressData.isEdit){
		var backRow = {'expertName':''};
		experts.push(backRow)
	};
	for(var i = 0;i< experts.length;i++){
		for(var j = 0;j<nodes.length;j++){
			if(nodes[j].subStatus){
				if(nodes[j].subStatus[experts[i].idCard] == 1){
                    experts[i]['nodeName_'+j] = "<span class='text-success'>已完成</span>";
				}else{
                    experts[i]['nodeName_'+j] = "<span class='text-danger'>未完成</span>";
				}
			}else{
                if(i == 0){
                    if(nodes[j].status == 0){
                        experts[i]['nodeName_'+j] = "<span class='text-danger'>未完成</span>";
                    }else if(nodes[j].status == 1){
                        experts[i]['nodeName_'+j] = "<span class='text-danger'>未完成</span>";
                    }else{
                        experts[i]['nodeName_'+j] = "<span class='text-success'>已完成</span>";
                    }
                }else{
                	experts[i]['nodeName_'+j] = "<span class='text-danger'>未完成</span>";
                }
			}
		}
		if (progressData.isEnd == 1) {
            experts[i]['nodeName_end'] = "<span class='text-danger'>已结束</span>";
        } else {
            experts[i]['nodeName_end'] = "<span class='text-danger'>未结束</span>";
        }
		if(progressData.isEdit){//有回退时
			if(i == experts.length -1){//最后一行
				for(var j = 0;j<nodes.length;j++){
					if(nodes[j].status == 1  || nodes[j].status == 2 || nodes[j].status == 3){
		                experts[i]['nodeName_'+j] = "<span class='btn btn-primary btn-sm butReset' nodeType='"+nodes[j].nodeType+"' nodeSubType='"+nodes[j].nodeSubType+"' nodeName='"+nodes[j].nodeName+"'>退回到此阶段</spn>";
					}else{
		               	experts[i]['nodeName_'+j] = "";
					}
				}
		        if (isEndReport && (progressData.reviewRoleType == 4 || progressData.reviewRoleType == 2)) {
		            experts[i]['nodeName_end'] = "<span class='btn btn-primary btn-sm' id='flowEnd'>结束评标</span>"
		        }else{
		            experts[i]['nodeName_end'] = "";
				}
			}
		};
		
	}
	
	
	layui.use('table', function(){
		var table = layui.table;
		 
		var tableIns =  table.render({
		    elem: '#flowProgress'
			    ,width: ($(window).width()-$('.flowNodeList').width()-30)
		    ,cols: [progreswsList]
		    ,data:experts
		    ,done: function(res,curr,count){
		    	
		    	merge(res,columsNames,columsIndex,progressData.isEdit)
		    	
		    	
		    }
	  	});
	})
	function merge(res,nameArr,indexArr,isEdit) {
 
        var data = res.data;
        var mergeIndex = 0;//定位需要添加合并属性的行数
        var mark = 1; //这里涉及到简单的运算，mark是计算每次需要合并的格子数
        var columsName = nameArr;//需要合并的列名称	 
        var columsIndex = indexArr;//需要合并的列索引值
		var mergeRow = res.data.length;
        if(isEdit){
        	mergeRow = res.data.length-1
        }
        for (var k = 0; k < columsName.length; k++) { //这里循环所有要合并的列
            var trArr = $(".layui-table-body>.layui-table").find("tr");//所有行
            for (var i = 1; i < mergeRow; i++) { //这里循环表格当前的数据
                var tdCurArr = trArr.eq(i).find("td").eq(columsIndex[k]);//获取当前行的当前列
                var tdPreArr = trArr.eq(mergeIndex).find("td").eq(columsIndex[k]);//获取相同列的第一列
 
//                  if (data[i][columsName[k]] === data[i-1][columsName[k]]) { //后一行的值与前一行的值做比较，相同就需要合并
                    mark += 1;
                    tdPreArr.each(function () {//相同列的第一列增加rowspan属性
                        $(this).attr("rowspan", mark);
                    });
                    tdCurArr.each(function () {//当前行隐藏
                        $(this).css("display", "none");
                    });
                /*}else {
                    mergeIndex = i;
                    mark = 1;//一旦前后两行的值不一样了，那么需要合并的格子数mark就需要重新计算
                }*/
            }
            mergeIndex = 0;
            mark = 1;
        }
    }
	/*var titletr = "";
	titletr+="<thead><tr>";
	titletr += "<th style='text-align: center;width:50px' lay-data='{fixed: left}'>序号</th>";
	titletr += "<th style='text-align: center;' lay-data='{field:expertName, width:100, fixed: left}'>评委</th>";

    for (var i = 0; i < nodes.length; i++) {
        titletr += "<th style='text-align: center;' lay-data='{field:"+nodes[i].nodeName+",width:100, fixed: left}'>"+nodes[i].nodeName+"</th>";
    }
    titletr += "<th style='text-align: center;'>结束评标</th>";
	titletr += "</tr></thead><tbody>";


	var rows = experts.length;
	for(var i=0;i<experts.length;i++){//循环评委
		titletr+="<tr>"
		titletr += "<td style='width:50px; text-align:center'>"+(i+1)+"</td>";
		titletr += "<td style='width:70px; text-align: center;'>"+ experts[i].expertName+"</td>";
		var status;

        for (var j = 0; j < nodes.length; j++) {
            status = nodes[j].status;
			if(nodes[j].subStatus){
				if(nodes[j].subStatus[experts[i].idCard] == 1){
                    titletr += "<td style='text-align: center;'><span class='text-success'>已完成</span></td>";
				}else{
                    titletr += "<td style='text-align: center;'><span class='text-danger'>未完成</span></td>";
				}
			}else{
                if(i == 0){
                    if(nodes[j].status == 0){
                        titletr += "<td style='text-align: center;' rowspan='"+ rows +"'><span class='text-danger'>未完成</span></td>";
                    }else if(nodes[j].status == 1){
                        titletr += "<td style='text-align: center;' rowspan='"+ rows +"'><span class='text-danger'>未完成</span></td>";
                    }else{
                        titletr += "<td style='text-align: center;' rowspan='"+ rows +"'><span class='text-success'>已完成</span></td>";
                    }
                }
			}

        }
        if(i == 0) {
            titletr += "<td style='text-align: center;' rowspan='" + rows + "'>";
            if (progressData.isEnd == 1) {
                titletr += "<span class='text-danger'>已结束</span>";
            } else {
                titletr += "<span class='text-danger'>未结束</span>";
            }
            titletr += "</td>";
        }
		titletr += "</tr>"
	}		

	if(progressData.isEdit){
		titletr += "<tr class='btntr'>";
        titletr += "<td style='width:50px;text-align:center'>"+(rows+1)+"</td><td></td>";
        for (var i = 0; i < nodes.length; i++) {
			if(nodes[i].status == 1  || nodes[i].status == 2 || nodes[i].status == 3){
                titletr += "<td><span class='btn btn-primary btn-sm butReset' nodeType='"+nodes[i].nodeType+"' nodeSubType='"+nodes[i].nodeSubType+"' nodeName='"+nodes[i].nodeName+"'>退回到此阶段</spn></td>";
			}else{
                titletr += "<td></td>";
			}
		}
        if (status == 3 && progressData.reviewRoleType == 4) {
            titletr += "<td><span class='btn btn-primary btn-sm' id='flowEnd' rowspan='"+ rows +"'>结束评标</span></td>"
        }else{
            titletr += "<td></td>";
		}
		titletr += "</tr>";
	};
	titletr += '</tbody>'

	$("#flowProgress").html(titletr);
	
	layui.use('table', function(){
		var table = layui.table;
	 
		//转换静态表格
		table.init('flowProgress', {
		  	width: ($(window).width()-$('.flowNodeList').width()-30)
		  	,limit: 5 //注意：请务必确保 limit 参数（默认：10）是与你服务端限定的数据条数一致
		  //支持所有基础参数
		}); 
	})*/
}
/*function progressList(progressData){
	var experts=progressData.experts;//评委
	var nodes=progressData.nodes;//节点

	var titletr = "";
	titletr+="<tr>";
	titletr += "<th style='text-align: center;width:50px'>序号</th>";
	titletr += "<th style='text-align: center;'>评委</th>";

    for (var i = 0; i < nodes.length; i++) {
        titletr += "<th style='text-align: center;'>"+nodes[i].nodeName+"</th>";
    }
    titletr += "<th style='text-align: center;'>结束评标</th>";
	titletr += "</tr>";

	var rows = experts.length;
	for(var i=0;i<experts.length;i++){//循环评委
		titletr+="<tr>"
		titletr += "<td style='width:50px; text-align:center'>"+(i+1)+"</td>";
		titletr += "<td style='width:70px; text-align: center;'>"+ experts[i].expertName+"</td>";
		var status;

        for (var j = 0; j < nodes.length; j++) {
            status = nodes[j].status;
			if(nodes[j].subStatus){
				if(nodes[j].subStatus[experts[i].idCard] == 1){
                    titletr += "<td style='text-align: center;'><span class='text-success'>已完成</span></td>";
				}else{
                    titletr += "<td style='text-align: center;'><span class='text-danger'>未完成</span></td>";
				}
			}else{
                if(i == 0){
                    if(nodes[j].status == 0){
                        titletr += "<td style='text-align: center;' rowspan='"+ rows +"'><span class='text-danger'>未完成</span></td>";
                    }else if(nodes[j].status == 1){
                        titletr += "<td style='text-align: center;' rowspan='"+ rows +"'><span class='text-danger'>未完成</span></td>";
                    }else{
                        titletr += "<td style='text-align: center;' rowspan='"+ rows +"'><span class='text-success'>已完成</span></td>";
                    }
                }
			}

        }
        if(i == 0) {
            titletr += "<td style='text-align: center;' rowspan='" + rows + "'>";
            if (progressData.isEnd == 1) {
                titletr += "<span class='text-danger'>已结束</span>";
            } else {
                titletr += "<span class='text-danger'>未结束</span>";
            }
            titletr += "</td>";
        }
		titletr += "</tr>"
	}		

	if(progressData.isEdit){
		titletr += "<tr class='btntr'>";
        titletr += "<td style='width:50px;text-align:center'>"+(rows+1)+"</td><td></td>";
        for (var i = 0; i < nodes.length; i++) {
			if(nodes[i].status == 1  || nodes[i].status == 2 || nodes[i].status == 3){
                titletr += "<td><span class='btn btn-primary btn-sm butReset' nodeType='"+nodes[i].nodeType+"' nodeSubType='"+nodes[i].nodeSubType+"' nodeName='"+nodes[i].nodeName+"'>退回到此阶段</spn></td>";
			}else{
                titletr += "<td></td>";
			}
		}
        if (status == 3 && progressData.reviewRoleType == 4) {
            titletr += "<td><span class='btn btn-primary btn-sm' id='flowEnd' rowspan='"+ rows +"'>结束评标</span></td>"
        }else{
            titletr += "<td></td>";
		}
		titletr += "</tr>";
	};

	$("#flowProgress").html(titletr);
}*/
/**
 * 下达结束评标指令
 */
$("#content").on("click","#flowEnd",function(){
    top.layer.confirm("温馨提示:是否结束评标?", function(indexs) {
        flowiInstruct('end', function(){
			sendMessage(bidSectionId,indexs);
        });

    });
});

$("#content").on("click",".butReset",function(){
	var that = $(this);
    var nodeName = that.attr("nodeName");
    var nodeType = that.attr("nodeType");
    var nodeSubType = that.attr("nodeSubType");
    nodeSubType = nodeSubType&& nodeSubType!='undefined' ? nodeSubType : '';
    top.layer.confirm("温馨提示:是否撤回到"+nodeName+"环节?", function(indexs) {
        top.layer.close(indexs);
        top.layer.prompt({
            title: '请输入撤回原因',
            formType: 2
        }, function(text, index) {
            if(text==""){
                top.layer.alert('温馨提示：请填写撤回原因');
                return;
            }
            $.ajax({
                type:"post",
                url:resetCheckUrl,
                async:false,
                data:{
                    'bidSectionId':bidSectionId,
                    'examType':examType,
                    'nodeType':nodeType,
                    'nodeSubType':nodeSubType,
                    'remark':text
                },
                success:function(res){
                    if(res.success){
                        top.layer.alert("温馨提示：撤回成功");
                        schedule();
                        currFunction();
                    }else{
                        top.layer.alert('温馨提示：'+res.message);
                    }
                }
            });
            top.layer.close(index);
        });
    });
});


/**
 * 显示撤回历史
 */
function showResetHis() {
	data = [];
	$.ajax({
		type:"get",
		url:backHistoryUrl,
		async:false,
		data:{
			'bidSectionId':bidSectionId,
			'examType':examType
		},
		success:function(res){
			if(res.success){
				data=res.data;
			}
		}
	});
	if(data.length>7){
		var hie='305';
	}else{
		var hie='';
	}
	$("#reviewResetHis").bootstrapTable({
		data: data,
		height:hie,
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
				field: 'checkName',
				title: '恢复评标项'
			},
			{
				field: 'remark',
				title: '操作备注'
			},
			{
				field: 'employeeName',
				title: '操作人'
			}, {
				field: 'createTime',
				title: '操作时间'
			}
		]
	});
}
/**********************将标段的标段Id传到后面,判断是否发送短信，如果没有就发送短信，有就不需要发送短信***************/
function sendMessage(bidSectionId,indexs){
	$.ajax({
		type:"post",
	    url: sendMsgUrl,
	    async:false,
	    data:{
			'relationId':bidSectionId,
		},
		success:function(data){
			if(data.success) {

				if(data.data){
					parent.layer.alert(data.data,{closeBtn: 0},function(index){
							top.layer.close(index);
							top.layer.alert("结束评标成功");
							top.layer.close(indexs);
							progress();
					});					
				}
				
			}
		}
	});
}