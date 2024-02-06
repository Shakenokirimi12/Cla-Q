function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    teacher_Rejoin();
  }
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
      if (data !== undefined && data.length !== 0) {
        var responseresult = data[Object.keys(data).length - 1];
        if (responseresult.result == "success") {
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
              document.querySelector("#filePicker").value = "";
            })
            .catch((error) => {
              console.error(error);
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

async function reserve_class(file) {
  var url = "https://teacher.api.cla-q.net/reserve_class";
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
          var classinfo = data[0];
          if (responseresult.result == "success") {
            class_Code = responseresult.class_Code;
            uploadFile(file);
            console.log("Successfully reserved the class");
            Swal.fire({
              html: "クラスを正常に予約完了しました。<br>クラスコードは書き留めて下さい。<br>クラスコードは" +
                responseresult.class_Code +
                "です。",
              title: "情報",
              icon: "success",
              showConfirmButton: true,
            })
          } else {
            Swal.fire({
              html: "クラスの予約に失敗しました。<br>" + responseresult.message + "(" + responseresult.status_Code + ")",
              title: "エラー",
              icon: "error",
            });
          }
        }
        else {
          Swal.fire({
            html: "予約できませんでした。<br>サーバーから無効な応答が返されました。",
            title: "エラー",
            icon: "error",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          html: "クラスを予約できませんでした。" + error,
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
          window.location.href = "../../student/student_start";
        } else {
          var userInfoElement = document.querySelector(".user-info");
          userInfoElement.innerHTML =
            "<p>ユーザー名: " +
            user.displayName +
            "</p><p>メールアドレス: " +
            user.email +
            "</p><button id='logout_button' class='flow-button' onclick='logOut()'>ログアウト</button><button id='back_button' class='flow-button' onclick='back()'>戻る</button>";
          let screenLock = document.querySelector("#screenLock");
          screenLock.parentNode.removeChild(screenLock);
          userName = user.displayName;
          userEmail = user.email;
        }
      });
  } else {
    window.location.href = "../../login";
  }
});

function back() {
  window.location.href = "../teacher_start";
}

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      prevent_Overlogin();
      Swal.fire({
        html: "ログアウトしました。ログイン画面に戻ります。",
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

