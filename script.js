const debugging = 1;

const settings = {
	"icons": {
		"Bug": "bug_report",
		"Feature": "grade",
		"Task": "task_alt",
		"Meeting": "event",
		"OOO": "logout",
		"Others": "question_mark"
	},
	"days": [ "Mon", "Tue", "Wed", "Thu", "Fri" ],
	"headers": [
		{ "key": "cate", "name": "Cate." },
		{ "key": "link", "name": "Jira ID" },
		{ "key": "proj", "name": "Project" },
		{ "key": "title", "name": "Title" },
	]
};

const hour = 8; // working hour

function debug(msg)
{
	if (!debugging)
		return;
	$("body").append($("<span>").addClass("code").text(msg));
}

function tip(msg)
{
	let span = $("<span>");
	span.addClass("tip");
	span.text(msg);
	return span;
}

function weekly_report(table)
{
	let days = settings["days"];
	let headers = settings["headers"];
	let icons = settings["icons"];

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
	table.append(tr);

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
					.addClass("material-symbols-outlined")
					.text(icons[info]);
				td.addClass("tooltip");
				td.addClass("non-select");
				td.append(span);
				td.append(tip(info));
				cate = info.toLowerCase();
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
		table.append(tr);
	});
}

function render()
{
	weekly_report($("#weekly"));
}

render();
$(document).ready(function (){
	$("#face").css("visibility", "visible");
});
