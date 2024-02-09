async function submitAnswer() {
  var answerBox = document.querySelector("#answer-box");
  var answer = answerBox.value.trim();
  if (answer !== "") {
    Swal.fire({
      title: "回答を送信しますか？",
      showCancelButton: true,
      confirmButtontext: "送信",
    }).then((result) => {
      if (result.isConfirmed) {
        const key = "class_Code";
        const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
        var class_Code = value;
        // Add your login logic here
        var url = "https://student.api.cla-q.net/submit_answer";
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
              Origin: "https://cla-q.net/",
              // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
            },
            body: JSON.stringify(postData),
          })
            .then((response) => response.json())
            .then((data) => {
              if (Object.keys(data).length != 0) {
                var responseresult = data[Object.keys(data).length - 1];
                if (responseresult.result == "success") {
                  console.log("Successfully submitted the question");
                  Swal.fire({
                    html: "<strong>答えを提出しました。</strong>(" + answer + ")",
                    title: "情報",
                    icon: "info",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                  }).finally(() => {
                    answerBox.value = "";
                  });
                } else {
                  if (responseresult.status_Code == "SSE-11") {
                    Swal.fire({
                      html:
                        "<strong>答えを提出できませんでした。</strong><br>問題が開始されていません。<br>先生の指示を待ってください。<br>エラーコード:" +
                        responseresult.status_Code,
                      title: "エラー",
                      icon: "error",
                    });
                  } else if (responseresult.status_Code == "SSE-12") {
                    Swal.fire({
                      html:
                        "<strong>答えを提出できませんでした。</strong><br>答えを提出済みの可能性があります。<br>エラーコード:" +
                        responseresult.status_Code,
                      title: "エラー",
                      icon: "error",
                    });
                  } else if (responseresult.status_Code == "SSE-01") {
                    Swal.fire({
                      html:
                        "<strong>答えを提出できませんでした。</strong><br>サーバーエラーです。<br>サポートへご確認ください。<br>エラーコード:" +
                        responseresult.status_Code,
                      title: "エラー",
                      icon: "error",
                    });
                  } else {
                    Swal.fire({
                      html:
                        "<strong>答えを提出できませんでした。</strong><br>不明なエラーです。<br>エラーコード:" +
                        responseresult.status_Code +
                        "<br>" +
                        responseresult.message,
                      title: "エラー",
                      icon: "error",
                    });
                  }
                }
              } else {
                Swal.fire({
                  html:
                    "<strong>回答を提出できませんでした。</strong><br>クライアントでエラーが発生しました。<br>" +
                    error,
                  title: "エラー",
                  icon: "error",
                });
              }
            })
            .catch((error) => {
              Swal.fire({
                html:
                  "<strong>回答を提出できませんでした。</strong><br>再度試してみてください。<br>" +
                  error,
                title: "エラー",
                icon: "error",
              });
            });
        } catch (error) {
          console.log("エラー発生。");
          console.log(error);
        }
        // ボックス内をクリア
      }
    });
  } else {
    Swal.fire({
      html: "<strong>回答を入力してください。</strong>",
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
  const key = "class_Code";
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  class_Code = value;
  if (class_Code == "" || class_Code == undefined) {
    prevent_Overlogin();
    Swal.fire({
      html: "<strong>クラス情報が読み込めませんでした。</strong><br>(Code:CSE-01)",
      title: "エラー",
      icon: "error",
      timer: 1500,
    }).then((result) => {
      window.location.href = "../../student_start";
    });
  }
  await mobileRedirect();
  await prevent_Overlogin();
  await checkIsAIAllowed();
  setInterval("showClock()", 1000);
  setInterval("checkIsAIAllowed()", 10000);
};

function mobileRedirect() {
  if (
    (navigator.userAgent.indexOf("iPhone") > 0 &&
      navigator.userAgent.indexOf("iPad") == -1) ||
    navigator.userAgent.indexOf("iPod") > 0 ||
    navigator.userAgent.indexOf("Android") > 0
  ) {
    location.href = "../../../mobile.html";
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
    var isTeacher; //boolean
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
        Origin: "https://cla-q.net/",
        // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        var responseresult = data[Object.keys(data).length - 1];
        console.log(responseresult.status_Code);
        if (responseresult.status_Code == "DR-01") {
          isTeacher = true;
          console.log("user is teacher.");
        } else if (responseresult.status_Code == "DR-02") {
          isTeacher = false;
          console.log("user is not teacher.");
        }
      })
      .catch((error) => { })
      .finally(() => {
        console.log(isTeacher);
        if (isTeacher) {
          window.location.href = "../../../teacher/teacher_start";
        }
        // ログイン時
        // Update the user information display
        document.querySelector("#user_Name").innerHTML = user.displayName;
        document.querySelector("#user_Email").innerHTML =
          "(" + user.email + ")";
        document.querySelector("#class_code").innerHTML =
          "参加中のクラス:" + class_Code;

        let screenLock = document.querySelector("#screenLock");
        screenLock.parentNode.removeChild(screenLock);
        userName = user.displayName;
        userEmail = user.email;
      });
    //教師か検知
  } else {
    // 未ログイン時
    window.location.href = "../../../login";
  }
});

