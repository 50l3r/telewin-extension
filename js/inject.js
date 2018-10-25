//CONFIG
var domain = "empre.site"
var endpoint = "https://www.ganasdetelepizza.es" //https://d6ow8diqzony0.cloudfront.net

var pizzas = 0;
var time_check = 10000 //No lo bajes o quedas ban 10000
var time_pizzas = 60000 //Tampoco lo bajes 60000
var timeout_telewin = 0;
var timeout_telequeda = 0;
var busy = false;
var busy_telequeda = false;

$(document).ready(function () {
    var div = document.createElement('div');
    div.id = "tl_sidebar";
    div.innerHTML = '<div id="tl_sidebar_header"><h2 class="tl_sidebar_title">Telewin 0.1 <div class="tl_sidebar_status">PIPSAS: <span id="tl_sidebar_status_val">' + pizzas + '</span><div></div></h2><hr><input type="text" id="tl_domain" placeholder="Dominio de email" value="' + domain + '"><a class="tl_btn" id="tl_set_domain">SET</a><hr><a class="tl_btn tl_stop_off" id="tl_stop">PARAR</a><a class="tl_btn" id="tl_start">FARMEAR</a><hr></div><div id="tl_sidebar_content"><table id="tl_table"><thead><tr><th>Email</th><th style="text-align:right">Resultado</th></tr></thead><tbody id="tl_table_body"></tbody></table></div>';
    document.body.appendChild(div);

    $('#tl_sidebar_content').slimScroll({height: "auto"});

    $(document).on("click", "#tl_set_domain", function () {
        var value = $("#tl_domain").val()
        domain = value
    })

    $(document).on("click", "#tl_start", function () {
        $("#tl_stop").removeClass("tl_stop_off")
        $("#tl_start").addClass("tl_start_off")
        timeout_telewin = setTimeout(function () {
            telewin()
        }, time_check);
    })

    $(document).on("click", "#tl_stop", function () {
        $("#tl_stop").addClass("tl_stop_off")
        $("#tl_start").removeClass("tl_start_off")
        clearInterval(timeout_telewin);
    })
})



function telewin() {
    if (!busy) {
        busy = true

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }

            if (domain == "gmail.com") {
                var sep = 0;
                return s4() + sep + s4() + sep + s4() + s4() + s4();
            } else {
                var sep = "-";
                return s4() + sep + s4() + s4() + s4();
            }

        }

        var UID = guid()

        var data = {
            email: UID + "@" + domain,
            receive_offert: false,
        }

        $.ajax({
            type: "POST",
            url: endpoint + "/check-mail", //remover php
            dataType: 'json',
            contentType: "application/json",
            crossDomain: true,
            data: JSON.stringify(data),
            success: function (result) {
                var body = JSON.stringify(JSON.parse(result['body'])  );
                var response = JSON.parse(body);

                switch (response.responseMessage) {
                    case 'EMAIL_SAVED':
                        $("#tl_table_body").prepend("<tr id='tl_" + UID + "'><td>" + data.email + "</td><td class='tl_status'></td></tr>");

                        $.ajax({
                            type: "POST",
                            url: endpoint + "/check-prize", //remover php
                            dataType: 'json',
                            contentType: "application/json",
                            crossDomain: true,
                            data: JSON.stringify({
                                email: data.email
                            }),
                            success: function (result) {
                                busy = false;

                                var body = JSON.stringify(JSON.parse(result['body'])  );
                                var response = JSON.parse(body);

                                switch (response.responseMessage) {
                                    case 'USER_IS_WINNER':
                                        console.log("[GANADOR]" + data.email)
                                        $("#tl_" + UID + " .tl_status").html("OK");
                                        $("#tl_" + UID + " .tl_status").addClass("tl_status_ok tl_blink");
                                        var audio = new Audio(chrome.extension.getURL('wow.mp3'));
                                        audio.play()
                                        break;
                                    case 'USER_NOT_WIN':
                                        console.log("[NO GANADOR]" + data.email)
                                        $("#tl_" + UID + " .tl_status").html("KO");
                                        $("#tl_" + UID + " .tl_status").addClass("tl_status_ko");
                                        break;
                                }

                                timeout_telewin = setTimeout(function () {
                                    telewin()
                                }, time_check);
                            },
                            error: function (e) {
                                busy = false
                                timeout_telewin = setTimeout(function () {
                                    telewin()
                                }, time_check);
                                console.log("ERROR: " + e.message);
                            }
                        });
                        break;
                    default:
                        busy = false
                }
            },
            error: function (e) {
                busy = false
                console.log("ERROR: " + e.message);
            }
        });
    }
}

//COMPROBACION DE PIPSAS
function telequeda() {
    if (!busy_telequeda) {
        busy_telequeda = true;
        $.ajax({
            url: endpoint + "/data.json",
            dataType: "text",
            success: function (e) {
                busy_telequeda = false;
                timeout_telequeda = setTimeout(function () {
                    telequeda()
                }, time_pizzas);

                var t = JSON.parse(e);
                prizesEnable = JSON.stringify(t.prizesEnable), $("#tl_sidebar_status_val").html(prizesEnable)
            },
            error: function (e) {
                busy_telequeda = false;
                timeout_telequeda = setTimeout(function () {
                    telequeda()
                }, time_pizzas);
                console.log("ERROR: " + e.message);
            }
        })
    }
}

telequeda()
timeout_telequeda = setTimeout(function () {
    telequeda()
}, time_pizzas);


function blinker() {
	$('.tl_blink').fadeOut(500);
	$('.tl_blink').fadeIn(500);
}
setInterval(blinker, 1000);