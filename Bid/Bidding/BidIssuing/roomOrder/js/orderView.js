
var calendarUrl = config.tenderHost + '/BiddingRoomAppointmentController/findRoomListByDateMonth.do';//日历列表信息
var detailUrl = 'Bidding/BidIssuing/roomOrderView/model/dayOrderList.html';//详情
var startdata = '';
$(function(){
	

    
    /*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
})
function getTime(data){
	if(data.start){
		startdata = data.start.split(' ')[0];
	}else{
		startdata = top.$("#systemTime").html()
	}
	var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      	plugins: [ 'dayGrid' ],
      	title:'2019年7月',
      	header: 
      	{
			left: '',
			center: 'title',
			right: 'today prev,next'
		},
		weekMode:'liquid',
		titleFormat:{
			year: 'numeric',
			month: '2-digit', // September 2013
		},
      	locale:'zh-cn',
      	editable: true,
      	defaultDate: startdata,
      	eventLimit: true, // allow "more" link when too many events
      	buttonText:{
			prev: '上一月', // ‹
			next: '下一月', // ›
			prevYear: '«', // «
			nextYear: '»', // »
			today: '今天',
			month: 'month',
			week: 'week',
			day: 'day'
		},
		aspectRatio:1.5,
		events: function(start,callback){
			var calendarList = [];
            $.ajax({
            	type:"post",
            	url:calendarUrl,
            	async:false,
            	data: {
            		'startDate': start.start.Format("yyyy-M-d")
            	},
            	success: function(data){
            		var events = [];
					$.each(data.data,function(key,value) {
                        events.push({
//                      	id: value.Start.split(' ')[0],
                            title: '预约标室：'+value.Been + '\n空闲标室：' + value.Free + '\n【详情】',
                            start: value.Start.split(' ')[0] , // will be parsed
                            textColor: '#228fda',
                            allDay:true,
                            borderColor: '#FFFFFF',
                            backgroundColor:'#FFFFFF'
                        });
                    });
                	callback(events);
            	}
            });
        },
        eventClick: function( event, jsEvent, view ) {
        	parent.layer.open({
				type: 2,
				title: '会议室预约情况',
				area: ['90%' , '80%'],
				resize: false,
				content: detailUrl,
				success:function(layero, index){
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.passMessage(event.event);  //调用子窗口方法，传参
				}
			});
        }
    });
	calendar.render();
//	console.log(data)
}
