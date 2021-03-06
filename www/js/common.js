var kdn_login_url  = "http://220.126.231.124:28180/mLoginProc";
var kdn_dept_url   = "http://220.126.231.124:28180/common/getDeptTreeData";
var kdn_upload_url = "http://220.126.231.124:28180/image/fileUpload";
var kdn_get_img_url = "http://220.126.231.124:28180/mobileImageListAjax";
/* for public jquery */
$(function(){
	// layer popup - open
	window.openLayer = function(el){
		var h = 0;
		var w = 0;
		var scArea = $('.wrapPop .cnt .scrollArea');
		$(el).show();
		h = $(el).find('.popCnt').outerHeight();
		w = $(el).find('.popCnt').outerWidth();
		$(el).find('.popCnt').css({'margin-top':-(h/2), 'margin-left':-(w/2)});
		if($(el).find('.scrollArea').length > 0){ // has scrollArea
			scArea.scrollTop(0);
		}		
	}
	// layer popup - close
	window.closeLayer = function(el){
		$(el).hide();
	}
	// layer popup - close
	var btnClosePop = $('.wrapPop .btnClose');
	btnClosePop.on('click', function(){
		var el = $(this).parents('.wrapPop');
		closeLayer(el);
		return false;
	});
	// date picker
	if($('.datePic').length > 0){
		$('.datePic').datepicker({
			dateFormat:"yy.mm.dd",
			showOn:"button",
			buttonImageOnly:true,
			buttonImage:"/resources/images/btn_cal.png"
		});
	}
	// footer 위치값 하단 조정
	$(window).on('load resize', function(){
		var wrapH = $('[class*="wrap"]').outerHeight();
		var winH = $(window).outerHeight();
		if(wrapH < winH){
			var footerH = $('.footer').outerHeight();
			$('.footer').addClass('fixed');
			$('.wrap').css('padding-bottom', footerH);
		} else {
			$('.footer').removeClass('fixed');
			$('.wrap').css('padding-bottom', 0);
		}
	});
});
/**
 * Cordova nofication.alert에서 호출 되는 빈 메소드
 */
function alertDismissed() {
	// do nothing...
}
/**
 * 공통 Alert 함수
 */
function commonAlert(title, msg)
{
	navigator.notification.alert(
		msg, 
		alertDismissed, 
		title, 
		'OK'
	);
}
document.addEventListener("checkConnection", checkConnection, false);

function onDeviceReady(){
	console.log("deviceready called....");
}
function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

	if (networkState == Connection.UNKNOWN || networkState == Connection.NONE)
	{
		alert("네트워크가 연결되지 않았습니다!!!");
	}else {
		location.href="NKS012.html";
	}
    //alert('Connection type: ' + states[networkState]);
}

/**
 * 공통으로 사용될 데이터베이스 쿼리문
 * 데이터베이스 처리 후 파일도 삭제한다.
 */
function DeleteProcessDB(myDB, executeQuery, fileURL, deleteFileName)
{
	var executeQuery = "DELETE FROM tb_files where filename = ?";
	myDB.executeSql(executeQuery, fileURL, function(result) {
		console.log("데이터베이스 삭제 성공!");
		var fileName = deleteFileName.substring(deleteFileName.lastIndexOf('/')+1);
		var ext = fileName.substring(deleteFileName.lastIndexOf('.')+1);
		var folder = deleteFileName.substring(0, deleteFileName.lastIndexOf('/'));
		console.log(fileName);
		console.log(folder);
		window.resolveLocalFileSystemURL(folder, function(entry) {
			entry.getFile (fileName, {create:false}, function(fileEntry) {
				fileEntry.remove(function(){
					console.log(deleteFileName + " File removed!");
					return 1;
				}, function(error){
					return 0;
				}, function(){
					return 0;
				});
			});
		});
	},
	function(error){
		return 0;
	});
}

Date.prototype.YYYYMMDDHHMMSS = function () {
	var yyyy = this.getFullYear().toString();
	var MM = pad(this.getMonth() + 1,2);
	var dd = pad(this.getDate(), 2);
	var hh = pad(this.getHours(), 2);
	var mm = pad(this.getMinutes(), 2)
	var ss = pad(this.getSeconds(), 2)

	return yyyy + MM + dd+  hh + mm + ss;
};
Date.prototype.getFormatDate = function () {
	var yyyy = this.getFullYear().toString();
	var MM = pad(this.getMonth() + 1,2);
	var dd = pad(this.getDate(), 2);
	var hh = pad(this.getHours(), 2);
	var mm = pad(this.getMinutes(), 2)
	var ss = pad(this.getSeconds(), 2)

	return yyyy+"-" + MM + "-" + dd + " " +  hh + ":" + mm+ ":" + ss;
};
Date.prototype.getToDate = function () {
	var yyyy = this.getFullYear().toString();
	var MM = pad(this.getMonth() + 1,2);
	var dd = pad(this.getDate(), 2);

	return yyyy+"-" + MM + "-" + dd;
};
function pad(number, length) {

	var str = '' + number;
	while (str.length < length) {
		str = '0' + str;
	}

	return str;
}
