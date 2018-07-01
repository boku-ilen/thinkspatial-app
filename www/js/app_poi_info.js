function buildInfoBasic(json) {
    json = json.sort(function (a, b) {
        return a.SORT - b.SORT;
    });
    for (var i = 0; i < json.length; i++) {
        switch (json[i].Q_PLUGIN_TYPE) {
            case "NAME":
            case "COMMENT":
                buildInfoText(json[i]);
                break;
            case "COLOR":
                buildInfoColor(json[i]);
                break;
            case "SYMBOL":
                buildInfoSymbol(json[i]);
                break;
            case "PICTURES":
                buildInfoPictures(json[i]);
                break;
        }
    }
}

function buildInfoIMGP(json) {
    json = json.sort(function (a, b) {
        return a.SORT - b.SORT;
    });
    for (var i = 0; i < json.length; i++) {
        switch (json[i].Q_PLUGIN_TYPE) {
            case "NAME":
            case "COMMENT":
                buildInfoText(json[i]);
                break;
            case "PICTURES":
                buildInfoPictures(json[i]);
                break;
        }
    }
}

function buildInfoGeneric(json) {
    for (var i = 0; i < json.length; i++) {
        switch (json[i].Q_QTYPE) {
            case "TEXT":
                buildInfoText(json[i]);
                break;
            case "RADIO":
            case "SELECT":
                buildInfoRadioSelect(json[i]);
                break;
            case "CHECKBOX":
                buildInfoCheckbox(json[i]);
                break;
            case "MATRIX":
                buildInfoMatrix(json[i]);
                break;
        }
    }
}

function buildInfoText(json) {
    if (json.Q_PLUGIN_TYPE === "NAME") {
        $(".point .navbar .center").text(json.Q_SURVEY_RESULTS[0]);
    } else {
        if (json.Q_PLUGIN_TYPE === "GENERIC") {
            $("<li>").addClass("item-divider").text(json.Q_QUESTION).appendTo(".point .list-block > ul");
        } else {
            $("<li>").addClass("item-divider").text("Kommentar(e)").appendTo(".point .list-block > ul");
        }
        for (var i = 0; i < json.Q_SURVEY_RESULTS.length; i++) {
            if (i === 0) {
                $(".point .list-block > ul").append($("<li>").addClass("accordion-item").append(
                        $("<a>").addClass("item-content item-link").append($("<div>").addClass("item-inner").append($("<div>").addClass("item-text").text(json.Q_SURVEY_RESULTS[i]))),
                        $("<div>").addClass("accordion-item-content")
                        ));
            } else {
                $(".point .list-block > ul > li").last().find(".accordion-item-content").append($("<li>").addClass("item-content").append($("<div>").addClass("item-inner").append($("<div>").addClass("item-text").text(json.Q_SURVEY_RESULTS[i]))));
            }
        }
    }
}

function buildInfoColor(json) {
    $("<div>").addClass("row no-gutter").insertAfter($(".point .page-content ul > .item-content").first());
    for (var i = 1; i < json.Q_SURVEY_RESULTS.length; i++) {
        $("<div>").css({width: 100/(json.Q_SURVEY_RESULTS.length-1)+"%", "background-color": "#" + json.Q_SURVEY_RESULTS[i][0]}).html("&nbsp;").appendTo($(".point .page-content ul > .row").first());
    }
}

