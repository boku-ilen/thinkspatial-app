var qc = 0;

function buildSurveyRateonly(json) {
    for (var i = 0; i < json.length; i++) {
        if (json[i].plugin_type === "comment") {
            buildSurveyText(json[i]);
        } else if (json[i].plugin_type.startsWith("rate")) {
            buildSurveyBasicSelect(json[i]);
        }
    }
    
    qc = 0;
}

function buildSurveyQuickpoint(json) {
    for (var i = 0; i < json.length; i++) {
        if (json[i].plugin_type === "name" || json[i].plugin_type === "comment") {
            buildSurveyText(json[i]);
        }
    }
    
    qc = 0;
}

function buildSurveyBasic(json) {
    /*json = json.sort(function (a, b) {
     return a.sort - b.sort;
     });*/

    for (var i = 0; i < json.length; i++) {
        switch (json[i].type) {
            case "text":
                buildSurveyText(json[i]);
                break;
            case "radio":
                buildSurveyBasicRadio(json[i]);
                break;
            default:
                buildSurveyBasicSelect(json[i]);
                break;
        }

        /*if (json[i].plugin_type.includes("smile")) {
         buildSurveyBasicRadioRateSmileModules(json[i]);
         } else if (json[i].plugin_type.includes("rate") && json[i].plugin_type.length > 4) {
         buildSurveyBasicRadioRateNumModules(json[i]);
         }*/
    }
}

function buildSurveyGeneric(json) {
    json = json.sort(function (a, b) {
        return a.sort - b.sort;
    });
    for (var i = 0; i < json.length; i++) {
        switch (json[i].type) {
            case "text":
                buildSurveyText(json[i]);
                break;
            case "radio":
                buildSurveyGenericRadio(json[i]);
                break;
            case "checkbox":
                buildSurveyCheckbox(json[i]);
                break;
            case "matrix":
                buildSurveyMatrix(json[i]);
                break;
            case "select":
                buildSurveySelect(json[i]);
                break;
        }
    }
}

function buildSurveyOptional(json) {
    for (var i = 0; i < json.length; i++) {
        buildSurveyCheckbox(json[i]);
    }
}

function buildSurveyText(json) {
    qc++;
    $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
        if (json.required === 1) {
            return qc + ". * " + json.question;
        } else {
            return qc + ". " + json.question;
        }
    }));

    if (json.guide)
        buildSurveyGuide(json.guide, qc, json.plugin_type);

    var li = $("<li>").append($("<div>").addClass("item-content").append($("<div>").addClass("item-inner")));
    var input = $("<div>").addClass("item-input").append(function () {
        if (!json.source) {
            return $("<input>").attr("type", "text").attr("placeholder", "Bitte ausfüllen").attr("name", function () {
                var name = json.plugin_type !== "generic" ? json.plugin_type : "F_" + json.sort;
                return name;
            }).attr("sort", json.sort).prop("required", function () {
                return json.required === 1;
            });
        } else {
            return $("<textarea>").attr("placeholder", "Bitte ausfüllen").attr("name", function () {
                var name = json.plugin_type !== "generic" ? json.plugin_type : "F_" + json.sort;
                return name;
            }).attr("sort", qc).prop("required", function () {
                return json.required === 1;
            });
        }
    });

    li.find(".item-inner").append(input);
    $(".survey form ul").append(li);
}

function buildSurveyBasicSelect(json) {
    qc++;
    var numOptions = parseInt(json.plugin_type.replace("rate", "").split("_")[0]);
    var symbols = ["symbol_svg_ID.php?K=1&F=smileys5&C=99b94e", "symbol_svg_ID.php?K=2&F=smileys5&C=b7bf4c",
        "symbol_svg_ID.php?K=3&F=smileys5&C=d7c549", "symbol_svg_ID.php?K=4&F=smileys5&C=dc8738",
        "symbol_svg_ID.php?K=5&F=smileys5&C=e34627"
    ];

    $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
        if (json.required === 1) {
            return qc + ". * " + json.question;
        } else {
            return qc + ". " + json.question;
        }
    }));

    var li = $("<li>").append($("<div>").addClass("item-content").append($("<div>").addClass("item-inner").append(
            $("<div>").addClass("item-title").append($("<input>").attr("type", "hidden").attr("name", "rate").attr("sort", qc).prop("required", true), 
    $("<a>").attr("href", "#").attr("data-popover", ".popover" + qc).addClass("open-popover").text("Drücken zum Wählen")),
    $("<div>").addClass("item-after"))));
    var popover = $("<div>").addClass("popover popover" + qc).append($("<div>").addClass("popover-angle"),
            $("<div>").addClass("popover-inner").append($("<div>").addClass("list-block").append($("<ul>"))));

    for (var i = 0; i < numOptions; i++) {
        if (json.plugin_type.includes("smile")) {
            var si = i;

            if (numOptions === 3) {
                i === 1 ? si = 2 : null;
                i === 2 ? si = 4 : null;
            }
            popover.find(".list-block ul").append($("<li>").append($("<label>").addClass("list-button smbl").append(
                    $("<img>").attr("src", stddir + "images_dyn/" + symbols[si]),
                    $("<input>").attr("type", "radio").attr("name", "rate").attr("sort", qc).val(i + 1).prop("required", true))));
        } else {
            popover.find(".list-block ul").append($("<li>").append($("<label>").addClass("list-button item-link").text(i + 1).append(
                    $("<input>").attr("type", "radio").attr("name", "rate").attr("sort", qc).val(i + 1).prop("required", true))));
        }
    }

    $("body").append(popover);

    $(".survey form ul").append(li);
}

