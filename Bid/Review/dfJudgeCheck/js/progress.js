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
				}else if(nodes[j].subStatus[experts[i].idCard] == 2){
					titletr += "<td style='text-align: center;'><span class='text-danger'>未完成（重签中）</span></td>";
                    // titletr += "<td style='text-align: center;'><span class='text-danger'>未完成</span></td>";
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
}

/**
 * 下达结束评标指令
 */
$("#content").on("click","#flowEnd",function(){
    top.layer.confirm("温馨提示:是否结束评标?", function(indexs) {
		flowiInstruct('end', function () {
			if (examType == 2) {
				sendMessage(bidSectionId, indexs);
			} else {
				top.layer.alert("结束评标成功");
				top.layer.close(indexs);
			}
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
                top.layer.alert('请填写撤回原因');
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
                        top.layer.alert("撤回成功");
                        schedule();
                        currFunction();
                    }else{
                        top.layer.alert(res.message);
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