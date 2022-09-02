var user;

let cached_count = 0;

if (!localStorage.getItem("username")) {
    localStorage.setItem("username", prompt("Enter your username", "guest"));
}
let username = localStorage.getItem("username");


async function send() {
    let user_input = $("#user_msgInput").val();
    setTimeout(() => {
        $("#user_msgInput").val("");
    }, 50)

    if (user_input.length < 1) {
        return;
    }

    let payload = `${getime()} ${username} - ${user_input}`;

    await ajax("POST", "/api/schat/send", payload);
}

//handler
$("#user_msgInput").keypress(function (key) {
    if (key.key == "Enter") {
        send();
    }
});

function addMessage(msg) {
    $("#message").prepend([
        $("<span>", { text: msg }),
        $("<br>")
    ]);
}

function ajax(method, url, data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: method,
            url: url,
            data: data,
            success: resolve,
            error: reject
        });
    })
}

setInterval(async () => {
    let count = await ajax("GET", "/api/schat/message_count", undefined)
    console.log(count, cached_count)
    if (count > cached_count) {
        let new_messages = await ajax(
            "GET",
            "/api/schat/messages/" + (count - cached_count).toString(),
            undefined
        );
        new_messages.map(addMessage);
        cached_count = count;
    }
}, 1000);