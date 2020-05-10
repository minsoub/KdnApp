var myDB;
var deleteNo;
var deleteFileName;
var storage;
var empid;
var deptCd;
var deptNm;

var selectedDeptCd;
var selectedDeptNm;
var app = {

    /**
     * 서버에 접속해서 부서정보를 가져온다.
     */
    treeDeptLoad: function() {
        var param = {};

        $.ajax({
            type : "GET", 
            url  : kdn_dept_url, 
            data : param,  
            success: function(data)
            {
                console.log(data);
                var authData = data;
                if (authData.code == "OK")
                {
                    $("#treeMn").empty();

                    var arr_data = authData.rows;
                    arr_data.forEach(function(rows, idx){
                        var dept_code = rows.deptCd;
                        var uppoDeptCd = rows.uppoDeptCd;
                        var dept_name = rows.deptNm;
                        var lev = rows.lev;
                        var rowNum = rows.rowNum;
                        var groupYn = rows.groupYn;
                        var childCnt = rows.childCnt;

                        var fold_file_type = "";
                        if (groupYn == "Y") fold_file_type = "folder";
                        else fold_file_type = "file";
                        var li = "<li id='"+dept_code+"' lvl='"+lev+"'><span class='"+fold_file_type+"'>"+dept_name+"</span></li>";
                        console.log(li);
                        if (lev == 0) {
                            $("#treeMn").append(li);
                        }else {
                            var parentLi = $("#treeMn li[id='"+uppoDeptCd+"']");
                            var bUl = parentLi.find("ul");

                            if (bUl.length == 0) {
                                parentLi.append(li);
                            }else {
                                bUl.append(li);
                            }
                        }
                    });   
                    $('#treeMn li').on('click', function(e){
						$('#treeMn li span').removeClass('slcted');
						$(this).find('> span').addClass('slcted');
                        e.stopPropagation();
                        
                        selectedDeptCd = $(this).attr("id");
                        selectedDeptNm = $(this).find('> span').text();

                        console.log("selectedDeptCd : " + selectedDeptCd);
                        console.log("selectedDeptNm : " + selectedDeptNm);
					});
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
    treeDeptSelect: function() {
        if (selectedDeptCd != "")
        {
            deptCd = selectedDeptCd;
            deptNm = selectedDeptNm;
            $("#deptName").val(deptNm);
            $("#deptCd").val(deptCd);
            closeLayer('.popSlctTeam');

            app.imageLoad();
        }
    },
    /**
     * 서버에 접속해서 이미지 정보를 가져온다.
     */
    imageLoad: function() {
        var searchStDt;
        var searchEndDt;
        var searchType;
        var searchText;
        if ($("#searchStDt").val() == "")
        {
            var date = new Date();
            date.setDate(date.getDate() - 5);
            searchStDt = date.getToDate();
        }else {
            searchStDt = $("#searchStDt").val().replace(".", "").replace(".", "");
        }
        if ($("#searchEndDt").val() == "")
        {
            searchEndDt = new Date().getToDate();
        }else {
            searchEndDt = $("#searchEndDt").val().replace(".", "").replace(".", "");
        }
        
        if ($("#searchMyId").attr("class") == "btnColorA")  {// 활성화
            searchType = "id";
            searchText = empid;
        }else {
            searchType = "dept";
            searchText = deptCd;      // 검색조건
        }

        var param = {
            searchStDt : searchStDt, 
            searchEndDt : searchEndDt,
            searchType : searchType,
            searchText : searchText,
            pageNo : 1
        };

        $.ajax({
            type : "POST", 
            url  : kdn_get_img_url, 
            data : param,  
            success: function(data)
            {
                //console.log(data);
                var authData = JSON.parse(data);
                if (authData.code == "OK")
                {
                    $("#imgShow").empty();

                    var arr_data = authData.rows;
                    arr_data.forEach(function(rows, idx){
                        var rgstYmd = rows.rgstYmd;
                        var imageShareList = rows.imageShareList;
                        console.log(rows.rgstYmd);
                        
                        $("#imgShow").append("<h2 class='tit'>"+rgstYmd+"</h2>");
                        $("#imgShow").append("<ul class='listImg' id='"+rgstYmd+"'></ul>");

                        var parentUL = $("#imgShow ul[id='"+rgstYmd+"']");
                        imageShareList.forEach(function(image, index){
                            parentUL.append(
                                "<li>"+
                                    "<a href='#'>" +
                                        "<p class='thumb'><img src='"+encodeURI(image.thumbnailFileName)+"'></p>" +
                                        "<p class='num'>"+image.imageSeqno+"</p>" +
                                    "</a>" +
                                "</li>"
                            );
                        });
                    });

                    var thumbImg = $('.wrapListImg .listImg .thumb img');
                    thumbImg.each(function(){
                        $(this).load(function() {   // 이미지 높이를 구하려면 load함수를 수행해야 된다(중요)
                            var imgH = $(this).height();
                            $(this).css('margin-top', -(imgH/2));
                        });                        
                    });                     
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
    PrevPage: function() {
        location.href="index.html";
    },
    /**
     * 내부서 탭 클릭
     */
    DeptTap: function() {
        console.log("DeptTap called..");
        console.log($("#searchMyDept").attr("class"));
        if ($("#searchMyDept").attr("class") != "btnColorA")
        {
            $("#searchMyDept").removeClass("btnLight");
            $("#searchMyDept").addClass("btnColorA");
            $("#searchMyId").removeClass("btnColorA");
            $("#searchMyId").addClass("btnLight");

            app.imageLoad();
        }
    },
    /**
     * 내사진 탭 클릭
     */
    IdTap: function() {
        console.log("IdTap called..");
        console.log($("#searchMyId").attr("class"));
        if ($("#searchMyId").attr("class") != "btnColorA")
        {
            $("#searchMyId").removeClass("btnLight");
            $("#searchMyId").addClass("btnColorA");
            $("#searchMyDept").removeClass("btnColorA");
            $("#searchMyDept").addClass("btnLight");
            app.imageLoad();
        }
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
        // 날짜기간 세팅
        var date = new Date();
        date.setDate(date.getDate() - 5);
        $("#searchStDt").val(date.getToDate());
        $("#searchEndDt").val(new Date().getToDate());

        
        app.imageLoad(); // 전송 리스트 조회
        app.treeDeptLoad();

        // event listener
        // document.getElementById("btnDel").addEventListener('click', this.fileDeleteConfirm, false);
        // document.getElementById("btnSend").addEventListener('click', this.fileSend, false);
        document.getElementById("btnPrev").addEventListener('click', this.PrevPage, false);
        document.getElementById("searchMyDept").addEventListener('click', this.DeptTap, false);
        document.getElementById("searchMyId").addEventListener('click', this.IdTap, false);
        document.getElementById("btnSelect").addEventListener('click', this.treeDeptSelect, false);
    } 
};

document.addEventListener('deviceready', function(){
    app.init();    
}, false);