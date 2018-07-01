function buildSurveyRadioColor(json) {
    qc++;
    var li;
    if (json.Q_QTYPE.RADIO.Q_SRC_COLOR_ID.length > 1) {
        $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
            if (json.required === 1) {
                return qc + ". * " + json.question;
            } else {
                return qc + ". " + json.question;
            }
        }));

        if (json.guide)
            buildSurveyGuide(json.guide, qc, json.plugin_type);

        if (json.Q_SHOW_NAMES === 1) {
            for (var i = 0; i < json.Q_QTYPE.RADIO.Q_SRC_COLOR_ID.length; i++) {
                var li = $("<li>").append($("<label>").addClass("label-radio item-content").append(
                        $("<input>").attr("type", "radio").attr("name", json.plugin_type).attr("sort", qc).val(json.Q_QTYPE.RADIO.Q_SRC_COLOR_ID[i]).prop("required", function () {
                    return json.required === 1;
                }),
                        $("<div>").addClass("item-media").append(
                        $("<label>").addClass("clr").css("background-color", "#" + json.Q_QTYPE.RADIO.Q_SRC_COLORS[i])),
                        $("<div>").addClass("item-inner").append(
                        $("<div>").addClass("item-title").text(json.source.options[i]))));

                $(".survey form ul").append(li);
            }
        } else {
            li = $("<li>");

            for (var r = 0; r < Math.ceil(json.Q_QTYPE.RADIO.Q_SRC_COLOR_ID.length / 4); r++) {
                var row = $("<div>").addClass("row no-gutter");
                var columns = r + 1 === Math.ceil(json.Q_QTYPE.RADIO.Q_SRC_COLOR_ID.length / 4) ? json.Q_QTYPE.RADIO.Q_SRC_COLOR_ID.length % 4 : 4;
                for (var c = 0; c < columns; c++) {
                    var col = $("<div>").addClass("col-25").append(
                            $("<label>").addClass("label-radio item-content clr").css("background-color", "#" + json.Q_QTYPE.RADIO.Q_SRC_COLORS[r * 4 + c]).append(
                            $("<input>").attr("type", "radio").attr("name", json.plugin_type).attr("sort", qc).val(json.Q_QTYPE.RADIO.Q_SRC_COLOR_ID[r * 4 + c]).prop("required", function () {
                        return json.required === 1;
                    }),
                            $("<div>").addClass("item-inner").css("border", "none")));

                    row.append(col);
                }
                if (row.children().length > 0)
                    li.append(row);
            }
        }
    } else {
        li = $("<input>").attr("type", "hidden").attr("name", json.plugin_type).val(json.Q_QTYPE.RADIO.Q_SRC_COLOR_ID[0]);
        qc--;
    }
    $(".survey form ul").append(li);
}

function buildSurveyRadioSymbol(json) {
    qc++;
    if (json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID.length > 1) {
        $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
            if (json.required === 1) {
                return qc + ". * " + json.Q_QUESTION_ADDON;
            } else {
                return qc + ". " + json.Q_QUESTION_ADDON;
            }
        }));

        if (json.guide)
            buildSurveyGuide(json.guide, qc, json.plugin_type);

        if (json.Q_SHOW_NAMES === 1) {
            for (var i = 0; i < json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID.length; i++) {
                var li = $("<li>").append($("<label>").addClass("label-radio item-content").append(
                        $("<input>").attr("type", "radio").attr("name", json.plugin_type).attr("plugin", json.plugin_type).attr("sort", qc).val(json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID[i]).prop("required", function () {
                    return json.required === 1;
                }),
                        $("<div>").addClass("item-media").append(
                        $("<img>").attr("src", stddir + "images_dyn/symbol_svg_ID.php?ID=" + json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID[i] + "&C=ccc").attr("height", "29px")),
                        $("<div>").addClass("item-inner").append(
                        $("<div>").addClass("item-title").text(json.source.options[i]))));

                $(".survey form ul").append(li);
            }
        } else {
            li = $("<li>");

            for (var r = 0; r < Math.ceil(json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID.length / 4); r++) {
                var row = $("<div>").addClass("row no-gutter");
                var columns = r + 1 === Math.ceil(json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID.length / 4) ? json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID.length % 4 : 4;
                for (var c = 0; c < columns; c++) {
                    var col = $("<div>").addClass("col-25").append(
                            $("<label>").addClass("label-radio item-content smbl").append(
                            $("<input>").attr("type", "radio").attr("name", json.plugin_type).attr("plugin", json.plugin_type).attr("sort", qc).val(json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID[r * 4 + c]).prop("required", function () {
                        return json.required === 1;
                    }),
                            $("<div>").addClass("item-inner").css("border", "none").append(
                            $("<img>").attr("src", stddir + "images_dyn/symbol_svg_ID.php?ID=" + json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID[r * 4 + c] + "&C=ccc")
                            )));

                    row.append(col);
                }
                li.append(row);
            }
            $(".survey form ul").append(li);
        }
    } else {
        $(".survey form ul").append($("<input>").attr("type", "hidden").attr("name", json.plugin_type).val(json.Q_QTYPE.RADIO.Q_SRC_SYMBOL_ID[0]));
        qc--;
    }
}

function buildSurveyRadioSize(json) {
    qc++;
    if (json.Q_QTYPE.RADIO.Q_SRC_SIZE_ID.length > 1) {
        $(".survey form ul").append($("<div>").addClass("item-divider").text(function () {
            if (json.required === 1) {
                return qc + ". * " + json.Q_QUESTION_ADDON;
            } else {
                return qc + ". " + json.Q_QUESTION_ADDON;
            }
        }));

        if (json.guide)
            buildSurveyGuide(json.guide, qc, json.plugin_type);

        for (var i = 0; i < json.Q_QTYPE.RADIO.Q_SRC_SIZE_ID.length; i++) {
            var li = $("<li>").append($("<label>").addClass("label-radio item-content").append(
                    $("<input>").attr("type", "radio").attr("name", json.plugin_type).attr("plugin", json.plugin_type).attr("sort", qc).val(json.Q_QTYPE.RADIO.Q_SRC_SIZE_ID[i]).prop("required", function () {
                return json.required === 1;
            }),
                    $("<div>").addClass("item-inner").append(
                    $("<div>").addClass("item-title").text(json.source.options[i]))));

            $(".survey form ul").append(li);
        }
    } else {
        $(".survey form ul").append($("<input>").attr("type", "hidden").attr("name", json.plugin_type).val(json.Q_QTYPE.RADIO.Q_SRC_SIZE_ID[0]));
        qc--;
    }
}