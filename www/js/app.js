// LEHMBAU

var app = new Framework7({
    statusbarOverlay: false,
    swipePanelOnlyClose: true
});
$.holdReady(true);

var preferences;
var rate2 = false, quickpoint = false;
var images = [];
var cluster, map, marker, passive_marker, layer_std_points, layer_trk_lines, layer_img_points,
        highaccuracygeoloc, basemap_aerial, osmlight;
var icon = L.icon({
    iconUrl: "img/i/i-pin-lf.svg",
    iconSize: [50, 76],
    iconAnchor: [25, 76]
}), icon_grey = L.icon({
    iconUrl: "img/i/i-pin-grey-lf.svg",
    iconSize: [50, 76],
    iconAnchor: [25, 76],
    popupAnchor: [0, -80]
});

var offline;
var stddir = "https://thinkspatial.boku.ac.at/app/";
var strings;
var timeout = 10 * 1000;

var u_id, u_lang = "de", u_name, u_project, u_projects, u_project_name,
        u_project_auth, u_point, u_point_id, u_point_info, u_points, u_survey,
        u_track_pois = [];

var view = app.addView(".view-main", {
    domCache: true,
    swipeBackPage: false
});

$(document).on("deviceready", function () {
    StatusBar.show();
    StatusBar.backgroundColorByHexString("#746451");
    $.holdReady(false);

    $(document).on("online", function () {
        offline = false;
        app.hidePreloader();
        ajaxLanguages();
    });

    $(document).on("offline", function () {
        offline = true;
        //app.showPreloader(strings[u_lang].errors.iconnection);
    });

    setInterval(function () {
        switch (navigator.connection.type) {
            case Connection.UNKNOWN:
            case Connection.CELL_2G:
            case Connection.CELL:
            case Connection.NONE:
                offline = true;
                //app.showPreloader(strings[u_lang].errors.iconnection);
                break;
            default:
                //offline ? app.hidePreloader() : null;
                offline ? ajaxStoredSurveys() : null;
                offline = false;
        }
    }, 1000);
});

$(document).ready(function () {
    $(document).ajaxSend(function (e, xhr, settings) {
        if (offline && !settings.isLocal) {
            xhr.abort();
            app.alert(strings[u_lang].errors.iconnection, strings[u_lang].errors.error);
        }
    });

    $.ajaxSetup({error: function (xhr, textStatus, thrownError) {
            app.hidePreloader();
            app.pullToRefreshDone();
            console.log(xhr);
            console.log(xhr.getAllResponseHeaders());
            if (!offline) {
                app.alert(thrownError + "<br>" + textStatus, strings[u_lang].errors.error);
                if (xhr.settings.url.replace(stddir, "") === "app_survey.php") {
                    clearMap();
                }
            }
        }, timeout: timeout});

    ajaxLanguages();

    var check = function () {
        !offline ? ajaxLanguages() : setTimeout(function () {
            execfn();
        }, 1000);
    };

    check();

    window.onerror = function (message, source, line) {
        //console.log(message + "\n" + source + "\n" + line);
    };
});

