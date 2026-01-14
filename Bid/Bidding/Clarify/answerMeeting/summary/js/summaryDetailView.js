


var listUrl = config.tenderHost + '/ClarifyController/getClarifyListByBidId.do';//查询澄清记录
var fileDownloadUrl = config.FileHost + "/FileController/download.do";	//下载文件
var timeUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do';//查询标段相关时间

var detailUrl = config.tenderHost + '/AnswerMeetingNoticeController/getAanswerSummaryByBidId.do';//编辑时获取详情接口
var deleteUrl = config.tenderHost + '/AnswerMeetingNoticeController/deleteAanswerSummaryById.do';//编辑时获取详情接口

var clarifyHtml = 'Bidding/Clarify/manager/model/clarifyEdit.html';//澄清页面

var editHtml = 'Bidding/Clarify/answerMeeting/summary/model/summaryEdit.html';//编辑页面
var detailData; // 页面接收的数据

var summaryList = [];//澄清数据列表
var bidData = '';//标段相关数据
var bidSectionData = '';//标段相关数据
var bidId = '';//标段id
var timeState = '';//时间状态 当前时间小于答复截止时间 为1 大于答复截止时间 为0
var nowTime = '';//当前时间
var examType = '';//标段当前处于预审还是后审阶段
var onEdit = true; // 是否为修改类型


$(function () {
    /*关闭*/
    $('#btnClose').click(function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    });
    //添加澄清
    $('#addAsk').click(function () {
        bidSectionData.bidSectionId = bidId;
        // openClarify(bidSectionData, 'add')
        openEdit(bidSectionData, true);
    })
    //编辑
    $('#summaryList').on('click', '.btnEdit', function () {
        var index = $(this).attr('data-index');
        var listData = summaryList[index];
        for (var key in bidData) {
            listData[key] = bidData[key]
        }
        // openClarify(listData, 'edit')
        openEdit(listData, false);
    })
    //删除
    $('#summaryList').on('click', '.btndel', function () {
        var index = $(this).attr('data-index');
        var listData = summaryList[index];
        parent.layer.confirm('确定删除?', { icon: 3, title: '询问' }, function (ind) {
            parent.layer.close(ind);
            getDelete(listData.id);
        })

        //		openClarify(passData)
    })
    //文件下载
    $('#summaryList').on('click', '.btnDownload', function () {
        var ftpPath = $(this).attr('data-url');
        var fileName = $(this).attr('data-fname');
        fileName = fileName.substring(0, fileName.lastIndexOf("."));
        $(this).attr('href', $.parserUrlForToken(fileDownloadUrl + '?ftpPath=' + ftpPath + '&fname=' + fileName))
    })
    //文件下载
    $('#summaryHistoryList').on('click', '.btnDownload', function () {
        var ftpPath = $(this).attr('data-url');
        var fileName = $(this).attr('data-fname');
        fileName = fileName.substring(0, fileName.lastIndexOf("."));
        $(this).attr('href', $.parserUrlForToken(fileDownloadUrl + '?ftpPath=' + ftpPath + '&fname=' + fileName))
    })
})
// //新增澄清
// function openClarify(data, type) {
//     parent.layer.open({
//         type: 2,
//         title: '编辑澄清',
//         area: ['1000px', '600px'],
//         content: clarifyHtml,
//         resize: false,
//         success: function (layero, index) {
//             var iframeWin = layero.find('iframe')[0].contentWindow;
//             //调用子窗口方法，传参
//             iframeWin.passMessage(data, type, fromChild);
//         }
//     });
// };

/*编辑
 * state true:新增  false:编辑 
 */
function openEdit(data, state) {
    var title = '';
    if (state) {
        title = '新增答疑会纪要'
    } else {
        title = '编辑答疑会纪要'
    }

    parent.layer.open({
        type: 2,
        title: title,
        area: ['80%', '90%'],
        content: editHtml,
        resize: false,
        success: function (layero, index) {
            var iframeWin = layero.find('iframe')[0].contentWindow;
            // 调用子窗口方法，传参
            // if (!state) {
            iframeWin.passMessage(data, refreshFather);
            // } else {

            // }
        }
    });
};

