// json display related
var mainJSONData = { version: "2.0.0" };
var currentTaskLocation = undefined;

function showJson() {
    document.getElementById("jsonHolder").innerHTML =
        "<pre><code>" +
        JSON.stringify(mainJSONData, undefined, 2) +
        "</code></pre>";
    hljs.highlightAll();
}

function addElementToJSON(elementName, elementValue) {
    mainJSONData[elementName] = elementValue;
    showJson();
}

function addElementToJSONArray(arrayName, elementName) {
    if (!mainJSONData[arrayName]) { mainJSONData[arrayName] = []; }
    mainJSONData[arrayName].push(elementName);
    showJson()
}

function addElementToCurrentTask(elementName, elementValue) {
    mainJSONData[currentTaskLocation][mainJSONData[currentTaskLocation].length - 1][elementName] = elementValue;
    showJson();
}

function addElementToCurrentTaskArray(arrayName, elementValue) {
    if (!mainJSONData[currentTaskLocation][mainJSONData[currentTaskLocation].length - 1][arrayName]) {
        mainJSONData[currentTaskLocation][mainJSONData[currentTaskLocation].length - 1][arrayName] = [];
    }
    mainJSONData[currentTaskLocation][mainJSONData[currentTaskLocation].length - 1][arrayName].push(elementValue);
    showJson();
}

// 

function appendTextValueToDiv(divId, clearDiv, contern) {
    let div = document.getElementById(divId);

    let toInsert = document.createElement('div');
    toInsert.className = 'argumentValues';
    toInsert.textContent = contern;

    if (clearDiv && div.hasChildNodes()) {
        div.removeChild(div.firstChild);
    }

    div.appendChild(toInsert);
}

function addTextValueToDiv(divId, textBoxId, clearDiv) {
    let textBox = document.getElementById(textBoxId);
    console.log(textBox);
    if (textBox.value == "") {
        alert("No need for empty values");
        return;
    }

    appendTextValueToDiv(divId, clearDiv, textBox.value);
    textBox.value = "";
}

function triggerCheckbox(checkboxId) {
    let check = document.getElementById(checkboxId);
    check.checked = !check.checked;
}

function showPopup(popupId, addSaver, saver, holder) {
    getAllDivInputFieldsToDefault(popupId);
    let currScroll = document.documentElement.scrollTop;
    let options = document.getElementById(popupId);

    if (addSaver) {
        let inner = document.getElementById(holder);
        let mSaver = inner.querySelector('.saver');
        mSaver.innerHTML = saver;
    }

    options.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    options.style.top = currScroll + 'px';
}

function hidePopup(divId, keepScrollHidden) {
    document.getElementById(divId).style.display = "none";
    if (keepScrollHidden) { return; }
    document.body.style.overflow = 'visible';
}

function cleanoutUselessJSONFields(json) {
    for (let prop in json) {
        if (json.hasOwnProperty(prop) && (json[prop] === '' || json[prop] === null || json[prop] === undefined)) {
            delete json[prop];
        }
    }
}

// class of every input element should be fieldvalue-specifier
function fillJSONFromDivInput(divId) {
    let div = document.getElementById(divId);
    let toReturn = {};

    let inputElements = div.querySelectorAll('input, select');

    for (let i = 0; i < inputElements.length; i++) {
        let inputType = inputElements[i].type.toLowerCase();
        let key = inputElements[i].className.split('-')[0];
        switch (inputType) {
            case 'text':
            case 'number':
                if (inputElements[i].value == "") { continue; }
            case 'select-one':
                toReturn[key] = inputElements[i].value;
                inputElements[i].value = inputElements[i].defaultValue;
                break;
            case 'checkbox':
                toReturn[key] = inputElements[i].checked;
                inputElements[i].checked = false;
                break;
        }
    }

    cleanoutUselessJSONFields(toReturn);
    return toReturn;
}

function clearDiv(divId) {
    document.getElementById(divId).innerHTML = "";
}

function getElementValue(element) { return document.getElementById(element).value; }
function isChecked(element) { return document.getElementById(element).checked; }

function getAllDivInputFieldsToDefault(divId) {
    let div = document.getElementById(divId);
    let fields = div.querySelectorAll("input, select");

    for (let i = 0; i < fields.length; i++) {
        if (fields[i].type.toLowerCase() == 'checkbox') { fields[i].checked = false; }
        else { fields[i].value = fields[i].defaultValue; }
    }
}

