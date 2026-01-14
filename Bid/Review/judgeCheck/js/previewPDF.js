/* pdf 大文件分片预览 */

function pdfjs_Extend(dom, obj){
	$('#' + dom + ' .the-canvas').attr('id', dom + '_canvas')
	var _canvas = document.getElementById(dom + '_canvas');
	var _ctx = _canvas.getContext('2d');
	var default_obj = {
		pdfDoc: null,
		pageNum: 1,
		pageRendering: false,
		pageNumPending: null,
		scale: 1.5,
		canvas: _canvas,
		ctx: _ctx,
		rotate: 0
	};
	this.dom = dom;  //当前要追加的对象
	this.new_obj = $.extend({},default_obj,obj);
	// this.init();
	this.init = function(){
		var _this = this;
		
		PDFJS.getDocument({url:_this.new_obj.url,rangeChunkSize:64*1024,disableAutoFetch:true,endPage: 10}).then(function(pdfDoc_) {
			_this.new_obj.pdfDoc = pdfDoc_;
			// _this.dom.find('.page_count').text(_this.new_obj.pdfDoc.numPages)
			$('#' + _this.dom + ' .page_count').text(_this.new_obj.pdfDoc.numPages)
			// document.getElementById('page_count').textContent = pdfDoc.numPages;
		
			// Initial/first page rendering
			_this.renderPage(Number( _this.new_obj.pageNum));
		});
		
		//上一页
		$('#' + _this.dom).on('click','.prev',function(){
			_this.onPrevPage()
		});
		//下一页
		$('#' + _this.dom).on('click','.next',function(){
			_this.onNextPage()
		})
		//放大
		$('#' + _this.dom).on('click','.enlarge', function(){
			_this.new_obj.scale += 0.1;
			_this.queueRenderPage(_this.new_obj.pageNum);
		});
		
		//缩小
		$('#' + _this.dom).on('click','.letting', function(){
			_this.new_obj.scale -= 0.1;
			_this.queueRenderPage(_this.new_obj.pageNum);
		});
		//旋转
		$('#' + _this.dom).on('click','.pdf_rotate', function(){
			_this.new_obj.rotate += 90;
			_this.queueRenderPage(_this.new_obj.pageNum);
		});
	};
	this.init();
}
pdfjs_Extend.prototype = {
	//初始化方法
	renderPage: function (num) { 
		var _this = this;
		_this.new_obj.pageRendering = true;
		// Using promise to fetch the page
		_this.new_obj.pdfDoc.getPage(num).then(function (page) {
			var viewport = page.getViewport(_this.new_obj.scale, _this.new_obj.rotate);
			_this.new_obj.canvas.height = viewport.height;
			_this.new_obj.canvas.width = viewport.width;
	
			// Render PDF page into canvas context
			var renderContext = {
				canvasContext: _this.new_obj.ctx,
				viewport: viewport
			};
			var renderTask = page.render(renderContext);
	
			// Wait for rendering to finish
			renderTask.promise.then(function () {
				_this.new_obj.pageRendering = false;
				if (_this.new_obj.pageNumPending !== null) {
					// New page rendering is pending
					renderPage(_this.new_obj.pageNumPending);
					_this.new_obj.pageNumPending = null;
				}
			});
		});
		// Update page counters
		// this.dom.find('.page_num').val(num)
		$('#' + this.dom + ' .page_num').val(num)
		// document.getElementById('page_num').textContent = num;
	},
	queueRenderPage: function (num) {
		var _this = this;
		if (_this.new_obj.pageRendering) {
			_this.new_obj.pageNumPending = num;
		} else {
			_this.renderPage(num);
		}
	},
	//上一页
	onPrevPage: function () {
		var _this = this;
		if (_this.new_obj.pageNum <= 1) {
			return;
		}
		_this.new_obj.pageNum--;
		_this.queueRenderPage(_this.new_obj.pageNum);
	},
	//下一页
	onNextPage: function () {
		var _this = this;
		if (_this.new_obj.pageNum >= _this.new_obj.pdfDoc.numPages) {
			return;
		}
		_this.new_obj.pageNum++;
		_this.queueRenderPage(_this.new_obj.pageNum);
	}
}