; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        fileDelUrl: top.config.AuctionHost + "/TempOfferFileController/deleteByPackageId.do",	//文件删除地址
        fileAddUrl: top.config.AuctionHost + "/TempOfferFileController/saveTempOfferFile.do",	//提交附件表的地址
        fileListUrl: top.config.AuctionHost + "/TempOfferFileController/findTempOfferFile.do", //文件列表
        downloadUrl:top.config.FileHost + "/FileController/download.do",//下载接口
        isRecord: true,   //是否显示列表
        Token: $.getToken(),
        parameter: {},//接口调用的基本参数
        status: 1,   //1是编辑，2是查看，3供应商报价，4供应商查看
        offerSubmit: 'fileBtn',
        tableName: 'fileContent',
        attachmentState: 2,   //1调用接口添加到数据库中，2是添加到数组中
        filesDataDetail: [],//报价表数组 
        offerFileData:[],//报价文件目录数组
        offerData:new Array(),
        flieName: '',
        isShow: '',//是否需要分项报价
        fileinput: {
            language: 'zh', //设置语言
            uploadAsync: false,
            uploadUrl: top.config.FileHost + "/FileController/uploadBatch.do",		//H5上传地址
            autoReplace: false,
            allowedFileExtensions: ['zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'ZIP', 'RAR', 'DOC', 'DOCX', 'XLS', 'XLSX','PDF','pdf'], //接收的文件后缀
            showUpload: false, //是否显示上传按钮
            showCaption: false, //是否显示标题
            //showCaption: true, //是否显示标题
            dropZoneEnabled: false, //是否显示拖拽区域
            maxFileCount: 1,
            showPreview: false,
            showRemove: false,
            layoutTemplates: {
                actionDelete: "",
                actionUpload: ""
            },
        },

    };

    function FileList($ele, options) {
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});
        this.init();
    }
    FileList.prototype = {
        constructor: FileList,
        init: function () {
            this.renderHtml();//渲染页面  
            this.viewAjax();//获取列表信息                         
            this.offerSubmit();//初始化提交事件 
        },
        renderHtml: function () {
            var options = this.options;
            var _that = this;
            var fileHtml = ""
            if(options.status==1){
                fileHtml += '<tr>'
                fileHtml += '<td class="th_bg">是否需要提供分项报价表</td>'
                fileHtml += '<td colspan="3" style="text-align: left;">'
                fileHtml += '<input type="radio" name="isOfferDetailedItem" value="0"  checked="checked"  />需要'
                fileHtml += '<input type="radio" name="isOfferDetailedItem" value="1"  />不需要'
                fileHtml += ' <div class="red">提示：默认为需要提供分项报价表，提供较为复杂、报价表较多的报价数据或者分项需要供应商提供报价数据</div>'
                fileHtml += '</td>'
                fileHtml += '</tr>'
                fileHtml += '<tr class="fxFile">'
                fileHtml += '<td class="th_bg">分项报价表模板<i class="red">*</i></td>'
                fileHtml += '<td style="text-align: left;width: 320px;">'
                fileHtml += '<div style="height: 34px;line-height: 34px" class="fileBlock">'
                fileHtml += '<input type="file" class="fileloading" name="files" id="saveFile" value="选择" accept=".xlsx,.XLSX,.xls,.XLS,.doc,.DOC,.docx,.DOCX,.zip,.ZIP,.rar,.RAR">'
                fileHtml += '</div>	'
                fileHtml += '</td>'
                fileHtml += '<td style="text-align: left;" colspan="2"><span class="red">注只能上传格式为Excel、Word、压缩包文件</span></td>'
                fileHtml += '</tr>'
                fileHtml += '<tr>'
                fileHtml += '<td  class="th_bg">报价注意事项</td>'
                fileHtml += '<td colspan="3" style="text-align: left;">'
                fileHtml += '<textarea name="offerAttention" id="offerAttention" style="width: 100%;height: 70px;" class="form-control" maxlength="1000"></textarea>'
                fileHtml += '</td>'
                fileHtml += '</tr>'
            }else if(options.status==2||options.status==3||options.status==4){               
                fileHtml += '<tr>'
                if(options.status==2){
                    fileHtml += '<td class="th_bg">是否需要提供分项报价表</td>'
                    fileHtml += '<td style="text-align: left;'+ ((options.status==3||options.status==4)?'width: 32%;':'width: 320px;') +'"'+ (options.isShow!=1?'':'colspan="3"') +'>'
                    fileHtml += '<span id="isOfferDetailedItem" style="margin-right:30px"></span>'                   
                    fileHtml += '</td>' 
                }
                if(options.isShow!=1){
                    fileHtml += '<td class="th_bg">分项报价表模版</td>'
                    fileHtml += '<td style="text-align: left;'+ ((options.status==3||options.status==4)?'width: 32%;':'width: 320px;') +'" >'
                    fileHtml += '<a href="javascript:;" id="downFile" class="filena"></a>'
                    fileHtml += '</td>'   
                }
                if(options.status==3&&options.isShow!=1){
                    fileHtml += '<td class="th_bg">分项报价表</td>'
                    fileHtml += '<td style="text-align: left;width: 32%;" "'+ (options.isShow!=1?'':'colspan="3"') +'">'
                    fileHtml += '<div style="height: 34px;line-height: 34px" class="fileBlock">'
                    fileHtml += '<input type="file" class="fileloading" name="files" id="saveFile" value="选择" accept=".xlsx,.XLSX,.xls,.XLS,.doc,.DOC,.docx,.DOCX,.zip,.ZIP,.rar,.RAR,.PDF,.pdf">' 
                    fileHtml += '</div>'
                    fileHtml += '<input type="hidden" name="offerFileList[0].projectId"/>'
                    fileHtml += '<input type="hidden" name="offerFileList[0].packageId"/>'
                    fileHtml += '<input type="hidden" name="offerFileList[0].packageCheckListId"/>'
                    fileHtml += '<input type="hidden" name="offerFileList[0].examType" value="1"/>'
                    fileHtml += '<input type="hidden" name="offerFileList[0].fileName"/>'
                    fileHtml += '<input type="hidden" name="offerFileList[0].filePath"/>'
                    fileHtml += '<input type="hidden" name="offerFileList[0].fileSize"/>'                             
                    fileHtml += '<input type="hidden" name="offerFileList[0].subDate"/>'
                    fileHtml += '<input type="hidden" class="fileState" name="offerFileList[0].fileState"/>'           
                    fileHtml += '</td>' 
                } 
                if(options.status==4&&options.isShow!=1){
                    fileHtml += '<td class="th_bg">分项报价表</td>'
                    fileHtml += '<td style="text-align: left;width: 32%;" "'+ (options.isShow!=1?'':'colspan="3"') +'">'
                    fileHtml += '<a href="javascript:;" id="downFileLL" class="filenaLL"></a>'                   
                    fileHtml += '</td>' 
                }          
                fileHtml += '</tr>'
                fileHtml += '<tr>'
                fileHtml += '<td  class="th_bg">报价注意事项</td>'
                fileHtml += '<td colspan="3" style="text-align: left;white-space:normal;word-break:break-all;">'
                fileHtml += '<div id="offerAttention"></div>'
                fileHtml += '</td>'
                fileHtml += '</tr>'
            }
            $(options.flieName).html(fileHtml);
            if(options.status==3||options.status==4){
                for(var i=0;i<options.offerData.length;i++){
                    if(options.offerData[i].packageCheckListId==0){
                        if(options.status==3){
                            var list=[];
                            list.push(options.offerData[i])
                            var html = _that.fileHtmldetle(list);
                            if($("#saveFile").closest("td").find(".fileContent").length > 0){
                                $("#saveFile").closest("td").find(".fileContent").remove();
                            }
                            $("#saveFile").closest("td").append(html);
                            $("#saveFile").closest("td").find(".fileBlock").hide();
                            _that.detelDefut();
                            $('input[name="offerFileList[0].projectId"]').val(options.offerData[i].projectId);
                            $('input[name="offerFileList[0].packageId"]').val(options.offerData[i].packageId);
                            $('input[name="offerFileList[0].packageCheckListId"]').val(0);
                            $('input[name="offerFileList[0].fileName"]').val(options.offerData[i].fileName);
                            $('input[name="offerFileList[0].filePath"]').val(options.offerData[i].filePath);
                            $('input[name="offerFileList[0].fileSize"]').val(options.offerData[i].fileSize);
                            $('input[name="offerFileList[0].subDate"]').val(options.offerData[i].subDate);
                        }else{
                            $(".filenaLL").html(options.offerData[i].fileName);
                        }
                        
                    }
                }
            }
            $("input[name='isOfferDetailedItem'][value='"+ options.isShow +"']").prop("checked",true);  
            if(options.status != 1){
            	$("#isOfferDetailedItem").html(options.isShow == 1 ? "不需要":"需要");
            	$("#offerAttention").html(options.offerAttention);
            } else {
            	if($('input[name="isOfferDetailedItem"]:checked').val()==1){                  
                    $(".fxFile").hide();                  
                }else{
                    $(".fxFile").show();    
                }
            	$("#offerAttention").val(options.offerAttention);
            }
            $('input[name=isOfferDetailedItem]').on("click", function () {
                if($('input[name="isOfferDetailedItem"]:checked').val()==1){                  
                    $(".fxFile").hide();                  
                }else{
                    $(".fxFile").show();    
                }                   
            })
            $("#" + options.tableName).bootstrapTable("load", options.filesDataDetail);
            if (options.status == 1||options.status == 3) {
                $("#saveFile").fileinput(options.fileinput).on("filebatchselected", function (event, files) {
                    if (event.currentTarget.files.length > 1) {
                        parent.layer.alert('单次上传文件数只能为1个');
                        $(this).fileinput("reset"); //选择的格式错误 插件重置
                        return;
                    }
                    if (event.currentTarget.files[0].size > 2 * 1024 * 1024 * 1024 * 1024) {
                        parent.layer.alert('上传的文件不能大于2G');
                        $(this).fileinput("reset"); //选择的格式错误 插件重置
                        return;
                    };
                    var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
                    if( filesnames != 'ZIP'&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS'&& filesnames != 'pdf'&& filesnames != 'PDF') {
                        parent.layer.alert('只能上传Excel、Word和压缩包文件');
                        $(this).fileinput("reset"); //选择的格式错误 插件重置
                        return;
                    };
                    $(this).fileinput("upload");
                }).on("filebatchuploadsuccess", function (event, data, previewId, index) {
                    if (data.response.success) {
                        if(options.status == 1){
                            options.filesDataDetail.push(
                                {
                                    fileName: data.files[0].name,
                                    fileSize: data.files[0].size / 1000 + "KB",
                                    filePath: data.response.data[0],
    
                                }
                            )
                            var fhtml =_that.fileHtmldetle(options.filesDataDetail);
                            
                        }else if(options.status == 3){                          
                            var offerData=new Array();                       
                            offerData.push({
                                'packageCheckListId':0,
                                'fileName':data.files[0].name,
                                'fileSize':data.files[0].size / 1000 + "KB",
                                'filePath':data.response.data[0],
                                'subDate':top.$("#systemTime").html()+' '+top.$("#sysTime").html(),
                            })                          
                            $('input[name="offerFileList[0].projectId"]').val(options.parameter.projectId);
                            $('input[name="offerFileList[0].packageId"]').val(options.parameter.packageId);
                            $('input[name="offerFileList[0].packageCheckListId"]').val(0);
                            $('input[name="offerFileList[0].fileName"]').val(data.files[0].name);
                            $('input[name="offerFileList[0].filePath"]').val(data.response.data[0]);
                            $('input[name="offerFileList[0].fileSize"]').val(data.files[0].size / 1000 + "KB");
                            $('input[name="offerFileList[0].subDate"]').val(top.$("#systemTime").html()+' '+top.$("#sysTime").html());
                            var fhtml =_that.fileHtmldetle(offerData);
                        } 
                        $(fhtml).appendTo($("#saveFile").closest("td"));
                        $("#saveFile").closest("td").find(".fileBlock").hide();  
                        _that.detelDefut();
                    }                                                           
                }).on('filebatchuploaderror', function (event, data, msg) {
                    parent.layer.msg("失败");
                });                  
            }


        },
        //查看附件表
        viewAjax: function () {
            var that = this;
            $.ajax({
                type: "post",
                url: that.options.fileListUrl,
                async: false,
                data: that.options.parameter,
                dataType: "json",
                success: function (response) {
                    if (response.success) {
                        if (response.data) {
                            that.options.filesDataDetail = response.data;
                        }

                    }
                }
            });
            if (that.options.filesDataDetail && that.options.filesDataDetail.length > 0) {
                if(that.options.status==1||that.options.status==2){
                    var html = that.fileHtmldetle(that.options.filesDataDetail);
                    if($("#saveFile").closest("td").find(".fileContent").length > 0){
                        $("#saveFile").closest("td").find(".fileContent").remove();
                    }
                    $("#saveFile").closest("td").append(html);
                    $("#saveFile").closest("td").find(".fileBlock").hide();
                }
                $(".filena").html(that.options.filesDataDetail[0].fileName)
                that.detelDefut();
            } else {
            	if(that.options.status==1||that.options.status==2){
            		$("#saveFile").closest("td").find(".fileBlock").show();
            		$("#saveFile").closest("td").find(".fileContent").remove();
            	}
            }
        },
        detelDefut:function(){
            var that = this;
            $("#delFile").on('click',function(){
                var id = $("#delFile").attr("data-id");
                id = "";
                that.fileDetel(id, 0)
            })
            $("#downFile").on('click',function(){
                
                var fileName = that.options.filesDataDetail[0].fileName;
                var filePath= that.options.filesDataDetail[0].filePath;
                $(this).attr('href',$.parserUrlForToken(that.options.downloadUrl+'?ftpPath='+filePath+'&fname='+fileName.replace(/\s+/g,"")));
            })
            $("#downFileLL").on('click',function(){
                if(that.options.status == 3){
                    var fileName = $('input[name="offerFileList[0].fileName"]').val();
                    var filePath= $('input[name="offerFileList[0].filePath"]').val();
                }else if(that.options.status == 4){
                    for(var i=0;i<that.options.offerData.length;i++){
                        if(that.options.offerData[i].packageCheckListId==0){
                            var fileName = that.options.offerData[i].fileName;
                            var filePath= that.options.offerData[i].filePath;
                        }
                    }
                }
                $(this).attr('href',$.parserUrlForToken(that.options.downloadUrl+'?ftpPath='+filePath+'&fname='+fileName.replace(/\s+/g,"")));
            })
            
        },
        //删除附件
        fileDetel: function (fileId, _index) {
            var that = this;
            var pare = that.options.parameter;
            parent.layer.confirm('温馨提示：您确定要删除该附件吗？', {
                btn: ['是', '否'] //可以无限个按钮
            }, function (index, layero) {
                if (fileId && fileId.length == 32&&that.options.status==1) {//从数据库中删除
                    $.ajax({
                        type: "post",
                        url: that.options.fileDelUrl,
                        async: false,
                        data: { 'packageId': pare.packageId },
                        dataType: "json",
                        success: function (response) {
                            if (response.success) {
                                that.viewAjax();
                            }
                        }
                    });
                } else {//从数组中删除
                    if(that.options.status==1){
                        that.options.filesDataDetail.splice(_index, 1);
                        $("#delFile").closest("td").find(".fileBlock").show();
                        $("#delFile").closest(".fileContent").remove();  
                    }else{
                        if(that.options.status==1){
                            that.options.filesDataDetail.splice(_index, 1);
                            $("#delFile").closest("td").find(".fileBlock").show();
                            $("#delFile").closest(".fileContent").remove();  
                        }else{
                            if(that.options.status == 3){
                                for(var i=0;i<that.options.offerData.length;i++){
                                    if(that.options.offerData[i].packageCheckListId==0){
                                        that.options.offerData.splice(i, 1);                                 
                                    }
                                } 
                            } 
                            $('input[name="offerFileList[0].projectId"]').val("");
                            $('input[name="offerFileList[0].packageId"]').val("");
                            $('input[name="offerFileList[0].packageCheckListId"]').val("");
                            $('input[name="offerFileList[0].fileName"]').val("");
                            $('input[name="offerFileList[0].filePath"]').val("");
                            $('input[name="offerFileList[0].fileSize"]').val("");
                            $('input[name="offerFileList[0].subDate"]').val("");
                            $("#delFile").closest("td").find(".fileBlock").show();
                            $("#delFile").closest(".fileContent").remove();   
                        }   
                    }                    
                }
                parent.layer.close(index);
            }, function (index) {
                parent.layer.close(index)
            });
        },
        fileHtmldetle:function(file){
            var that = this;
            var html = '<div class="fileContent">'
            html +='<span class="fileName" style="padding-right:10px;">'+(file[0] ? file[0].fileName : "")+'</span>'
            if(that.options.status==1){
                html +='<a href="javascript:;" class="btn btn-danger btn-sm" id="delFile" data-id="'+(file[0]?file[0].id:"")+'">删除</a>'
                html +='<a href="javascript:;" class="btn btn-primary btn-sm" id="downFile">下载</a>';  
            }else{
                html +='<a href="javascript:;" class="btn btn-danger btn-sm" id="delFile" data-id="'+(file[0]?file[0].packageCheckListId:"")+'">删除</a>' 
                html +='<a href="javascript:;" class="btn btn-primary btn-sm" id="downFileLL">下载</a>';  
            }
                
            html += '</div>';
            return html;
            
        },
        // 整个提交
        offerSubmit: function () {
            var that = this;
            $(that.options.offerSubmit).on("click", function () {
                if($('input[name="isOfferDetailedItem"]:checked').val()==1){
                    return
                }
                var pare = that.options.parameter;
                var file = that.options.filesDataDetail
                if(file.length>0){
                    pare.fileName = file[0].fileName;
                    pare.fileSize = file[0].fileSize;
                    pare.filePath = file[0].filePath;
                }else{
                    return
                }
             
                $.ajax({
                    type: "post",
                    url: that.options.fileAddUrl,
                    data: pare,
                    async:false,
                    dataType: "json",
                    success: function (response) {
                        if (response.success) {

                        }
                    }
                });
            })
        },
    };
    $.fn.fileList = function (options) {
        options = $.extend(defaults, options || {});

        return new FileList($(this), options);
    }

})(jQuery, window, document);