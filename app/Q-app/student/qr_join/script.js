firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    if (user.email.includes("-")) {
      window.location.href = "../../teacher/teacher_start";
    }
    userName = user.displayName;
    userEmail = user.email;
    let url_string = window.location.href;
    // 文字列としてのURLをURLオブジェクトに変換する。
    let url = new URL(url_string);
    // URLオブジェクトのsearchParamsのget関数でIDがdの値を取得する。
    let data = url.searchParams.get("class_Code");
    console.log(data);
    var class_Code = data;
    // "d"というIDが定義されていない場合はnullが入る
    if (class_Code != null) {
      document.cookie = "class_Code = " + data + "; path=/;";
      qrcodeLogin(class_Code, userName);
    }
  } else {
    // 未ログイン時
    window.location.href = "../../login";
  }
});
//反映されないので再コミット
async function qrcodeLogin(class_Code, userName) {
  var url = "https://api.cla-q.net/student/join";
  var postData = {
    class_Code: class_Code,
    userName: userName,
  };
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://app.cla-q.net/",
        // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        // レスポンスデータの処理
        if (data[1].result == "success" || data[0].result == "success") {
          console.log("Successfully joined the class");
          console.log(
            data[1].message,
            data[0].message,
            data[1].result,
            data[0].result
          );
          document.cookie = "class_Code=" + data[0].class_Code + "; path=/;";
          Swal.fire({
            title: "成功",
            text: "クラス" + data[0].class_Code + "に参加しました。",
            icon: "success",
            showConfirmButton: false,
            timer: 1500, //3秒経過後に閉じる
          }).then((result) => {
            window.location.href = "../student_menu";
          });
        } else {
          Swal.fire({
            title: "エラー",
            text: "ログインできませんでした。" + data.status_Code,
            icon: "error",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "エラー",
          text: "ログインできませんでした。(" + error + ")",
          icon: "error",
        });
      });
  } catch (error) {
    console.log("エラー発生。");
    console.log(error);
  }
}
