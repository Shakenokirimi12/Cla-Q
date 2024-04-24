function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    teacher_Rejoin();
  }
}

async function startClass() {
  var url = "https://api.cla-q.net/v2/teacher/create_class";
  var postData = {
    userEmail: userEmail,
    userName: userName,
  };
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
          if (responseresult.result == "success") {
            console.log("Successfully created the class.");
            prevent_Overlogin();
            document.cookie = "class_Code=" + responseresult.class_Code + ";path=/;";
            Swal.fire({
              html:
                "<strong>クラスを作成しました。</strong><br>クラスコードは" +
                responseresult.class_Code +
                "です。",
              title: "情報",
              icon: "success",
              showConfirmButton: false,
              timer: 1500, 
            }).then((result) => {
              window.location.href = "../teacher_menu";
            });
          } else {
            Swal.fire({
              html: "<strong>クラスを開始できませんでした。</strong><br>(" + responseresult.message + responseresult.status_Code + ")",
              title: "エラー",
              icon: "error",
            });
          }
        }
        else {
          Swal.fire({
            html: "<strong>接続できませんでした。</strong><br>サーバーから無効な応答が返されました。",
            title: "エラー",
            icon: "error",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          html: "<strong>クラスを開始できませんでした。</strong><br>(" + error + ")",
          title: "エラー",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("エラー発生。");
    console.log(error);
  }
}

async function teacher_Rejoin() {
  var class_Code = document.querySelector("#class-code-input").value;
  if (class_Code == null || class_Code == undefined || class_Code == "") {
    Swal.fire({
      html: "<strong>クラスコードが入力されていません。</strong>",
      title: "情報",
      icon: "info",
    });
    return;
  }
  var url = "https://api.cla-q.net/v2/teacher/rejoin_class";
  var postData = {
    class_Code: class_Code,
    userEmail: userEmail,
    userName: userName,
  };
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
            prevent_Overlogin();
            console.log("Successfully rejoined the class");
            document.cookie = "class_Code=" + classinfo.class_Code + ";path=/;";
            Swal.fire({
              html: "<strong>クラスに再接続しました。</strong>",
              title: "情報",
              icon: "success",
              showConfirmButton: false,
              timer: 1500, 
            }).then((result) => {
              window.location.href = "../teacher_menu";
            });
          } else {
            Swal.fire({
              html: "<strong>接続できませんでした。</strong><br>" + responseresult.message + "(" + responseresult.status_Code + ")",
              title: "エラー",
              icon: "error",
            });
          }
        }
        else {
          Swal.fire({
            html: "<strong>接続できませんでした。</strong><br>サーバーから無効な応答が返されました。",
            title: "エラー",
            icon: "error",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          html: "<strong>クラスに再接続できませんでした。</strong><br>" + error,
          title: "エラー",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("エラー発生。");
    console.log(error);
  }
}

window.onload = function () {
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
    location.href = "../../mobile";
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
firebase.auth().onAuthStateChanged(async function (user) {
  var isStudent;
  if (user) {
    var url = "https://api.cla-q.net/detect_role";
    var postData = {
      userEmail: user.email,
      userName: user.displayName,
    };
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
          console.log(responseresult.status_Code);
          if (responseresult.status_Code == "DR-01") {
            isStudent = false;
            console.log("user is not student.")
          } else if (responseresult.status_Code == "DR-02") {
            isStudent = true;
            console.log("user is student.")
          }
        }
      })
      .catch((error) => { })
      .finally(() => {
        if (isStudent) {
          window.location.href = "../../student/student_join";
        } else {
          var userInfoElement = document.querySelector(".user-info");
          userInfoElement.innerHTML =
            "<p>" +
            user.displayName +
            "</p><p>" +
            user.email +
            "</p><button id='logout_button' onclick='logOut()'>ログアウト</button>";
          let screenLock = document.querySelector("#screenLock");
          screenLock.parentNode.removeChild(screenLock);
          userName = user.displayName;
          userEmail = user.email;
        }
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
      }).then((result) => {
        document.cookie = "class_Code=; path=/;";
        location.reload();
      });
    });
}

