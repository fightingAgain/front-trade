/*

 */ 
var url = top.config.AuctionHost;
var loadFile = top.config.FileHost + "/FileController/download.do"; //文件下载
var startUrl = top.config.AuctionHost + "/ManagerCheckController/sendReview.do";//手动下达评审指令
var reStartUrl = top.config.AuctionHost + "/ManagerCheckController/reissueCheck.do";//重新下达评审指令
var packageId = getUrlParam("packageId");//包件id
var projectId = getUrlParam("projectId");//项目id
var examType = getUrlParam("examType");//预审还是后审0是预审，1是后审
var createType = getUrlParam("createType"); //0自己本人创建  1非本人创建
var enterpriseType=getUrlParam("enterpriseType");
var tenderType = getUrlParam("tenderType");//采购方式
var _thisId='projectData';//当前菜单id
var _THISID="projectData";//当前点击菜单id，当点击进入之后运行成功了即可赋值，不成功即为上一个点击菜单的id；
var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;//获取父级弹出层id
var dcmt = parent.$('#' + thisFrame);//获取整个父级弹出层对象；
var isStopCheck="";//流标状态
var checkPlan;//评审方式：0综合评分法，1最低评标价法，3最低投标价法，2、经评审的最低价法(价格评分) 4、经评审的最高投标价法5经评审的最低投标价法
var progressList=new Object();//评审进度
var checkSetType=1;//预审还是后审的参数，1为预审参数，2为后审参数
var quotePriceUnit; //报价单位
var isAllOut;//供应商是否全部淘汰，1是全部淘汰，0是没有
var isAgent;//是否是代理机构项目，1是代理机构项目，0不是
var pointNum;
var keepNum = "";
var _h=parent.$('#' + thisFrame).height();//获取父级高度
var isclose=false;
var isLeader, isPriceCheck, isTotalCheck;//(项目经理) 空无评委组长 1有组长; isPriceCheck价格评审执行人0 项目经理 1 评委; isTotalCheck评审汇总执行人 0 项目经理 1 评委
var alertHaltReminder = false, timeStep;//是否已弹出停机提醒、定时器
//初始化
$(function(){
    //资格审查方式，0是预审，1是后审
    if(examType==1){
        checkSetType=2
        
    }
   
    $("#menu").height(_h-95);//得到右边进度菜单的高度
    $("#reportContent").height(_h-195);//内容详情的容器高度
    
    getData();//初始化获取菜单列表信息和评审进度
    if(examType == 1){
    	getPriceUnit(); //报价单位
    }
    if(progressList.continueState==0){
        layerDloag();
    }
    $('#reportContent').load('projectData.html');//默认首次进入页面展示项目信息
    //刷新事件
    $("#btnRefresh").on('click',function(){
        if(isclose){
            layerDloag(); 
        }
        $("#"+_THISID).click();
    })
    //关闭页面事件
	$('html').on('click', '#btnClose', function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//下达评审指令
	$('html').on('click', '#btnOfOrder', function () {
		$(this).attr('disabled', true);
		startReview();
	});
	//下达评审指令
	$('html').on('click', '#btnOfReOrder', function () {
		$(this).attr('disabled', true);
		parent.layer.prompt({
			formType: 2,
			value: '',
			resize: false,
			maxmin: false,
			maxlength: 1000,
			title: '请输入重新下达原因',
			btn2: function(){
				$('#btnOfReOrder').removeAttr('disabled');
			}
		}, function(value, ind, elem) {
			parent.layer.close(ind);
			top.layer.confirm('确定重新下达评标指令?', {
				icon: 3,
				title: '提示',
				btn:['取消', '确认']
			}, function(indexs) {
				$('#btnOfReOrder').removeAttr('disabled');
				top.layer.close(indexs);
			}, function(indexs){
				top.layer.close(indexs);
				reReview(value);
			});
			
		})
		
		
		
		
	});
})
//获取菜单列表信息和评审进度
function getData() {
    $.ajax({
        type: "get",
		url: url + "/ManagerCheckController/findManagerCheckProgress.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: examType
        },
        async: false,
        success: function (response) {
            if(response.success){               
                progressList=response.data;
				isLeader = progressList.isLeader;
				isTotalCheck = progressList.isTotalCheck;
				isPriceCheck = progressList.isPriceCheck;
				startNavTask(progressList.checkResult);
				//展示下达评审指令按钮 (employeeType == 8 表示监标人)
				if(progressList.autoOrderShow && (createType == 0 || top.employeeType == 8)){
					$('#btnOfOrder').show();
				}else{
					$('#btnOfOrder').hide();
				};
				//展示重新下达按钮
				if(progressList.autoReOrderShow && progressList.autoReOrderShow == 1 && (createType == 0 || top.employeeType == 8) && progressList.checkResult == '未完成'){
					$('#btnOfReOrder').show();
				}else{
					$('#btnOfReOrder').hide();
				}
                isStopCheck=progressList.isStopCheck;
				//自动评审指令且 （无推选时已发送评委抽取短信 或 有推选组长且已推选） 或 （手动评审指令）已下达评审指令
				if(((progressList.isAutoOrder == 0 || !progressList.isAutoOrder) && ((progressList.isSendMess == 1 && progressList.isRecommendExpert == 0) || (progressList.isRecommendExpert == 1 && progressList.recommendStatus == "已完成"))) || (progressList.isAutoOrder == 1 && progressList.autoReOrderShow == 1)){
					$('#downloadAllFile').show();
				}else{
					$('#downloadAllFile').hide();
				};
                if(examType==1){
                    checkPlan = progressList.checkPlan;                   
                }else{
                    checkPlan = progressList.examCheckPlan;
                }  
                if(progressList.keepNum != undefined){
                    keepNum = progressList.keepNum;
                }              
                isAllOut=progressList.isAllOut;
                isAgent=progressList.isAgent;
                if (progressList.stopCheckReason != "" && progressList.stopCheckReason != undefined) {
                    $('#viewReason').html(progressList.stopCheckReason);
                    $('#StopChecks').html('专家评委提出项目失败，');
                    $(".queRen").html('确认');
                    $('.StopCheck').show();
                    $('#viewReason').show();
                } else {
                    $(".queRen").html('');
                    $('.StopCheck').hide();                
                    $('#viewReason').hide();
					if($('.xEdit').prop('id') != 'Formation'){
						$('.isStopCheck').show();
					}
                    if (progressList.bidResultType == 1) {//已存在结果通知书,无法项目失败                     
                        $('.StopCheckBtn').hide();
                    }
                };
                if (progressList.isStopCheck == 1) {
                    $('.StopCheck').show();
                    $('#StopChecks').html('已项目失败，');                 
                    $('.isStopCheck').hide();
                    $('.StopCheckBtn').hide();
                    $('input').attr('disabled',true);
                    $('select').attr('disabled',true);
                }
                if(createType==1){
                    $('input').attr('disabled',true);
                    $('select').attr('disabled',true);                  
                    $(".isCreateType").hide();
                    $('#StopCheck').hide();
                    $('#StopCheckPw').hide();
                }else{
					if($('.xEdit').prop('id') != 'Formation'){
						$(".isCreateType").show();
					}
                }                            
            }else{
				top.layer.alert(response.message)
			}
        }
    });
    menuList();
    $("#btn_close").on('click',function(){
        parent.layer.close(parent.layer.getFrameIndex(window.name));	
    })
}
function menuList(){
    var data=new Array();
	var canClick = false;//能否点击
	var sysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	var nowDate = Date.parse(new Date(sysDate.replace(/\-/g, "/"))); //公告发布时间
	var startDate = Date.parse(new Date(progressList.checkEndDate.replace(/\-/g, "/")));
    /**
     * @param isAutoOrder 0自动  1 手动  2 已下达评审指令
     */
	if(progressList.isAutoOrder == 0 || !progressList.isAutoOrder){
        // 后审ca加密的项目判断openEnd开启结束
        if (progressList.examType == 1 && progressList.encipherStatus == 1) {
            if (progressList.isSendMess == 1 && progressList.openEnd == true) {
                canClick = true
            }
        }
        // isSendMess 是否组建完评委会
		else if(progressList.isSendMess==1 && nowDate > startDate){
			canClick = true
		}
        // 未完成组长推荐的话后面的节点无法点击
        if (canClick && progressList.isRecommendExpert == 1 && progressList.recommendStatus === '未完成') {
            canClick = false;
        }
	}
    // autoReOrderShow 下达的状态 0 未下达 1下达
    else if((progressList.isAutoOrder == 1 && progressList.autoReOrderShow == 1) || progressList.isAutoOrder == 2){//已下达评审指令
		canClick = true
	}
	data.push(
	    {
	        "name": "项目信息",
	        "url": "projectData.html",
	        'id':'projectData',
	        'typeClass':'keEdit',        
	    },
	    {
	        "name": "评审设置",
	        "url": "ReportSet.html",
	        'id':'ReportSet', 
	        'typeClass':'keEdit',          
	    },
	    {
	        "name": "组建评委",
	        "url": "Formation.html",
	        'id':'Formation', 
	        'typeClass':'keEdit',           
	    }
	)
	if(progressList.isNeedSignPromise == 1){
		data.push(
		    {
		        "name": "签订承诺书",
		        "url": "signPromise.html",
		        'id': 'signPromise',
		        'typeClass':'keEdit',
		    }
		)
		if(progressList.isRecommendExpert == 1){//是否推选组长 0否1是
			data.push(
			    {
			        "name": "推选组长",
			        "url": "recommendLeader.html",
			        'id': 'recommendLeader',
			        'typeClass':progressList.signIn == '已完成'?'keEdit':'bkEdit',
			    }
			)
		}
		
	}else{
		if(progressList.isRecommendExpert == 1){//是否推选组长 0否1是
			data.push(
			    {
			        "name": "推选组长",
			        "url": "recommendLeader.html",
			        'id': 'recommendLeader',
			        'typeClass':'keEdit',
			    }
			)
		}
	}
	if(isAgent == 1 || isAgent == 0){
		data.push(
			{
			    "name": "政府失信名单查询",
			    "url": "dishonestList.html",
			    'id':'dishonestList',  
			    'typeClass': !canClick?'bkEdit':'keEdit',
			}
		)
	}
	if (progressList.isNeedClear == 1) {//有清单
		data.push({
		    "name": "清标",
		    'id': 'clearBidding',
		    "url": "clearBidding.html",
		    'typeClass': !canClick ? 'bkEdit' : 'keEdit',
		});
	}
	if(progressList.isNeedQueryRep == 1){
		data.push({
			"name": "查重",
			'id': 'queryRep',
			"url": "queryRep.html",
			'typeClass': !canClick ? 'bkEdit' : 'keEdit',
		});
	}
	data.push(
		{
			"name": "进度管理",
			"url": "progress.html",
			'id':'progress',  
			'typeClass': !canClick?'bkEdit':'keEdit',
		}   
	)
    
    
    if(examType==1){
        
        if(progressList.doubleEnvelope == 1){
            if(progressList.isShowOfferTab!=1){
                data.push({
                    "name": "报价一览表",
                    'id':'quotation',
                    "url": "quotation.html",  
                    'typeClass':!canClick?'bkEdit':'keEdit',
                });    
            }          
        }else{
            if(progressList.projectCheckers[0].isShowAllOffer == 1&&(progressList.packageCheckLists&&progressList.packageCheckLists[progressList.packageCheckLists.length-1].isCheckFinish=='已完成')){
                data.push({
                    "name": "报价一览表",
                    'id':'quotation',
                    "url": "quotation.html",  
                    'typeClass':!canClick?'bkEdit':'keEdit',
                });
                
            }else if(progressList.projectCheckers[0].isShowAllOffer == 0){
                data.push({
                    "name": "报价一览表",
                    'id':'quotation',
                    "url": "quotation.html",
                    'typeClass':!canClick?'bkEdit':'keEdit',
                }); 
                
            }          
        }
        data.push(       
            {
                "name": "报价文件",
                'id':'PriceFile',
                "url": "PriceFile.html",
                'typeClass':!canClick?'bkEdit':'keEdit', 
                
            }
        )
        var isShowCode=false
        if(progressList.isOpenDarkDoc==1&&progressList.packageCheckLists.length>0){
            if(isStopCheck==1||isAllOut==1){
                isShowCode=true
            }else{
                
                if((progressList.darkSupCode==1&&progressList.checkItem=="已完成")){
                    isShowCode=true
                }else{
                    var isShadowMarkData=[];
                    for(var i = 0; i < progressList.packageCheckLists.length; i++) {
                        if(progressList.packageCheckLists[i].isShadowMark==1){
                            isShadowMarkData.push(progressList.packageCheckLists[i])
                        }
                    }
                    if((progressList.darkSupCode==0&&isShadowMarkData.length>0&&isShadowMarkData[isShadowMarkData.length-1].isCheckFinish=="已完成")){
                        isShowCode=true
                    }
                }   
            }
            if(isShowCode){
                data.push(       
                    {
                        "name": "暗标编号对应关系",
                        'id':'corresponding',
                        "url": "corresponding.html",
                        'typeClass':!canClick?'bkEdit':'keEdit', 
                        
                    }
                )
            }
        }
    }
    if(examType==0){
        data.push(       
            {
                "name": "资格预审申请文件",
                'id':'PriceFile',
                "url": "PriceFile.html",
                'typeClass':!canClick?'bkEdit':'keEdit', 
                
            }
        )
    }
    if(progressList.packageCheckLists.length>0){
        for(var i = 0; i < progressList.packageCheckLists.length; i++) { //评审项目循环
            if(progressList.packageCheckLists[i].checkType==4){
                if(i>0&&progressList.packageCheckLists[i-1].isCheckFinish=='未完成'){
                    var className="bkEdit"
                }else if(i>0&&progressList.packageCheckLists[i-1].isCheckFinish=='已完成'){
                        if(progressList.packageCheckLists[i].isCheckFinish=='未完成'){
                            var className="nowEdit"
                        }else{
                            var className="keEdit"
                        }
                }else{
                    
                    if(!canClick){
                        var className="bkEdit"
                    }else{
                        if(progressList.packageCheckLists[i].isCheckFinish=='未完成'){
                            var className="nowEdit"
                        }else{
                            var className="keEdit"
                        }
                    }
                        
                }
                data.push(
                    {
                        "name": progressList.packageCheckLists[i].checkName+((examType==1&&progressList.doubleEnvelope == 1)?'</br><i class="text-danger">(第'+ top.sectionToChinese(progressList.packageCheckLists[i].envelopeLevel) +'信封)</i>':''),
                        "url": "packageCheckList.html",
                        'id':progressList.packageCheckLists[i].id,                   
                        'typeClass':className,       
                    }            
                )
            }else{
                data.push(
                    {
                        "name": progressList.packageCheckLists[i].checkName+((examType==1&&progressList.doubleEnvelope == 1)?'</br><i class="text-danger">(第'+ top.sectionToChinese(progressList.packageCheckLists[i].envelopeLevel) +'信封)</i>':''),
                        "url": "packageCheckList.html",
                        'id':progressList.packageCheckLists[i].id,
                        'typeClass':progressList.packageCheckLists[i].isCheckFinish=="未完成"?'bkEdit':'keEdit',               
                    }           
                )
            }
           
        }
        if(examType==1&&progressList.isShowOfferTab!=1){
			var priceCheckType = 'bkEdit';
			//isPriceCheck 价格评审执行人  0 项目经理  1 组长
			if(progressList.packageCheckLists[progressList.packageCheckLists.length-1].isCheckFinish == '未完成'){
				priceCheckType = 'bkEdit'
			}else{
				if(progressList['priceCheck'] == '未完成'){
					if(isPriceCheck == 0){
						priceCheckType = 'nowEdit'
					}
				}else{
					priceCheckType = 'keEdit'
				}
			}
            data.push(
                {
                    "name": "价格评审"+((examType==1&&progressList.doubleEnvelope == 1)?'</br><i class="text-danger">(第二信封)</i>':''),
                    "url": "PriceCheck.html",
                    'id':'priceCheck',
                    'typeClass': priceCheckType,  
                }
            )
        }
		var  PriceCheckTotalClass = 'bkEdit';
        if(examType==1){
			//isTotalCheck 评审汇总执行人  0 项目经理  1 组长
			if(isStopCheck==1||isAllOut==1){
				if(isTotalCheck == 0 || progressList['checkItem'] == '已完成'){
					PriceCheckTotalClass = 'keEdit'
				}
			}else{
				if(progressList['priceCheck'] == '已完成'){
					if(progressList['checkItem'] == '未完成'){
						if(isTotalCheck == 0){
							PriceCheckTotalClass = 'nowEdit'
						}
					}else{
						PriceCheckTotalClass = 'keEdit'
					}
				}
			}
            // var  PriceCheckTotalClass= (isStopCheck==1||isAllOut==1)?'keEdit':(progressList['priceCheck']=="未完成"?'bkEdit':((progressList['checkItem']=='未完成' && isTotalCheck===0)?'nowEdit':((progressList['checkReport']=="未完成" && isTotalCheck===0)?'nowEdit':'keEdit')))
        }else{
			if(isStopCheck==1||isAllOut==1){
				if(isTotalCheck == 0 || progressList['checkItem'] == '已完成'){
					PriceCheckTotalClass = 'keEdit'
				}
			}else{
				if(progressList.packageCheckLists[progressList.packageCheckLists.length-1].isCheckFinish=='已完成'){
					if(progressList['checkItem'] == '未完成'){
						if(isTotalCheck == 0){
							PriceCheckTotalClass = 'nowEdit'
						}
					}else{
						PriceCheckTotalClass = 'keEdit'
					}
				}
			}
            // var  PriceCheckTotalClass= (isStopCheck==1||isAllOut==1)?'keEdit':(progressList.packageCheckLists[progressList.packageCheckLists.length-1].isCheckFinish=='未完成'?'bkEdit':((progressList['checkItem']=='未完成' && isTotalCheck===0)?'nowEdit':((progressList['checkReport']=="未完成" && isTotalCheck===0)?'nowEdit':'keEdit')))
        }
        data.push(
            {
                "name": "评审记录汇总",
                "url": "PriceCheckTotal.html",
                'id':'PriceCheckTotal',  
                'typeClass':PriceCheckTotalClass,                  
            },
            {
                "name": "评审报告",
                "url": "CheckReport.html",
                'id':'CheckReport',
                'typeClass':progressList['checkReport']=="未完成"?'bkEdit':'keEdit',            
            },
            {
                "name": "评审澄清",
                "url": "raterAsks.html",
                'id':'raterAsks',
                'typeClass':!canClick?'bkEdit':'keEdit',           
            }
        )
    
    }
    var liStr= "";
    // 遍历生成主菜单
    for( var i = 0; i <data.length; i++){           
        liStr+='<li data-index="'+ i +'" class="'+ data[i].typeClass +'" id="'+ data[i].id +'" data-url="'+ data[i].url +'">'
            liStr+='<span>'
            liStr+=data[i].name
            liStr+='</span>'
        liStr+='</li>'
    };
    $("#menu").html(liStr);
    $("#"+_thisId).addClass('xEdit')
    if(progressList.packageCheckLists.length>0){
         //动态渲染进度列表
        var list="";
        var _i=0;
        var _w=$("#jindu").width();//父容器宽度
        for(var i=0;i<data.length;i++){
            if(data[i].id.length==32){
                _i=i;
                break;
            }
        }
        list+='<div style="width:85%;margin:auto;overflow: hidden;"><ul class="flex-direction-content" style="width:'+ (300*(data.length-1-_i)) +'px">'
        for(var i=_i;i<data.length-1;i++){       
            if(data[i].id.length==32){//当id位数是32位时，为评审项阶段
                if(data[i].typeClass=="keEdit"){//为keEdit为可操作阶段
                    list+='<li id="'+ data[i].id +'" style="background: url(../../public/img/img_14.png) no-repeat center 5px">' 
                }else if(data[i].typeClass=="nowEdit"){//为nowEdit为当前所在阶段
                    list+='<li id="'+ data[i].id +'" style="background: url(../../public/img/img_16.png) no-repeat center 5px">' 
                }else{//剩下的为不可操作阶段
                    list+='<li id="'+ data[i].id +'" style="background: url(../../public/img/img_18.png) no-repeat center 5px">' 
                }    
                list+='<p>'+ data[i].name +'</p>'
                list+='</li>'

                list+='<li style="width:80px" class="xian '+ (data[i].typeClass=="keEdit"?'blud':'grey') +' "></li>'
            }else{//反之为固定的几个阶段
                list+='<li id="'+ data[i].id +'" class="'+ data[i].typeClass +'">'      
                list+='<p>'+ data[i].name +'</p>'
                list+='</li>'
                if(i<data.length-2){

                    list+='<li style="width:80px" class="xian '+ (data[i].typeClass=="keEdit"?'blud':'grey') +' "></li>'
                }   
            }
        
        }
        list+= '</ul></div>'
        
        if(parseFloat(300*(data.length-1-_i))>parseFloat(_w)){
            list+= '<ul class="flex-direction-nav">'
            list+= '<li class="flex-nav-prev"><span class="flex-prev">《</span></li>'
            list+= '<li class="flex-nav-next"><Span class="flex-next">》</Span></li>'
            list+= '</ul>'
        }
        $("#jindu").html(list);
        
    }
}
var moveIndexs = 0;
$(document).on('click',".flex-prev",function(){
    moveIndexs < 0 ? moveIndexs++ : moveIndexs = 0
	$(".flex-direction-content").stop().animate({

		'marginLeft': moveIndexs * 300
	})   
})
$(document).on('click',".flex-next",function(){

    var _o= parseInt($("#jindu").width()/300);
    if(examType==1){
        _o=(progressList.packageCheckLists.length+3)-_o;
    }else{
        _o=(progressList.packageCheckLists.length+2)-_o;
    }
    Math.abs(moveIndexs) < _o ? moveIndexs-- : "";
    $(".flex-direction-content").stop().animate({

        'marginLeft': (moveIndexs *300)
    })
})
 // 页面切换
