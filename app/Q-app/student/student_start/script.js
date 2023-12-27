function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    student_Join();
  }
}

var userName, userEmail;
async function student_Join() {
  var class_Code = document.getElementById("class-code-input").value;
  var url = "https://api.cla-q.net/student/join";
  var postData = {
    class_Code: class_Code,
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
            console.log("Successfully joined the class");
            prevent_Overlogin();
            document.cookie = "class_Code=" + classinfo.class_Code + "; path=/;";
            Swal.fire({
              title: "成功",
              text: "クラス" + classinfo.class_Code + "に参加しました。",
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
                text: "クラスに参加できませんでした。",
                icon: "error",
              });
            } else {
              Swal.fire({
                title: "エラー",
                text:
                  "クラスに参加できませんでした。\nエラーコード:" + responseresult.status_Code,
                icon: "error",
              });
            }
          }
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "エラー",
          text: "クラスに参加できませんでした。",
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
    document.getElementById("class-code-input").value = class_Code;
  }
  mobileRedirect();
  prevent_Overlogin();
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

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
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

          let screenLock = document.getElementById("screenLock");
          screenLock.parentNode.removeChild(screenLock);
          userName = user.displayName;
          userEmail = user.email;
        }
        document.getElementById("user_Name").innerHTML = user.displayName;
        document.getElementById("user_Email").innerHTML =
          "(" + user.email + ")";
        document.getElementById("class_code").innerHTML =
          "参加中のクラス:" + class_Code;

        let screenLock = document.getElementById("screenLock");
        screenLock.parentNode.removeChild(screenLock);
        userName = user.displayName;
        userEmail = user.email;
      });
  } else {
    window.location.href = "../../login";
  }
});

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      prevent_Overlogin();
      Swal.fire({
        text: "ログアウトしました。ログイン画面に戻ります。",
        title: "情報",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      }).finally((result) => {
        location.reload();
      });
    });
}
