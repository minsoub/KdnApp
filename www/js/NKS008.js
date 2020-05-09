var myDB;

var app = {
    loginProcess: function() {
        // 로그인 처리
        if ($("#id").val() == "")
        {
            alert("아이디를 입력하세요!!!");
            $("#id").focus();
            return;
        }
        if ($("#pass").val() == "")
        {
            alert("패스워드를 입력하세요!!!");
            $("#pass").focus();
            return;
        }

        //  서버 통신
        console.log(kdn_login_url);
        var param = {
            empid : $("#id").val(), 
            password : $("#pass").val()
        };

        $.ajax({
            type : "POST", 
            url  : kdn_login_url, 
            data : param,  
            success: function(data)
            {
                console.log(data);
                var authData = data;
                if (authData.code == "OK")
                {
                    // 스토리지 저장
                    console.log("sss: " + JSON.stringify(data));
                    var storage = window.localStorage;
                    storage.setItem("kdnapp_session_data", JSON.stringify(data));
                    storage.setItem("kdnapp_session_dt",   (new Date()).getFormatDate())  // 2013-09-05 15:34:00
                    var referer = storage.getItem("referer");
                    storage.removeItem("referer");
                    // 로그인 완료 후 이전 페이지로 이동
                    console.log("referer: " + referer);
                    if (referer == null)
                    {
                        location.href = "index.html";
                    }else {
                        location.href = referer;
                    }                    
                    //history.back();
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
        myDB = window.sqlitePlugin.openDatabase(                    // myDB에 sqlite db 파일 정의
            {name: "kdnapp.db", location: 'default'}                  // db 파일명 : kdnapp.db
        );

        document.getElementById("btnLogin").addEventListener('click', this.loginProcess, false);
    }
};


document.addEventListener('deviceready', function(){
    app.init();    
}, false);