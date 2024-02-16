function openSignup() 
{
    window.location.href = "../signup/signup.html"
}

function tryLogin()
{
    var formData = new FormData(document.getElementById('login-form'));

    var json = {
        "RequestType": "LogUser",
        "username": formData.get("username"),
        "password": formData.get("password"),
        "email":    formData.get("email")
    };

    var jsonBody = JSON.stringify(json);

    fetch("../../server/serve.php", {
        method: 'POST',
        body: jsonBody
    })
    .then(resp => resp.json() )
    .then(data => {
        if(data["Status"] == false)
        {
            alert("User doesn't exist");
        }
        else
        {
            window.location.href = "../dashboard/dashboard.html";
        }
    });
}