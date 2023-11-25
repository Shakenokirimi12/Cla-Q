async function submitAnswer() {
  // 送信処理のコードを追加
  var answerBox = document.getElementById("answer-box");
  var answer = answerBox.value.trim();

  if (answer !== "") {
    var confirmation = confirm("本当に答えを送信しますか？");

    if (confirmation) {
      const key = "class_Code";
      const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
      var class_Code = value;
      // Add your login logic here
      var url = "https://api.cla-q.net/student/submit_answer";
      var postData = {
        class_Code: class_Code,
        userName: userName,
        userEmail: userEmail,
        answer_Value: answer,
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
            if (data.result == "success" || data[0].result == "success") {
              console.log("Successfully submitted the question");
              alert("答えが送信されました: " + answer);
            } else {
              alert("回答を提出できませんでした" + data.message);
            }
          })
          .catch((error) => {
            alert(
              "回答を提出できませんでした。問題が開始されているか確認してください。"
            );
          });
      } catch (error) {
        console.log("エラー発生。");
        console.log(error);
      }
      // ボックス内をクリア
      answerBox.value = "";
    }
  } else {
    alert("答えを入力してください。");
  }
}

function handleKeyDown(event) {
  // Enter キーが押された場合に送信処理を行う
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitAnswer();
  }
}

var class_Code;
window.onload = function () {
  console.log(document.cookie)
  const key = "class_Code";
  /// 正規表現でcookie値を取得
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  class_Code = value;
  if (class_Code == "" || class_Code == undefined) {
    window.location.href = "/student/student_start";
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
    location.href = "/mobile.html";
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
    if (user.email.includes("-")) {
      window.location.href = "/teacher/teacher_start";
    }
    // ログイン時
    // Update the user information display
    document.getElementById("mail_address").innerHTML =
      "メールアドレス:" + user.email;
    document.getElementById("user_name").innerHTML = user.displayName;
    document.getElementById("class_code").innerHTML =
      "参加中のクラス:" + class_Code;

    let screenLock = document.getElementById("screenLock");
    screenLock.parentNode.removeChild(screenLock);
    userName = user.displayName;
    userEmail = user.email;
  } else {
    // 未ログイン時
    window.location.href = "/login";
  }
});

async function logOut() {
  await leaveClass();
}
//以上firebase

//以下workers
async function leaveClass() {
  // Add your login logic here
  var url = "https://api.cla-q.net/student/leave";
  var postData = {
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
        try {
          var result1 = data[0].result;
        } catch (error) {
          console.log(error);
          try {
            var result2 = data[1].result;
          } catch (error2) {
            console.log(error2);
            try {
              var result3 = data.result;
            } catch (error3) {
              console.log(error2);
              alert("クラスを離脱できませんでした。");
              return;
            }
          }
        }
        if (
          result1 == "success" ||
          result2 == "success" ||
          result3 == "success"
        ) {
          console.log("Successfully leaved the class");
          alert("クラスを離脱しました。クラス参加画面に戻ります。");
          document.cookie = "class_Code=" + "";
          window.location.href = "/student/student_start";
        } else {
          console.log("データエラー。successが返されなかった。");
          if (result1 != undefined) {
            if (data[0].status_Code == "LE-11") {
              alert("クラスが教師によって閉じられています。");
              window.location.href = "/student/student_start";
            } else {
              alert("クラスを離脱できませんでした。:" + data.message);
            }
          } else if (result2 != undefined) {
            if (data[1].status_Code == "LE-11") {
              alert("クラスが教師によって閉じられています。");
              window.location.href = "/student/student_start";
            } else {
              alert("クラスを離脱できませんでした。:" + data.message);
            }
          } else {
            if (data.status_Code == "LE-11") {
              alert("クラスが教師によって閉じられています。");
              window.location.href = "/student/student_start";
            } else {
              alert("クラスを離脱できませんでした。:" + data.message);
            }
          }
        }
      })
      .catch((error) => {
        console.log("不明なエラー1。", error);
        alert("クラスを離脱できませんでした。");
      });
  } catch (error) {
    console.log("不明なエラー2。", error);
    alert("クラスを離脱できませんでした。");
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../../serviceworker.js")
    .then((registration) => {
      // 登録成功
      registration.onupdatefound = function () {
        console.log("アップデートがあります！");
        registration.update();
      };
    })
    .catch((err) => {
      // 登録失敗
    });
}