app.onPageInit("login", function (page) {
    $(".login #tab_login .item-link").click(function (e) {
        app.showPreloader(strings[u_lang].labels.loading);
        var data = $(".login form").serializeArray();
        u_name = data[0].value;
        data[1].value = md5(data[1].value);
        data.push({"name": "lehmbau", "value": 1});

        $.ajax(stddir + "app_login.php", {dataType: "json", data: data, method: "POST", success: function (result) {
                if (result !== 99) {
                    u_project = result.projects[0];
                    u_lang = result.user.lang;
                    u_id = result.user.id;
                    app.showPreloader(strings[u_lang].labels.loading);
                    u_project_name = u_project.name;
                    u_project_auth = u_project.auth;
                    $(".login #tab_login input[name=pass]").val("");

                    ajaxMap(false);
                } else {
                    app.hidePreloader();
                    app.alert(null, strings[u_lang].errors.error + ": " + strings[u_lang].errors.loginFail);
                }
            }});
    });

    $(".login .list-block-label a").eq(0).click(function () {
        cordova.InAppBrowser.open(stddir + "signin.php?AUTH=ASZ5HRMPYNKTG8N1YL5W", "_system");
    });
    
    $(".login .list-block-label a").eq(1).click(function () {
        cordova.InAppBrowser.open("https://thinkspatial.boku.ac.at/app/password_request.php", "_system");
    });

    $(".login .list-block-label a").eq(2).click(function () {
        cordova.InAppBrowser.open("http://cs-lehmbau.boku.ac.at/", "_system");
    });
    
    $(".login .list-block-label a").eq(3).click(function () {
        cordova.InAppBrowser.open("http://cs-lehmbau.boku.ac.at/datenschutz/", "_system");
    });
}).trigger();

app.onPageBeforeAnimation("map", function (page) {
    app.hidePreloader();
    map.invalidateSize();
    $("div.map div.toolbar span").text(strings[u_lang].labels.aerial);

    $(".map .navbar .left").click(function () {
        logout();
        view.router.back({pageName: "login", force: true});
    });

    $(".map .navbar .right #locate").click(function () {
        map.locate({enableHighAccuracy: highaccuracygeoloc});
    });

    $("div.map div.toolbar input").change(function () {
        switch ($(this).attr("name")) {
            case "sat":
                if ($(this).prop("checked")) {
                    map.removeLayer(osmlight);
                    map.addLayer(basemap_aerial);
                } else {
                    map.removeLayer(basemap_aerial);
                    map.addLayer(osmlight);
                }
                break;
        }
    });
});

app.onPageAfterBack("map", function () {
    try {
        clearMap();
        clearSurvey();
    } catch (e) {
        console.log(e);
    }
});

