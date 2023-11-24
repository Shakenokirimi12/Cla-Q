function handleKeyDown(event) {
    // Enter キーが押された場合に送信処理を行う
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        teacher_Rejoin();
    }
}

async function startClass() {
    var url = "https://api.cla-q.net/teacher/create_class";
    var postData = {
        "userEmail": userEmail,
        "userName": userName
    };
    try {
        await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "https://app.cla-q.net/",
                // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
            },
            body: JSON.stringify(postData),
        })
            .then(response => response.json())
            .then(data => {
                // レスポンスデータの処理
                if (data.result == "success") {
                    console.log("Successfully created the class");
                    document.cookie = 'class_Code=' + data.class_Code;
                    window.location.href = "/teacher/teacher_menu";
                }
                else {
                    alert("ログインできませんでした。:" + data.message);
                }
            })
            .catch(error => {
                alert("ログインできませんでした。");
            });
    } catch (error) {
        console.log("エラー発生。")
        console.log(error)
    }
}


async function teacher_Rejoin() {
    var class_Code = document.getElementById("class-code-input").value;
    if (class_Code == null || class_Code == undefined || class_Code == "") {
        alert("クラスコードが入力されていません。");
        return;
    }
    var url = "https://api.cla-q.net/teacher/rejoin_class";
    var postData = {
        "class_Code": class_Code,
        "userEmail": userEmail,
        "userName": userName
    };
    try {
        await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "https://app.cla-q.net/",
                // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
            },
            body: JSON.stringify(postData),
        })
            .then(response => response.json())
            .then(data => {
                try {
                    var result = data[1].result;
                    if (result == "success") {
                        console.log("Successfully created the class");
                        document.cookie = 'class_Code=' + class_Code;
                        window.location.href = "/teacher/teacher_menu";
                    }
                    else {
                        alert("ログインできませんでした。:" + data[1].message);
                    }
                }
                catch (error) {
                    try {
                        var result2 = data.result;
                        if (result2 == "success") {
                            console.log("Successfully created the class");
                            document.cookie = 'class_Code=' + class_Code;
                            window.location.href = "/teacher/teacher_menu";
                        }
                        else {
                            alert("ログインできませんでした。:" + data.message);
                        }
                    }
                    catch (error) {
                        alert("サーバーエラーです。管理者にお問い合わせください。");
                    }
                }
                // レスポンスデータの処理
            })
            .catch(error => {
                alert("ログインできませんでした。");
            });
    } catch (error) {
        console.log("エラー発生。")
        console.log(error)
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
        location.href = "/mobile.html";
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
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // ログイン時
        if (user.email.includes("_")) {
            window.location.href = "/student/student_start";
        } else {
            // Update the user information display
            var userInfoElement = document.querySelector(".user-info");
            userInfoElement.innerHTML =
                "<p>ユーザー名: " +
                user.displayName +
                "</p><p>メールアドレス: " +
                user.email +
                "</p><button id='logout_button' onclick='logOut()'>ログアウト</button>";
            //ログイン越え回避解除
            let screenLock = document.getElementById("screenLock");
            screenLock.parentNode.removeChild(screenLock);
            userName = user.displayName;
            userEmail = user.email;
        }
    } else {
        // 未ログイン時
        window.location.href = "/login";
    }
});

function logOut() {
    firebase
        .auth()
        .signOut()
        .then(function () {
            location.reload();
        });
}