$(document).off('click', '#menu .keEdit,#menu .nowEdit').on('click', '#menu .keEdit,#menu .nowEdit', function(){ 
    var _index=$(this).attr("data-index");//当前标签的下表
    $(this).addClass('xEdit').siblings().removeClass('xEdit'); 
    var thisPage = $(this).attr("data-url");
    _thisId=this.id;
    if(_index>3){//判断是否是前四个标签，不为前四个则显示按钮
        $(".showNTB").show();
        $("#BtnShow").show();
        $("#reportContent").height(_h-245);//内容详情的容器高度
        if(examType==1&&progressList.doubleEnvelope == 1&&this.id=="PriceFile"){
            $(".envelopeLevelFile").show();
            if(progressList.isShowOfferTab!=1){
                $('.envelopeLevelFile2').show();
            }
        }else{
            $(".envelopeLevelFile").hide();
            $(".envelopeLevelFile2").hide();
        }
    }else{
        $(".showNTB").hide();
        $("#BtnShow").hide();
        $("#reportContent").height(_h-195);//内容详情的容器高度
        $(".envelopeLevelFile").hide();
        $(".envelopeLevelFile2").hide();
    }       

    if(typeof(thisPage) != "undefined"){
        $('#reportContent').load(thisPage,function(){
            getData();
        });    
    }  
      
});

