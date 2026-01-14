/*
 * @Author: your name
 * @Date: 2020-09-09 13:49:49

 * @LastEditTime: 2021-03-08 14:30:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\ReportSet.js
 */ 
var packageCount="";
var checkCount = "";
var packages = [];
var resultSetList=[];//评审项数据
$(function(){
    //查询项目信息
    $.ajax({
        url: url + "/CheckController/getPurchaseCheckState.do",
        data: {
            id: projectId,
            packageId:packageId
        },
        async: false,
        success: function(data) {
            if(data.success) {
                _THISID=_thisId
                if(data.data.packageList){
                    
                    packages = data.data.packageList;   
                }
                showMsg();
                
                medias();

                if(createType==1){
                    $('.isNotOrSure').attr('disabled',true);
					$('.isCanSignIn, .isCanSignReport').attr('disabled',true);
                }             
            }
        }
    }) 
    if(examType==1){
        $('.examTypeShow').show(); 

        $(".examTypeName").html('评审报告'); 
        if(progressList.doubleEnvelope != 1){
            $(".isNotDoubleEnvelope").show();

            if(isAgent==1){
                $(".isEnterpriseType").html('采购人和代理机构')
            } else{
                $(".isEnterpriseType").html('采购人')
            }
        }  
    }else{
        $('.examTypeShow').hide(); 
        $(".examTypeName").html('预审报告');
   
    } 
    if (examType == 1 && progressList.encipherStatus == 1) {
        $('.encipherShow').show();
        $('.encipherHide').hide();
    } else {
        $('.encipherShow').hide();
        $('.encipherHide').show();
    }
})
function medias(){	
    var op = "";
    //op = "<option value='0' >关联包件</option>"
    if(packages.length > 0){
        //有包件	
        for(var i=0;i<packages.length;i++){
            op+="<option value="+packages[i].id+">"+packages[i].packageName+"</option>"
        }
    }else{
        op = "<option value='0' >无</option>"
    }
    $("#optionName").html(op);
    $("#optionName").val(["0"]);	
}	
function onLinkPackage(){
    var va = $("#optionName").val();
    var vaName = $("#optionName :selected").text();
    if(va != 0 && va != 1){
        layer.confirm(checkSetType==1?"确定关联包件"+vaName+"的资格预审设置吗？":"确定关联包件"+vaName+"的评审设置吗？", {
            btn: ['确定', '取消'] //按钮
        }, function(index1) {
            //修改
            $.ajax({
                type: "post",
                data: {
                    projectId:projectId,
                    packageId:packageId,
                    upPackageId:va,
                    checkType:checkSetType,
                },
                url: url + "/CheckController/updateLinkProjectChecker.do",
                success: function(data) {
                    if(data.success) {
                        //$("input[name='isleader']").val([row.id]); 
                        $("#"+_THISID).click();
                        parent.layer.alert("设置成功");
                    } else {
                        parent.layer.alert(data.message);
                    }
                }
            });
            
            layer.close(index1);
        })
    }
}

