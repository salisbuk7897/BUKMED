function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementsById("h").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "/i", true);
    xhttp.send();
}