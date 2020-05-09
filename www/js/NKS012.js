var myDB;
var deleteNo;
var deleteFileName;
var storage;
var empid;
var deptCd;
var deptNm;
var app = {

    /**
     * 서버에 접속해서 이미지 정보를 가져온다.
     */
    imageLoad: function() {
        var searchStDt = $("#searchStDt").val().replace(".", "").replace(".", "");
        var searchEndDt = $("#searchEndDt").val().replace(".", "").replace(".", "");
        var searchType;
        var searchText;
        if ($("#searchMyId").attr("class") == "btnColorA")  {// 활성화
            searchType = "id";
            searchText = empid;
        }else {
            searchType = dept;
            searchText = deptCd;      // 검색조건
        }

        var param = {
            searchStDt : $("#id").val(), 
            searchEndDt : $("#pass").val(),
            searchType : $("#pass").val(),
            searchText : $("#pass").val(),
            pageNo : 1
        };

        $.ajax({
            type : "POST", 
            url  : kdn_get_img_url, 
            data : param,  
            success: function(data)
            {
                console.log(data);
                var authData = data;
                if (authData.code == "OK")
                {
                    // 스토리지 저장
                    console.log("sss: " + data);
                    
                }else {
                    alert(authData.message);
                }
            }, 
            error: function(data) {
                console.log(data);
                alert(data);
            }
        });

    },
    init: function() {
        document.addEventListener("deviceready", onDeviceReady, false);
        storage = window.localStorage;
        CameraPreview.stopCamera();    
        myDB = window.sqlitePlugin.openDatabase(                    // myDB에 sqlite db 파일 정의
            {name: "kdnapp.db", location: 'default'}                // db 파일명 : kdnapp.db
        );
        var auth_data = storage.getItem("kdnapp_session_data");     // 세션데이터 : string형식(JSON형식으로 변경해야 됨)
        var du_date = storage.getItem("kdnapp_session_dt");   // 로그인일자
        var auth = JSON.parse(auth_data);
        empid = auth.empid;
        deptCd = auth.deptCd;
        deptNm = auth.deptNm;
        $("#deptName").val(deptNm);        
        app.imageLoad(); // 전송 리스트 조회

        // event listener
        // document.getElementById("btnDel").addEventListener('click', this.fileDeleteConfirm, false);
        // document.getElementById("btnSend").addEventListener('click', this.fileSend, false);
    } 
};

document.addEventListener('deviceready', function(){
    app.init();    
}, false);