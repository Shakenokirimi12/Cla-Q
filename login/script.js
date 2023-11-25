firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // ログイン時
    if (user.email.includes("-")) {
      Swal.fire({

        text: "ログインしました。教師接続画面に遷移します。",
        title: "情報",
        icon: "info",
        toast: true,
        animation: false,
        position: "top-end", //画面右上
        showConfirmButton: false,
        timer: 3000, //3秒経過後に閉じる
      });
      sleep(3000);
      window.location.href = "/teacher/teacher_start";
    } else {
      Swal.fire({

        text: "ログインしました。生徒接続画面に遷移します。",
        title: "情報",
        icon: "info",
        toast: true,
        animation: false,
        position: "top-end", //画面右上
        showConfirmButton: false,
        timer: 3000, //3秒経過後に閉じる
      });
      sleep(3000);
      window.location.href = "/student/student_start";
    }
  } else {
    // 未ログイン時
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start("#firebaseui-auth-container", {
      signInOptions: [
        firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
      ],
      callbacks: {
        signInSuccess: function (currentUser, credential, redirectUrl) {
          if (currentUser.email.includes("-")) {
            Swal.fire({

              text: "ログインしました。教師接続画面に遷移します。",
              title: "情報",
              icon: "info",
              toast: true,
              animation: false,
              position: "top-end", //画面右上
              showConfirmButton: false,
              timer: 3000, //3秒経過後に閉じる
            });
            sleep(3000);
            window.location.href = "/teacher/teacher_start";
          } else {
            Swal.fire({
              text: "ログインしました。生徒接続画面に遷移します。",
              title: "情報",
              icon: "info",
              toast: true,
              animation: false,
              position: "top-end", //画面右上
              showConfirmButton: false,
              timer: 3000, //3秒経過後に閉じる
            });
            sleep(3000);
            window.location.href = "/student/student_start";
          }
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
    location.href = "/mobile.html";
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
        toast: true,
        animation: false,
        position: "top-end", //画面右上
        showConfirmButton: false,
        timer: 3000, //3秒経過後に閉じる
      });
      sleep(3000);
      location.reload();
    });
}
const sleep = waitTime => new Promise(resolve => setTimeout(resolve, waitTime));