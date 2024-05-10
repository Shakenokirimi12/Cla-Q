const default_destination = "/app/Q-app";
//一生反映されないので追加
function onStartClick() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithRedirect(provider)
    .catch(function (error) {
      console.log(error);
      if (String(error).includes("popup")) {
        Swal.fire({
          html: "Googleログインに失敗しました。<br>画面右上のポップアップ設定を許可してください。<br>内部エラー:" + error,
          title: "情報",
          icon: "error",
        }).then((result) => {
          window.location.href = "./";
        });
      } else {
        Swal.fire({
          html: "Googleログインに失敗しました。<br>内部エラー:" + error,
          title: "情報",
          icon: "error",
        }).then((result) => {
          window.location.href = "./";
        });
      }
    });
}

firebase.auth()
  .getRedirectResult()
  .then((result) => {
    console.log(result, "this is the result.");
    if (result.credential) {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;

      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = credential.accessToken;
      // ...
      console.log(result);
      location.href = "../login_success";
    }
    else {
      console.log("user was null.");
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithRedirect(provider)
        .catch(function (error) {
          console.log(error);
          if (String(error).includes("popup")) {
            Swal.fire({
              html: "Googleログインに失敗しました。<br>画面右上のポップアップ設定を許可してください。<br>内部エラー:" + error,
              title: "情報",
              icon: "error",
            }).then((result) => {
              window.location.href = "./";
            });
          } else {
            Swal.fire({
              html: "Googleログインに失敗しました。<br>内部エラー:" + error,
              title: "情報",
              icon: "error",
            }).then((result) => {
              window.location.href = "./";
            });
          }
        });

    }
    // The signed-in user info.
    var user = result.user;
    // IdP data available in result.additionalUserInfo.profile.
    // ...

  }).catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    console.log(error);
    // ...
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