var myDB;

var app = {
    fileDelete: function() {
        // 체크박스 선택 여부
        var result = true;
        var inputChck = $('.cntWrapImg .listImg li input[type="checkbox"]:checked');
        if(inputChck.length == 0)
        {
            alert("체크박스 선택 후 삭제 버튼을 클릭하세요!!!");
            return;
        }
        // 파일을 삭제 및 데이터베이스의 데이터를 삭제한다. 
        $('.cntWrapImg .listImg li input[type="checkbox"]:checked').each(function(){
            var data = $(this).val();
            console.log(data);
            // 데이터베이스 삭제
            var executeQuery = "DELETE FROM tb_files where filename = ?";
            myDB.executeSql(executeQuery, [data], 
                function(result) {
                    console.log("데이터 삭제 성공!");
                    // 파일을 삭제한다.
                    var fileName = data.substring(data.lastIndexOf('/')+1);
                    var ext = fileName.substring(data.lastIndexOf('.')+1);
                    var folder = data.substring(0, data.lastIndexOf('/'));

                    window.resolveLocalFileSystemURL(folder, function(entry) {
                        entry.getFile (fileName, {create:false}, function(fileEntry) {
                            fileEntry.remove(function(){
                                console.log(data + " File removed!");
                            }, function(error){
                                console.log("error deleting the file["+data+"] " + error.code);
                                result = false;
                            }, function(){
                                console.log("file does not exist["+data+"]");
                                result = false;
                            });
                        });
                    });
                },
                function(error){
                    result = false;                    
                    console.log("데이터베이스 삭제 실패!");
                    return false;
                }
            );
        });
        if (result == false)
        {
            commonAlert("파일삭제 에러", "파일 삭제하는데 에러가 발생하였습니다!!!");
        }else {
            commonAlert("파일삭제 완료", "파일 삭제를 완료하였습니다!!!");
            app.imageLoad(); // 전송 리스트 조회
        }

    }, 
    fileSend: function() {
        // 사용자 세션 여부 체크
        var storage = window.localStorage;
        var auth_data = storage.getItem("kdnapp_session_data");     // 세션데이터 : string형식(JSON형식으로 변경해야 됨)
        var du_date = storage.getItem("kdnapp_session_dt");   // 로그인일자
        if (auth_data == null || auth_data == "")
        {
            // 로그인 이동
            storage.setItem("referer", "NKS009.html");
            location.href="NKS008.html";        // 로그인 페이지 이동
        }else {
            // 만료일자 체크 : 로그인 후 1일
            console.log(du_date);  // 2013-09-05 15:34:00
            var t1 = (new Date(du_date.replace(/-/g, '/')).getTime()/1000);
            var t2 = new Date().getTime()/1000;     //  현재 시간
            console.log("t1 : " + t1);
            console.log("t2 : " + t2);
            if ((t2 - t1) > (24 * 60 * 60))
            {
                storage.setItem("referer", "NKS009.html");
                // 재 로그인을 수행
                location.href="NKS008.html";        // 로그인 페이지 이동
            }else {
                // 체크 된 사진 데이터를 전송한다. 
                // 전송 전 네트워크 상태 여부 체크
                var networkState = navigator.connection.type;
                if (networkState == Connection.UNKNOWN || networkState == Connection.NONE)
                {
                    commonAlert("네트워크 에러", "네트워크 상태가 미연결 상태입니다!!!");
                }else {
                    var inputChck = $('.cntWrapImg .listImg li input[type="checkbox"]:checked');
                    if(inputChck.length == 0)
                    {
                        commonAlert("체크박스 선택", "체크박스 선택 후 전송 버튼을 클릭하세요!!!");
                        return;
                    }                    
                    // 파일을 전송한다.
                    console.log("file 전송 시작... " + inputChck.length);
                    openLayer('.layerProgBar');
                    // 전송크기 : inputCheck.length
                    // 전송그래프 : 초기값 
                    var size = "1/"+inputChck.length;
                    var graph = Math.ceil(100/inputChck.length);
                    var num = 0;
                    var result = true;
                    var total = inputChck.length;
                    
                    $("#send_size").text(size);
                    $("#send_graph").attr("width", "0%");

                    // 사용자 아이디/부서코드/파일
                    console.log(JSON.parse(auth_data));
                    var auth = JSON.parse(auth_data);
                    var empid = auth.empid;
                    var deptCd = auth.deptCd;
                    console.log(empid);
                    console.log(deptCd);
                    
                    $('.cntWrapImg .listImg li input[type="checkbox"]:checked').each(function(){
                        var fileURL = $(this).val();

                        var win = function(r)
                        {
                            console.log(r);
                            var data = r.response;
                            var rData = JSON.parse(data);
                            console.log(rData);
                            if (rData.code == "OK")
                            {
                                num = num + 1;
                                size = num+"/"+total;
                                $("#send_size").text(size);
                                if (num == total) {
                                    $("#send_graph").css("width", "100%");
                                } else { 
                                    var p = graph * num;
                                    $("#send_graph").css("width", p+"%");
                                }
                                // 파일 삭제 후 데이터베이스 내용도 삭제한다.
                                // 데이터베이스 삭제
                                var executeQuery = "DELETE FROM tb_files where filename = ?";                                            
                                myDB.executeSql(executeQuery, [fileURL], function(result) {
                                    console.log("데이터베이스 삭제 성공!");
                                    var fileName = fileURL.substring(fileURL.lastIndexOf('/')+1);
                                    var ext = fileName.substring(fileURL.lastIndexOf('.')+1);
                                    var folder = fileURL.substring(0, fileURL.lastIndexOf('/'));
                                    console.log(fileName);
                                    console.log(folder);
                                    window.resolveLocalFileSystemURL(folder, function(entry) {
                                        entry.getFile (fileName, {create:false}, function(fileEntry) {
                                            fileEntry.remove(function(){
                                                console.log(fileURL + " File removed!");
                                                console.log("num : " + num + ", total : " + total);
                                                if (num == total) { // 완료
                                                    closeLayer('.layerProgBar');
                                                    commonAlert("전송완료", "전송을 완료하였습니다!!!");
                                                    app.imageLoad(); // 전송 리스트 조회
                                                }
                                            }, function(error){
                                                closeLayer('.layerProgBar');
                                                console.log("error deleting the file["+fileURL+"] " + error.code);
                                                commonAlert("전송에러", "error deleting the file["+fileURL+"] " + error.code);
                                                return false;
                                            }, function(){
                                                closeLayer('.layerProgBar');
                                                console.log("file does not exist["+fileURL+"]");
                                                commonAlert("전송에러", "file does not exist["+fileURL+"]");
                                                return false;
                                            });
                                        });
                                    });

                                },
                                function(error){
                                    closeLayer('.layerProgBar');
                                    commonAlert("전송에러", "데이터 파일 삭제 에러");
                                    return false;
                                });
                            }else {
                                closeLayer('.layerProgBar');
                                commonAlert("전송에러", rData.message);
                                return false;
                            }                                      
                        }
                        var fail = function(error)
                        {
                            closeLayer('.layerProgBar');
                            console.log(error);
                            commonAlert("전송에러", "파일 전송하는데 에러가 발생하였습니다!!!["+error.code+"]");
                            return false;
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
                    }); // each end..
                }
            }
        }
    },
    imageLoad: function() {
        myDB.transaction(function(transaction) {
            transaction.executeSql("SELECT id, filename, sts FROM tb_files where sts = 'N' order by id desc ", [], function (tx, results) {
                var len = results.rows.length;
                console.log("len : " + len);
                if (len > 0)
                {
                    $("#listImg").empty();
                    for (var i=0; i<len; i++)
                    {
                        var data = results.rows.item(i).filename;

                        var fileName = data.substring(data.lastIndexOf('/')+1);
                        var name = fileName.substring(0, fileName.lastIndexOf('.'));
                        var folder = data.substring(0, data.lastIndexOf('/'));
                        //console.log(name);
                        //console.log(data);

                        var chkName = "chck" + ((i < 10) ? ('0'+(i+1)) : (i+1));
                        //console.log(chkName);
                        $("#listImg").append(
                            "<li>" +
                            "<input type='checkbox' name='checkImg' id='"+chkName+"' value='"+data+"'>" + 
                            "<label for='"+chkName+"'></label>" +
                            "<a href=\"javascript:ImageDetail('"+results.rows.item(i).id+"');\">" + 
                            "<p class='thumb'><img src='"+data+"' alt='상세보기' class='imgGo' id='"+data+"'></p>" +
                            "<p class='num'>"+results.rows.item(i).id+"</p>" +
                            "</a>" +
                            "</li>"
                        );
                    }

                    var thumbImg = $('.cntWrapImg .listImg .thumb img');
                    thumbImg.each(function(){
                        $(this).load(function() {
                            //console.log($(this).height());
                            var imgH = $(this).height();
                            $(this).css('margin-top', -(imgH/2));
                        });                        
                    });
                }
            })
        }); 
    }, 
    AllCheck: function() {
        var chckAll = $('.cntWrapImg #chckAll');
        var inputChck = $('.cntWrapImg .listImg li input[type="checkbox"]');

        var chckStatus = $("#chckAll").prop('checked');
        console.log("chckAll checked... call..");
        inputChck.each(function(){
            //console.log("cc...");
            $(this).prop('checked', chckStatus);
        });
    },
    init: function() {
        CameraPreview.stopCamera();    
        myDB = window.sqlitePlugin.openDatabase(                    // myDB에 sqlite db 파일 정의
            {name: "kdnapp.db", location: 'default'}                  // db 파일명 : kdnapp.db
        );
        app.imageLoad(); // 전송 리스트 조회

        // event listener
        document.getElementById("btnDel").addEventListener('click', this.fileDelete, false);
        document.getElementById("btnSend").addEventListener('click', this.fileSend, false);

        document.getElementById("chckAll").addEventListener('click', this.AllCheck, false);
    }
};

document.addEventListener('deviceready', function(){
    app.init();    
}, false);

/**
 * 이미지 상세 보기
 * @param {이미지 key} data 
 */
function ImageDetail(data)
{
    console.log(data);
    var storage = window.localStorage;
    storage.setItem("param", data);
    location.href="NKS011.html";
}