app.onPageBeforeAnimation("survey", function (page) {
    if (page.query.quickpoint) {
        quickpoint = true;
    }
    buildSurveyPage();

    $(".survey .navbar .center").text(strings[u_lang].labels.questionnaire);
    $(".survey .button").text(strings[u_lang].buttons.send);

    $(".survey .navbar .left a").click(function () {
        view.router.back({pageName: "map", force: true});
    });

    $(".survey .navbar .icon-camera").click(function (e) {
        if ($(".actions-modal").length === 1) {
            return;
        }

        var buttons = [
            {
                text: strings[u_lang].buttons.camera,
                onClick: function () {
                    picture(1);
                }
            },
            {
                text: strings[u_lang].buttons.photolibrary,
                onClick: function () {
                    picture(2);
                }
            }
        ];

        var group = [buttons, [{
                    text: strings[u_lang].buttons.cancel,
                    color: "red"
                }]];

        app.actions(group);

        function picture(type) {
            navigator.camera.getPicture(function (image) {
                images.push(image);
                $(".survey .navbar .badge").show().text(images.length);
            }, function (message) {
                //app.alert(message);
            }, {
                quality: 50,
                allowEdit: false,
                sourceType: type
            });
        }
    });

    $(".survey .navbar .badge").hide();

    $(".survey .row input[type='checkbox']").on("change", function () {
        $(".row input[name='" + this.name + "']").not(this).prop("checked", false);
    });

    $(document).on("change", ".popover input", function () {
        $(".survey input[sort=" + $(this).attr("sort") + "]").val($(this).val());
        if ($(".popover img").length > 0) {
            $(".survey input[sort=" + $(this).attr("sort") + "]").parent().next().empty();
            $(".survey input[sort=" + $(this).attr("sort") + "]").parent().next().append($(this).prev().clone());
        } else {
            $(".survey input[sort=" + $(this).attr("sort") + "]").parent().next().text($(this).val());
        }
        app.closeModal();
    });

    $(".survey .button").click(function (e) {
        app.showPreloader(strings[u_lang].labels.loading);
        var check = checkRequired();
        if (check[0]) {
            var data = {};
            if (u_project.access === "rateonly") {
                data.poi_type = "RATE";
            } else {
                if (quickpoint) {
                    data.poi_type = "IMG";
                    quickpoint = false;
                } else {
                    data.poi_type = "STD";
                }
            }
            $.each($(".survey form").serializeArray(), function () {
                data[this.name] = this.value;
            });
            data.auth = u_project_auth;
            data.uid = u_id;
            if (rate2) {
                data.poi_id = u_point.id;
                data.lat = u_point.geometry.coordinates[1];
                data.lon = u_point.geometry.coordinates[0];
            } else {
                data.lat = marker.getLatLng().lat;
                data.lon = marker.getLatLng().lng;
            }
            rate2 = false;

            if (!offline) {
                $.ajax(stddir + "app_poi_save.php", {data: {response: data}, method: "POST", success: function (result) {
                        ajaxMap(true);
                        u_point_id = result;
                        if (images.length > 0) {
                            uploadPictures(images);
                        }
                        app.addNotification({
                            title: "ThinkSpatial App",
                            subtitle: strings[u_lang].hints.evaluation,
                            message: strings[u_lang].hints.evaluationSuccess,
                            media: '<img width="44" height="44" style="border-radius:25%" src="img/app_logo_50.png">'
                        });
                    }
                });
            } else {
                data.images = images;
                storeSurvey(data);
                clearSurvey();
                app.hidePreloader();
                view.router.back({pageName: "map", force: true});
                app.addNotification({
                    title: "ThinkSpatial App",
                    subtitle: strings[u_lang].hints.evaluationStored,
                    message: strings[u_lang].hints.evaluationSuccess,
                    media: '<img width="44" height="44" style="border-radius:25%" src="img/app_logo_50.png">'
                });
            }
        } else {
            app.hidePreloader();
            app.alert(null, check[1] + " " + strings[u_lang].hints.unfulfilled);
        }

        e.stopImmediatePropagation();
    });
});

app.onPageAfterAnimation("survey", function (page) {
    if (quickpoint) {
        $(".survey .navbar .icon-camera").click();
    }
});

app.onPageAfterBack("survey", function (page) {
    clearSurvey();
    quickpoint = false;
});

app.onPageBeforeAnimation("point", function (page) {
    if (u_project.access === "norate" || u_project.access === "closed") {
        $(".point .navbar .right").css("visibility", "hidden");
    }

    $(".point .navbar .left a").click(function () {
        view.router.back();
    });

    $(".point .navbar .right a").click(function () {
        app.showPreloader(strings[u_lang].labels.loading);
        rate2 = true;
        view.router.load({pageName: "survey"});
        clearPointPage();
        app.hidePreloader();
    });

    $(".point .pull-to-refresh-content").on("refresh", function (e) {
        var data = {
            auth: u_project_auth,
            poi_id: u_point.id,
            uid: u_id,
            os: device.platform,
            os_ver: device.version
        };
        $.ajax(stddir + "app_poi_info.php", {dataType: "json", data: data, method: "POST", success: function (result) {
                u_point_info = result;
                clearPointPage();
                buildPointPage();
                app.pullToRefreshDone();
            }});

        e.stopImmediatePropagation();
    });
});

app.onPageAfterBack("point", function (page) {
    clearPointPage();
});

app.onPageBeforeAnimation("binfo", function (page) {
    $(".binfo .navbar .left a").click(function () {
        view.router.back();
    });
});

function buildSurveyPage() {
    if (u_project.access === "rateonly") {
        buildSurveyRateonly(u_survey.basic);
    } else if (quickpoint) {
        buildSurveyQuickpoint(u_survey.basic);
    } else {
        buildSurveyBasic(u_survey.basic);
        if (u_survey.generic) {
            buildSurveyGeneric(u_survey.generic);
        }
        if (u_survey.optional) {
            buildSurveyOptional(u_survey.optional);
        }
        qc = 0;
    }
}

