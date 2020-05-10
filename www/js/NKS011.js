var myDB;
var deleteNo;
var deleteFileName;
var storage;

var app = {
    fileDeleteConfirm: function() {
        navigator.notification.confirm(
            "해당 파일을 삭제하시겠습니까?", 
            app.fileDelete, 
            "삭제확인",
            ['취소', '확인']
        );
    },    
    /**
     * 파일 삭제
     */
    fileDelete: function(buttonIndex) {
        if (buttonIndex == 2)
        {
            deleteNo = $("#deleteNo").val();
            deleteFileName = $("#deleteFileName").val();

            console.log("삭제번호 : " + deleteNo);
            console.log("삭제파일 : " + deleteFileName);

            var executeQuery = "DELETE FROM tb_files where id = ?";
            //alert("1");
            myDB.executeSql(executeQuery, [deleteNo], 
                function(result) {
                    //alert("2");
                    console.log("데이터베이스 삭제 성공!");
                    // 파일을 삭제한다.
                    var fileName = deleteFileName.substring(deleteFileName.lastIndexOf('/')+1);
                    var ext = fileName.substring(deleteFileName.lastIndexOf('.')+1);
                    var folder = deleteFileName.substring(0, deleteFileName.lastIndexOf('/'));
                    console.log(fileName);
                    console.log(folder);
                    window.resolveLocalFileSystemURL(folder, function(entry) {
                        entry.getFile (fileName, {create:false}, function(fileEntry) {
                            fileEntry.remove(function(){
                                console.log(deleteFileName + " File removed!");
                                location.href="NKS009.html"
                            }, function(error){
                                console.log("error deleting the file["+deleteFileName+"] " + error.code);
                                result = false;
                            }, function(){
                                console.log("file does not exist["+deleteFileName+"]");
                                result = false;
                            });
                        });
                    });
                },
                function(error){                  
                    console.log("데이터베이스 삭제 실패!");
                    alert("데이터를 삭제하는데 에러가 발생하였습니다!!!");
                }
            );
        }
    }, 
    /**
     * 선택한 파일을 전송한다.
     */
    fileSend: function() {
        // 사용자 세션 여부 체크
        //var storage = window.localStorage;
        deleteNo = $("#deleteNo").val();
        deleteFileName = $("#deleteFileName").val();

        var auth_data = storage.getItem("kdnapp_session_data");     // 세션데이터 : string형식(JSON형식으로 변경해야 됨)
        var du_date = storage.getItem("kdnapp_session_dt");   // 로그인일자
        console.log(auth_data);
        console.log(du_date);
        if (auth_data == null || auth_data == "")
        {
            // 로그인 이동
            storage.setItem("referer", "NKS011.html");
            storage.setItem("param", deleteNo);
            location.href="NKS008.html";        // 로그인 페이지 이동
        }else {
            // 만료일자 체크 : 로그인 후 1일
            console.log(du_date);  // 2013-09-05 15:34:00
            console.log(new Date());
            var t1 = (new Date(du_date.replace(/-/g, '/')).getTime()/1000);
            var t2 = new Date().getTime()/1000;     //  현재 시간
            console.log("t1 : " + t1);
            console.log("t2 : " + t2);
            if ((t2 - t1) > (24 * 60 * 60))
            {
                // 재 로그인을 수행
                storage.setItem("referer", "NKS011.html");
                storage.setItem("param", deleteNo);
                location.href="NKS008.html";        // 로그인 페이지 이동
            }else {
                // 체크 된 사진 데이터를 전송한다. 
                // 전송 전 네트워크 상태 여부 체크
                var networkState = navigator.connection.type;
                if (networkState == Connection.UNKNOWN || networkState == Connection.NONE)
                {
                    alert("네트워크 상태가 미연결 상태입니다!!!");
                }else {                   
                    // 파일을 전송한다.
                    console.log("file 전송 시작...");
                    openLayer('.layerProgBar');
                    // 전송크기 : inputCheck.length
                    // 전송그래프 : 초기값 
                    var size = "1/"+1;
                    var graph = Math.ceil(100/1);
                    var num = 1;
                    var result = true;
                    
                    $("#send_size").text(size);
                    $("#send_graph").css("width", "0%");

                    // 사용자 아이디/부서코드/파일
                    console.log(JSON.parse(auth_data));
                    var auth = JSON.parse(auth_data);
                    var empid = auth.empid;
                    var deptCd = auth.deptCd;
                    console.log(empid);
                    console.log(deptCd);
                    
                    var fileURL = deleteFileName;
                    var formData = new FormData();
                    formData.append("empid",  empid);
                    formData.append("deptCd", deptCd);

                    window.resolveLocalFileSystemURL(fileURL, function(fileEntry) {
                        fileEntry.file(function(file) {
                            var reader = new FileReader();
                            reader.onloadend = function(e) {
                            var imgBlob = new Blob([this.result], { type:file.type});                            
                                  formData.append('files', imgBlob);
                                  console.log("file loaded...");
                                  var win = function(r)
                                  {
                                      console.log(r);
                                      var data = r.response;
                                      var rData = JSON.parse(data);
                                      console.log(rData);
                                      if (rData.code == "OK")
                                      {
                                          num = 1;
                                          size = num+"/"+1;
                                          $("#send_size").text(size);
                                          if (num == 1) {
                                              $("#send_graph").css("width", "100%");
                                          } else { 
                                              var p = graph * num;
                                              $("#send_graph").css("width", p+"%");
                                          }
                                          // 파일 삭제 후 데이터베이스 내용도 삭제한다.
                                          // 데이터베이스 삭제
                                          var executeQuery = "DELETE FROM tb_files where filename = ?";
                                        //   var result = DeleteProcessDB(myDB, executeQuery, [fileURL], fileURL);
                                        //   if (result == 1)
                                        //   {
                                        //     closeLayer('.layerProgBar');
                                        //     commonAlert("전송완료", "전송완료하였습니다!!!");
                                        //     location.href="NKS009.html"
                                        //   }else {
                                        //     closeLayer('.layerProgBar');
                                        //     commonAlert("전송에러", "파일전송에 에러가 발생하였습니다[데이터베이스 및 파일 삭제 에러");
                                        //   }
                                          
                                          myDB.executeSql(executeQuery, [fileURL], function(result) {
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
                                                          closeLayer('.layerProgBar');
                                                          commonAlert("전송완료", "전송완료하였습니다!!!");
                                                          location.href="NKS009.html"
                                                      }, function(error){
                                                          closeLayer('.layerProgBar');
                                                          console.log("error deleting the file["+deleteFileName+"] " + error.code);
                                                          commonAlert("전송에러", "error deleting the file["+deleteFileName+"] " + error.code);
                                                      }, function(){
                                                          closeLayer('.layerProgBar');
                                                          console.log("file does not exist["+deleteFileName+"]");
                                                          commonAlert("전송에러", "file does not exist["+deleteFileName+"]");
                                                      });
                                                  });
                                              });
                                          },
                                          function(error){
                                              closeLayer('.layerProgBar');
                                              commonAlert("전송에러", "데이터 파일 삭제 에러");
                                          });
                                      }else {
                                          closeLayer('.layerProgBar');
                                          commonAlert("전송에러", rData.message);
                                      }                                      
                                  }
                                  var fail = function(error)
                                  {
                                      closeLayer('.layerProgBar');
                                      console.log(error);
                                      commonAlert("전송에러", "파일 전송하는데 에러가 발생하였습니다!!!["+error.code+"]");
                                  }
                                  var options = new FileUploadOptions();
                                  options.fileKey = "files";
                                  options.fileName = fileURL.substr(fileURL.lastIndexOf('/')+1);

                                  var params = {};
                                  params.empid = empid;
                                  params.deptCd = deptCd;

                                  options.params = params;

                                  var ft = new FileTransfer();
                                  ft.upload(fileURL, encodeURI(kdn_upload_url), win, fail, options);
                            };
                            reader.readAsArrayBuffer(file);
                        });
                    });                  
                }
            }
        }
    },    
    /**
     * 이미지를 데이터베이스에서 가져와서 출력한다ㅏ.
     */
    imageLoad: function() {
        //var storage = window.localStorage;
        var key = storage.getItem("param");
        deleteNo = key;  //  삭제 번호 저장
        console.log("key : " + key);
        storage.removeItem("param");
        var imgFile = new Array();
        var imgFileNo = new Array();
        var delFile = new Array();
        myDB.transaction(function(transaction) {
            //transaction.executeSql("SELECT id, filename, sts FROM tb_files where id = ? ", [key], function (tx, results) {
            transaction.executeSql("SELECT id, filename, sts FROM tb_files ", [], function (tx, results) {    
                var len = results.rows.length;
                console.log("len : " + len);
                if (len > 0)
                {
                    console.log("data found...");
                    var data = results.rows.item(0).filename;
                    deleteFileName = data;
                    console.log("data : " + data);
                    $("#imgShow").empty();
                    var index = 0;
                    for (var i=0; i<len; i++)
                    {
                        var fileName = results.rows.item(i).filename.substring(results.rows.item(i).filename.lastIndexOf('/')+1);
                        imgFile[i] = fileName;
                        imgFileNo[i] = results.rows.item(i).id;
                        delFile[i] = results.rows.item(i).filename;

                        if (key == results.rows.item(i).id) {
                            index = i;
                            $("#title").text(fileName);
                            $("#deleteNo").val(results.rows.item(i).id);
                            $("#deleteFileName").val(results.rows.item(i).filename);
                        }
                        $("#imgShow").append("<li><img src='"+results.rows.item(i).filename+"' alt='' id='"+results.rows.item(i).id+"'></li>");
                    }

                    var thumbImg = $('.cntViewDtl .slideImg li img');
                    thumbImg.each(function(){
                        $(this).load(function() {   // 이미지 높이를 구하려면 load함수를 수행해야 된다(중요)
                            //console.log($(this).height());
                            var imgH = $(this).height();
                            $(this).css('margin-top', -(imgH/2));
                        });                        
                    }); 

                    var picArea = $('.cntViewDtl .slideImg');
                    var items = $('.cntViewDtl >').not(picArea);
                    picArea.on('click', function(){
                        items.toggle();
                    });
                    // 이미지 slides
                    picArea.bxSlider({	
                        infiniteLoop : false,	
                        touchEnabled: true,
                        slideMargin: 10,
                        adaptiveHeight: true,
                        startSlide: index,		
                        controls:false,
                        pager:false, 
                        useCSS: true,
                        onSliderLoad: function() {  
                            console.log('onSliderLoad'); //executed
                            // thumbImg.each(function(){
                            //     $(this).load(function() {   // 이미지 높이를 구하려면 load함수를 수행해야 된다(중요)
                            //         //console.log($(this).height());
                            //         var imgH = $(this).height();
                            //         $(this).css('margin-top', -(imgH/2));
                            //     });                        
                            // }); 
                        },
                        onSlideAfter: function($slideElement, oldIndex, newIndex) {
                            console.log('onSlideAfter'); //executed
                            // thumbImg.each(function(){
                            //     $(this).load(function() {   // 이미지 높이를 구하려면 load함수를 수행해야 된다(중요)
                            //         //console.log($(this).height());
                            //         var imgH = $(this).height();
                            //         $(this).css('margin-top', -(imgH/2));
                            //     });                        
                            // }); 
                        },
                        onSlideNext: function($slideElement, oldIndex, newIndex) {
                            console.log('onSlideNext'); //executed
                            $("#title").text(imgFile[newIndex]);
                            $("#deleteNo").val(imgFileNo[newIndex]);
                            $("#deleteFileName").val(delFile[newIndex]);
                        },
                        onSlidePrev: function($slideElement, oldIndex, newIndex) {
                            console.log('onSlidePrev'); //executed
                            $("#title").text(imgFile[newIndex]);
                            $("#deleteNo").val(imgFileNo[newIndex]);
                            $("#deleteFileName").val(delFile[newIndex]);
                        }                                    
                    });
                }else {
                    console.log("no data found...");
                }
            },
            function(error){
                console.log("데이터 조회 실패!" + error);
            }) 
        });           
    },
    init: function() {
        document.addEventListener("deviceready", onDeviceReady, false);
        storage = window.localStorage;
        CameraPreview.stopCamera();    
        myDB = window.sqlitePlugin.openDatabase(                    // myDB에 sqlite db 파일 정의
            {name: "kdnapp.db", location: 'default'}                // db 파일명 : kdnapp.db
        );
        app.imageLoad(); // 전송 리스트 조회

        // event listener
        document.getElementById("btnDel").addEventListener('click', this.fileDeleteConfirm, false);
        document.getElementById("btnSend").addEventListener('click', this.fileSend, false);
    }    
};

document.addEventListener('deviceready', function(){
    app.init();    
}, false);


