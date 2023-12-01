function handleKeyDown(event) {
  // Enter キーが押された場合に送信処理を行う
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    teacher_Rejoin();
  }
}

async function startClass() {
  var url = "https://beta.api.cla-q.net/teacher/create_class";
  var postData = {
    userEmail: userEmail,
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
        if (data.result == "success") {
          console.log("Successfully created the class");
          prevent_Overlogin();
          document.cookie = "class_Code=" + data.class_Code + ";path=/;";
          Swal.fire({
            text: "クラスを作成しました。クラスコードは" + deta.class_Code + "です。",
            title: "情報",
            icon: "success",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            window.location.href = "../teacher_menu";
          });
        } else {
          Swal.fire({
            text: "クラスを開始できませんでした。(" + data.message + ")",
            title: "エラー",
            icon: "error",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          text: "クラスを開始できませんでした。",
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
  var class_Code = document.getElementById("class-code-input").value;
  if (class_Code == null || class_Code == undefined || class_Code == "") {
    Swal.fire({
      text: "クラスコードが入力されていません。",
      title: "情報",
      icon: "info",
    });
    return;
  }
  var url = "https://beta.api.cla-q.net/teacher/rejoin_class";
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
        Origin: "https://app.cla-q.net/",
        // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        try {
          var result = data[1].result;
          if (result == "success") {
            prevent_Overlogin();
            console.log("Successfully rejoined the class");
            document.cookie = "class_Code=" + class_Code + ";path=/;";
            Swal.fire({
              text: "クラスに再接続しました。",
              title: "情報",
              icon: "success",
              showConfirmButton: false,
              timer: 1500, //3秒経過後に閉じる
            }).then((result) => {
              window.location.href = "../teacher_menu";
            });
          } else {
            Swal.fire({
              text: "接続できませんでした。(" + data[1].message + ")",
              title: "エラー",
              icon: "error",
            });
          }
        } catch (error) {
          try {
            var result2 = data.result;
            if (result2 == "success") {
              console.log("Successfully created the class");
              prevent_Overlogin();
              document.cookie = "class_Code=" + class_Code + ";path=/;";
              Swal.fire({
                text: "クラスに再接続しました。",
                title: "情報",
                icon: "success",
                showConfirmButton: false,
                timer: 1500, //3秒経過後に閉じる
              }).then((result) => {
                window.location.href = "../teacher_menu";
              });
            } else {
              Swal.fire({
                text: "接続できませんでした。(" + data.message + ")",
                title: "エラー",
                icon: "error",
              });
            }
          } catch (error) {
            Swal.fire({
              text: "サーバーエラーです。サポートにお問い合わせください。",
              title: "エラー",
              icon: "error",
            });
          }
        }
        // レスポンスデータの処理
      })
      .catch((error) => {
        Swal.fire({
          text: "ログインできませんでした。",
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
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // ログイン時
    if (user.email.includes("_")) {
      window.location.href = "../student/student_start";
    } else {
      // Update the user information display
      var userInfoElement = document.querySelector(".user-info");
      userInfoElement.innerHTML =
        "<p>ユーザー名: " +
        user.displayName +
        "</p><p>メールアドレス: " +
        user.email +
        "</p><button id='logout_button' onclick='logOut()'>ログアウト</button>";
      //ログイン越え回避解除
      let screenLock = document.getElementById("screenLock");
      screenLock.parentNode.removeChild(screenLock);
      userName = user.displayName;
      userEmail = user.email;
    }
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
