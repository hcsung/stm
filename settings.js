var locks = {
	"clients": 0
};

function to_upper_case(e) {
	$(this).val($(this).val().toUpperCase());
}

function no_special_char(e, exceptions = []) {
	var hit = 0;
	var key = e.which || e.charCode;
	var regex = new RegExp("[a-zA-Z0-9]");

	key = String.fromCharCode(key);

	if ($.inArray(key, exceptions) >= 0)
		return true;

	if (regex.test(key))
		return true;

	e.preventDefault();
	return false;
}

function invalid_input(input, err, lock) {
	warn(err);
	highlight(input);
	setTimeout(function () {
		locks[lock] = 0;
	}, animation_delay);
}

function check_input(input, db_name, key) {
	if (!input.val()) {
		invalid_input(input, "Cannot be empty", db_name);
		return -1;
	}

	if (db[db_name].find(obj => match(input.val(), obj[key]))) {
		invalid_input(input, "Duplicated", db_name);
		return -1;
	}

	return 0;
}

function new_row(main, data) {
	let db_name = main.data("db");
	let tb = main.children("table");
	let th = tb.find("th");
	let tr = $("<tr>");

	th.each(function (i) {
		let key = $(this).attr("id");
		let obj;

		if (!key) { // the first column
			obj = icon("del", true);
			obj.on("click", function () {
				let tr;
				let td;
				let key;

				if (locked)
					return;

				tr = $(this).parent().parent();
				td = tr.find("td:eq(1)");
				key = tb.find("th:eq(1)").attr("id").split('-')[1];

				db[db_name] = $.grep(db[db_name], function (data) {
					return !match(td.html(), data[key]);
				});
				update_db(db_name);
				repaint_settings();
			});
		} else {
			key = key.split('-')[1];
			obj = data[key];
		}
		tr.append($("<td>").append(obj));
	});

	return tr;
}

function render_settings(main, control) {
	let db_name = main.data("db");
	let tb = main.children("table");
	let th = tb.find("th");
	let tr = $("<tr>").addClass("control");

	th.each(function (i) {
		let key = $(this).attr("id");
		let obj;

		debug("rendering setting: " + db_name + ": " + i + ": " + key);

		if (!key) { // the first column
			obj = icon("add", true);
			obj.on("click", function () {
				let tr;
				let new_data = {};
				let valid = 1;

				if (locked)
					return;

				if (locks[db_name])
					return;

				locks[db_name] = 1;

				tr = $(this).parent().parent();
				tr.find(".input").each(function (i) {
					let key = $(this).data("key");
					let check = $(this).data("check");

					if (!valid)
						return;

					$(this).val($(this).val().trim());

					if (check == 1 && check_input($(this), db_name, key)) {
						valid = 0;
						return;
					}
					new_data[key] = $(this).val();
				});

				if (!valid)
					return;

				db[db_name].push(new_data);
				update_db(db_name);
				repaint_settings();

				locks[db_name] = 0;
			});
		} else {
			obj = control.find(ctl => ctl["key"] == key);
			if (obj) {
				obj = obj["obj"]();
				obj.addClass("input");
				obj.data("key", key.split('-')[1]);
			} else {
				error("failed to render '" + db_name + "' : " +
					"key '" + key + "' not found");
				obj = $("span").text("[ERROR]");
			}
		}
		tr.append($("<td>").append(obj));
	});
	tb.append(tr);

	db[db_name].forEach(data => {
		tb.append(new_row(main, data));
	});
}

function render_settings_cli() {
	let control = [
		{
			"key": "cli-code",
			"obj": function () {
				return $("<input>")
					.attr("type", "text")
					.attr("maxlength", "5")
					.addClass("upper-case")
					.data("check", "1")
					.on("keypress", no_special_char)
					.on("keyup", to_upper_case);
			}
		},
		{
			"key": "cli-name",
			"obj": function () {
				return $("<input>")
					.attr("type", "text")
					.attr("maxlength", "14")
					.data("check", "1")
					.on("keypress", function (e) {
						no_special_char(e, [" "]);
					});
			}
		},
		{
			"key": "cli-desc",
			"obj": function () {
				return $("<input>")
					.attr("type", "text")
					.attr("maxlength", "80");
			}
		}
	];
	render_settings($("#settings-cli"), control);
}