//一键打包
$("#downloadAllFile").click(function () {
	var newUrl = $.parserUrlForToken(top.config.AuctionHost + "/ReviewCheckController/downloadAllPurFile.do?projectId=" + projectId + "&packageId=" + packageId + "&examType=" +examType)
	window.location.href = newUrl;
});
//一键打包
$(".envelopeLevelFile").click(function () {
    var _envelopeLevel=$(this).data('envelopelevel')
	var newUrl = $.parserUrlForToken(top.config.AuctionHost + "/ReviewCheckController/downloadAllPurFile.do?projectId=" + projectId + "&packageId=" + packageId + "&examType=" +examType+'&envelopeCount='+_envelopeLevel)
	window.location.href = newUrl;
});
//一键打包
$(".envelopeLevelFile2").click(function () {
    var _envelopeLevel=$(this).data('envelopelevel')
	var newUrl = $.parserUrlForToken(top.config.AuctionHost + "/ReviewCheckController/downloadAllPurFile.do?projectId=" + projectId + "&packageId=" + packageId + "&examType=" +examType+'&envelopeCount='+_envelopeLevel)
	window.location.href = newUrl;
});
//包件评审结束
$(".StopCheckBtn").click(function () {
	getData();
	if (progressList.stopCheckReason != "" && progressList.stopCheckReason != undefined && progressList.stopCheckSource == 1) {
		//专家发起项目失败,项目经理确认
		top.layer.confirm("温馨提示：项目失败后该包件将作废，是否确定项目失败？", function (indexs) {
            setIsStopCheckP(progressList.stopCheckReason);
            parent.layer.close(indexs);
		})
	} else {
        if (progressList.checkResult == '未完成') {
			//评审报告未审核完成之前,评委若有打分记录则由评委发起
			if (progressList.isCheckItemType==1) {
				top.layer.alert("温馨提示：专家已打分，无法发起项目失败");
				return
			}
		}
		top.layer.confirm("温馨提示：项目失败后该包件将作废，是否确定项目失败？", function (indexs) {
			parent.layer.close(indexs);
			parent.layer.prompt({
				title: '请输入项目失败原因',
				formType: 2
			}, function (text, index) {
				if (text.trim() == "") {
					parent.layer.alert('请填写项目失败原因');

					return
				}
				setIsStopCheckP(text.trim())
				parent.layer.close(index);
			});
		});
	}
})