function buildSurveyBasicRadio(json) {
    qc++;
    if (json.source.option_ids.length > 1) {
        $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
            if (json.required === 1) {
                return qc + ". * " + json.question;
            } else {
                return qc + ". " + json.question;
            }
        }));

        if (json.guide)
            buildSurveyGuide(json.guide, qc, json.plugin_type);

        if (json.names || json.plugin_type === "size") {
            for (var i = 0; i < json.source.option_ids.length; i++) {
                var li = $("<li>").append($("<label>").addClass("label-radio item-content").append(
                        $("<input>").attr("type", "radio").attr("name", json.plugin_type).attr("sort", qc).val(json.source.option_ids[i]).prop("required", function () {
                    return json.required === 1;
                }),
                        $("<div>").addClass("item-inner").append(
                        $("<div>").addClass("item-title").text(json.source.options[i]))));

                if (json.plugin_type === "color") {
                    $("<div>").addClass("item-media").append($("<label>").addClass("clr").css("background-color", "#" + json.source.colors[i])).insertAfter(li.find("input"));
                } else if (json.plugin_type === "symbol") {
                    $("<div>").addClass("item-media").append($("<img>").attr("src", stddir + "images_dyn/symbol_svg_ID.php?ID=" + json.source.option_ids[i] + "&C=ccc").attr("height", "44px")).insertAfter(li.find("input"));
                }

                $(".survey form ul").append(li);
            }
        } else {
            var li = $("<li>");

            for (var r = 0; r < Math.ceil(json.source.option_ids.length / 4); r++) {
                var row = $("<div>").addClass("row no-gutter");
                var columns = r + 1 === Math.ceil(json.source.option_ids.length / 4) ? json.source.option_ids.length % 4 : 4;
                for (var c = 0; c < columns; c++) {
                    var col = $("<div>").addClass("col-25");

                    if (json.plugin_type === "color") {
                        col.append(
                                $("<label>").addClass("label-radio item-content clr").css("background-color", "#" + json.source.colors[r * 4 + c]).append(
                                $("<input>").attr("type", "radio").attr("name", json.plugin_type).attr("sort", qc).val(json.source.option_ids[r * 4 + c]).prop("required", function () {
                            return json.required === 1;
                        }),
                                $("<div>").addClass("item-inner").css("border", "none")));
                    } else if (json.plugin_type === "symbol") {
                        col.append(
                                $("<label>").addClass("label-radio item-content smbl").append(
                                $("<input>").attr("type", "radio").attr("name", json.plugin_type).attr("sort", qc).val(json.source.option_ids[r * 4 + c]).prop("required", function () {
                            return json.required === 1;
                        }),
                                $("<div>").addClass("item-inner").css("border", "none").append(
                                $("<img>").attr("src", stddir + "images_dyn/symbol_svg_ID.php?ID=" + json.source.option_ids[r * 4 + c] + "&C=ccc")
                                )));
                        ;
                    }

                    row.append(col);
                }
                if (row.children().length > 0)
                    li.append(row);

            }

            $(".survey form ul").append(li);
        }
    } else {
        $(".survey form ul").append($("<input>").attr("type", "hidden").attr("name", json.plugin_type).val(json.source.option_ids[0]));
        qc--;
    }
}

function buildSurveyGenericRadio(json) {
    qc++;
    $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
        if (json.required === 1) {
            return qc + ". * " + json.question;
        } else {
            return qc + ". " + json.question;
        }
    }));

    if (json.guide)
        buildSurveyGuide(json.guide, qc, json.plugin_type);

    for (var i = 0; i < json.source.options.length; i++) {
        var li = $("<li>").append($("<label>").addClass("label-radio item-content").append(
                $("<input>").attr("type", "radio").attr("name", "F_" + json.sort).attr("plugin", json.plugin_type).attr("sort", qc).val(json.name ? i : i + 1).prop("required", function () {
            return json.required === 1;
        }),
                $("<div>").addClass("item-inner").append(
                $("<div>").addClass("item-title").text(json.source.options[i]))));

        $(".survey form ul").append(li);
    }
}

