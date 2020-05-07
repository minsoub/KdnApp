var myDB;

var app = {

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    onDeviceReady: function() {
        myDB = window.sqlitePlugin.openDatabase(                    // myDB에 sqlite db 파일 정의
            {name: "kdnapp.db", location: 'default'}                  // db 파일명 : kdnapp.db
        );

        myDB.transaction(function(transaction) {
            transaction.executeSql('CREATE TABLE IF NOT EXISTS tb_files (id integer, filename text, sts integer)', [],
                function(tx, result) {
                    console.log("테이블 생성완료");
                },
                function(error) {
                    console.log("테이블 생성 실패!");
                }
            );
        });

        // 초기 테스트를 위해서 사용자 세션을 지운다.
        //var storage = window.localStorage;
        //storage.removeItem("kdnapp_session_data");
        //storage.removeItem("kdnapp_session_dt");
    }
};

app.initialize();