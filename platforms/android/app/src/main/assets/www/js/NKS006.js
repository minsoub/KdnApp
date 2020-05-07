var id;
var myDB;
var fileName;
var folder;
var ext;
var app = {

    fileSave: function() {
        var saveName;
        if (document.getElementById("filename").value  != "")
        {
            saveName = document.getElementById("filename").value +"."+ext;
            // 재저장해야 된다.
            var fileUri = "file://"+folder+fileName;    // 이전 정보
            window.resolveLocalFileSystemURL(fileUri, function(entry) {
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(ent) {
                    entry.moveTo(ent, saveName, app.success, app.fail);
                });
            });
            var newFileName = cordova.file.dataDirectory + saveName;

            // 데이터베이스에 등록하고 화면으로 이동한 후 최신 데이터를 읽어서 보여준다. 
            var filename = newFileName;
            var executeQuery = "UPDATE tb_files set filename=? where id = ?";
            myDB.executeSql(executeQuery, [id, filename], function(result) {
                console.log("데이터 수정 성공!");
                location.href="NKS004.html";
                },
                function(error){
                    console.log("데이터 수정 실패!");
                    alert("파일명 변경하는데 에러가 발생하였습니다!!!");
                }
            );
        }
    },
    init: function() {
        myDB = window.sqlitePlugin.openDatabase(                    // myDB에 sqlite db 파일 정의
            {name: "kdnapp.db", location: 'default'}                  // db 파일명 : kdnapp.db
        );

        myDB.transaction(function(transaction) {
            transaction.executeSql("SELECT * FROM tb_files where id = (select max(id) from tb_files)", [], function (tx, results) {
                var len = results.rows.length;
                console.log("len : " + len);
                if (len > 0)
                {
                    id = results.rows.item(0).id;
                    $("#preivew").prop("src", results.rows.item(0).filename);
                    var data = results.rows.item(0).filename;

                    fileName = data.substring(data.lastIndexOf('/')+1);
                    ext = fileName.substring(data.lastIndexOf('.')+1);
                    folder = data.substring(0, data.lastIndexOf('/'));
                }
            })
        });

        document.getElementById("btnSave").addEventListener('click', this.fileSave, false);
    }
};

document.addEventListener('deviceready', function(){
    app.init();
}, false);