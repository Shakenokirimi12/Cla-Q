firebase.auth().onAuthStateChanged(async function (user) {
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
        // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        var responseresult = data[Object.keys(data).length - 1];

        var isTeacher; //boolean
        console.log(responseresult);
        if (responseresult.status_Code == "DR-01") {
          isTeacher = true;
        } else if (responseresult.status_Code == "DR-02") {
          isTeacher = false;
        } else {
          //先生でも生徒でもない場合
          Swal.fire({
            text: "ログインできませんでした。もう一度試してください。",
            title: "エラー",
            icon: "error",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            firebase.auth().signOut();
          });
        }

        if (isTeacher) {
          Swal.fire({
            text: "ログインしました。教師接続画面に遷移します。",
            title: "情報",
            icon: "info",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            window.location.href = "../teacher/teacher_start";
          });
        } else {
          Swal.fire({
            text: "ログインしました。生徒接続画面に遷移します。",
            title: "情報",
            icon: "info",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            window.location.href = "../student/student_start";
          });
        }
      })
      .catch((error) => { });
  } else {
    // 未ログイン時
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start("#firebaseui-auth-container", {
      signInOptions: [
        firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
      ],
      callbacks: {
        signInSuccess: function (currentUser, credential, redirectUrl) {
          var url = "https://api.cla-q.net/detect_role";
          var postData = {
            userEmail: currentUser.email,
            userName: currentUser.displayName,
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
              var isTeacher; //boolean
              if (responseresult.status_Code == "DR-01") {
                isTeacher = true;
              } else if (responseresult.status_Code == "DR-02") {
                isTeacher = false;
              } else {
                //先生でも生徒でもない場合
                Swal.fire({
                  text: "サーバーレスポンスエラーです。\n(ErrorCode:" + responseresult.status_Code + ")",
                  title: "エラー",
                  icon: "error",
                  showConfirmButton: false,
                  timer: 1500, //3秒経過後に閉じる
                }).then((result) => {
                  logOut();
                });
              }

              if (isTeacher) {
                Swal.fire({
                  text: "ログインしました。教師接続画面に遷移します。",
                  title: "情報",
                  icon: "info",
                  showConfirmButton: false,
                  timer: 1500, //3秒経過後に閉じる
                }).then((result) => {
                  window.location.href = "../teacher/teacher_start";
                });
              } else {
                Swal.fire({
                  text: "ログインしました。生徒接続画面に遷移します。",
                  title: "情報",
                  icon: "info",
                  showConfirmButton: false,
                  timer: 1500, //3秒経過後に閉じる
                }).then((result) => {
                  window.location.href = "../student/student_start";
                });
              }
            })
            .catch((error) => { });

          return false;
        },
      },
    });
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  }
});

window.onload = function () {
  if (
    (navigator.userAgent.indexOf("iPhone") > 0 &&
      navigator.userAgent.indexOf("iPad") == -1) ||
    navigator.userAgent.indexOf("iPod") > 0 ||
    navigator.userAgent.indexOf("Android") > 0
  ) {
    location.href = "../mobile";
  }
};

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
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
const sleep = (waitTime) =>
  new Promise((resolve) => setTimeout(resolve, waitTime));