function fromChild(id, bid) {
    getList(bid, examType)
}
function passMessage(data, flag) {
    detailData = data;
    bidData = JSON.parse(JSON.stringify(data));
    bidSectionData = JSON.parse(JSON.stringify(data));

    for (var key in data) {
        $('#' + key).html(data[key]);
        $('#' + key).val(data[key]);
    }
    //菜单列表中过来的有标段id（bidSectionId） 控制台过来的标段id为（id）
    if (data.getForm && data.getForm == 'KZT') {
        bidId = data.id;
        examType = data.examType;
        bidSectionData.bidSectionId = bidSectionData.id;
		flag = false;
    } else {
        bidId = data.bidSectionId;
        examType = data.bidStage;
    }
	// 判断传入的flag数值 true 为查看 false 为编辑
	if (flag) {
	    onEdit = false;
	    $('.hideOnView').hide();
	} else {
	    $('.hideOnEdit').hide();
	}
    if (bidSectionData.id) {
        delete bidSectionData.id
    }
    if (bidData.id) {
        delete bidData.id
    }
    console.log(data);
    // getTime(bidId, examType)
    // getList(bidId, examType);
    getDetail(bidId);
};



//修改时获取详情
function getDetail(id) {
    $.ajax({
        type: "post",
        url: detailUrl,
        async: true,
        data: {
            'bidSectionId': id
        },
        success: function (data) {
            console.log(data);
            if (data.success) {
                if (data.data) {
                    listHtml(data.data, onEdit);
                    summaryList = data.data;
                }
            } else {
                top.layer.alert(data.message)
            }
        }
    });
};