function buildInfoSymbol(json) {
    var mixcolor = $.grep(u_point_info.BASIC, function (el, i) {
        return el.Q_PLUGIN_TYPE === "COLOR";
    })[0].Q_SURVEY_RESULTS[0][0];
    var li = $("<li>").addClass("item-content").append($("<div>").addClass("item-inner"));
    li.find(".item-inner").append($("<div>").addClass("row").append($("<div>").addClass("col-auto").html("<img width='50%' src='" + stddir + "images_dyn/symbol_svg_ID.php?ID=" + json.Q_SURVEY_RESULTS[0][0] + "&C=" + mixcolor + (mixcolor === "ffffff" ? "&shadow=0.5" : "") + "'>")));
    li.find(".item-inner").append($("<div>").addClass("row"));

    if (json.Q_SURVEY_RESULTS.length > 1) {
        for (var r = 0; r < Math.ceil((json.Q_SURVEY_RESULTS.length - 1) / 4); r++) {
            var rows = r + 1 === Math.ceil((json.Q_SURVEY_RESULTS.length - 1) / 4) ? (json.Q_SURVEY_RESULTS.length - 1) % 4 : 4;
            li.find(".item-inner > .row").last().append($("<div>").addClass("row"));
            for (var c = 0; c < 4; c++) {
                if (c < rows) {
                    li.find(".row > .row").last().append($("<div>").addClass("col-auto").html("<img width='100%' src='" + stddir + "images_dyn/symbol_svg_ID.php?ID=" + json.Q_SURVEY_RESULTS[r * 4 + c + 1][0] + "&C=ccc'>"));
                } else {
                    li.find(".row > .row").last().append($("<div>").addClass("col-auto"));
                }
            }
        }
    }

    $(".point .list-block > ul").append(li);
}

function buildInfoPictures(json) {
    $(".point .list-block > ul").append(
            $("<li>").append(
            $("<a>").attr("href", "#").addClass("item-link item-content").append(
            $("<div>").addClass("item-inner").append(
            $("<div>").addClass("item-title").text(strings[u_lang].labels.photos),
            $("<div>").addClass("item-after").append(
            $("<span>").addClass("badge").text(json.Q_PICTURES.length)
            ))).click(function () {
        var pictures = []
        for (var i = 0; i < json.Q_PICTURES.length; i++) {
            pictures.push(stddir + json.Q_PICTURES[i]);
        }
        app.photoBrowser({photos: pictures}).open();
    })));
}

function buildInfoCheckbox(json) {
    function makeData(a1, a2) {
        var array = [];
        for (var i = 0; i < a1.length; i++) {
            array.push({count: a1[i], label: a2[i]});
        }
        
        array.sort(function (a,b) {return b.count - a.count;});
        return array;
    }
    
    var content = $("<li>").addClass("item-content tagcloud").append($("<div>").addClass("item-inner").append($("<ul>")));
    var max = json.Q_SURVEY_RESULTS.filter(function (val) {
        return val > 0;
    });
    max.sort(function (a, b) {
        return a - b;
    });
    max = max[max.length - 1];
    
    var data = makeData(json.Q_SURVEY_RESULTS, json.Q_SURVEY_LABELS);

    for (var i = 0; i < data.length; i++) {
        if (data[i].count > 0)
        content.find("ul").append($("<li>").css("font-size", data[i].count / max * 200 + "%").text(data[i].label));
    }

    $(".point .list-block > ul").append($("<div>").addClass("item-divider").text(json.Q_QUESTION));
    $(".point .list-block > ul").append(content);
}