function render_settings_proj() {
	let control = [
		{
			"key": "proj-name",
			"obj": function () {
				return $("<input>")
					.attr("type", "text")
					.attr("maxlength", "12")
					.data("check", "1")
					.on("keypress", function (e) {
						no_special_char(e, ["+"]);
					});
			}
		},
		{
			"key": "proj-chip",
			"obj": function () {
				return $("<input>")
					.attr("type", "text")
					.attr("maxlength", "8")
					.addClass("upper-case")
					.data("check", "1")
					.on("keyup", to_upper_case)
					.on("keypress", function (e) {
						no_special_char(e, ["-"]);
					});
			}
		},
		{
			"key": "proj-cli",
			"obj": function () {
				let sel = $("<select>");
				db["clients"].forEach(cli => {
					let opt = $("<option>");
					opt.append(cli["name"]);
					sel.append(opt);
				});
				return sel;
			}
		},
		{
			"key": "proj-desc",
			"obj": function () {
				return $("<input>")
					.attr("type", "text")
					.attr("maxlength", "80");
			}
		}
	];
	render_settings($("#settings-proj"), control);
}

function render_settings_job() {
	let control = [
		{
			"key": "job-stat",
			"obj": function () {
				let sel = $("<select>");
				states.forEach(stat => {
					let opt = $("<option>");
					opt.text(stat);
					sel.append(opt);
				});
				return sel;
			}
		},
		{
			"key": "job-cate",
			"obj": function () {
				let sel = $("<select>");
				categories.forEach(cate => {
					let opt = $("<option>");
					opt.text(cate["name"]);
					sel.append(opt);
				});
				return sel;
			}
		},
		{
			"key": "job-pri",
			"obj": function () {
				let sel = $("<select>");
				priorities.forEach(pri => {
					let opt = $("<option>");
					opt.text(pri);
					sel.append(opt);
				});
				return sel;
			}
		},
		{
			"key": "job-link",
			"obj": function () {
				return $("<input>")
					.attr("type", "text")
					.attr("maxlength", "12")
					.addClass("upper-case")
					.data("check", "1")
					.on("keyup", to_upper_case)
					.on("keypress", function (e) {
						no_special_char(e, ["-"]);
					});
			}
		},
		{
			"key": "job-proj",
			"obj": function () {
				let sel = $("<select>");
				db["projects"].forEach(proj => {
					let opt = $("<option>");
					opt.text(proj["name"]);
					opt.val(proj["code"]);
					sel.append(opt);
				});
				return sel;
			}
		},
		{
			"key": "job-title",
			"obj": function () {
				return $("<input>")
					.attr("type", "text")
					.attr("maxlength", "80")
					.data("check", "1");
			}
		}
	];
	render_settings($("#settings-job"), control);

	let tb = $("#settings-job").children("table");

	tb.find("tr").each(function (i) {

		let target;
		let text;
		let div;
		let obj;

		if (i < 2)
			return;

		// status
		id = tb.find("th#job-stat").index();
		target = $(this).children().eq(id);
		text = target.text();
		target.text("");
		obj = $("<div>").addClass("mark");
		obj.addClass(text == "-" ? "na" : text.toLowerCase());
		target.append(obj.text(text));
	});
}

function repaint_settings() {
	[
		$("#settings-job").children("table"),
		$("#settings-proj").children("table"),
		$("#settings-cli").children("table"),
	].forEach(tb => {
		tb.find("tr").each(function (i) {
			if (i > 0)
				$(this).remove();
		});
	});
	render_settings_job();
	render_settings_proj();
	render_settings_cli();
}

render_settings_job();
render_settings_proj();
render_settings_cli();