function addTask(taskName) {
    let taskConfig = document.getElementById("taskDescription");
    taskConfig.style.display = "block"
    document.getElementById("purpose").innerHTML = taskName;

    addElementToJSONArray(taskName, {});
    currentTaskLocation = taskName;
    clearTasks();
}

function optionsAddEnvKeyValue() {
    addTextValueToDiv("envKeyHolder", "envKey", false);
    addTextValueToDiv("envValueHolder", "envValue", false);
}

function addShellArguments() {
    addTextValueToDiv("shellArgsHolder", "shellArgsInput", false);
}

function saveOptions() {
    let v_envKeyHolder = document.getElementById("envKeyHolder");
    let v_envValueHolder = document.getElementById("envValueHolder");
    let v_shellArgsHolder = document.getElementById("shellArgsHolder");

    let json = {
        cwd: getElementValue('cwd'),
        env: [],
        shell: {
            executable: getElementValue('shellInput'),
            args: []
        }
    };

    for (let i = 0; i < v_envKeyHolder.children.length; i++) {
        let v_key = v_envKeyHolder.children[i].innerText;
        let v_value = v_envValueHolder.children[i].innerText;
        let toInsert = {};
        toInsert[v_key] = v_value;
        json.env.push(toInsert);
    }

    for (let i = 0; i < v_shellArgsHolder.children.length; i++) {
        let argValue = v_shellArgsHolder.children[i].innerText;
        json.shell.args.push(argValue);
    }

    addElementToJSON("options", json);
    v_envKeyHolder.innerHTML = "";
    v_envValueHolder.innerHTML = "";
    v_shellArgsHolder.innerHTML = "";
    hidePopup("commandOptionsBackground");
}

function savePresentation() {
    let json = fillJSONFromDivInput('presentationOptions');
    let presentationDiv = document.getElementById('presentationOptions');
    let saver = presentationDiv.querySelector('.saver');

    if (saver.innerHTML == "base") { addElementToJSON("presentationOptions", json); }
    else if (saver.innerHTML == "tasks") { addElementToCurrentTask("presentationOptions", json); }

    hidePopup("presentationOptionsBackground");
}

function saveIncludeExclude() {
    let incl = document.getElementById("includeHolder");
    let excl = document.getElementById("excludeHolder");

    console.log(incl);
    console.log(excl);

    let json = [
        'search',
        {
            include: [],
            exclude: []
        }
    ];

    for (let i = 0; i < incl.children.length; i++) {
        json[1].include.push(incl.children[i].innerText);
    }


    for (let i = 0; i < excl.children.length; i++) {
        json[1].exclude.push(excl.children[i].innerText);
    }

    incl.innerHTML = "";
    excl.innerHTML = "";

    document.getElementById('fileLocationHolder').innerHTML = JSON.stringify(json);
    hidePopup('includeExcludeBackground', true);
}

function addFileLocationString() {
    let fileLocationHolder = document.getElementById("fileLocationHolder");
    let string = document.getElementById("flString");

    let json;
    if (fileLocationHolder.innerHTML.trim() == "") { json = [string.value]; }
    else {
        json = JSON.parse(fileLocationHolder.innerHTML);
        if (json[0] == 'search') { json = []; }
        json.push(string.value);
    }

    fileLocationHolder.innerHTML = "";
    fileLocationHolder.innerHTML = JSON.stringify(json);
}

function saveProblemPattern() {
    let json = fillJSONFromDivInput("problemPattern");
    document.getElementById('patternHolder').innerHTML = JSON.stringify(json);
    hidePopup("problemPatternBackground", true);
}

function saveBackgroundMatcher() {
    let json = fillJSONFromDivInput('backgroundMatcher');
    document.getElementById('backgroundMatcherHolder').innerHTML = JSON.stringify(json);
    hidePopup('backgroundMatcherBackground', true);
}

function getHolderValue(holderIndex) {
    toReturn = [];
    let holder = document.getElementById(holderIndex + "Holder");
    let args = holder.getElementsByClassName("argumentValues");
    for (let i = 0; i < args.length; i++) {
        toReturn.push(args[i].innerHTML);
    }

    if (args.length == 0) { toReturn.push(""); }

    return toReturn;
}

