firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // ログイン時
      if (user.email.includes("-")) {
        window.location.href = "/teacher/teacher_start";
      } else {
        window.location.href = "/student/student_start";
      }
    } else {
      // 未ログイン時
      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start("#firebaseui-auth-container", {
        signInOptions: [
          firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
        ],
        'callbacks': {
          'signInSuccess': function (currentUser, credential, redirectUrl) {
            if (currentUser.email.includes("-")) {
              window.location.href = "/teacher/teacher_start";
            } else {
              window.location.href = "/student/student_start";
            }
            return false;
          }
        }
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
        location.reload();
      });
  }

  
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../serviceworker.js")
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