function buildInfoMatrix(json) {
    function makePolygonData(left) {
        result = [];

        for (var i = 0; i < json.Q_SURVEY_RESULTS.length; i++) {
            result.push({x: json.Q_SURVEY_RESULTS[i], y: i});
        }

        result.push({x: left ? 0-2 : json.Q_MATRIX_LABELS.length+2, y: json.Q_SURVEY_RESULTS.length - 1});
        result.push({x: left ? 0-2 : json.Q_MATRIX_LABELS.length+2, y: 0});

        return result;
    }

    var h = 35;

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

    $("<li>").addClass("item-divider").text(json.Q_QUESTION).appendTo(".point .list-block > ul");
    $("<li>").addClass("item-content").attr("id", id).append($("<div>").addClass("item-inner")).appendTo(".point .list-block > ul");

    var svg = d3.select("#" + id + " .item-inner").append("svg")
            .attr("width", $(window).width() - 30)
            .attr("height", h * json.Q_SURVEY_RESULTS.length + h)
            .attr("class", "matrix");

    var x_domain = [-2, json.Q_MATRIX_LABELS.length+1];
    var x_scale = d3.scaleLinear()
            .domain(x_domain)
            .range([0, $(window).width() - 30]);

    var y_domain = [0, json.Q_SURVEY_RESULTS.length];
    var y_scale = d3.scaleLinear()
            .domain(y_domain)
            .range([0, h * json.Q_SURVEY_RESULTS.length]);

    var line = d3.line()
            .x(function (d) {
                return x_scale(d-1);
            })
            .y(function (d, i) {
                return y_scale(i);
            });

    var polygon = d3.line()
            .x(function (d) {
                return x_scale(d.x-1);
            })
            .y(function (d) {
                return y_scale(d.y);
            });

    svg.append("g").attr("class", "poly").append("path")
            .attr("d", polygon(makePolygonData(true)))
            .attr("fill", u_project.colorLight);

    svg.select(".poly").append("path")
            .attr("d", polygon(makePolygonData(false)))
            .attr("fill", u_project.colorComplementaryLight);

    svg.append("g").selectAll("line")
            .data(json.Q_SURVEY_RESULTS)
            .enter()
            .append("line")
            .attr("x1", x_scale(0-2))
            .attr("x2", x_scale(json.Q_MATRIX_LABELS.length+1))
            .attr("y1", function (d, i) {
                return y_scale(i);
            })
            .attr("y2", function (d, i) {
                return y_scale(i);
            });
            
    svg.append("g").selectAll("line")
            .data(json.Q_MATRIX_LABELS)
            .enter()
            .append("line")
            .attr("x1", function(d,i){return x_scale(i);})
            .attr("x2", function(d,i){return x_scale(i);})
            .attr("y1", 0)
            .attr("y2", y_scale(json.Q_SURVEY_RESULTS.length-1));

    svg.append("g").attr("class", "result").append("path")
            .attr("d", line(json.Q_SURVEY_RESULTS));

    svg.select(".result").selectAll("circle")
            .data(json.Q_SURVEY_RESULTS)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x_scale(d-1);
            })
            .attr("cy", function (d, i) {
                return y_scale(i);
            })
            .attr("r", 5);

    svg.append("g").attr("class", "left").selectAll("text")
            .data(json.Q_MATRIX_LABELS_LEFT)
            .enter()
            .append("text")
            .attr("x", 5)
            .attr("y", function (d, i) {
                return y_scale(i) + 3.75;
            })
            .text(function (d) {
                return d;
            });

    if (json.Q_MATRIX_LABELS_RIGHT) {
        svg.append("g").attr("class", "right").selectAll(".text")
                .data(json.Q_MATRIX_LABELS_RIGHT)
                .enter()
                .append("text")
                .attr("x", $(window).width() - 35)
                .attr("y", function (d, i) {
                    return y_scale(i) + 3.75;
                })
                .attr("text-anchor", "end")
                .text(function (d) {
                    return d;
                });
    }

    svg.selectAll("g").attr("transform", "translate(0, " + h + ")");

}