function buildPointPage() {
    try {
        buildInfoBasic(u_point_info.BASIC);
        u_point_info.GENERIC ? buildInfoGeneric(u_point_info.GENERIC) : null;
        $("<div>").addClass("item-divider small").text("N = " + u_point_info.COUNT).insertBefore($(".point .item-divider").first());
    } catch (e) {
        console.log(e);
        clearPointPage();
    }
}

function buildBasicInfoPage() {
    $(".binfo .page-content").empty();

    $.ajax(stddir + "app_info.php", {method: "POST", dataType: "JSON", success: function (result) {
            for (var i = 0; i < result.length; i++) {
                $(".binfo .page-content").append(
                        $("<div>").addClass("content-block-title").text(result[i].title),
                        $("<div>").addClass("content-block").append($("<div>").addClass("content-block-inner").append($("<p>").text(result[i].text))));
            }
        }
    });
}

function uploadPictures(array) {
    var win = function (r) {
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
    };

    var fail = function (error) {
        //app.alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
    };

    for (var i = 0; i < array.length; i++) {
        var options = new FileUploadOptions();
        options.fileKey = "image";
        options.fileName = u_project_auth + "_" + u_point_id + "_" + u_id + "_" + new Date().getTime();

        var ft = new FileTransfer();
        ft.upload(array[i], encodeURI(stddir + "app_picture_save.php"), win, fail, options);
    }

    app.addNotification({
        title: "ThinkSpatial App",
        subtitle: strings[u_lang].hints.evaluation,
        message: strings[u_lang].hints.evaluationSuccessPics,
        media: '<img width="44" height="44" style="border-radius:25%" src="img/app_logo_50.png">'
    });
}

function initLeaflet() {
    var bbox = L.latLngBounds(u_project.bbox.lt, u_project.bbox.rb);

    map = L.map("map", {
        center: u_project.center,
        maxBounds: bbox,
        tap: false,
        zoom: 17,
        maxZoom: 18,
        zoomControl: false
    });

    osmlight = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
        attribution: "Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
        subdomains: ["a", "b", "c"]
    });

    basemap_aerial = new L.tileLayer("http://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg", {
        subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
        attribution: 'Tiles &copy; <a href="http://basemap.at">Basemap.at</a>'});

    initGeoJSON();
    cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        disableClusteringAtZoom: 17,
        spiderfyOnMaxZoom: false
    });
    cluster.addLayer(layer_std_points);
    map.addLayer(cluster);

    map.addLayer(osmlight);

    map.locate();

    map.on("locationfound", function (e) {
        if (bbox.contains(e.latlng)) {
            map.setView(e.latlng, 17);
            if (u_project.access !== "closed" && u_project.access !== "rateonly") {
                if (!marker) {
                    marker = L.marker(e.latlng, {draggable: true, icon: icon});
                    marker.addTo(map);

                    marker.on("click", markerClick);
                } else {
                    marker.setLatLng(e.latlng);
                    marker.fire("click");
                }
            } else {
                if (!passive_marker) {
                    passive_marker = L.marker(e.latlng, {icon: icon_grey});
                    if (u_project.access === "rateonly")
                        passive_marker.bindPopup(strings[u_lang].labels.rateonly_popup);
                    passive_marker.addTo(map);
                } else {
                    passive_marker.setLatLng(e.latlng);
                }
            }
        } else {
            map.setView(u_project.center, 17);
            if (u_project.access !== "closed" && u_project.access !== "rateonly") {
                if (!marker) {
                    marker = L.marker(u_project.center, {draggable: true, icon: icon});
                    marker.addTo(map);
                    marker.on("click", markerClick);
                } else {
                    marker.setLatLng(u_project.center);
                }
            } else {
                if (!passive_marker) {
                    passive_marker = L.marker(u_project.center, {draggable: true, icon: icon_grey});
                    if (u_project.access === "rateonly")
                        passive_marker.bindPopup(strings[u_lang].labels.rateonly_popup);
                    passive_marker.addTo(map);
                } else {
                    passive_marker.setLatLng(u_project.center);
                }
            }
            app.alert(null, strings[u_lang].hints.hint + ": " + strings[u_lang].hints.location);
        }
    });

    map.on("locationerror", function (e) {
        if (u_project.access !== "closed" && u_project.access !== "rateonly") {
            if (!marker) {
                marker = L.marker([u_project.center], {draggable: true, icon: icon});
                marker.addTo(map);

                marker.on("click", markerClick);
            }
        }

        app.alert(null, strings[u_lang].hints.hint + ": " + strings[u_lang].hints.locationError);
    });

    map.on("click", function (e) {
        console.log(u_project);
        if (u_project.access !== "closed" && u_project.access !== "rateonly") {
            if (bbox.contains(e.latlng)) {
                marker.setLatLng(e.latlng);
                marker.fire("click");
            } else {
                app.alert(null, strings[u_lang].hints.hint + ": " + strings[u_lang].hints.marker);
            }
        }
    });
}

