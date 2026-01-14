/*=======评审项的封装js===== 
*========== JIN ===========
*====== 2020-05-07 ========
*/
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        CheckListlist:config.AuctionHost +'/PackageCheckListController/list.do',//评审项查询
        CheckListSave:config.AuctionHost +'/PackageCheckListController/save.do',//评审项添加
        deleteChenkUrl:config.AuctionHost +'/PackageCheckListController/delete.do',//评审项删除
        updateChenkUrl:config.AuctionHost +'/PackageCheckListController/update.do',//评审项修改
        CheckItemUrl:config.AuctionHost +'/PackageCheckItemController/list.do',//评价项查询
        CheckItemsave:config.AuctionHost +'/PackageCheckItemController/save.do',//评价项添加
        CheckItemdelete:config.AuctionHost +'/PackageCheckItemController/delete.do',//评价项删除
        CheckItemupdate:config.AuctionHost +'/PackageCheckItemController/update.do',//评价项修改
        saveByExcel:config.AuctionHost+'/PackageCheckItemController/saveByExcel.do',//批量导入评价项
        tempCheckPlanUrl:config.AuctionHost+"/tempPackageCheckController/findPackageCheckList.do",//模板接口
        savePackageCheckAllUrl:config.AuctionHost +'/tempPackageCheckController/savePackageCheckAll.do',//选择评审项模板
        Token:$.getToken(),
        parameter:{},//接口调用的基本参数
        status: 1,   //1是编辑，2是查看
        headerBtn:'addOffer',//自定义添加按钮名称
        offerSubmit:'offerBtn',
        tableName:'offerTable',
        customModal:true,//是否自定义弹出框
        modalHtml:'Auction/common/Agent/packageCheck/model/PackageCheckList.html',//评审项弹出框
        modalitemHtml:'Auction/common/Agent/packageCheck/model/add_Check.html',//评价项弹出框
        modalWidth:'500px',
        modalHeight:'550px',
        attachmentState:2,   //1调用接口添加到数据库中，2是添加到数组中
        attachmentData:[],//报价表数组        
    };
    function OfferForm($ele, options) {
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});
        this.init();
    }
    OfferForm.prototype = {
        constructor: OfferForm,
        init: function () { 
            if(this.$ele.parent()){//如果有父级去清除父级的内边距；
                this.$ele.parent().css('padding','0px');
            }
            this.viewAjax();//获取列表信息          
            this.renderHtml();//渲染页面
            this.openModel(null);//初始化添加事件         
            this.offerSubmit();//初始化提交事件    
        },
        renderHtml: function () {
            var options = this.options;
            var _that=this;
            var data=options.attachmentData;
            var column=options.columns; 
            if(options.status==1){
                column.push(
                    {
                        field: '',
                        title: '操作',
                        align: 'left',
                        width: '150',
                        events:{
                            //调用编辑功能
                            'click .editModel':function(e,value, row, index){
                                _that.editModel(row.id,index)
                            },
                            //调用删除功能
                            'click .deleteAjax':function(e,value, row, index){
                                _that.deleteAjax(row.id,index)
                            },
                            //调用删除功能
                            'click .MoveUpward':function(e,value, row, index){
                                _that.MoveUpward(row.id,index)
                            },
                            //调用删除功能
                            'click .MoveDown':function(e,value, row, index){
                                _that.MoveDown(row.id,index)
                            },
                        },
                        formatter: function(value, row, index) {
                            var html=[];
                            if(index>0){
                                html.push('<button type="button" class="btn btn-xs btn-primary editModel" style="margin-bottom:5px" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>');
                                html.push('<button type="button" class="btn btn-xs btn-danger deleteAjax" style="margin-bottom:5px" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>');
                                html.push('<button type="button" class="btn btn-xs btn-default MoveUpward" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>上移</button>');
                                html.push('<button type="button" class="btn btn-xs btn-default MoveDown" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>下移</button>');  
                            } else{
                                html.push('<button type="button" class="btn btn-xs btn-primary editModel" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>');
                            }
                            return html.join("")   
                        }
                    }
                )
            }
            var html = [];               
            html.push('<table class="table table-bordered" style="margin-bottom: 0px;">') 
            html.push('<tr>')
            if(options.status==1){
                html.push('<td colspan="3" class="active" style="border: none;"><strong>综合评审</strong></td>')
                html.push('<td colspan="3" style="text-align: right;border: none;" class="active">')
                html.push('<input class=" btn btn-primary" type="button" value="添加评审项"  placeholder=""/>')			
                html.push('</td>')
            }else{
                html.push('<td colspan="3" class="active" style="border: none;"><strong>综合评审</strong></td>')
            }
            
            html.push('</tr>')		  	
            html.push('<tr>')
            html.push('<td colspan="4">')	           
            html.push('</td>')
            html.push('</tr>')
            html.push('</table>')
            _that.$ele.html(html.join(""))                             
            $("#"+options.tableName).bootstrapTable({
                columns: column
            });									
            $("#"+options.tableName).bootstrapTable("load", data);           
        },
        //弹出层
        openModel:function(){//add是添加，edit是编辑，offerId报价表的主键id
            var that = this;
            if(that.options.custom){//自定义表格
                $('#'+that.options.headerBtn).on("click", function () {
                    if(that.options.customModal){//自定义弹出层
                        var content=that.options.modalHtml;
                        var type=2;
                    }
                    parent.layer.open({
                        type: type ,//此处以iframe举例     
                        title:'添加报价表',
                        area: [that.options.modalWidth, that.options.modalHeight],
                        content: content,
                        btn:['确定','关闭'],
                        success: function(layero, index) {                           
                            var iframeWinAdd = layero.find('iframe')[0].contentWindow;  
							/* iframeWin.passessage(function(data){
								data.orders=((that.options.attachmentData.length)+1);  //排序
								that.addAjax(data);
							}) */
                        },
                        yes:function(index,layero){
                            var iframeWin = layero.find('iframe')[0].contentWindow;
							
                            if(that.Verification(iframeWin.$("form"))){
                                var data=serializeArrayToJson(iframeWin.$("form").serializeArray()); 
                                data.orders=((that.options.attachmentData.length)+1);  //排序                                                                  
                                that.addAjax(data);
                                parent.layer.close(index);
                            }  
                        }
                    });                   
                })
            }   
            
        },
        editModel:function(offerId,_index){
            var that = this;
            if(that.options.customModal){//自定义弹出层
                var content=that.options.modalHtml+'?offerId='+offerId//弹出层路径
                var type=2     
            }
            parent.layer.open({
                type: type ,//此处以iframe举例     
                title:'编辑报价表',
                area: [that.options.modalWidth, that.options.modalHeight],
                content: content,
                btn:['确定','关闭'],
                success: function(layero, index) {
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var dataInfo=that.options.attachmentData[_index]; 
                    iframeWin.formModel(dataInfo)   
                },
                yes:function(index,layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    if(that.Verification(iframeWin.$("form"))){
                        var data=serializeArrayToJson(iframeWin.$("form").serializeArray());                                                  
                        that.addAjax(data,_index)
                        parent.layer.close(index);
                    } 
                    
                }
            });
            parent.$('.active').bind('click',function(){

            });
        },
        //添加报价表
        addAjax:function(_data,_index){
            var that = this;
            if(that.options.attachmentState==1){//添加到数据库中
                $.ajax({
                    type: "post",
                    url: that.options.saveurl,
                    async:false,
                    data:_data,
                    dataType: "json",
                    success: function (response) {
                        if(response.success){                        
                            that.viewAjax();
                            
                        }
                    }
                });              
            }else{//添加到数组中
                if(_index){//输入下标存在则为编辑，替换所对应下标的数据
                    that.options.attachmentData[_index]=_data
                }else{
                    that.options.attachmentData.push(_data);
                }
            }
            $("#"+that.options.tableName).bootstrapTable("load", that.options.attachmentData);
        },      
        //查看报价表
        viewAjax:function(){
            var that = this;
            $.ajax({
                type: "post",
                url: that.options.viewURL,
                async:false,
                data:that.options.parameter,
                dataType: "json",
                success: function (response) {
                    if(response.success){
                        if(response.data){
                            that.options.attachmentData=response.data;
                        }                       
                    }
                }
            });
        },
        //删除报价表
        deleteAjax:function(offerId,_index){
            var that = this;
            parent.layer.confirm('温馨提示：您确定要删除该条报价吗？', {
                btn: ['是', '否'] //可以无限个按钮
            }, function(index, layero) {
                if(that.options.attachmentState==1){//从数据库中删除
                    $.ajax({
                        type: "post",
                        url: that.options.deleteUrl,
                        async:false,
                        data:_data,
                        dataType: "json",
                        success: function (response) {
                            if(response.success){                        
                                that.viewAjax();
                            }
                        }
                    });              
                }else{//从数组中删除
                    that.options.attachmentData.splice(_index,1);
                    $("#"+that.options.tableName).bootstrapTable("load", that.options.attachmentData);
                }
                parent.layer.close(index);
            }, function(index) {
                parent.layer.close(index)
            });    
        },
        //上移
        MoveUpward:function(offerId,_index,_this){
            var that = this;
            if(_index>1){
                that.options.attachmentData[_index].orders=_index;
                that.options.attachmentData[_index-1].orders=_index+1;             
                that.options.attachmentData[_index] = that.options.attachmentData.splice(_index-1, 1, that.options.attachmentData[_index])[0];
                console.log(that.options.attachmentData)
                $("#"+that.options.tableName).bootstrapTable("load", that.options.attachmentData);             
            }else{
                parent.layer.alert('已经是最上层了！');
                return false;
            }
           
        },
        //下移
        MoveDown:function(offerId,_index,_this){
            var that = this;
            if(_index==that.options.attachmentData.length-1){
                parent.layer.alert('已经是最下层了！');
                return false;
            }else{
                that.options.attachmentData[_index].orders=_index+2;
                that.options.attachmentData[_index+1].orders=_index;    
                that.options.attachmentData[_index] = that.options.attachmentData.splice(_index+1, 1, that.options.attachmentData[_index])[0];              
                $("#"+that.options.tableName).bootstrapTable("load", that.options.attachmentData);
            }
            
        },
        //验证
        Verification:function(self){
            var that = this;
            var _this = self;
            var isSuc = true;
            var dataType = {
                "*": /\S/,  //不能为空
                "mobile": /^1[3456789]\d{9}$/,  //手机号
                "num": /^\d+$/,  //数字               
                "positiveNum" :/^[0-9][0-9]*$/,    //正整数              
            };
            var dataMsg = {
                "*": "信息不能为空",
                "num": "只能输入数字",              
                "positiveNum": "请输入大于0的正数",          
            };
            _this.find("[datatype]").each(function(){
                var dt = $(this).attr("datatype");//必填选项
                var char=$(this).data("char");//限制位数
                var val = $.trim($(this).val());
                var ignore = $(this).attr("ignore");  //忽略必填验证  ignore="ignore"  
                var errormsg = $(this).attr("errormsg");
                errormsg = errormsg ? errormsg : dataMsg[dt];
                ignore = ignore && ignore == "ignore" ? ignore : "";   
                val = val ? val : "";
                if(dt && dt != "" && dt != undefined && !(ignore && val == "")){
                    if(!dataType[dt].test(val)){
                        var _that = $(this);
                        window.top.layer.alert(errormsg, function(index){
                            top.layer.close(index);			
                            if($(".panel-collapse").length > 0){
        //						$('.collapse').collapse('hide');
                                _that.closest('.panel-collapse').collapse('show');
                                _that.closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
                            }
                            _that.focus();
                        });
                        
                        isSuc = false;
                        return false;
                    }
                    if(val.length>char){
                        var _that = $(this);
                        window.top.layer.alert(errormsg+'，且不能超过'+char+'个字符', function(index){
                            top.layer.close(index);			
                            if($(".panel-collapse").length > 0){
                                _that.closest('.panel-collapse').collapse('show');
                                _that.closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
                            }
                            _that.focus();
                        });
                        
                        isSuc = false;
                        return false;
                    }
                }
            });
            return isSuc;
        },
        // 整个提交
        offerSubmit:function(){
            var that = this;           
            $(that.options.offerSubmit).on("click", function () {
                var pare=that.options.parameter;
                pare.packagePriceLists=that.options.attachmentData;              
                $.ajax({
                    type: "post",
                    url: that.options.saveurl,
                    data:pare,
                    dataType: "json",
                    success: function (response) {
                       if(response.success){
    
                       }
                    }
                });                  
            })     
        },
        //插入一条默认数据-报价总价
        defaultData:function(){
            var that = this;
            if(that.options.attachmentData.length==0||that.options.attachmentData[0].productServices!="报价总价"){
                that.options.attachmentData.unshift(
                    {
                        'productServices':'报价总价', //产品或服务
                        'quotePriceType':'1', //报价-价格: 1  报价-费率：2  数字：3  文本：4
                        'quotePriceName':'报价总价',//报价名称
                        'quotePriceUnit':'元',//报价单位
                        'pointNum':'2',//小数点位数
                        'pointLast':'1',//小数点最后一位  不允许为0：0  允许为0：1
                        'remark':'',//备注
                        'orders':'1' //排序
                    }
                )
            }    
        },        
    };
    $.fn.offerForm = function (options) {
        options = $.extend(defaults, options || {});
 
        return new OfferForm($(this), options);
    }
 
})(jQuery, window, document);