async function submitAnswer() {
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
        var url = "https://api.cla-q.net/student/submit_answer";
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
                    text: "答えを提出しました。(" + answer + ")",
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
                  Swal.fire({
                    text:
                      "答えを提出できませんでした。:" + responseresult.status_Code + "",
                    title: "エラー",
                    icon: "error",
                  });
                }
              } else {
                Swal.fire({
                  text:
                    "回答を提出できませんでした。問題が開始されているか確認してください。:" +
                    error,
                  title: "エラー",
                  icon: "error",
                });
              }
            })
            .catch((error) => {
              Swal.fire({
                text:
                  "回答を提出できませんでした。再度試してみてください。",
                title: "エラー",
                icon: "error",
              });
            });
        } catch (error) {
          console.log("エラー発生。");
          console.log(error);
        }
      }
    });
  } else {
    Swal.fire({
      text: "回答を入力してください。",
      title: "エラー",
      icon: "error",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
    });
  }
}

function handleKeyDown(event) {
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
  await checkPDFExistance();
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
        var responseresult = data[Object.keys(data).length - 1];
        console.log(responseresult.status_Code);
        if (responseresult.status_Code == "DR-01") {
          isTeacher = true;
          console.log("user is teacher.");
        } else if (responseresult.status_Code == "DR-02") {
          isTeacher = false;
          console.log("user is not teacher.");
        }
        return isTeacher;
      })
      .catch((error) => { })
      .finally(() => {
        console.log(isTeacher);
        if (isTeacher) {
          window.location.href = "../../teacher/teacher_start";
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

async function logOut() {
  await leaveClass();
}

async function leaveClass() {
  var url = "https://api.cla-q.net/student/leave";
  var postData = {
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
        var responseresult = data[Object.keys(data).length - 1];
        if (responseresult.result == "success") {
          console.log("Successfully leaved the class");
          prevent_Overlogin();
          Swal.fire({
            text: "クラスを離脱しました。クラス参加画面に戻ります。",
            title: "情報",
            icon: "info",
            showConfirmButton: false,
            timer: 1500,
          }).then((result) => {
            document.cookie = "class_Code=; path=/;";
            window.location.href = "../student_start";
          });
        } else {
          console.log("データエラー。successが返されなかった。");
          if (responseresult.status_Code == "LE-11") {
            prevent_Overlogin();
            Swal.fire({
              text:
                "クラスが教師によって閉じられています。クラス参加画面に戻ります。:" +
                responseresult.status_Code +
                "",
              title: "情報",
              icon: "info",
              showConfirmButton: false,
              timer: 1500,
            }).then((result) => {
              window.location.href = "../student_start";
            });
          } else {
            Swal.fire({
              text:
                "クラスを離脱できませんでした。(" +
                responseresult.message +
                ":" +
                responseresult.status_Code +
                ")",
              title: "エラー",
              icon: "error",
            });
          }
        }
      })
      .catch((error) => {
        console.log("不明なエラー1。", error);
        Swal.fire({
          text: "クラスを離脱できませんでした。\n予期しないエラーが発生しました。\nエラーコード:CSE-02",
          title: "不明なエラー",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("不明なエラー2。", error);
    Swal.fire({
      text: "クラスを離脱できませんでした。\nAPIへの接続または応答に失敗しました。\nエラーコード:CSE-03\n" + error,
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
/*
async function checkPDFExistance() {
  var url = "https://api.cla-q.net/class_info/pdf";
  var postData = {
    class_Code: class_Code,
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
      var responseresult = data[Object.keys(data).length - 1];
      if (responseresult.result == "success") {
        if (responseresult.pdf == "true") {
          console.log("Successfully fetched pdf info.");
          Swal.fire({
            title: "PDFを表示しますか？",
            text: "このクラスにはPDF資料があります。PDFを表示しますか？",
            showDenyButton: true,
            timer: 1500,
            icon: "info",
            confirmButtonText: "はい",
            denyButtonText: "いいえ",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "./pdf";
            }
          });
        }
      } else {
        Swal.fire({
          title: "エラー",
          text: "サーバーでエラーが発生しました。\nPDF存在チェックに失敗しました。",
          icon: "error",
        });
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
*/