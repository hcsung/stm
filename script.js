const debugging = 1;

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
	$("body").append($("<div>").addClass("code").text(msg));
}

function match(a, b) {
	return String(a).toLowerCase() == String(b).toLowerCase();
}

function tip(td, msg) {
	let span = $("<span>");

	span.addClass("tip");
	span.text(msg);
	td.addClass("tooltip");
	td.append(span);
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
					tip(td, "OT");
				}
				if (rec > 9) {
					td.text("+");
					tip(td, "OT: " + rec);
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

function light_switch(icon) {
	let src = "icons/";

	src += (lights_on ? "dark" : "light");
	src += ".svg";

	icon.children("img.icon").attr("src", src);
	if (lights_on)
		$("html").addClass("lights-on");
	else
		$("html").removeClass("lights-on");
}

function render_control(ctl) {
	let btn = $("<button>");
	let src = "icons/";

	src += lights_on ? "dark" : "light";
	src += ".svg";

	btn.append($("<img>").addClass("icon").attr("src", src));
	btn.on("click", function() {
		if (lights_on) {
			lights_on = undefined;
			localStorage.removeItem("lights-on");
		} else {
			lights_on = 1;
			localStorage.setItem("lights-on", 1);
		}
		light_switch($(this));
	});
	light_switch(btn);
	ctl.append(btn);
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
				let icon = $("<img>").addClass("icon");

				cate = categories.find(c => match(c["name"], info));
				if (cate) {
					icon.attr("src", "icons/" + cate["icon"] + ".svg");
					// for adding class later
					cate = info.toLowerCase();
				}

				td.append(icon);
				td.addClass("non-select");
				tip(td, info);
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
					.text(" ");

				td.on("mousedown", function() {
					stamp = Date.now();
					timer = setTimeout(function() {
						stamp = 0;

						let pos = position(td);
						logs[pos.row].rec[pos.dd][pos.hh] = 0;
						update_weekly(tbl, logs);
					}, 400);
				});

				td.on("mouseup", function() {
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

function render_tabs(obj) {
	let tabs = obj.children(".tab");
	let labs = obj.children(".label");
	let hash = window.location.hash;
	let curr_tab = hash ? $(hash) : undefined;
	let curr_lab;

	if (curr_tab) {
		labs.each(function () {
			if ($(this).attr("href") == hash)
				curr_lab = $(this);
		});
	} else {
		curr_tab = tabs.first();
		curr_lab = labs.first();
	}

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

function render_sub_tabs(obj) {
	let tabs = obj.children(".sub-tab");
	let btns = obj.children("button");

	activate(btns.first());
	activate(tabs.first());
	btns.each(function () {
		$(this).on("click", function () {
			let target = $(this).attr("value");

			btns.each(function () { deactivate($(this)); });
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

	$(".tabs").each(function () { render_tabs($(this)); });
	$(".sub-tabs").each(function () { render_sub_tabs($(this)); });


	$("#face").removeClass("hide");

	$(window).on("resize", onresize);
	onresize(); // force update
});