function buildSurveyCheckbox(json) {
    qc++;
    $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
        if (json.required === 1) {
            return qc + ". * " + json.question;
        } else {
            return qc + ". " + json.question;
        }
    }));

    if (json.guide)
        buildSurveyGuide(json.guide, qc, json.plugin_type);

    for (var i = 0; i < json.source.options.length; i++) {
        var name = json.name ? json.name : "F_" + json.sort + "_" + (i + 1);
        var li = $("<li>").append($("<label>").addClass("label-checkbox item-content").append(
                $("<input>").attr("type", "checkbox").attr("name", name).attr("plugin", json.plugin_type).attr("sort", qc).val(json.name ? 1 : i + 1).prop("required", function () {
            return json.required === 1;
        }),
                $("<div>").addClass("item-media").append(
                $("<i>").addClass("icon icon-form-checkbox")),
                $("<div>").addClass("item-inner").append(
                $("<div>").addClass("item-title").text(json.source.options[i]))));

        $(".survey form ul").append(li);
    }
}

function buildSurveyMatrix(json) {
    qc++;
    $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
        if (json.required === 1) {
            return qc + ". * " + json.question;
        } else {
            return qc + ". " + json.question;
        }
    }));

    if (json.guide)
        buildSurveyGuide(json.guide, qc, json.plugin_type);

    var li = $("<li>").addClass("matrix");
    var count = 1;

    for (var r = -1; r < json.source.labels_left.length * 2; r++) {
        var row = $("<div>").addClass("row");
        if (r % 2 === 0) {
            var max = json.source.labels_right ? 2 : 1;
            for (var c = 0; c < max; c++) {
                row.append($("<div>").addClass("col-" + (100 / max)).css("text-align", c === 0 ? "left" : "right").text(c === 0 ? json.source.labels_left[r / 2] : json.source.labels_right[r / 2]));
            }
        } else {
            for (var c = 0; c < json.source.labels_top.length; c++) {
                var col = $("<div>").addClass("col-auto").css("text-align", "center");

                if (r === -1) {
                    col.text(json.source.labels_top[c]);
                } else {
                    col.append($("<label>").addClass("label-checkbox").append(
                            $("<input>").attr("type", "checkbox").attr("name", "F_" + json.sort + "_" + count).attr("plugin", json.plugin_type).attr("sort", qc).val(c + 1).prop("required", function () {
                        return json.required === 1;
                    }),
                            $("<div>").addClass("item-media").append(
                            $("<i>").addClass("icon icon-form-checkbox"))));

                    (c + 1) === json.source.labels_top.length ? count++ : true;
                }

                row.append(col);
            }
        }
        li.append(row);
    }

    $(".survey form ul").append(li);
}

function buildSurveySelect(json) {
    qc++;

    $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
        if (json.required === 1) {
            return qc + ". * " + json.question;
        } else {
            return qc + ". " + json.question;
        }
    }));

    if (json.guide)
        buildSurveyGuide(json.guide, qc, json.plugin_type);

    var li = $("<li>").append($("<a>").addClass("item-link smart-select").attr("data-open-in", "picker").attr("data-back-on-select", "true").append($("<select>").attr("name", "F_" + json.sort).attr("sort", qc)));

    for (var i = 0; i < json.source.options.length; i++) {
        li.find("select").append($("<option>").val(json.source.option_ids[i]).text(json.source.options[i]).prop("required", function () {
            return json.required === 1;
        }));
    }

    li.find("a").append($("<div>").addClass("item-content").append($("<div>").addClass("item-inner").append(
            $("<div>").addClass("item-title").text("Auswählen"),
            $("<div>").addClass("item-after")
            )));

    $(".survey form ul").append(li);
}

function buildSurveyGuide(gid, q, plugin_type) {
    $("<li>").addClass("guide").append(
            $("<a>").addClass("item-link item-content").append(
            $("<div>").addClass("item-media").append(
            $("<i>").addClass("icon icon-guide")),
            $("<div>").addClass("item-inner").append(
            $("<div>").addClass("item-title").text(strings[u_lang].labels.guide)))
            ).click(function () {
        app.showPreloader();
        var data = {};
        if (plugin_type !== "generic") {
            data.auth = u_project_auth;
            data.basic = plugin_type;
        } else {
            data.guide = gid;
        }

        $.ajax(stddir + "app_guide.php", {dataType: "json", data: data, method: "POST", timeout: timeout, success: function (result) {
                $(".panel-left").empty();

                for (var i = 0; i < result.length; i++) {
                    $("<div>").addClass("content-block-title").text(result[i].TITLE).appendTo(".panel-left");
                    var content = $("<div>").addClass("content-block").text(result[i].TEXT);

                    if (result[i].IMAGE) {
                        content.prepend($("<figure>").append($("<img>").attr("src", stddir + result[i].IMAGE).attr("width", "100%")));
                        if (result[i].IMAGE_TEXT) {
                            content.find("figure").append($("<figcaption>").text(result[i].IMAGE_TEXT));
                        }
                    }
                    content.appendTo(".panel-left");
                }

                app.openPanel("left");
                app.hidePreloader();
            }});
    }).appendTo(".survey form ul");
}