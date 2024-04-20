const default_destination = "/app/Q-app";
//一生反映されないので追加

firebase.auth().onAuthStateChanged(async function (user) {
  if (user) {
    var url = "https://api.cla-q.net/v2/system/detect_role";
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
            html:
              "<strong>サーバーレスポンスエラーです。</strong><br>(ErrorCode:" +
              responseresult.status_Code +
              ")",
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
            html: "<strong>ログインしました。</strong><br>教師接続画面に遷移します。",
            title: "情報",
            icon: "info",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            window.location.href =
              default_destination + "/teacher/teacher_start";
          });
        } else {
          Swal.fire({
            html: "<strong>ログインしました。</strong><br>生徒接続画面に遷移します。",
            title: "情報",
            icon: "info",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            window.location.href =
              default_destination + "/student/student_start";
          });
        }
      })
      .catch((error) => {});
  } else {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithRedirect(provider)
      .then((result) => {
        location.reload();
      })
      .catch(function (error) {
        if (String(error).includes("popup")) {
          Swal.fire({
            html: "Googleログインに失敗しました。<br>画面右上のポップアップ設定を許可してください。<br>内部エラー:" + error,
            title: "情報",
            icon: "error",
          });
        } else {
          Swal.fire({
            html: "Googleログインに失敗しました。<br>内部エラー:" + error,
            title: "情報",
            icon: "error",
          });
        }
      });
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
        html: "<strong>ログアウトしました。</strong><br>ログイン画面に戻ります。",
        title: "情報",
        icon: "success",
        showConfirmButton: false,
        timer: 1500, //3秒経過後に閉じる
      }).finally((result) => {
        location.reload();
      });
    });
}
const sleep = (waitTime) =>
  new Promise((resolve) => setTimeout(resolve, waitTime));