async function logOut() {
  await leaveClass();
}
//以上firebase

//以下workers
async function leaveClass() {
  // Add your login logic here
  var url = "https://student.api.cla-q.net/leave";
  var postData = {
    userName: userName,
    userEmail: userEmail,
  };
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://cla-q.net/",
        // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        var responseresult = data[Object.keys(data).length - 1]; //レスポン状況ノードを抽出
        if (responseresult.result == "success") {
          //レスポン成功
          console.log("Successfully leaved the class");
          prevent_Overlogin();
          Swal.fire({
            html: "<strong>クラスを離脱しました。</strong><br>クラス参加画面に戻ります。",
            title: "情報",
            icon: "info",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            document.cookie = "class_Code=; path=/;";
            window.location.href = "../../student_start";
          });
        } else {
          //レスポン失敗
          console.log("データエラー。successが返されなかった。");
          if (responseresult.status_Code == "LE-11") {
            //教師がクラスを閉じていた時
            prevent_Overlogin();
            Swal.fire({
              html:
                "<strong>クラスが教師によって閉じられています。</strong><br>クラス参加画面に戻ります。:" +
                responseresult.status_Code +
                "",
              title: "情報",
              icon: "info",
              showConfirmButton: false,
              timer: 1500, //3秒経過後に閉じる
            }).then((result) => {
              window.location.href = "../../student_start";
            });
          } else {
            Swal.fire({
              html:
                "<strong>クラスを離脱できませんでした。</strong><br>エラーコード:" +
                responseresult.message +
                "<br>" +
                responseresult.status_Code,
              title: "エラー",
              icon: "error",
            });
          }
        }
      })
      .catch((error) => {
        console.log("不明なエラー1。", error);
        Swal.fire({
          html: "<strong>クラスを離脱できませんでした。</strong><br>予期しないエラーが発生しました。<br>エラーコード:CSE-02",
          title: "不明なエラー",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("不明なエラー2。", error);
    Swal.fire({
      html:
        "<strong>クラスを離脱できませんでした。</strong><br>APIへの接続または応答に失敗しました。<br>エラーコード:CSE-03<br>" +
        error,
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
  document.querySelector("#currentTime").innerHTML = msg;
}

async function checkIsAIAllowed() {
  var url = "https://student.api.cla-q.net/Class_Setitngs";
  var postData = {
    class_Code: class_Code,
  };
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://cla-q.net/",
      // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      //ファイル名を抽出
      var responseresult = data[Object.keys(data).length - 1]; //レスポン状況ノードを抽出
      var classSetting = data[0];
      if (classSetting.AIOption == "gemini-pro") {
        var chatzone = document.querySelector("#chatzone");
        chatzone.src = "https://app.cla-q.net/app/ChatAI/gemini-pro";
      }
      else if (classSetting.AIOption == "meta-llama") {
        var chatzone = document.querySelector("#chatzone");
        chatzone.src = "https://app.cla-q.net/app/ChatAI/meta-llama";
      }
      else {
        Swal.fire({
          html: "<strong>このクラスではChatAIが有効ではありません。</strong><br>通常の解答画面に戻ります。",
          icon: "info",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "../";
          }
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        title: "エラー",
        html: "<strong>サーバーでエラーが発生しました。</strong><br>" + error,
        icon: "error",
      });
    });
}
