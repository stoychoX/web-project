function submitForm() {
    var formData = new FormData(document.getElementById('signup-form'));

    passwd = formData.get("password");
    uname = formData.get("username");
    email = formData.get("email");
    if(passwd != formData.get("password_repeat"))
    {
        alert("Please make sure that the password is corectly written.");
        return;
    }

    if(passwd.length < 8)
    {
        alert("Password is too short. At least 8 symbols.");
        return;
    }

    var json = {
        "RequestType": "InsertUser",
        "username": uname,
        "email": email,
        "password": passwd
    };

    var jsonBody = JSON.stringify(json);

    console.log(jsonBody);

    fetch('http://localhost/web-project/server/serve.php', {
        method: 'POST',
        body:   jsonBody
    })
    .then(resp => resp.json())
    .then(data => {
        if(data["Status"] == false)
        {
            alert('Error in inserting user. ' + data["Content"]);
        }
        else
        {
            alert(data["Content"]);
            window.location.href = "../login/login.html";
        }
    });
}