function setIsStopCheckP(text){
    $.ajax({
        type: "post",
        url: url + "/ProjectReviewController/setIsStopCheck.do",
        data: {
            id: packageId,
            isStopCheck: 1,
            stopCheckReason: text,
            examType:examType
        },
        async: true,
        success: function (data) {
            if (data.success) {
                $("#"+_thisId).click();
                parent.$("#ReportChecktable").bootstrapTable(('refresh'));
                top.layer.alert("操作成功");
            } else {
                top.layer.alert(data.message);
            }
        }
    });
}
//正负数字的正则表达式
var re=new RegExp("^[+-]?(([0-9][0-9]*)|(([0]\\.\\d{1,2}|[0-9][0-9]*\\.\\d{1,2})))$");
//大于0的数字的正则表达式
var rm=new RegExp("^(([1-9][0-9]*)|(([0]\\.\\d{1,2}|[1-9][0-9]*\\.\\d{1,2})))$");
var re0=/^((?:0\.\d*[1-9]|(?!0)\d+(?:\.\d*[1-9])?)|0)-(?:0\.\d*[1-9]|(?!0)\d+(?:\.\d*[1-9])?)$/;
var weiChnise='两';
var priceInte = 15;//价格的整数位数
/*************start获取报价信息****************/
function getPriceUnit(){
	$.ajax({
		url: top.config.AuctionHost + "/NegotiationController/findPriceList.do",
		dataType: 'json',
		data: {
			packageId: packageId
		},
		async:false,
		success: function(data) {
			if(!data.success){
				top.layer.alert(data.message);
				return;
			}
			if(data.data && data.data.quotePriceUnit){
				quotePriceUnit = (data.data.quotePriceName ? data.data.quotePriceName + "（" : "") + data.data.quotePriceUnit + (data.data.quotePriceName ? "）" : "");
			} else {
				quotePriceUnit = "元";
            }

            if(data.data && data.data.pointNum!=undefined){
                pointNum=data.data.pointNum
            }else{
                pointNum=2
            }
			priceInte = 15 - Number(pointNum);

            if(pointNum==0){
                var ss = "^[+-]?([0-9][0-9]*)$";
                var rs = "^[1-9][0-9]*$";
                weiChnise='零'
            }else{
                //正负数字的正则表达式
                var ss="^[+-]?(\\b(?:0|[1-9][0-9]*)\\b|(([0]\\.\\d{1,"+ pointNum +"}|\\b(?:0|[1-9][0-9]*)\\b.\\d{1,"+ pointNum +"})))$";
                //大于0的数字的正则表达式
                var rs="^(([1-9][0-9]*)|(([0]\\.\\d{1,"+ pointNum +"}|[1-9][0-9]*\\.\\d{1,"+ pointNum +"})))$";

                
                weiChnise=(pointNum==2?'两':top.sectionToChinese(pointNum))
            }
            re =new RegExp(ss);


            rm =new RegExp(rs);

            
		},
		error: function(){
			parent.layer.alert("温馨提示：请求失败");
		}
	});
}
/*************end获取报价信息****************/

