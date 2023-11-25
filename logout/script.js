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
