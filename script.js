var timer;
var stamp;

function debug(msg) {
	if (!debugging)
		return;
	console.log(msg);
}

function error(msg) {
	console.log("[ERROR] " + msg);
}

function activate(obj) {
	obj.addClass("active");
}

function deactivate(obj) {
	obj.removeClass("active");
}

function icon(name, clickable = false) {
	let div = $("<div>");

	div.addClass("icon");
	div.addClass(name);
	if (clickable)
		div.addClass("clickable");
	return div;
}

function match(a, b) {
	a = String(a).toLowerCase();
	b = String(b).toLowerCase();
	return a == b;
}

function tip(msg) {
	let span = $("<span>");

	span.addClass("tip");
	span.text(msg);
	return span;
}

function warn(msg) {
	let target = $("#warning");

	target.text(msg);
	target.css("opacity", "1");
	setTimeout(function () {
		target.css("opacity", "0");
	}, animation_delay);
}

function highlight(obj) {
	obj.css("border-bottom-color", "red");
	setTimeout(function () {
		obj.removeAttr("style");
	}, animation_delay);
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

function update_lock(btn) {
	if (locked) {
		btn.removeClass("unlock");
		$(".control").addClass("locked");
		$(".clickable").addClass("locked");
		$("td.time").addClass("locked");
	} else {
		btn.addClass("unlock");
		$(".control").removeClass("locked");
		$(".clickable").removeClass("locked");
		$("td.time").removeClass("locked");
	}
}

function render_control(ctl) {
	let btn;

	lights_on = lights_on == null ? 0 : parseInt(lights_on);

	btn = ctl.children("button.theme");
	btn.on("click", function () {
		lights_on = lights_on ? 0 : 1;
		update_theme($(this));
		localStorage.setItem(my_app + "lights-on", lights_on);
	});
	update_theme(btn);

	btn = ctl.children("button.lock");
	btn.on("click", function () {
		locked = locked ? 0 : 1;
		update_lock($(this));
	});
	update_lock(btn);
}

function render_weekly(tbl, logs) {

	let tr = $("<tr>");

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

	logs.forEach(log => {
		let id = log["job"];
		let job = db["jobs"].find(job => job["id"] == id);
		let sum = $("<td>");
		let cate = undefined;

		if (!job) {
			debug("job-" + id + ": not found");
			return;
		}

		tr = $("<tr>");

		headers.forEach(header => {
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
		days.forEach(day => {
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
					if (locked)
						return;
					stamp = Date.now();
					timer = setTimeout(function () {
						stamp = 0;

						let pos = position(td);
						logs[pos.row].rec[pos.dd][pos.hh] = 0;
						update_weekly(tbl, logs);
					}, 400);
				});

				td.on("mouseup", function () {
					if (locked)
						return;

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
	render_weekly($("#weekly").children(".dashboard").children("table"),
		weekly_report);

	$(".tabs").each(function () {
		render_tabs($(this), '.tab');
	});
	$(".sub-tabs").each(function () {
		render_tabs($(this), '.sub-tab');
	});

	// render control panel at the end for the lock to be applied
	render_control($("#control"));

	$("#face").removeClass("hide");

	$(window).on("resize", onresize);
	onresize(); // force update
});
