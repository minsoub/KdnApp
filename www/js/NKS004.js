var app = {
            
    startCameraAbove: function() {
        let options = {
            x: 0,
            y: 60,
            width: window.screen.width,
            height: 500, // window.screen.height,
            camera: CameraPreview.CAMERA_DIRECTION.BACK,
            toBack: true,
            tapPhoto: false,
            tapFocus: false,
            previewDrag: false,
            storeToFile: true,
            disableExifHeaderStripping: false
          };
        CameraPreview.startCamera(options);
    }, 
    stopCamera: function() {
        CameraPreview.stopCamera();
    }, 
    success: function(entry) {
        console.log("New Path : " + entry.fullPath);
    }, 
    fail: function(error) {
        console.log("move error : ["+error.message+"]" + error.code);
    },
    takePicture: function() {
        CameraPreview.takePicture(function(imgData){
            console.log("file://"+imgData);  // file:///data/user/0/kr.co.neodream.kdnapp/cache/cpcp_capture_f65c1206.jpg
            var data = ''+imgData;
            var fileName = data.substring(data.lastIndexOf('/')+1);
            var folder = data.substring(0, data.lastIndexOf('/'));
            var d = new Date();
            var changeName = d.YYYYMMDDHHMMSS()+fileName.substring(fileName.lastIndexOf('.'));

            console.log("fileName : " + fileName);
            console.log("folder: " + cordova.file.dataDirectory);
            console.log("changeName : " + changeName);
            // 이미지명 변경
            var fileUri = "file://"+imgData;
            window.resolveLocalFileSystemURL(fileUri, function(entry) {
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(ent) {
                    entry.moveTo(ent, changeName, app.success, app.fail);
                });
            });
            //fileUri.moveTo(parentEnty, changeName, app.success, app.fail);
            var newFileName = cordova.file.dataDirectory + changeName;

            // 데이터베이스에 등록하고 화면으로 이동한 후 최신 데이터를 읽어서 보여준다. 
            var id = 0;
            var filename = newFileName;
            var sts = "N";

            myDB.executeSql("SELECT max(id) as id FROM tb_files", [], function (results) {
                var len = results.rows.length;
                console.log("len : " + len); 
                if (len > 0)
                {
                    console.log("db id : " + results.rows.item(0).id);
                    id = results.rows.item(0).id + 1; 
                }else {
                    id = 1;
                }
                console.log("id : " + id);

                var executeQuery = "INSERT INTO tb_files (id, filename, sts) VALUES (?, ?, ?)";
                myDB.executeSql(executeQuery, [id, filename, sts], function(result) {
                    console.log("id : " + id);
                    console.log("filename : " + filename);
                    console.log("sts : " + sts);
                    console.log("데이터 입력 성공!");
                    },
                    function(error){
                        console.log("데이터 입력 실패!");
                    }
                );
            });                       
 
            if ($("#chck01").is(":checked") == true)
            {
                // 사진 저장을 위해서 파일명 변경화면으로 이동해야 한다. 
                // 임시 저장하고 변경화면으로 이동한다. 
                CameraPreview.stopCamera();           
                location.href="NKS006.html";        // 이미지 변경저장 화면으로 이동
            }
        })
    },
    show: function() {
        CameraPreview.show();
    }, 

    hide: function() {
        CameraPreview.hide();
    }, 
    changeZoom1: function() {
        var zoom = 0.5;
        CameraPreview.setZoom(zoom);
        console.log(zoom);

        var slctZoom = $('.wrapCam .btnCam .slctZoom li a');
        slctZoom.removeClass('active');
        $("#zoom1_href").addClass('active');      
    }, 
    changeZoom2: function() {
        var zoom = 1.0;
        CameraPreview.setZoom(zoom);
        console.log(zoom);
        var slctZoom = $('.wrapCam .btnCam .slctZoom li a');
        slctZoom.removeClass('active');
        $("#zoom2_href").addClass('active');         
    }, 
    changeZoom3: function() {
        var zoom = 2.0;
        CameraPreview.setZoom(zoom);
        console.log(zoom);
        var slctZoom = $('.wrapCam .btnCam .slctZoom li a');
        slctZoom.removeClass('active');
        $("#zoom3_href").addClass('active');        
    },     
    changeFlashMode: function() {
        var mode = document.getElementById("flashmode").value;
        console.log(mode);
        if (mode == "off")
        {
            CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.ON);
            $("#btnFlash").removeClass('off'); 
            $("#flashmode").val("on");
        }else {
            CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.OFF);
            $("#btnFlash").addClass('off'); 
            $("#flashmode").val("off");
        }
        
    }, 
    init: function() {
        //document.addEventListener("backbutton", onBackKeyDown, false);
        document.getElementById("zoom1").addEventListener('click', this.changeZoom1, false);
        document.getElementById("zoom2").addEventListener('click', this.changeZoom2, false);
        document.getElementById("zoom3").addEventListener('click', this.changeZoom3, false);

        // Flash
        document.getElementById("btnFlash").addEventListener('click', this.changeFlashMode, false);
        // 사진 촬영
        document.getElementById("btnShot").addEventListener('click', this.takePicture, false);
    }
};

document.addEventListener('deviceready', function(){
    app.init();
    $("#btnFlash").addClass('off');        // flash mode off
    app.startCameraAbove();

    onDeviceReady();
}, false);

function onDeviceReady()
{
    document.addEventListener("backbutton", onBackKeyDown, false);
}

function onBackKeyDown()
{
    console.log("onBackKeyDown called...");
    CameraPreview.stopCamera();
    location.href="index.html";
}