function buildInfoRadioSelect(json) {
    console.log(json);
    var h = 25;

    function makeTwinData(array) {
        var count = {}, result = [], overall = 0;

        for (var i = 0; i < array.length; i++) {
            if (!count[array[i]]) {
                count[array[i]] = 0;
            }
            count[array[i]]++;
            overall++;
        }

        for (var j = 0; j < Object.keys(count).length; j++) {
            result.push({id: Object.keys(count)[j], count: count[Object.keys(count)[j]], label: json.Q_SURVEY_LABELS[Object.keys(count)[j]], x: j === 0 ? 0 : count[Object.keys(count)[j - 1]]});
        }

        return [overall, result];
    }

    function makeMultiData(array) {
        var count = [], keys = [], overall = 0;

        for (var i = 0; i < array.length; i++) {
            if (keys.indexOf(array[i]) < 0) {
                keys.push(array[i]);
                count[keys.indexOf(array[i])] = 0;
            }
            count[keys.indexOf(array[i])]++;
            overall++;
        }

        return [count, keys, overall];
    }

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

    $("<li>").addClass("item-divider").text(json.Q_QUESTION).appendTo(".point .list-block > ul");
    $("<li>").addClass("item-content").attr("id", id).append($("<div>").addClass("item-inner")).appendTo(".point .list-block > ul");

    var svg = d3.select("#" + id + " .item-inner").append("svg")
            .attr("width", $(window).width() - 30)
            .attr("class", "radio-select");

    if (Object.keys(json.Q_SURVEY_LABELS).length === 2) {
        svg.attr("height", h);

        var data = makeTwinData(json.Q_SURVEY_RESULTS);
        var domain = [0, data[0]];
        var scale = d3.scaleLinear()
                .domain(domain)
                .range([0, $(window).width() - 30]);

        svg.selectAll("rect")
                .data(data[1])
                .enter()
                .append("rect")
                .attr("x", function (d) {
                    return scale(d.x);
                })
                .attr("y", 0)
                .attr("width", function (d) {
                    return scale(d.count);
                })
                .attr("height", h)
                .style("fill", function (d) {
                    return color(d.id);
                });

        svg.selectAll("text")
                .data(data[1])
                .enter()
                .append("text")
                .attr("x", function (d) {
                    if (data[1].indexOf(d) === 0) {
                        return 5;
                    } else {
                        return $(window).width() - 35;
                    }
                })
                .style("text-anchor", function (d) {
                    if (data[1].indexOf(d) === 1) {
                        return "end";
                    }
                })
                .attr("y", h * 0.7)
                .text(function (d) {
                    return d.label + " " + Math.round(d.count / data[0] * 100) + "%";
                })
                .classed(".rase");
    } else if (Object.keys(json.Q_SURVEY_LABELS).length <= 10) {
        var data = makeMultiData(json.Q_SURVEY_RESULTS);
        svg.attr("height", h * data[0].length);

        var x_domain = [0, d3.max(data[0])];
        var x_scale = d3.scaleLinear()
                .domain(x_domain)
                .range([0, $(window).width() - 30]);

        var y_domain = [0, data[0].length];
        var y_scale = d3.scaleLinear()
                .domain(y_domain)
                .range([0, h * data[0].length]);

        svg.selectAll("rect")
                .data(data[1])
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", function (d) {
                    return y_scale([data[1].indexOf(d)]);
                })
                .attr("width", function (d) {
                    return x_scale(data[0][data[1].indexOf(d)]);
                })
                .attr("height", h)
                .style("fill", function (d) {
                    return color(data[1].indexOf(d));
                });

        svg.selectAll("text")
                .data(data[1])
                .enter()
                .append("text")
                .attr("x", 5)
                .attr("y", function (d) {
                    return h * 0.7 + h * data[1].indexOf(d);
                })
                .text(function (d) {
                    return json.Q_SURVEY_LABELS[d] + " " + Math.round(data[0][data[1].indexOf(d)] / data[2] * 100) + "%";
                })
                .classed(".rase");
    } else {
        svg.attr("class", "radio-select-pie");
        svg.attr("height", svg.attr("width")*0.75);
        
        var data = makeTwinData(json.Q_SURVEY_RESULTS);
        
        var pie = d3.pie().value(function(d) {return d.count;});
        var arc = d3.arc().outerRadius(svg.attr("width")*0.75/2).innerRadius(0);
        var labelArc = d3.arc().outerRadius(svg.attr("width")*0.75/2).innerRadius(h);

        var g = svg.selectAll(".arc")
                .data(pie(data[1]))
                .enter()
                .append("g")
                .attr("class", "arc");

        g.append("path")
                .attr("d", arc)
                .style("fill", function (d, i) {
                    return color(i);
                });
                
        g.append("text")
                .attr("transform", function (d) {
                    return "translate(" + labelArc.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.data.label + " " + Math.round(d.data.count / data[0] * 100) + "%";
                });
                
        g.attr("transform", "translate(" + svg.attr("width")/2 + "," + svg.attr("height")/2 + ")");
    }
}