function showMsg(){
    $.ajax({
        url: url + "/CheckController/getPurchaseCheck.do",
        data: {
            id:projectId,
            packageId:packageId,
            checkType:checkSetType
        },
        async: false,
        success: function(data) {

            if(data.success) {
                
                ProjectData = data.data;
				//是否是历史数据   区分评审设置的是否展示设置按钮      0否1是
				if(ProjectData.isSignInHis === 0 ){
					$('.isPromiss').show();
					if(isAgent == 1){
						$('#addAnnounce, .isAgentTips').show();
					}else{
						$('.notAgentSignPromiseTips').show();
					}
					//是否可编辑 0否1是  评审正式开始后（手动情况下达评审命令或自动情况下推选组长完成）
					if(ProjectData.isCanSignIn == 1 && createType == 0 && isStopCheck != 1){
						$('.isCanSignIn').removeAttr('disabled');
					}else{
						$('.isCanSignIn').attr('disabled', true);
					}
					if(ProjectData.ownerDeclarationState || ProjectData.ownerDeclarationState == 0){
						var states = {'0': '未提交', '1': '审核中', '2': '审核通过', '3': '审核不通过'}
						$('#announceState').html('（'+states[ProjectData.ownerDeclarationState]+'）')
					}
				}
				//是否是历史数据   区分评审设置的是否展示评委CA签订评审报告      0否1是
				if(ProjectData.isSignReportHis === 0 ){
					$('.isSignReport').show();
					if(isAgent == 1){
						$('#addReportAnnounce, .isAgentReportTips').show();
					}else{
						$('.notAgentReportTips').show();
					}
					//是否可编辑 0否1是  评审正式开始后（手动情况下达评审命令或自动情况下推选组长完成）
					if(ProjectData.isCanSignIn == 1 && createType == 0 && isStopCheck != 1){
						$('.isCanSignReport').removeAttr('disabled');
					}else{
						$('.isCanSignReport').attr('disabled', true);
					}
					if(ProjectData.reportOwnerDeclarationState || ProjectData.reportOwnerDeclarationState == 0){
						var states = {'0': '未提交', '1': '审核中', '2': '审核通过', '3': '审核不通过'}
						$('#reportAannounceState').html('（'+states[ProjectData.reportOwnerDeclarationState]+'）')
					}
				}
                if(progressList.isCheckItemType==1){
                    //评委已有打分记录
                   
                    $('.isNotOrSure').attr('disabled',true);
					$('.isCanSignIn, .isCanSignReport').attr('disabled',true);
                }
                if(ProjectData.checkReports.length>0&&(ProjectData.checkReports[0].isCheck==2||ProjectData.checkReports[0].isCheck==4)){
                    $("input[name=isSetChecker]").attr('disabled',true);
                    $("input[name=isJoinCheck]").attr('disabled',true);
                    $("#addReviewer").hide();
                }else{
                    $("input[name=isSetChecker]").attr('disabled',false);
                    $("input[name=isJoinCheck]").attr('disabled',false);
                    $("#addReviewer").show();
                }
                resultSetList=ProjectData.resultSetList
                $("#tenderType").html(['询比采购', '竞价采购', '竞卖', '询比报价', '招标采购', '谈判采购', '单一来源采购', '框架协议采购', '战略协议采购'][ProjectData.tenderType]);
                $("input[name=isShowCollect]").val([ProjectData.isShowCollect]);
                $("input[name=isShowReport]").val([ProjectData.isShowReport]);
                $("input[name=isNeedSure]").val([ProjectData.isNeedSure||0]);
                $("input[name=isSetChecker]").val([ProjectData.isSetChecker]);
                $("input[name=isShowOffer]").val([ProjectData.isShowOffer]);
                $("input[name=isShowAllOffer]").val([ProjectData.isShowAllOffer]);
                $("input[name=isPriceCheck]").val([ProjectData.isPriceCheck]);
                $("input[name=isShowProject]").val([ProjectData.isShowProject]);
                $("input[name=isShowCheckListResult]").val([ProjectData.isShowCheckListResult]);
                $("input[name=isNeedSignPromise]").val([ProjectData.isNeedSignPromise]);
                $("input[name=isNeedSignReport]").val([ProjectData.isNeedSignReport]);
                if(ProjectData.isShowCheckListResult==0){
                    $(".isCheckListResult").show();
                    checkListResult()
                }else{
                    $(".isCheckListResult").hide();
                }
                if(examType==1){
                    if(ProjectData.isShowReport==1){
                        $('.isNeedSureShow').hide();
                    }else{
                        $('.isNeedSureShow').show();
                    }
                }                
                $("input[name=isSendResult]").val([ProjectData.isSendResult]);
                $("input[name=isJoinCheck]").val([ProjectData.isJoinCheck]);
                if(ProjectData.isSetChecker == "1") { //不设置评审报告审核人时，隐藏表格
                    $("#NowReviewerTalbe").hide();
                    $("#addReviewer").attr("disabled", "disabled");
                    $(".isJoinCheck").hide();
                }
                if (progressList.stopCheckReason != "" && progressList.stopCheckReason != undefined) {
                    $('.isStopCheck').hide();  
                    $('.isNotOrSure').attr('disabled',true);   
					$('.isCanSignIn, .isCanSignReport').attr('disabled',true);
                }
                if (progressList.isStopCheck == 1) {
                    $('.isStopCheck').hide();
                    $('.isNotOrSure').attr('disabled',true);
					$('.isCanSignIn, .isCanSignReport').attr('disabled',true);
                }
                //绑定审核人
                BindReviewer(ProjectData.reviewReportCheckers);	
            }
        }
    });      
}
$('input[name="isShowReport"]').off('change').on('change',function(){
    if(examType==1){
        if($(this).val()==1){
            $('.isNeedSureShow').hide();
        }else{
            $('.isNeedSureShow').show();
        }
    }
})
function addReviewer(){
    if(!!ProjectData.checkReports.length&&(ProjectData.checkReports[0].isCheck==2||ProjectData.checkReports[0].isCheck==4)) {
        return top.layer.alert("评审报告已提交审核，无法更换业主代表");	    
    }
    parent.layer.open({
        type: 2,
        area: ['800px', '600px'],
        maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
        resize: false, //是否允许拉伸
        title: "选择业主代表",
        content: 'bidPrice/Review/projectManager/modal/Reviewer.html?checkType='+checkSetType+"&projectId="+projectId+"&packageId="+packageId+"&projectCheckerId="+ ProjectData.id+'&enterpriseId='+ProjectData.enterpriseId+'&isAgent='+isAgent,
    })
}
function BindReviewer(data) {
    $("#NowReviewerTalbe").bootstrapTable({
        data: data,
        columns: [{
            field: 'id',
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
            field: 'employeeName',
            title: '姓名',
            formatter: function(value, row, index) {
                return row.employeeName || row.userName;
            }
        }, {
            field: 'logCode',
            title: '登录名'
        }, {
            field: 'tel',
            title: '手机号'
        }, {
            field: 'email',
            title: '邮箱'
        }]
    });
};

