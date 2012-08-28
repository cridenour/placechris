$(function() { 


	$('img').hover(function(e){
		var offset = $(this).offset();
		var width = this.clientWidth
		,  height = this.clientHeight;
		
		$('.overlay').css({'top': offset.top, 'left': offset.left, 'width': width, 'height': height}).html('<p>' + width + 'x' + height + '</p>').show()

	},
	function(e) {
		$('.overlay').hide()
	}
	);

	//$('body').on('mouseleave', '.overlay', function(e) { $('.overlay').remove() });

});