function initGeoJSON() {
    var sizes = [];
    for (var i = 0; i < u_points.std.features.length; i++) {
        if (sizes.indexOf(u_points.std.features[i].properties.size) < 0)
            sizes.push(u_points.std.features[i].properties.size);
    }

    sizes.sort(function (a, b) {
        return a - b;
    });
    var largest = sizes[sizes.length - 1];

    var r0 = sizes[0] < window.innerWidth * 0.15 ? window.innerWidth * 0.15 / sizes[0] : 0.5;
    var r1 = largest < 100 ? 1.5 : largest >= 100 && largest < 200 ? 1 : largest >= 200 ? 0.5 : 0.25;

    var scale = d3.scaleLinear()
            .domain([sizes[0], largest])
            .range([r0, r1]);

    layer_std_points = L.geoJson(u_points.std, {
        onEachFeature: function (f, l) {
            var url = stddir + "images_dyn/symbol_svg_ID.php?ID=" + f.properties.symbol + "&C=" + f.properties.color + "&shadow=" + u_project.shadow;
            var size = f.properties.size * scale(f.properties.size);

            l.setIcon(L.icon({
                iconUrl: url,
                iconSize: [size, size],
                iconAnchor: [size / 2, size]
            }));
            var name = f.properties.name.indexOf("|") > 0 ? f.properties.name.substring(0, f.properties.name.indexOf("|")) : f.properties.name;
            var buttons = [
                {
                    text: name,
                    label: true
                }, {
                    text: strings[u_lang].buttons.view,
                    onClick: function () {
                        app.showPreloader(strings[u_lang].labels.loading);
                        u_point = f;
                        var data = {
                            auth: u_project_auth,
                            poi_id: u_point.id,
                            uid: u_id,
                            os: device.platform,
                            os_ver: device.version
                        };
                        $.ajax(stddir + "app_poi_info.php", {dataType: "json", data: data, method: "POST", success: function (result) {
                                u_point_info = result;
                                try {
                                    buildPointPage();
                                    view.router.load({pageName: "point"});
                                } catch (e) {
                                    console.log(e);
                                    app.alert(null, strings[u_lang].errors.error + ": " + strings[u_lang].errors.point);
                                }
                                app.hidePreloader();
                            }
                        });
                    }
                }, {
                    text: strings[u_lang].buttons.evaluate,
                    onClick: function () {
                        app.showPreloader(strings[u_lang].labels.loading);
                        u_point = f;
                        rate2 = true;
                        view.router.load({pageName: "survey"});
                        app.hidePreloader();
                    }
                }, {
                    text: strings[u_lang].buttons.delete,
                    color: "red",
                    disabled: true,
                    onClick: function () {
                        app.modal({
                            title: strings[u_lang].hints.hint,
                            text: strings[u_lang].hints.markerDelete,
                            buttons: [
                                {
                                    text: strings[u_lang].buttons.no,
                                    close: true
                                },
                                {
                                    text: strings[u_lang].buttons.yes,
                                    onClick: function () {
                                        app.showPreloader(strings[u_lang].labels.loading);
                                        var data = {uid: u_id, auth: u_project_auth, poi_id: u_point.id, os: device.platform,
                                            os_ver: device.version};
                                        $.ajax(stddir + "app_poi_delete.php", {dataType: "json", data: data, method: "POST", success: function (result) {
                                                ajaxMap(true);
                                                app.hidePreloader();
                                            }});
                                    }
                                }
                            ]
                        });
                    }
                }
            ];

            if (u_project.access === "norate" || u_project.access === "closed") {
                buttons.splice(2, 1);
            }

            var groups = [buttons, [{
                        text: strings[u_lang].buttons.cancel,
                        color: "red"
                    }]];

            l.on("click", function (e) {
                if ($(".actions-modal").length === 0) {
                    u_point = this.feature;
                    if (u_point.properties.delete === 1) {
                        groups[0][u_project.access === "closed" || u_project.access === "norate" ? 2 : 3].disabled = false;
                    } else {
                        groups[0][u_project.access === "closed" || u_project.access === "norate" ? 2 : 3].disabled = true;
                    }
                    app.actions(groups);
                }
            });
        }
    });
}

