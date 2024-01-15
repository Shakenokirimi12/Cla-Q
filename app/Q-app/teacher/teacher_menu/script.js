function showExpandedCode() {
  window.open("./class_invite.html", "_blank");
}

async function sendToGAS() {
  const key = "class_Code";
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  var class_Code = value;
  Swal.fire({
    title: "通知",
    html: "エクスポートを開始しました。<br>完了すると新しいタブでスプレッドシートが開きます。",
    icon: "info",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
  });
  var url =
    "https://script.google.com/macros/s/AKfycbxGJTMf6kqWsODNhUNYB_QqdENHl28b-y_Y32n5_RijVivPDAQM5Lde7SSJYyOOHGd7/exec";
  var postData = {
    class_Code: class_Code,
    userEmail: userEmail,
  };
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
        window.open(res.url, "_blank");
      })
      .catch((error) => {
        console.log(error);
        Swal.fire({
          title: "エラー",
          html: "共有リンクを取得できませんでした。<br>エラー内容:" + error,
          icon: "error",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  } catch (error) {
    console.log("エラー発生。");
    console.log(error);
  }
}
async function startQuestion() {
  const key = "class_Code";
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  var class_Code = value;
  var url = "https://api.cla-q.net/teacher/start_question";
  var postData = {
    class_Code: class_Code,
    userName: userName,
    userEmail: userEmail,
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
          console.log(responseresult.question_Number);
          if (responseresult.result == "success") {
            console.log("Successfully started the question");
            console.log(responseresult.question_Number);
            var questionnumber = responseresult.question_Number;
            document.getElementById("status").innerHTML =
              "現在:" + questionnumber + "問目実施中";
            var select = document.getElementById("problemSelector");
            if (select.options.length === 0) {
              if (questionnumber !== 1) {
                for (var i = 1; i <= questionnumber; i++) {
                  var option = document.createElement("option");
                  option.value = i;
                  option.text = "第" + i + "問";
                  select.appendChild(option);
                }
              } else {
                var option = document.createElement("option");
                option.value = 1;
                option.text = "第1問";
                select.appendChild(option);
              }
            } else {
              var option = document.createElement("option");
              option.value = questionnumber;
              option.text = "第" + questionnumber + "問";
              select.appendChild(option);
            }
            document.getElementById("problemSelector").value = questionnumber;
            Swal.fire({
              html: "問題を開始しました。現在" + questionnumber + "問目です。",
              title: "成功",
              icon: "success",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 1000,
            });
          } else {
            console.log(responseresult.result);
            Swal.fire({
              html: "問題を開始できませんでした。<br>エラーコード:" + responseresult.status_Code + "<br>" + responseresult.message,
              title: "エラー",
              icon: "error",
            });
          }
        }
      })
      .catch((error) => {
        Swal.fire({
          html: "問題を開始できませんでした。<br>(" + error + ")",
          title: "エラー",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("エラー発生。");
    console.log(error);
  }
}

async function endQuestion() {
  const key = "class_Code";
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  var class_Code = value;
  var url = "https://api.cla-q.net/teacher/end_question";
  var postData = {
    class_Code: class_Code,
    userName: userName,
    userEmail: userEmail,
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
            console.log("Successfully ended the question");
            document.getElementById("status").innerHTML = "現在:問題開始待ち";
            Swal.fire({
              html: "問題を終了しました。",
              title: "成功",
              icon: "success",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 1000,
            });
          } else {
            Swal.fire({
              html: "問題を終了できませんでした。<br>" + "エラーコード:" + responseresult.status_Code + "<br>" + responseresult.message,
              title: "エラー",
              icon: "error",
            });
          }

        }
      })
      .catch((error) => {
        console.log(error);
        Swal.fire({
          html: "問題を終了できませんでした。<br>エラー内容:" + error,
          title: "エラー",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("エラー発生。");
    console.log(error);
  }
}

window.onload = async function () {
  const key = "class_Code";
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  class_Code = value;
  Swal.fire({
    title:"お知らせ",
    html: "PDFの閲覧機能を実装しました。<br>ただし、<strong>日本語のファイル名には対応していません。</strong><br>アップロードする際には、ファイル名に日本語を含めないでください。",
    icon: "info",
  }).then((result) => {
    if (class_Code == "" || class_Code == undefined) {

      Swal.fire({
        html: "クラス情報が読み込めませんでした。(Code:CTE-01)",
        title: "エラー",
        icon: "error",
        timer: 1500,
      }).then((result) => {
        window.location.href = "../teacher_start";
      });
    }
    await redirectMobile();
    await preventOverLogin();
    setInterval("showClock()", 1000);  
  });
};

async function executeEveryTwoSeconds() {
  while (true) {
    await getStudentsList();
    await getAnswersList();
    console.log("処理を実行しました。");
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }
}

async function getStudentsList() {
  console.log("生徒一覧を取得しています。");
  var url = "https://api.cla-q.net/teacher/get_StudentsList";
  var postData = {
    userEmail: userEmail,
    userName: userName,
    class_Code: class_Code,
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
        if (data != undefined) {
          var tableBody = document.getElementById("studentsTableBody");
          tableBody.innerHTML = "";
          data.forEach(function (item) {
            var connectedTime = new Date(item.connected_Time * 1000);
            var newRow = document.createElement("tr");
            var connectedTimeCell = document.createElement("td");
            connectedTimeCell.textContent = connectedTime.toLocaleString();
            newRow.appendChild(connectedTimeCell);
            var nameCell = document.createElement("td");
            nameCell.textContent = item.connected_User_Name;
            newRow.appendChild(nameCell);
            tableBody.appendChild(newRow);
          });
          document.getElementById("student_count").innerHTML =
            "生徒" + data.length + "人接続済み";
          Swal.fire({
            html: "生徒接続情報が更新されました。",
            title: "情報",
            icon: "info",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            html:
              "生徒一覧を取得できませんでした。<br>サーバーから無効な応答が返されました。",
            title: "エラー",
            icon: "error",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      })
      .catch((error) => {
        console.log("生徒一覧を取得できませんでした。", error);
      });
  } catch (error) {
    console.log("エラー発生。");
    console.log(error);
  }
}

async function getAnswersList() {
  var comboBox = document.getElementById("problemSelector");
  var selectedIndex = String(comboBox.selectedIndex + 1);
  console.log("答え一覧を取得しています。");
  var url = "https://api.cla-q.net/teacher/get_AnswersList";
  var postData = {
    userEmail: userEmail,
    userName: userName,
    class_Code: class_Code,
    question_Number: selectedIndex,
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
        if (data != undefined) {
          var tableBody = document.getElementById("answersTableBody");
          tableBody.innerHTML = "";
          data.forEach(function (item) {
            var newRow = document.createElement("tr");
            var nameCell = document.createElement("td");
            nameCell.textContent = item.submitted_User_Name;
            newRow.appendChild(nameCell);
            var connectedTimeCell = document.createElement("td");
            connectedTimeCell.textContent = item.answer_Value;
            newRow.appendChild(connectedTimeCell);
            tableBody.appendChild(newRow);
          });
        } else {
          Swal.fire({
            html:
              "答えの一覧を取得できませんでした。<br>サーバーから無効な応答が返されました。",
            title: "エラー",
            icon: "error",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      })
      .catch((error) => {
        console.log("生徒一覧を取得できませんでした。");
      });
  } catch (error) {
    console.log("APIアクセス中にエラー発生。");
    console.log(error);
  }
}

function redirectMobile() {
  if (
    (navigator.userAgent.indexOf("iPhone") > 0 &&
      navigator.userAgent.indexOf("iPad") == -1) ||
    navigator.userAgent.indexOf("iPod") > 0 ||
    navigator.userAgent.indexOf("Android") > 0
  ) {
    location.href = "../../mobile";
  }
}

function preventOverLogin() {
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
  if (user) {
    var isStudent;
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
          window.location.href = "../../student/student_start";
        }
        document.getElementById("user_info").innerHTML =
          user.displayName + "(" + user.email + ")";
        document.getElementById("class_code").innerHTML =
          "クラスコード:" + class_Code;
        let screenLock = document.getElementById("screenLock");
        screenLock.parentNode.removeChild(screenLock);
        userName = user.displayName;
        userEmail = user.email;
      });
    await getClassInfo();
    executeEveryTwoSeconds();
  } else {
    window.location.href = "../../login";
  }
});

async function disposeClass() {
  Swal.fire({
    title:
      "続行しますか？",
    icon: "warning",
    html:"クラスを終了すると、クラスが無効になり、<br>先生、生徒全員が再入室できなくなります。<br>続行しますか？",
    showCancelButton: true,
    confirmButtontext: "続行",
  }).then((result) => {
    if (result.isConfirmed) {
      var url = "https://api.cla-q.net/teacher/inactivate_class";
      var postData = {
        class_Code: class_Code,
        userEmail: userEmail,
        userName: userName,
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
            try {
              if (data != undefined && data.length != 0) {
                var responseresult = data[Object.keys(data).length - 1];
                if (responseresult.result == "success") {
                  console.log("Successfully deleted the class");
                  document.cookie = "class_Code=; path=/;";
                  Swal.fire({
                    html: "クラスを閉じました。<br>クラス参加画面に戻ります。",
                    title: "情報",
                    icon: "info",
                    showConfirmButton: false,
                    timer: 1500,
                  }).then((result) => {
                    window.location.href = "../teacher_start";
                  });
                }
                else if (responseresult.status_Code == "IAE-13") {
                  Swal.fire({
                    html: "クラスはすでに閉じられています。<br>クラス参加画面に戻ります。",
                    title: "情報",
                    icon: "info",
                    showConfirmButton: false,
                    timer: 1500,
                  }).then((result) => {
                    window.location.href = "../teacher_start";
                  });
                } else {
                  Swal.fire({
                    html: "クラスを終了できませんでした",
                    title: "エラー",
                    icon: "error",
                  });
                }
              }
            } catch (error) {
              console.log("レスポンス解析中にエラー発生。<br>レスポンスは以下です。")
              console.log(data)
            }
          })
          .catch((error) => {
            Swal.fire({
              html: "ログインできませんでした。",
              title: "エラー",
              icon: "error",
            });
          });
      } catch (error) {
        console.log("APIアクセス中にエラー発生。");
        console.log(error);
      }
    }
  });
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

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  fetch("https://pdf.api.cla-q.net/" + class_Code + "-" + file.name, {
    method: "POST",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": file.type,
    },
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => {
      if (data != undefined && data.length != 0) {
        var responseresult = data[Object.keys(data).length - 1];
        if (responseresult.result == "success") {
          Swal.fire({
            text: "ファイルを共有しました。",
            title: "情報",
            icon: "info",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
      else {
        Swal.fire({
          text: "ファイルを共有できませんでした。",
          title: "失敗",
          icon: "error",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
        })
          .then((result) => {
          })
          .catch((error) => {
            console.error(error);
          });
      }
      Swal.fire({
        html: "ファイルを共有しました。",
        title: "成功",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      })
        .then((result) => {
          document.getElementById("filePicker").value = "";
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
      Swal.fire({
        html: "ファイルが選択されていません。",
        title: "エラー",
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1000,
      });
    });
}


function logOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      preventOverlogin();
      Swal.fire({
        html: "ログアウトしました。ログイン画面に戻ります。",
        title: "情報",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      }).then((result) => {
        location.reload();
      });
    });
}

async function getClassInfo() {
  const key = "class_Code";
  const value = document.cookie.match(new RegExp(key + "=([^;]*);*"))[1];
  var class_Code = value;
  var url = "https://api.cla-q.net/teacher/class_info";
  var postData = {
    class_Code: class_Code,
    userEmail: userEmail,
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
        try {
          if (data != undefined && data.length != 0) {
            var responseresult = data[Object.keys(data).length - 1];
            var classinfo = data[0];
            if (responseresult.result == "success") {
              console.log(classinfo)
              var select = document.getElementById("problemSelector");
              if (classinfo.latest_Question_Number == "0") {
                document.getElementById("status").innerHTML = "現在:問題開始待ち";
              }
              else {
                if (classinfo.latest_Question_Number !== 1) {
                  for (var i = 1; i <= classinfo.latest_Question_Number; i++) {
                    var option = document.createElement("option");
                    option.value = i;
                    option.text = "第" + i + "問";
                    select.appendChild(option);
                  }
                } else {
                  var option = document.createElement("option");
                  option.value = 1;
                  option.text = "第1問";
                  select.appendChild(option);
                }
                if (classinfo.current_Question_Number != 0) {
                  document.getElementById("status") = "現在" + classinfo.current_Question_Number + "問目";
                }
                else {
                  document.getElementById("status").innerHTML = "現在:問題開始待ち";
                }
              }
            }
          } else {
            Swal.fire({
              html: "クラス情報を取得できませんでした",
              title: "エラー",
              icon: "error",
            });
            window.location.href = "../teacher_start"
          }
        }
        catch (error) {
          console.log("レスポンス解析中にエラー発生。<br>レスポンスは以下です。")
          console.log(data)
          console.log(error)
        }
      })
      .catch((error) => {
        Swal.fire({
          html: "API送信に失敗しました。",
          title: "エラー",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("APIアクセス中にエラー発生。");
    console.log(error);
  }
}