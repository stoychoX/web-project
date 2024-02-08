var currentEditedDocument = {
    id: "-1"
};

function loadUsername() {
    let json = {
        "RequestType": "Ping"
    };
    let jsonString = JSON.stringify(json);

    fetch("../../server/serve.php", {
        method: 'POST',
        body: jsonString
    })
    .then(resp => resp.json())
    .then(data => {
        content = JSON.parse(data['Content']);

        let header = document.getElementById("main-header");
        header.textContent += content['name'] + '!';
    });
}

function closeEditor() {
    document.body.style.overflow = 'visible';
    document.getElementById("configEditorBackground").style.display = 'none';
}

function showEditOptions(event) {
    let currScroll = document.documentElement.scrollTop;
    let background = document.getElementById("configEditorBackground");
    currentEditedDocument.id = event.target.id;
    background.style.display = 'flex';

    document.body.style.overflow = 'hidden';
    background.style.top = currScroll + 'px';

    let target = currentEditedDocument.id;

    let json = {
        "RequestType": "GetRecord",
        "Id": target
    };

    let body = JSON.stringify(json, null, 2);

    fetch("../../server/serve.php", {
        method: 'POST',
        body: body
    })
    .then(resp => resp.json())
    .then(data => {
        if(data["Status"] == false) {
            alert("Cannot find config");
            return;
        }

        let resp = data["Content"];
        let content = resp[0]["line"];
        let name = resp[0]["name"];

        document.getElementById('title').innerHTML = 'Editing config: ' + name + '.';
        document.getElementById('jsonEditor').value = JSON.stringify(JSON.parse(content), null, 2);
    });
}

function appendConfig(line) {
    let cfg = document.getElementById('configHolder');
    let elem = document.createElement('li');
    elem.id = line['id']; // funny
    elem.onclick = showEditOptions;
    elem.appendChild(document.createTextNode(line['name']));
    cfg.appendChild(elem);
}

function loadConfigurations() {
    let json = {
        "RequestType": "LoadConfigs"
    };
    let body = JSON.stringify(json);

    fetch("../../server/serve.php", {
        method: 'POST',
        body: body
    })
    .then(resp => resp.json())
    .then(data => {
        let configs = JSON.parse(data["Content"]);

        configs.forEach(line => {
            appendConfig(line);
        });
    });
}

function loadDashboard() {
    loadUsername();
    loadConfigurations();
}

window.onload = loadDashboard;

function addConfig() {
    window.location.href = "../config-creator/config-creator-oo.html";
}

function logout() {
    let json = {
        "RequestType": "Logout"
    };

    let body = JSON.stringify(json);

    fetch("../../server/serve.php", {
        method: 'POST',
        body: body
    });

    window.location.href = "../login/login.html";
}

function downloadConfig(event) {
    let target = currentEditedDocument.id;

    let json = {
        "RequestType": "GetRecord",
        "Id": target
    };

    let body = JSON.stringify(json, null, 2);

    fetch("../../server/serve.php", {
        method: 'POST',
        body: body
    })
    .then(resp => resp.json())
    .then(data => {
        if(data["Status"] == false) {
            alert('Unable to download config');
            return;
        }

        let resp = data["Content"];
        let toDownload = resp[0]["line"];
        let name = resp[0]["name"];

        const blob = new Blob([toDownload], { type: 'application/json' });

        const a = document.createElement('a');

        a.href = URL.createObjectURL(blob);

        a.download = name + '.json';

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);
    });
}

function saveConfig() {
    let configData = document.getElementById('jsonEditor').value;

    try {
        JSON.parse(configData);
    } catch (e) {
        alert("invalid JSON!");
        return;
    }
    
    let json = {
        RequestType: "UpdateRecord",
        Record: configData,
        Id: currentEditedDocument.id
    };
    let body = JSON.stringify(json);

    fetch('../../server/serve.php', {
        method: 'POST',
        body: body
    })
    .then (resp => resp.json())
    .then(data => {
        if(data["Status"] == false) {
            alert("Unable to update record");
            return;
        }
        alert("Record updated.");
        closeEditor();
    });
}

function deleteRecord() {
    let id = currentEditedDocument.id;

    let json = {
        RequestType: "DeleteRecord",
        Id: id
    };

    let body = JSON.stringify(json);

    fetch("../../server/serve.php", {
        method: 'POST',
        body: body
    })
    .then(resp => resp.json())
    .then(data => {
        if(data["Status"] == false) {
            alert("Cannot delete the record");
            return;
        }

        window.location.reload();
    });
}


function startLoadingRecord() {
    let record = document.getElementById('jsonEditor').value;

    try {
        JSON.parse(record);
    }
    catch(e) {
        alert("Invalid json");
        return;
    }

    let json = {
        RequestType: "CacheRecord",
        Record: record
    };

    let body = JSON.stringify(json);

    fetch("../../server/serve.php", {
        method: "POST",
        body: body
    })
    .then(resp => resp.json())
    .then(data => {
        if(data["Status"] == false) {
            alert("Unable to load record");
            return;
        }
        addConfig();
    }); 
}

document.getElementById('jsonEditor').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        let editor = document.getElementById('jsonEditor');

        const start = editor.selectionStart;
        const end = editor.selectionEnd;

        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.setSelectionRange(start + 2, start + 2);
    }
    else if(e.key === '"') {
        e.preventDefault();
        let editor = document.getElementById('jsonEditor');

        const start = editor.selectionStart;
        const end = editor.selectionEnd;

        editor.value = editor.value.substring(0, start) + '""' + editor.value.substring(end);
        editor.setSelectionRange(start + 1, start + 1);
    }
});