function markerClick() {
    if (!$(".actions-modal").length) {
        var buttons = [
            {
                text: strings[u_lang].buttons.evaluate,
                onClick: function (e) {
                    console.log(e);
                    console.log("#1");
                    app.showPreloader(strings[u_lang].labels.loading);
                    view.router.load({query: {quickpoint: false}, pageName: "survey"});
                    app.hidePreloader();
                }
            }, {
                text: strings[u_lang].buttons.cancel,
                color: "red"
            }
        ];

        app.actions(buttons);
    }
}

function checkRequired() {
    var ok = true;
    var question;
    $.each($(".survey form").find("input, textfield, select"), function (i, element) {
        var required = $(element).prop("required");
        if (($(element).prop("nodeName") !== "select" && $(element).attr("type") !== "text" && $(element).attr("type") !== "hidden" && !$(".survey input[name=" + $(element).attr("name") + "]").is(":checked") && required) ||
                ($(element).prop("nodeName") !== "select" && !$(".survey input[name=" + $(element).attr("name") + "], .survey textarea[name=" + $(element).attr("name") + "]").val() && required) ||
                ($(element).prop("nodeName") === "select" && !$(element).children().is(":selected") && required)) {
            question = strings[u_lang].hints.question + " " + $(element).attr("sort");
            ok = false;
            return false;
        }
    });
    return [ok, question];
}

function clearMap() {
    map.remove();
    map = undefined;
    marker = undefined;
    passive_marker = undefined;
    images = [];
    $("head").find("style").remove();
    $(".map .navbar, .point .navbar, .survey .navbar").removeAttr("style");
    $(".map").find("#map").attr("class", "page-content").removeAttr("tabindex");
    $(".point .navbar .right, .map .navbar .right").removeAttr("style");
}

function clearSurvey() {
    $(".survey .page-content ul").empty();
    rate2 = false;
    quickpoint = false;
    images = [];
}

function resetSurvey() {
    $(".survey [checked]").prop("checked", false);
    $(".survey [value]").removeAttr("value");
    rate2 = false;
    quickpoint = false;
    images = [];
}

function clearPointPage() {
    $(".point .page-content > .row").empty();
    $(".point .list-block ul").empty();
    $(".point .list-block").nextAll().remove();
    $(".point .page-content").scrollTop(0);
}

