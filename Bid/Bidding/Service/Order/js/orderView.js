
var calendarUrl = config.tenderHost + '/BiddingRoomAppointmentController/findRoomListByDateMonth.do';//日历列表信息
var detailUrl = 'Bidding/BidIssuing/roomOrderView/model/dayOrderList.html';//详情

$(function(){
	var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
      	plugins: [ 'dayGrid' ],     	
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
      	eventLimit: true, // allow "more" link when too many events
      	buttonText:{
			prev: '上一月', // ‹
			next: '下一月', // ›
			prevYear: '«', // «
			nextYear: '»', // »
			today: '今天',
			month: '月',
			week: '周',
			day: '日'
		},
		/*monthNames: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
		monthNamesShort: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
		dayNames:['星期日', '星期一', '星期二', '星期三','星期四', '星期五', '星期六'],
		dayNamesShort:['星期日', '星期一', '星期二', '星期三','星期四', '星期五', '星期六'],*/
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
        	layer.open({
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
        },
        changeView:function(){ console.log("$$$$$$$$$$")
        	var dateTit = $(".fc-center h2").text();
    		$(".fc-center h2").text(dateTit.replace("月月", "月"));
        }
    });

    calendar.render();
    
   /* var dateTit = $(".fc-center h2").text();
    $(".fc-center h2").text(dateTit.replace("月月", "月"));*/
    
})
function getTime(data){
	console.log(data)
}
