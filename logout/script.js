firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // ログイン時
        firebase
            .auth()
            .signOut()
            .then(function () {
                location.reload();
            });
    } else {
        // 未ログイン時
        window.location.href = "/login";
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
  