function ajaxMap(survey) {
    layer_img_points = null;
    layer_std_points = null;
    layer_trk_lines = null;
    if (typeof map !== "undefined" && map !== null && typeof cluster !== "undefined") {
        cluster.clearLayers();
        map.remove();
    }
    var data = {
        uid: u_id,
        auth: u_project_auth,
        os: device.platform,
        os_ver: device.version
    };
    $.ajax(stddir + "app_pois_get_new.php", {dataType: "json", data: data, method: "POST", success: function (result) {
            u_points = result;
            if (u_points !== "99") {
                var data = {
                    auth: u_project_auth,
                    uid: u_id,
                    os: device.platform,
                    os_ver: device.version
                };
                initLeaflet();
                if (u_project.access !== "closed") {
                    $.ajax(stddir + "app_survey_new.php", {dataType: "json", data: data, method: "POST", success: function (result) {
                            u_survey = result;
                            view.router.load({pageName: "map"});
                            app.hidePreloader();
                        }});
                } else if (survey) {
                    clearSurvey();
                    app.hidePreloader();
                    view.router.back({pageName: "map", force: true});
                } else {
                    view.router.load({pageName: "map"});
                    app.hidePreloader();
                }
            } else {
                app.hidePreloader();
                app.alert("Fehler bei Datenübertragung", "Fehler");
            }
        }
    });
}

function logout() {
    u_id = undefined;
    u_name = undefined;
    u_project = undefined;
    u_project_name = undefined;
    u_project_auth = undefined;
    u_point = undefined;
    u_point_id = undefined;
    u_point_info = undefined;
    u_points = undefined;
    u_survey = undefined;
}

function ajaxLanguages() {
    if (!offline && ((strings && strings.source === "local") || !strings)) {
        $.ajax(stddir + "app_languages.php", {data: {json: 1}, dataType: "json", method: "POST", success: function (result) {
                strings = result;
            }});
    } else if (offline && !strings) {
        $.ajax("app_languages.json", {dataType: "json", isLocal: true, method: "GET", success: function (result) {
                strings = result;
            }});
    }
}

function storeSurvey(data) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
        dir.getFile("surveys.json", {create: true, exclusive: false}, function (fileEntry) {
            var surveys;
            fileEntry.file(function (file) {
                var reader = new FileReader();
                surveys = JSON.parse(reader.readAsText(file));
            });

            if (!surveys) {
                surveys = [data];
            } else {
                surveys.push(data);
            }

            app.alert(JSON.stringify(surveys));

            fileEntry.createWriter(function (writer) {
                surveys = new Blob(surveys, {type: "application/json"});
                writer.write(surveys);
            });
        });
    });
}

function ajaxStoredSurveys() {
    var surveys;
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
        dir.getFile("surveys.json", {create: true, exclusive: false}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                surveys = JSON.parse(reader.readAsText(file));
                app.alert(reader.readAsText(file));
            });
        });
    });

    for (var i = 0; i < surveys.length; i++) {
        var data = surveys[i];
        images = data.images;
        delete data.images;
        $.ajax(stddir + "app_poi_save.php", {data: {response: data}, method: "POST", success: function (result) {
                ajaxMap(true);
                u_point_id = result;
                if (images.length > 0) {
                    uploadPictures(images);
                }
                app.addNotification({
                    title: "ThinkSpatial App",
                    subtitle: strings[u_lang].hints.evaluation,
                    message: strings[u_lang].hints.evaluationSuccess,
                    media: '<img width="44" height="44" style="border-radius:25%" src="img/app_logo_50.png">'
                });
            }
        });
    }

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
        dir.getFile("surveys.json", {create: true, exclusive: false}, function (fileEntry) {
            fileEntry.createWriter(function (writer) {
                surveys = new Blob([], {type: "application/json"});
                writer.write(surveys);
            });
        });
    });
}