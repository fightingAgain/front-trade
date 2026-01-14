/*
 * @Author: your name
 * @Date: 2021-02-05 10:26:50
 * @LastEditTime: 2021-02-05 17:06:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork\bidPrice\currencyControl\js\tree.js
 */ 
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        findURL:config.Syshost + '/DataTypeController/findDataTypeList.do',//回显接口
        Token:$.getToken(),
        title:'选择项目类型',
        projectType:'3',
        parameter:{
            'status':"0",
            'type':2,
        },//接口调用的基本参
        content:'',//弹出层内容
        checkType:'radio',//radio为单选，checkbox为多选，默认单选
        islowest:true,//是否只能选择最下级，true为是，false为否，默认true
        checkedId:'',
        success:function(data,$index){ 
        }
    };
 
    function TreeNew($ele, options) {
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});
        this.code={
            '0':'A',
            '1':'B',
            '2':'C',
            '3':'C50',
            '4':'W'
        }
        this.options.parameter.code=this.code[this.options.projectType]
        this.init();
        
    }
    TreeNew.prototype = {
        constructor: TreeNew,
        init: function () { 
            this.renderHtml();//渲染页面
            this.openModel(null);//初始化添加时间  
        },
        renderHtml: function () {
            var options = this.options;
            var _that=this;
            options.content='<div style="height: 480px;overflow: auto;">'
                            +'<fieldset>'
                                +'<ul id="experItem" class="ztree">11111</ul>'
                            +'</fieldset>'
                        +'</div>'                       
        },
        //弹出层
        openModel:function(){//add是添加，edit是编辑，offerId报价表的主键id
            var that = this;
            that.$ele.off("click").on("click", function () {                 
                parent.layer.open({
                    type: 1 ,//此处以iframe举例     
                    title:that.options.title,
                    area: ['450px', '600px'],
                    btn: ['确认', '取消'],
                    id:'windows',
                    content: that.options.content,
                    success: function(layero, index) {                                    
                        that.getRow(layero);                           
                    },
                    yes: function(index, layero){
                        var treeObj = $.fn.zTree.getZTreeObj('experItem');
                        var info = [];
                        var nodes= treeObj.getCheckedNodes(true);
                        if(nodes.length==0){
                            parent.layer.alert("请选择一条项目类型");
                            return false;
                        }
                        if(that.options.checkType=='radio'&&nodes.length>1){
                            parent.layer.alert('只能选择一个项目类型')
        
                            return false;
                        }
                        for(var i = 0; i < nodes.length; i++){
                            if(nodes[i].children==undefined) {
                                //不是父节点
                                info.push(nodes[i]);
                            }else{
                                if(that.options.islowest){
                                    parent.layer.alert('请选择最下级')
                
                                    return false;
                                }                               
                            }
                        }
                        
                        that.options.success(info,index,that)
                    }
                    ,btn2: function(index, layero){
                       
                    }
                });                   
            })  
            
        },      
        //获取数据
        setNodes:function(){
            var that = this;
            var nodes=[];
            $.ajax({
                url:that.options.findURL,
                type:"post",
                async:false,
                dataType:"json",
                data:that.options.parameter,
                success: function(result){	
                    if(result.success){
                        nodes = result.data;
                    }
                }
            })
            return nodes;
        },
        getRow:function($layero){
            var that = this;
            var zNodes = that.setNodes();
            var setting = {	
                data:{
                    simpleData:{
                        enable: true,
                        idKey: "code",
                        pIdKey: "pCode",
                        rootPId: ""
                    }
                },
                check:{
                    enable:true,
                    chkStyle:that.options.checkType,
                    chkboxType : { "Y" : "", "N" : "" }
                }
            };
            console.log(that.options.checkedId)
            var zTreeObj = $.fn.zTree.init($layero.find("#experItem"), setting, zNodes);
            //勾选已经选中的值	
            if(typeof(that.options.checkedId) != "undefined" && that.options.checkedId != null && that.options.checkedId != ""){
                var checkedId = that.options.checkedId.split(',');	
                var nodes = zTreeObj.transformToArray(zTreeObj.getNodes());
                $.each(nodes,function(i,node){
                    if(checkedId.contain(node.id)){
                        zTreeObj.checkNode(node,true,false);
                    } 
                });
            }
        }        
    };
    $.fn.treeNew = function (options) {
        options = $.extend(defaults, options || {});
 
        return new TreeNew($(this), options);
    }
 
})(jQuery, window, document);