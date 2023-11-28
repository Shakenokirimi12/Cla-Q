firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // ログイン時
    firebase
      .auth()
      .signOut()
      .then(function () {
        Swal.fire({
          text: "ログアウトしました。",
          title: "情報",
          icon: "info",
          toast: true,
          position: "top-end", //画面右上
          showConfirmButton: false,
          timer: 3000, //3秒経過後に閉じる
        }).then((result) => {
          document.cookie = "class_Code=; path=/;";
          location.reload();
        });
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


