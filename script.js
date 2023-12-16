const debugging = 0;

const hour = 8; // working hour
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const headers = [
	{ "key": "cate", "name": " " },
	{ "key": "link", "name": "Jira ID" },
	{ "key": "proj", "name": "Project" },
	{ "key": "title", "name": "Title" },
];

var timer;
var stamp;
var lights_on = localStorage.getItem("lights-on");

function debug(msg) {
	if (!debugging)
		return;
	$("body").append($("<div>").text(msg));
}

function match(a, b) {
	return String(a).toLowerCase() == String(b).toLowerCase();
}

function icon(name) {
	let div = $("<div>");

	div.addClass("icon");
	div.addClass(name);
	return div;
}

function tip(msg) {
	let span = $("<span>");

	span.addClass("tip");
	span.text(msg);
	return span;
}

function position(td) {
	let tr = $(td).parent();
	let tb = tr.parent();
	let row = tb.children().index(tr);
	let col = tr.children().index(td);

	row -= 1; // header (first row)
	col -= 1; // sum
	col -= headers.length;

	return {
		row: row,
		col: col,
		dd: ~~(col / hour),
		hh: col % hour
	};
}

function update_weekly(tbl, logs) {

	let start = headers.length + 1; // +1 for summation column
	let end = start + days.length * hour;
	let count = [];
	let sum = []

	for (let col = start; col < end; col++) {
		let temp = 0;
		for (let row = 0; row < logs.length; row++) {
			let dd = ~~((col - start) / hour);
			let hh = (col - start) % hour;
			let td = tbl.children().eq(row + 1).children().eq(col);
			let rec = logs[row].rec[dd][hh];

			td.removeClass("marked");
			td.removeClass("ot");
			td.html("");

			if (!rec)
				continue;

			td.addClass("marked");

			if (hh == hour - 1) {
				if (rec > 1) {
					td.text(rec);
					td.addClass("ot");
					td.addClass("tooltip");
					td.append(tip("OT"));
				}
				if (rec > 9) {
					td.text("+");
					td.append(tip("OT: " + rec));
				}
				temp = 1;
			} else {
				temp += rec;
			}
		}
		count.push(temp);
	}

	for (let row = 0; row < logs.length; row++) {
		let td = tbl.children().eq(row + 1).children().eq(headers.length);

		sum.push(0);
		for (let col = 0; col < count.length; col++) {
			let dd = ~~(col / hour);
			let hh = col % hour;
			let rec = logs[row].rec[dd][hh];

			if (!count[col])
				continue;

			sum[row] += rec / count[col];
		}
		td.text(Math.round(sum[row] * 10) / 10);
	}
}

function update_theme(btn) {
	if (lights_on) {
		$("html").addClass("lights-on");
		btn.removeClass("light");
		btn.addClass("dark");

	} else {
		$("html").removeClass("lights-on");
		btn.removeClass("dark");
		btn.addClass("light");
	}
}

function render_control(ctl) {
	let btn = ctl.children("button.theme");

	lights_on = lights_on == null ? 0 : parseInt(lights_on);
	update_theme(btn);

	btn.on("click", function () {
		lights_on = lights_on ? 0 : 1;
		update_theme($(this));
		localStorage.setItem("lights-on", lights_on);
	});
}

function render_weekly(tbl, logs) {

	let tr = $("<tr>").addClass("non-select");

	headers.forEach(header => tr.append($("<th>")
		.addClass(header["key"])
		.text(header["name"])));

	tr.append($("<th>").addClass("col sum").text("\u2211"));

	days.forEach(day => tr.append($("<th>")
		.addClass("col")
		.addClass(day.toLowerCase())
		.attr("colspan", hour)
		.text(day)));

	// headers
	tbl.append(tr);

	logs.forEach(function (log) {
		let id = log["job"];
		let job = jobs.find(job => job["id"] == id);
		let sum = $("<td>");
		let cate = undefined;

		if (!job) {
			debug("job-" + id + ": not found");
			return;
		}

		tr = $("<tr>");

		headers.forEach(function (header) {
			let key = header["key"];
			let info = job[key];
			let td = $("<td>").addClass(key);

			if (!info) {
				debug("job-" + id + ": no key: " + key);
				return;
			}

			if (key == "cate") {
				cate = categories.find(c => match(c["name"], info));
				if (cate) {
					td.addClass("tooltip");
					td.append(icon(cate["icon"]));
					td.append(tip(info));
					cate = info.toLowerCase();
				}
			} else {
				td.text(info);
			}
			tr.append(td);
		});

		sum.addClass("col");
		sum.addClass("sum");
		tr.append(sum);

		let d = 0;
		let total = 0;
		days.forEach(function (day) {
			let rec = log["rec"];

			day = day.toLowerCase();
			for (let i = 0; i < hour; i++) {
				let tm = rec[d][i];
				let td = $("<td>")
					.addClass("time")
					.addClass(day)
					.addClass(cate)
					.text(" ");

				td.on("mousedown", function () {
					stamp = Date.now();
					timer = setTimeout(function () {
						stamp = 0;

						let pos = position(td);
						logs[pos.row].rec[pos.dd][pos.hh] = 0;
						update_weekly(tbl, logs);
					}, 400);
				});

				td.on("mouseup", function () {
					clearTimeout(timer);

					// long press occurred
					if (!stamp)
						return;

					let pos = position(td);

					if (pos.hh < hour - 1)
						logs[pos.row].rec[pos.dd][pos.hh] = 1;
					else
						logs[pos.row].rec[pos.dd][pos.hh]++;

					update_weekly(tbl, logs);
				});

				if (i == 0)
					td.addClass("col");

				tr.append(td);
			}
			d++;
		});
		tbl.append(tr);
	});
	update_weekly(tbl, logs);
}

function activate(obj) {
	obj.addClass("active");
}

function deactivate(obj) {
	obj.removeClass("active");
}

function render_tabs(obj, selector) {
	let tabs = obj.children(selector);
	let labs = obj.children(".label");
	let hash = window.location.hash;
	let curr_tab, curr_lab;

	if (selector == ".tab")
		hash = hash.split("-")[0];

	if (hash)
		curr_tab = obj.children(hash);

	if (curr_tab && curr_tab.length) {
		labs.each(function () {
			if ($(this).attr("href") == hash)
				curr_lab = $(this);
		});
	} else {
		curr_tab = tabs.first();
	}

	if (!curr_lab)
		curr_lab = labs.first();

	activate(curr_tab);
	activate(curr_lab);
	labs.each(function () {
		$(this).on("click", function () {
			let target = $(this).attr("href");

			labs.each(function () { deactivate($(this)); });
			tabs.each(function () { deactivate($(this)); });
			activate($(this));
			activate($(target));
		});
	});
}

function onresize() {
	let tab = $("div.active");
	let tbl = tab.children(".dashboard").children("table");
	let diff = tbl.width() - tab.width();
	let width = tbl.children("th.title").width();
	let min = 130;

	width = ~~(width - diff);
	if (width < min)
		width = min;
	$(".title").css("max-width", width);
}

$(document).ready(function () {
	render_control($("#control"));
	render_weekly($("#weekly").children(".dashboard").children("table"),
		weekly_report);

	$(".tabs").each(function () {
		render_tabs($(this), '.tab');
	});
	$(".sub-tabs").each(function () {
		render_tabs($(this), '.sub-tab');
	});


	$("#face").removeClass("hide");

	$(window).on("resize", onresize);
	onresize(); // force update
});
