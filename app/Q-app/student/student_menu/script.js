async function submitAnswer() {
  // 送信処理のコードを追加
  var answerBox = document.getElementById("answer-box");
  var answer = answerBox.value.trim();

  if (answer !== "") {
    Swal.fire({
      title: "回答を送信しますか？",
      showCancelButton: true,
      confirmButtonText: "送信",
    }).then((result) => {
      if (result.isConfirmed) {
        const key = "class_Code";
        const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
        var class_Code = value;
        // Add your login logic here
        var url = "https://beta.api.cla-q.net/student/submit_answer";
        var postData = {
          class_Code: class_Code,
          userName: userName,
          userEmail: userEmail,
          answer_Value: answer,
        };
        try {
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
              if (data.result == "success" || data[0].result == "success") {
                console.log("Successfully submitted the question");
                Swal.fire({
                  text: "答えを提出しました。(" + answer + ")",
                  title: "情報",
                  icon: "info",
                  toast: true,
                  position: "top-end", //画面右上
                  showConfirmButton: false,
                  timer: 3000, //3秒経過後に閉じる
                });
              } else {
                Swal.fire({
                  text: "答えを提出できませんでした。",
                  title: "エラー",
                  icon: "error",
                });
              }
            })
            .catch((error) => {
              Swal.fire({
                text: "回答を提出できませんでした。問題が開始されているか確認してください。",
                title: "エラー",
                icon: "error",
              });
            });
        } catch (error) {
          console.log("エラー発生。");
          console.log(error);
        }
        // ボックス内をクリア
        answerBox.value = "";
      }
    });
  } else {
    Swal.fire({
      text: "回答を入力してください。",
      title: "エラー",
      icon: "error",
      toast: true,
      position: "top-end", //画面右上
      showConfirmButton: false,
      timer: 3000, //3秒経過後に閉じる
    });
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
  const key = "class_Code";
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  class_Code = value;
  if (class_Code == "" || class_Code == undefined) {
    Swal.fire({
      text: "クラス情報が読み込めませんでした。(Code:CSE-01)",
      title: "エラー",
      icon: "error",
    }).then((result) => {
      window.location.href = "../student_start";
    });
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
    if (user.email.includes("-")) {
      window.location.href = "../../teacher/teacher_start";
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
    window.location.href = "../../login";
  }
});

async function logOut() {
  await leaveClass();
}
//以上firebase

//以下workers
async function leaveClass() {
  // Add your login logic here
  var url = "https://beta.api.cla-q.net/student/leave";
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
              Swal.fire({
                text: "クラスを離脱できませんでした。",
                title: "エラー",
                icon: "error",
              });
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
          Swal.fire({
            text: "クラスを離脱しました。クラス参加画面に戻ります。",
            title: "情報",
            icon: "info",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            document.cookie = "class_Code=; path=/;";
            window.location.href = "../student_start";
          });
        } else {
          console.log("データエラー。successが返されなかった。");
          if (result1 != undefined) {
            if (data[0].status_Code == "LE-11") {
              Swal.fire({
                text: "クラスが教師によって閉じられています。クラス参加画面に戻ります。",
                title: "情報",
                icon: "info",
                showConfirmButton: false,
                timer: 1500, //3秒経過後に閉じる
              }).then((result) => {
                window.location.href = "../student_start";
              });
            } else {
              Swal.fire({
                text: "クラスを離脱できませんでした。(" + data[0].message + ")",
                title: "情報",
                icon: "info",
              });
            }
          } else if (result2 != undefined) {
            if (data[1].status_Code == "LE-11") {
              Swal.fire({
                text: "クラスが教師によって閉じられています。クラス参加画面に戻ります。",
                title: "情報",
                icon: "info",
                showConfirmButton: false,
                timer: 1500, //3秒経過後に閉じる
              }).then((result) => {
                window.location.href = "../student_start";
              });
            } else {
              Swal.fire({
                text: "クラスを離脱できませんでした。(" + data[1].message + ")",
                title: "エラー",
                icon: "error",
              });
            }
          } else {
            if (data.status_Code == "LE-11") {
              Swal.fire({
                text: "クラスが教師によって閉じられています。クラス参加画面に戻ります。",
                title: "情報",
                icon: "info",
                showConfirmButton: false,
                timer: 1500, //3秒経過後に閉じる
              }).then((result) => {
                window.location.href = "../student_start";
              });
            } else {
              Swal.fire({
                text: "クラスを離脱できませんでした。(" + data.message + ")",
                title: "エラー",
                icon: "error",
              });
            }
          }
        }
      })
      .catch((error) => {
        console.log("不明なエラー1。", error);
        Swal.fire({
          text: "クラスを離脱できませんでした。(" + data.message + ")",
          title: "不明なエラー",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("不明なエラー2。", error);
    Swal.fire({
      text: "クラスを離脱できませんでした。",
      title: "不明なエラー",
      icon: "error",
    });
  }
}

