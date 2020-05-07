var myDB;

var app = {

    /**
     * 이미지를 데이터베이스에서 가져와서 출력한다ㅏ.
     */
    imageLoad: function() {
        var storage = window.localStorage;
        var key = storage.getItem("param");
        console.log("key : " + key);
        storage.removeItem("param");
        myDB.transaction(function(transaction) {
            transaction.executeSql("SELECT id, filename, sts FROM tb_files where id = ? ", [key], function (tx, results) {
                var len = results.rows.length;
                console.log("len : " + len);
                if (len > 0)
                {
                    console.log("data found...");
                    var data = results.rows.item(0).filename;
                    console.log("data : " + data);
                    $("#imgShow").empty();
                    $("#imgShow").append("<li><img src='"+data+"' alt=''></li>");

                    var thumbImg = $('.cntViewDtl .slideImg li img');
                    thumbImg.each(function(){
                        $(this).load(function() {   // 이미지 높이를 구하려면 load함수를 수행해야 된다(중요)
                            //console.log($(this).height());
                            var imgH = $(this).height();
                            $(this).css('margin-top', -(imgH/2));
                        });                        
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
        CameraPreview.stopCamera();    
        myDB = window.sqlitePlugin.openDatabase(                    // myDB에 sqlite db 파일 정의
            {name: "kdnapp.db", location: 'default'}                // db 파일명 : kdnapp.db
        );
        app.imageLoad(); // 전송 리스트 조회

        // event listener
        // document.getElementById("btnDel").addEventListener('click', this.fileDelete, false);
        // document.getElementById("btnSend").addEventListener('click', this.fileSend, false);
    }    
};

document.addEventListener('deviceready', function(){
    app.init();    
}, false);