$('input:radio').off('change').change(function() {
    var _this=this;
    
	if(_this.name == 'isNeedSignPromise'){
		if((progressList.isAutoOrder == 1 && progressList.autoReOrderShow == 1) || progressList.isAutoOrder == 2){
			top.layer.confirm("温馨提示：设置项更改后将重新进行后续流程，是否确认更改？", function (indexs) {
			    changeRadios(_this);
			    parent.layer.close(indexs);
			}, function (indexs) {
				if(_this.name == 'isNeedSignPromise'){
					var isNeedSignPromiseVal = progressList.isNeedSignPromise||progressList.isNeedSignPromise==0?progressList.isNeedSignPromise:''
					$('[name=isNeedSignPromise]').val([isNeedSignPromiseVal]);
				}else if(_this.name == 'isNeedSignReport'){
					var isNeedSignReportVal = progressList.isNeedSignReport||progressList.isNeedSignReport==0?progressList.isNeedSignReport:''
					$('[name=isNeedSignReport]').val([isNeedSignReportVal]);
				}
			    parent.layer.close(indexs);
			})
		}else{
			changeRadios(_this);
		}
	}else{
		if(_this.name == 'isNeedSignReport'){
			if(ProjectData.isNeedSignReport || ProjectData.isNeedSignReport == 0){
				top.layer.confirm("温馨提示：是否确认更改？", function (indexs) {
				    changeRadios(_this);
				    parent.layer.close(indexs);
				}, function (indexs) {
					var isNeedSignReportVal = progressList.isNeedSignReport||progressList.isNeedSignReport==0?progressList.isNeedSignReport:''
					$('[name=isNeedSignReport]').val([isNeedSignReportVal]);
				    parent.layer.close(indexs);
				})
			}else{
				changeRadios(_this);
			}
		}else{
			changeRadios(_this);
		}
	}
    //var name = this.name.substring(0,this.name.length-1);
})
function changeRadios(_this){
	var para = {
	    id: ProjectData.id,
	    projectId: projectId,
	    packageId:packageId,
	    checkType:checkSetType
	}
	para[_this.name] = _this.value;
	$.ajax({
	    type: "post",
	    data: para,
	    url: url + "/CheckController/updateProjectChecker.do",
	    success: function(data) {
	        if(data.success) {
	            parent.layer.alert("设置成功");
	
	            if(_this.name=="isShowAllOffer"){
	                getData();
	            }
	        } else {
				$("#"+_THISID).click();
	            parent.layer.alert(data.message);
	        }
	        if(para.hasOwnProperty('isSetChecker')) {
	            //移除弹出框选中项
	            sessionStorage.removeItem("Reviewer_data");
	            if(para.isSetChecker == "1") {
	                $("#NowReviewerTalbe").hide();
	                $("#addReviewer").attr("disabled", "disabled");
	                //if(types == 1){
	                    $(".isJoinCheck").hide();
	                //}
	                
	                //移除table数据
	                refreshReviewer([]);
	            } else {
	                //if(types == 1){
	                    $(".isJoinCheck").show();
	                //}
	                
	                $("#NowReviewerTalbe").show();
	                $("#addReviewer").removeAttr("disabled");
	            }
	        }
	        if($("input[name='isShowCheckListResult']:checked").val()==0){
	            $(".isCheckListResult").show();
	            checkListResult()
	        }else{
	            $(".isCheckListResult").hide();
	        }
			if(_this.name == 'isNeedSignPromise'){
				$("#"+_THISID).click();
			}
	    }
	});
}
function refreshReviewer(data) {
    $("#NowReviewerTalbe").bootstrapTable('load', data);
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
    var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
    if(r != null) return unescape(r[2]);
    return null; // 返回参数值  
}


