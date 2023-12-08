const debug = 1;

const settings = {
	"icons": {
		"Bug": "bug_report",
		"Feature": "grade",
		"Task": "task_alt",
		"Meeting": "event",
		"Leave": "logout",
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

function msg(m)
{
	if (!debug)
		return;
	$("body").append($("<p>").text(m));
}

function weekly_report(table)
{
	let days = settings["days"];
	let headers = settings["headers"];
	let icons = settings["icons"];

	let tr = table.append($("<tr>"));

	headers.forEach(header => tr.append($("<th>")
		.addClass(header["key"])
		.text(header["name"])));

	days.forEach(day => tr.append($("<th>")
		.addClass("col")
		.addClass(day.toLowerCase())
		.attr("colspan", hour)
		.text(day)));

	logs.forEach(function (log) {
		let id = log["job"];
		let job = jobs.find(job => job["id"] == id);
		let cate = undefined;

		if (!job) {
			msg("job-" + id + ": not found");
			return;
		}

		tr = table.append($("<tr>"));

		headers.forEach(function (header) {
			let key = header["key"];
			let info = job[key];
			let td = $("<td>").addClass(key);

			if (!info) {
				msg("job-" + id + ": no key: " + key);
				return;
			}

			if (key == "cate") {
				let span = $("<span>")
					.addClass("material-symbols-outlined")
					.text(icons[info]);
				td.append(span);
				cate = info.toLowerCase();
			} else {
				td.text(info);
			}
			tr.append(td);
		});

		let d = 0;
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
				if (tm > 0)
					td.addClass("marked");

				if (tm > 1) {
					if (i != hour - 1) {
						// only the last hour can be overtime
						td.addClass("err");
						td.text("X");
					} else {
						td.addClass("ot");
					}
				}
				tr.append(td);
			}
			d++;
		});
	});
}

function render()
{
	let table = $("#weekly");

	weekly_report(table);
}

$(document).ready(render);