function getHolderValueAsJSON(holderIndex) {
    let holder = document.getElementById(holderIndex + "Holder");
    if (holder.innerHTML.trim() == "") { return ""; }
    let jsonToBe = holder.innerHTML;
    return JSON.parse(jsonToBe);
}

function cleanProblemMatcher() {
    document.getElementById('baseHolder').innerHTML = '';
    document.getElementById('ownerHolder').innerHTML = '';
    document.getElementById('sourceHolder').innerHTML = '';
    document.getElementById('severityHolder').innerHTML = '';
    document.getElementById('fileLocationHolder').innerHTML = '';
    document.getElementById('patternHolder').innerHTML = '';
    document.getElementById('backgroundMatcherHolder').innerHTML = '';
}

function saveProblemMatcher() {
    // collect all information from the holders
    let json = {
        base: getHolderValue('base')[0],
        owner: getHolderValue('owner')[0],
        source: getHolderValue('source')[0],
        severity: getHolderValue('severity')[0],
        fileLocation: getHolderValueAsJSON('fileLocation'),
        pattern: getHolderValueAsJSON('pattern'),
        background: getHolderValueAsJSON('backgroundMatcher')
    };

    cleanoutUselessJSONFields(json);

    let saver = document.getElementById('problemMatcher').querySelector('.saver').innerHTML;

    if (saver == "base") { addElementToJSON("problemMatcher", json); }
    else if (saver == "tasks") { addElementToCurrentTask("problemMatcher", json); }

    hidePopup('problemMatcherBackground');
}

function saveRunOptions() {
    let json = fillJSONFromDivInput('runOptions');
    addElementToCurrentTask('runOptions', json);
    hidePopup('runOptionsBackground');
}

// This is too ugly - however can't figure better way :/
function clearTasks() {
    document.getElementById('labelInput').value = '';
    document.getElementById('type-select').value = '';
    document.getElementById('commandInput').value = '';
    document.getElementById('backCheckTask').checked = false;
    document.getElementById('appendArgTask').value = '';
    document.getElementById('select-group').value = '';
    document.getElementById('groupCheck').checked = false;
    document.getElementById('isDefaultTask').style.display = 'none';
    document.getElementById('problemMatcherInputTask').value = '';
}

function saveTask() {
    document.getElementById("taskDescription").style.display = 'none';
    clearTasks();
}

// Litte bug here - sleep.
function handleTaskGroupCheck(event) {
    if (event.target.value != '') {
        document.getElementById('isDefaultTask').style.display = 'block';
        addElementToCurrentTask('group', event.target.value);
    }
    else {
        delete mainJSONData[currentTaskLocation][mainJSONData[currentTaskLocation].length - 1]['group'];
        document.getElementById('isDefaultTask').style.display = 'none';
        showJson();
    }
}

function handleIsDefaultTaskCheck() {
    let groupKind = mainJSONData[currentTaskLocation][mainJSONData[currentTaskLocation].length - 1]['group'];
    // is it object?
    if (typeof groupKind === 'object' && !Array.isArray(groupKind) && groupKind !== null) {
        groupKind['isDefault'] = document.getElementById('groupCheck').checked;
    }
    else {
        mainJSONData[currentTaskLocation][mainJSONData[currentTaskLocation].length - 1]['group'] = {
            kind: groupKind,
            isDefault: document.getElementById('groupCheck').checked
        };
    }
    showJson();
}

function popBackTask() {
    if (mainJSONData[currentTaskLocation].length != 0) {
        mainJSONData[currentTaskLocation].pop();
        if (mainJSONData[currentTaskLocation].length == 0) {
            delete mainJSONData[currentTaskLocation];
        }
    }
    showJson();
    document.getElementById("taskDescription").style.display = 'none';
    clearTasks();
}

function addTaskToDatabase() {
    let request = {
        "RequestType": "InsertRecord",
        "record": mainJSONData
    };

    var jsonBody = JSON.stringify(request);
    fetch("../../server/serve.php", {
        method: 'POST',
        body: jsonBody
    }).then(resp => resp.json())
    .then(data => {
        if(data["Status"] == false)
        {
            alert("Error in saving the configuration");
        }
        else
        {
            window.location.href = "../dashboard/dashboard.html";
        }
    });
}