//获取查询提出问题
// function getList(id, bidStage) {
//     $.ajax({
//         type: "post",
//         url: listUrl,
//         async: false,
//         data: {
//             'bidSectionId': id,
//             'examType': bidStage
//         },
//         success: function (data) {
//             if (data.success) {
//                 if (data.data) {
//                     listHtml(data.data);
//                     summaryList = data.data;
//                 }
//             } else {
//                 top.layer.alert(data.message)
//             }
//         }
//     });
// };
//查询提出问题列表
function listHtml(data) {
    var html = '';
    $('#summaryList').html('');
    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var viewHtml = '';
            var btn = '';
            var fileHtml = '';
            var createTime = '';//发送时间
            var clarifyType = '';
            if (data[i].noticeState == 0) {
                // if (timeState == 1) {
                btn = '<div style="position: absolute;right:0;top:0;"><button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + i + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>'
                    + '<button  type="button" class="btn btn-danger btn-sm btndel" data-index="' + i + '"><span class="glyphicon glyphicon-remove"></span>删除</button></div>';
                // }
                createTime = '<span style="color:red;">未发送</span>';
            } else {
                var time = data[i].createTime.split(':').splice(0, 2).join(':');
                createTime = '<span> 上传时间 : ' + time + '</span>';
            }
            // if (data[i].clarifyType == 1) {
            //     clarifyType = '资格预审文件 '
            // } else if (data[i].clarifyType == 4) {
            //     clarifyType = '招标文件 '
            // }
            if (data[i].projectAttachmentFiles) {
                var fileData = data[i].projectAttachmentFiles;
                fileHtml = '<div><label style="font-weight: 600;">会议纪要附件：</label>'
                for (var j = 0; j < fileData.length; j++) {
                    fileHtml += '<a target="_blank" data-url="' + fileData[j].url + '" data-fname="' + fileData[j].attachmentFileName + '" class=" btnDownload" style="margin-right:50px;cursor:pointer;text-decoration:none">' + fileData[j].attachmentFileName + '</a>'
                }
                fileHtml += '</div>';
                //			fileHtml = '<table class="table table-bordered ">'
                //      		+'<tr>'
                //      			+'<th style="width: 50px;text-align: center;">序号</th>'
                //      			+'<th>文件名称</th>'
                //      			+'<th>文件大小</th>'
                //      			+'<th>创建人</th>'
                //      			+'<th style="width: 150px;text-align: center;">创建时间</th>'
                //      			+'<th style="width: 80px;text-align: center;">操作</th>'
                //      		+'</tr>';
                //      	for(var j = 0;j<fileData.length;j++){
                //      		fileHtml += '<tr>'
                //      			+'<td style="width: 50px;text-align: center;">'+(j+1)+'</td>'
                //      			+'<td>'+fileData[j].attachmentFileName+'</td>'
                //      			+'<td>'+changeUnit(fileData[j].attachmentSize)+'</td>'
                //      			+'<td>'+fileData[j].createEmployeeName+'</td>'
                //      			+'<td style="width: 150px;text-align: center;">'+fileData[j].createDate+'</td>'
                //      			+'<td><a target="_blank" data-url="'+fileData[j].url+'" data-fname="'+fileData[j].attachmentFileName+'" class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a></td>'
                //      		+'</tr>'
                //      	}
                //      	fileHtml += '</table>'
            }
            viewHtml += '<div style="margin: 20px;padding: 20px;border: 2px solid #ecebeb;box-shadow: 0 5px 10px #ecebeb;">'
                + '<div style="margin: 10px 0;position: relative;">'
                + '<span style="padding: 5px 10px;margin-right:20px;background: orange;color: #ffffff;border-radius: 4px;font-weight: 600;">会议纪要' + (data.length - i) + '</span>' + createTime + btn
                + '</div>'
                + '<div><label style="font-weight: 600;">答疑会通知名称：</label><span>' + (data[i].noticeName || '') + '</span></div>'
                + '<div>'
                + '<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">联系人：</label><span>' + (data[i].linkMen || '') + '</span></div>'
                + '<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">联系人电话：</label > <span>' + (data[i].linkTel || '') + '</span></div>'
                + '</div>'
                + '<div>'
                + '<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">组织形式：</label><span>' + (data[i].organizationForm == 0 ? '线上组织' : '线下组织') + '</span></div>'
                + '<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">答疑会地点：</label><span>' + (data[i].address || '') + '</span></div>'
                + '</div>'
                + '<div>'
                + '<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">会议开始时间：</label><span>' + (data[i].noticeStartTime || '') + '</span></div>'
                + '<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">会议结束时间：</label><span>' + (data[i].noticeEndTime || '') + '</span></div>'
                + '</div>'
                // + '<div><label style="font-weight: 600;">澄清类型：</label><span>' + clarifyType + '</span><label style="font-weight: 600;margin-left:50px;">澄清标题：</label><span>' + (data[i].clarifyTitle ? data[i].clarifyTitle : '') + '</span></div>'
                // + '<div style="margin-bottom:5px;"><label style="font-weight: 600;margin-bottom:0px;">澄清内容：</label><span>' + (data[i].clarifyContent ? data[i].clarifyContent : '') + '</span></div>'
                //      	+'<div style="padding:5px 10px 10px 10px">'+data[i].clarifyContent+'</div>'
                + '<div>' + fileHtml + '</div>'
                // + '<div><label style="font-weight: 600;">发送时间：</label><span>' + createTime + '</span></div>'
                + '</div>'
            html += viewHtml;
        }
        $(html).appendTo('#summaryList');
    }
}
function changeUnit(size) {
    var num = Number(size);
    if (num >= 1024 * 1024 * 1024) {
        return (num / 1024 / 1024 / 1024).toFixed(2) + "G";
    } else if (num >= 1024 * 1024 && num < 1024 * 1024 * 1024) {
        return (num / 1024 / 1024).toFixed(2) + "M";
    } else if (num >= 1024 && num < 1024 * 1024) {
        return (num / 1024).toFixed(2) + "KB";
    } else {
        return num + "B";
    }
};
//删除
function getDelete(id) {
    $.ajax({
        type: "post",
        url: deleteUrl,
        async: true,
        data: {
            'id': id
        },
        success: function (data) {
            if (data.success) {
                parent.layer.alert('删除成功！', { icon: 6, title: '提示' });
                getDetail(bidId);
                parent.$('#tableList').bootstrapTable('refresh');
            } else {
                parent.layer.alert(data.message)
            }
        }
    });
}
/**********************    获取时间相关信息           **********************/
/* function getTime(id, type) {
    $.ajax({
        type: "post",
        url: timeUrl,
        async: false,
        data: {
            'bidSectionId': id,
            'examType': type
        },
        success: function (data) {
            if (data.success) {
                //获取当前时间
                nowTime = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g, "/")));
                var endTime = Date.parse(new Date(data.data.answersEndDate.replace(/\-/g, "/")))
                for (var key in data.data) {
                    $('#' + key).html(data.data[key])
                }
                timeState = data.data.clarifyTimeState;
                if (timeState != 'undefined' && timeState == 0) {
                    $('#addAsk').css('display', 'none')
                }
                bidData.answersEndDate = data.data.answersEndDate;
                bidSectionData.answersEndDate = data.data.answersEndDate;
            } else {
                top.layer.alert(data.message)
            }
        }
    });
} */
function refreshFather() {
    // $('#tableList').bootstrapTable('refresh');
    window.location.reload();
}