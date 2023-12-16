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

function new_row(columns, data, name) {
	let btn = icon("del", true);
	let tr = $("<tr>");
	let td;

	btn.on("click", function () {
		let tr = $(this).parent().parent();
		let td = tr.find("td:eq(1)");
		let key = td.attr("data-key");

		db[name] = $.grep(db[name], function (data) {
			return !match(td.html(), data[key]);
		});
		update_db(name);
		tr.remove();
	});
	tr.append($("<td>").append(btn));

	columns.forEach(col => {
		td = $("<td>").text(data[col["key"]]);
		td.attr("data-key", col["key"]);
		tr.append(td);
	});

	return tr;
}

function render_settings(tb, name, columns) {
	let th = tb.find("th");
	let tr = $("<tr>");

	th.each(function (i) {
		let id = $(this).attr("id");
		let obj = undefined;

		columns.forEach(col => {
			if (id != col["id"])
				return;
			obj = col["obj"]().addClass("input");
			tr.append($("<td>").append(obj));
		});

		if (obj)
			return;

		obj = icon("add", true);
		obj.on("click", function () {
			let input;
			let valid = 1;
			let new_data = {};

			if (locks[name])
				return;

			locks[name] = 1;
			input = $(this).parent().parent().find(".input");

			columns.forEach(col => {
				col["obj"] = undefined;
			});

			input.each(function (i) {
				$(this).val($.trim($(this).val()));
				columns.forEach(col => {
					if ($(this).attr("name") != col["id"])
						return;
					col["obj"] = $(this);
				});
			});

			columns.forEach(col => {
				if (!valid || !col["key"])
					return;
				if (col["check"] &&
					check_input(col["obj"], name, col["key"])) {
					valid = 0;
					return;
				}
				new_data[col["key"]] = col["obj"].val();
			});

			if (!valid)
				return;

			columns.forEach(col => {
				col["obj"].val("");
			});

			db[name].push(new_data);
			update_db(name);
			tb.append(new_row(columns, new_data, name));

			locks[name] = 0;
		});
		tr.append($("<td>").append(obj));
	});
	tb.append(tr);

	db[name].forEach(row => {
		tb.append(new_row(columns, row, name));
	});
}

function render_settings_proj() {
	let name = "projects";
	let tb = $("#settings-proj").children("table");
	let columns = [
		{
			"id": "proj-name",
			"key": "name",
			"obj": function () {
				let obj = $("<input>");
				obj.attr("type", "text");
				obj.attr("name", "proj-name");
				obj.attr("maxlength", "12");
				obj.on("keypress", no_special_char);
				return obj;
			},
			"check": 1
		},
		{
			"id": "proj-chip",
			"key": "chip",
			"obj": function () {
				let obj = $("<input>");
				obj.attr("type", "text");
				obj.attr("name", "proj-chip");
				obj.attr("maxlength", "10");
				obj.addClass("upper-case");
				obj.on("keypress", function (e) {
					no_special_char(e, ["-"]);
				});
				obj.on("keyup", to_upper_case);
				return obj;
			},
			"check": 1
		},
		{
			"id": "proj-cli",
			"key": "cli",
			"obj": function () {
				let obj = $("<select>");
				obj.attr("name", "proj-cli");
				db["clients"].forEach(cli => {
					let opt = $("<option>");
					opt.attr("value", cli["name"]);
					opt.text(cli["name"]);
					obj.append(opt);
				});
				return obj;
			},
			"check": 0
		},
		{
			"id": "proj-desc",
			"key": "desc",
			"obj": function () {
				let obj = $("<input>");
				obj.attr("type", "text");
				obj.attr("name", "proj-desc");
				obj.attr("maxlength", "80");
				return obj;
			},
			"check": 0
		},
	];

	render_settings(tb, name, columns);
}

function render_settings_cli() {
	let name = "clients";
	let tb = $("#settings-cli").children("table");
	let columns = [
		{
			"id": "cli-code",
			"key": "code",
			"obj": function () {
				let obj = $("<input>");
				obj.attr("type", "text");
				obj.attr("name", "cli-code");
				obj.attr("maxlength", "5");
				obj.addClass("upper-case");
				obj.on("keypress", no_special_char);
				obj.on("keyup", to_upper_case);
				return obj;
			},
			"check": 1
		},
		{
			"id": "cli-name",
			"key": "name",
			"obj": function () {
				let obj = $("<input>");
				obj.attr("type", "text");
				obj.attr("name", "cli-name");
				obj.attr("maxlength", "14");
				obj.on("keypress", function (e) {
					no_special_char(e, [" "]);
				});
				return obj;
			},
			"check": 1
		},
		{
			"id": "cli-desc",
			"key": "desc",
			"obj": function () {
				let obj = $("<input>");
				obj.attr("type", "text");
				obj.attr("name", "cli-desc");
				obj.attr("maxlength", "80");
				return obj;
			},
			"check": 0
		},
	];

	render_settings(tb, name, columns);
}

render_settings_proj();
render_settings_cli();
