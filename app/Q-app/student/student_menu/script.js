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
                  text: "答えを提出できませんでした。:" + data.status_Code + "",
                  title: "エラー",
                  icon: "error",
                });
              }
            })
            .catch((error) => {
              Swal.fire({
                text: "回答を提出できませんでした。問題が開始されているか確認してください。:" + data.status_Code + "",
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
window.onload = async function () {
  await checkPDFExist();
  const key = "class_Code";
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  class_Code = value;
  if (class_Code == "" || class_Code == undefined) {
    prevent_Overlogin();
    Swal.fire({
      text: "クラス情報が読み込めませんでした。(Code:CSE-01)",
      title: "エラー",
      icon: "error",
      timer: 1500,
    }).then((result) => {
      window.location.href = "../student_start";
    });
  }
  await mobileRedirect();
  await prevent_Overlogin();
  setInterval("showClock()", 1000);
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
    document.getElementById("user_Name").innerHTML = user.displayName;
    document.getElementById("user_Email").innerHTML = "(" + user.email + ")";
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
              console.log(error3);
              Swal.fire({
                text: "クラスを離脱できませんでした。(" + error3 +")",
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
          prevent_Overlogin();
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
              prevent_Overlogin();
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
                text: "クラスを離脱できませんでした。(" + data[0].message + ":" + data[0].status_Code + ")",
                title: "情報",
                icon: "info",
              });
            }
          } else if (result2 != undefined) {
            if (data[1].status_Code == "LE-11") {
              prevent_Overlogin();
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
              prevent_Overlogin();
              Swal.fire({
                text: "クラスが教師によって閉じられています。クラス参加画面に戻ります。:" + data.status_Code + "",
                title: "情報",
                icon: "info",
                showConfirmButton: false,
                timer: 1500, //3秒経過後に閉じる
              }).then((result) => {
                window.location.href = "../student_start";
              });
            } else {
              Swal.fire({
                text: "クラスを離脱できませんでした。(" + data.message + ":" + data.status_Code + ")",
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
          text: "クラスを離脱できませんでした。(" + data.message + ":" + data.status_Code + ")",
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

function showClock() {
  let nowTime = new Date();
  var nowHour = nowTime.getHours();
  var nowMin = nowTime.getMinutes();
  var nowSec = nowTime.getSeconds();
  if (String(nowHour).startsWith("0")) {
    nowHour = Number("0" + String(nowHour));
  }
  if (String(nowMin).startsWith("0")) {
    nowMin = Number("0" + String(nowMin));
  }
  if (String(nowSec).startsWith("0")) {
    nowSec = Number("0" + String(nowSec));
  }
  let msg = "現在時刻：" + nowHour + ":" + nowMin + ":" + nowSec;
  document.getElementById("currentTime").innerHTML = msg;
}

function checkPDFExist() {
  var url = "https://beta.api.cla-q.net/class_info/pdf";
  var postData = {
    class_Code: class_Code,
  };
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
        if (data[1].pdf == "exist") {
          console.log("Successfully fetched pdf info.");
          console.log(
            data[1].message,
            data[0].message,
            data[1].result,
            data[0].result
          );
          Swal.fire({
            title: "成功",
            text: "このクラスにはPDF資料があります。PDFを表示しますか？",
            showDenyButton: true,
            timer: 1500, //3秒経過後に閉じる
            icon: "info",
            confirmButtonText: "はい",
            denyButtonText: "いいえ"
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "./pdf.html";
            }
          });
        }
      } else {
        if (!(data[1].message == "")) {
          Swal.fire({
            title: "エラー",
            text: "サーバーでエラーが発生しました(" + data[1].message + ":" + data[1].status_Code + ")",
            icon: "error",
          });
        }
        else if (!(data[0].message == "")) {
          Swal.fire({
            title: "エラー",
            text: "サーバーでエラーが発生しました(" + data[0].message + ":" + data[0].status_Code + ")",
            icon: "error",
          });
        }
        else{
          Swal.fire({
            title: "エラー",
            text: "サーバーでエラーが発生しました",
            icon: "error",
          });
        }
      }
    })
    .catch((error) => {
      Swal.fire({
        title: "エラー",
        text: "サーバーでエラーが発生しました。",
        icon: "error",
      });
    });
}