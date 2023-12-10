const debugging = 1;

const hour = 8; // working hour
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function debug(msg) {
	if (!debugging)
		return;
	$("body").append($("<div>").addClass("code").text(msg));
}

function match(a, b) {
	return String(a).toLowerCase() == String(b).toLowerCase();
}

function tip(msg) {
	let span = $("<span>");
	span.addClass("tip");
	span.text(msg);
	return span;
}

function render_weekly(tbl) {
	const headers = [
		{ "key": "cate", "name": " " },
		{ "key": "link", "name": "Jira ID" },
		{ "key": "proj", "name": "Project" },
		{ "key": "title", "name": "Title" },
	];

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
				let span = $("<span>")
					.addClass("material-symbols-outlined");

				cate = categories.find(c => match(c["name"], info));
				if (cate) {
					span.text(cate["icon"]);
					// for adding class later
					cate = info.toLowerCase();
				} else {
					span.text("error");
				}

				td.addClass("tooltip");
				td.addClass("non-select");
				td.append(span);
				td.append(tip(info));
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

				if (i == 0)
					td.addClass("col");

				if (tm > 0) {
					td.addClass("marked");
					total += tm;
				}

				if (tm > 1) {
					if (i != hour - 1) {
						// only the last hour can be overtime
						td.addClass("err");
						td.text("X");
					} else {
						tm = tm > 9 ? "+" : tm;
						td.addClass("ot");
						td.addClass("tooltip");
						td.text(tm);
						td.append(tip("OT"));
					}
				}
				tr.append(td);
			}
			d++;
		});
		sum.text(total);
		tbl.append(tr);
	});
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
	let min = 120;

	width = ~~(width - diff);
	if (width < min)
		width = min;
	$(".title").css("max-width", width);
}

$(document).ready(function () {
	render_weekly($("#weekly").children(".dashboard").children("table"));

	$(".tabs").each(function () { render_tabs($(this)); });
	$(".sub-tabs").each(function () { render_sub_tabs($(this)); });

	$(window).on("resize", onresize);

	$("#face").removeClass("hide");
	onresize(); // force update
});
