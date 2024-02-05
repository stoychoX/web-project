function loadDashboard()
{
    var json = {
        "RequestType": "Ping"
    };
    var jsonString = JSON.stringify(json);

    fetch("../../server/serve.php", {
        method: 'POST',
        body: jsonString
    })
    .then(resp => resp.json())
    .then(data => {
        content = JSON.parse(data['Content']);

        var header = document.getElementById("main-header");
        header.textContent += content['name'] + '!';
    });
}

window.onload = loadDashboard