window.onload = function(){
    let url_string = window.location.href;
    // 文字列としてのURLをURLオブジェクトに変換する。
    let url = new URL(url_string);
    // URLオブジェクトのsearchParamsのget関数でIDがdの値を取得する。
    let data=url.searchParams.get("class_Code");
    // "d"というIDが定義されていない場合はnullが入る
    if(class_Code != null){
        document.cookie = "class_Code = " + data + "; path=/;"
        window.location = "../student_start"
    }
}