function GetTime(time){
    var date=new Date(time.replace("-", "/").replace("-", "/")).getTime()
    return date;
};
//评审项列表
function checkListResult() {
    $("#checkListResult").bootstrapTable({
        columns: [{
            field: 'id',
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
        },{
            field: 'Checkbox',
            title: '评委可查看评审结果',
            events:{
                'change .ShowCheckbox':function(e,value,row,index){
                    if(this.checked==true){
                        resultSetList[index].isShow=0;
                    }else{
                        resultSetList[index].isShow=1;
                    }
                    var pare={
                        'projectId':projectId,
                        'packageId':packageId,
                        'examType':examType,
                        'resultSetList':resultSetList
                    }
                    $.ajax({
                        type: "post",
                        url:top.config.AuctionHost+ "/CheckListResultSetController/saveCheckReport.do",
                        data: pare,
                        dataType: "json",
                        async:false,        				
                        success: function (response) {
                            if(response.success){
                                parent.layer.alert('设置成功')
                            }else{
                                parent.layer.alert(response.message)
                            }
                        }
                    });
                },
            },
            formatter: function(value, row, index) {
                
                if(row.isShow==0){
                    return '<input '+  ((createType==1||isStopCheck==1||ProjectData.checkItemInfos.length >0)?'disabled':'') +' type="checkbox" checked class="ShowCheckbox" name="isShow" />可查看';
                }else{
                    return '<input '+  ((createType==1||isStopCheck==1||ProjectData.checkItemInfos.length >0)?'disabled':'') +' type="checkbox" class="ShowCheckbox" name="isShow" />可查看';
                }
                
            }
        },{
            field: 'checkName',
            title: '评审项名称'
        }]
    });
    $("#checkListResult").bootstrapTable('load',resultSetList)
};
$('#addAnnounce, #addReportAnnounce').click(function(){
	var state = ProjectData.ownerDeclarationState, type='promiss';
	if($(this).prop('id') == 'addReportAnnounce'){
		state = ProjectData.reportOwnerDeclarationState;
		type='report'
	}
	parent.layer.open({
	    type: 2,
	    area: ['1000px', '600px'],
	    maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
	    resize: false, //是否允许拉伸
	    title: (ProjectData.isCanSignIn == 1&& isStopCheck != 1 && state !=1 && state != 2)?"编辑":"查看",
	    content: 'bidPrice/Review/projectManager/modal/statements.html?isCanSignIn='+ProjectData.isCanSignIn+"&projectId="+projectId+"&packageId="+packageId+"&examType="+examType+"&ownerDeclarationState="+state+"&isStopCheck="+isStopCheck+"&type="+type,
		success: function (layero, index) {
		    var iframeWin = layero.find('iframe')[0].contentWindow;
		    iframeWin.passMessage(function(state){
				$("#"+_THISID).click();
			});
		},
	})
});
$('[name=isNeedSignPromise]').click(function(e){
	//代理项目选择“否”的前提为业主声明材料已提交并审批通过，若不满足则选择“否”时提示：不存在审批通过的业主声明材料，请提交并审批后再进行选择！
	if($(this).val() == 0 && isAgent == 1){
		if(ProjectData.ownerDeclarationState != 2){
			top.layer.alert('不存在审批通过的业主声明材料，请提交并审批后再进行选择！');
			e.preventDefault();
		}
	}
})
$('[name=isNeedSignReport]').click(function(e){
	//代理项目选择“否”的前提为业主声明材料已提交并审批通过，若不满足则选择“否”时提示：不存在审批通过的业主声明材料，请提交并审批后再进行选择！
	if($(this).val() == 0 && isAgent == 1){
		if(ProjectData.reportOwnerDeclarationState != 2){
			top.layer.alert('不存在审批通过的业主声明材料，请提交并审批后再进行选择！');
			e.preventDefault();
		}
	}
})