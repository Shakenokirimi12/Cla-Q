function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    student_Join();
  }
}

async function student_Join() {
  var class_Code = document.querySelector("#class-code-input").value;
  var url = "https://student.api.cla-q.net/join";
  var postData = {
    class_Code: class_Code,
    userName: userName,
    userEmail: userEmail,
  };
  console.log(postData)
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://cla-q.net/",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.length != 0) {
          var responseresult = data[Object.keys(data).length - 1];
          var classinfo = data[0];
          if (responseresult.result == "success") {
            console.log("Successfully joined the class");
            prevent_Overlogin();
            document.cookie = "class_Code=" + classinfo.class_Code + "; path=/;";
            Swal.fire({
              title: "成功",
              html: "<strong>クラス" + classinfo.class_Code + "に参加しました。</strong>",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            }).then((result) => {
              window.location.href = "../student_menu";
            });
          } else {
            if (responseresult.status_Code == undefined) {
              Swal.fire({
                title: "エラー",
                html: "<strong>クラスに参加できませんでした。</strong><br>エラーコード:不明",
                icon: "error",
              });
            } else {
              if(responseresult.status_Code == "JE-12"){
                Swal.fire({
                  html:
                    "<strong>クラスに参加できませんでした。</strong><br>クラスがアクティブでありませんでした。<br>エラーコード:" + responseresult.status_Code,
                  title: "エラー",
                  icon: "error",
                });  
              }
              else if(responseresult.status_Code == "JE-01"){
                Swal.fire({
                  html:
                    "<strong>クラスが見つからなかったため、クラスに参加できませんでした。</strong><br>エラーコード:" + responseresult.status_Code,
                  title: "エラー",
                  icon: "error",
                });  
              }
              else if(responseresult.status_Code == "JE-06"){
                Swal.fire({
                  html:
                    "<strong>クラスに設定されている参加可能な人数を超えたため、<br>クラスに接続できませんでした。</strong><br>エラーコード:" + responseresult.status_Code,
                  title: "エラー",
                  icon: "error",
                });  
              }
              else{
                Swal.fire({
                  html:
                    "<strong>クラスに参加できませんでした。</strong><br>サポートへご確認ください。<br>エラーコード:" + responseresult.status_Code,
                  title: "エラー",
                  icon: "error",
                });  
              }
            }
          }
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "エラー",
          html: "<strong>クラスに参加できませんでした。</strong><br>エラー内容:「" + error + "」",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("エラー発生。");
    console.log(error);
  }
}

window.onload = function () {
  let url_string = window.location.href;
  let url = new URL(url_string);
  let data = url.searchParams.get("class_Code");
  console.log(data);
  var class_Code = data;
  if (class_Code.length = !0) {
    document.querySelector("#class-code-input").value = class_Code;
  }
  mobileRedirect();
  prevent_Overlogin();
  Swal.fire({
    title: "お知らせ",
    html: '開発履歴などは<a href="https://dev.cla-q.net/" target="_blank">こちら</a><br>開発ブログは<a href="https://blog.cla-q.net/" target="_blank">こちら</a>',
    icon: "info",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
  });
};

function mobileRedirect() {
  if (
    (navigator.userAgent.indexOf("iPhone") > 0 &&
      navigator.userAgent.indexOf("iPad") == -1) ||
    navigator.userAgent.indexOf("iPod") > 0 ||
    navigator.userAgent.indexOf("Android") > 0
  ) {
    location.href = "../mobile";
  }
}

function prevent_Overlogin() {
  let lock_screen = document.createElement("div");
  lock_screen.id = "screenLock";

  lock_screen.style.height = "100%";
  lock_screen.style.left = "0px";
  lock_screen.style.position = "fixed";
  lock_screen.style.top = "0px";
  lock_screen.style.width = "100%";
  lock_screen.style.zIndex = "9999";
  lock_screen.style.opacity = "0";

  let objBody = document.getElementsByTagName("body").item(0);
  objBody.appendChild(lock_screen);
}

var userName, userEmail;
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    userName = user.displayName;
    userEmail = user.email;
    var isTeacher;
    var url = "https://api.cla-q.net/detect_role";
    var postData = {
      userEmail: user.email,
      userName: user.displayName,
    };
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://cla-q.net/",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.length != 0) {
          var responseresult = data[Object.keys(data).length - 1];
          console.log(responseresult.status_Code);
          if (responseresult.status_Code == "DR-01") {
            isTeacher = true;
            console.log("user is teacher.");
          } else if (responseresult.status_Code == "DR-02") {
            isTeacher = false;
            console.log("user is not teacher.");
          }
        }
      })
      .catch((error) => { })
      .finally(() => {
        console.log(isTeacher);
        if (isTeacher) {
          window.location.href = "../../teacher/teacher_start";
        } else {
          var userInfoElement = document.querySelector(".user-info");
          userInfoElement.innerHTML =
            "<p>ユーザー名: " +
            user.displayName +
            "</p><p>メールアドレス: " +
            user.email +
            "</p><button id='logout_button' onclick='logOut()'>ログアウト</button>";

          let screenLock = document.querySelector("#screenLock");
          screenLock.parentNode.removeChild(screenLock);
        }
        document.querySelector("#user_Name").innerHTML = user.displayName;
        document.querySelector("#user_Email").innerHTML =
          "(" + user.email + ")";
        document.querySelector("#class_code").innerHTML =
          "参加中のクラス:" + class_Code;

        let screenLock = document.querySelector("#screenLock");
        screenLock.parentNode.removeChild(screenLock);
      });
  } else {
    window.location.href = "/login/index.html";
  }
});

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      prevent_Overlogin();
      Swal.fire({
        html: "<strong>ログアウトしました。</strong><br>ログイン画面に戻ります。",
        title: "情報",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      }).finally((result) => {
        location.reload();
      });
    });
}
