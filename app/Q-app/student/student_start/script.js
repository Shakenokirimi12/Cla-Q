function handleKeyDown(event) {
  // Enter キーが押された場合に送信処理を行う
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    student_Join();
  }
}

var userName, userEmail;
async function student_Join() {
  var class_Code = document.getElementById("class-code-input").value;
  // Add your login logic here
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
        Origin: "https://app.cla-q.net/",
        // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        // レスポンスデータの処理
        console.log(
          data[1].message,
          data[0].message,
          data[1].result,
          data[0].result
        );
        if (data[1].result == "success" || data[0].result == "success") {
          console.log("Successfully joined the class");
          console.log(
            data[1].message,
            data[0].message,
            data[1].result,
            data[0].result
          );
          prevent_Overlogin();
          document.cookie = "class_Code=" + data[0].class_Code + "; path=/;";
          Swal.fire({
            title: "成功",
            text: "クラス" + data[0].class_Code + "に参加しました。",
            icon: "success",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            window.location.href = "../student_menu";
          });
        } else {
          Swal.fire({
            title: "エラー",
            text: "ログインできませんでした。エラーコード:" + data[0].status_Code,
            icon: "error",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "エラー",
          text: "ログインできませんでした。",
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

//以下firebase auth
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    var isTeacher; //boolean
    // ログイン時
    //教師か検知
    var url = "https://api.cla-q.net/detect_role";
    var postData = {
      userEmail: user.email,
      userName: user.displayName,
    };
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://app.cla-q.net/",
        // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.status_Code);
        if (data.status_Code == "DR-01") {
          isTeacher = true;
          console.log("user is teacher.")
        } else if (data.status_Code == "DR-02") {
          isTeacher = false;
          console.log("user is not teacher.")
        }
        return isTeacher;
      })
      .catch((error) => { })
      .finally(() => {
        console.log(isTeacher);
        if (isTeacher) {
          window.location.href = "../../teacher/teacher_start";
        }
        else {
          // Update the user information display
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
        // ログイン時
        // Update the user information display
        document.getElementById("user_Name").innerHTML = user.displayName;
        document.getElementById("user_Email").innerHTML = "(" + user.email + ")";
        document.getElementById("class_code").innerHTML =
          "参加中のクラス:" + class_Code;

        let screenLock = document.getElementById("screenLock");
        screenLock.parentNode.removeChild(screenLock);
        userName = user.displayName;
        userEmail = user.email;
      });
  } else {
    // 未ログイン時
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
        timer: 1500, //3秒経過後に閉じる
      }).then((result) => {
        location.reload();
      });
    });
}
//以上firebase auth