function NewDateT(str){  
	if(!str){  
	  return 0;  
	}  
	arr=str.split(" ");  
	d=arr[0].split("-");  
	t=arr[1].split(":");
	var date = new Date(); 
   
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
	date.setUTCHours(t[0]-8, t[1], t[2], 0);
	return date;  
}
//时间转换是的IE和谷歌都可以判断日期大小
function NewDatefp(str){  
	if(!str){  
	    return 0;  
	}  
	var timeDATE=new Date(Date.parse(str.replace(/-/g, "/"))).getTime()
	return  timeDATE;  
} 

/* 消息弹出框*/
function layerDloag(){
    isclose=false;
	top.layer.open({
		type: 1, 
		title:'操作提醒',
        area: ['450px', '250px'],
        content: '<div style="width:100%;text-align:center;margin-top:40px;font-size:18px;">该包件参与供应商人数不足'+ progressList.supplierCount +'家，是否要继续评审？</div>'+
        '<div style="width:100%;text-align:center;margin-top:10px;font-size:14px;">（“继续”：可正常评审；“不继续”：项目终止，采购结束）</div>',
		btnAlign: 'c',
        btn: ['继续','不继续'],
        cancel: function(){ 
            //右上角关闭回调
            isclose=true;
        },
		btn1: function(index, layero){
            addContinueCheck(0);
            top.layer.close(index);	
        },
        btn2:function(index, layero){
            top.layer.confirm("温馨提示：是否确定不继续？", function (indexs) {
                addContinueCheck(1)
                top.layer.close(index);
                top.layer.close(indexs);	
            });
            return false;
        },
				
	});	
}
function addContinueCheck(isContinueCheck){
    $.ajax({
        type: "post",
        url: url+"/ManagerCheckController/setIsContinueCheck.do",
        data: {
            'id':packageId,
            'isContinueCheck':isContinueCheck,
            'examType':examType

        },
        dataType: "json",
        async:false,
        success: function (response) {
            if(response.success){
                getData();
                parent.$("#ReportChecktable").bootstrapTable(('refresh'));
            }
        }
    });
};
//手动下达评审指令
function startReview(){
	$.ajax({
	    type: "post",
	    url: startUrl,
	    data: {
	        'id':progressList.projectCheckers[0].id,
			'packageId': packageId,
			'examType': examType,
	        // 'isContinueCheck':isContinueCheck,
	        // 'examType':examType
	    },
	    dataType: "json",
	    async:false,
	    success: function (response) {
			$('#btnOfOrder').removeAttr('disabled');
	        if(response.success){
	            getData();
	            parent.$("#ReportChecktable").bootstrapTable('refresh');
	        }else{
				top.layer.alert(response.message);
			}
	    }
	});
};
//重新下达评审指令
function reReview(remark){
	$.ajax({
	    type: "post",
	    url: reStartUrl,
	    data: {
	        'packageId':packageId,
			'projectId': projectId,
			'examType': examType,
			'reviewCheckId':progressList.projectCheckers[0].id,
			'remark': remark
	    },
	    dataType: "json",
	    async:false,
	    success: function (response) {
			$('#btnOfReOrder').removeAttr('disabled');
	        if(response.success){
	            getData();
	            parent.$("#ReportChecktable").bootstrapTable('refresh');
	        }else{
				top.layer.alert(response.message);
			}
	    }
	});
};