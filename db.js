const clients = [
	{
		"name": "Beetle",
		"code": "c1",
		"desc": ""
	},
	{
		"name": "Cricket",
		"code": "c2",
		"desc": ""
	},
	{
		"name": "Dragonfly",
		"code": "c3",
		"desc": ""
	}
];

const categories = [
	{
		"name": "Bug",
		"icon": "bug"
	},
	{
		"name": "Feature",
		"icon": "new"
	},
	{
		"name": "Task",
		"icon": "task"
	},
	{
		"name": "Meeting",
		"icon": "event"
	},
	{
		"name": "OOO",
		"icon": "logout"
	},
	{
		"name": "Document",
		"icon": "desc"
	},
	{
		"name": "Others",
		"icon": "question"
	}
];

function prepare_projects() {
	let ret = localStorage.getItem("projects");

	if (ret)
		return ret;

	return [
		{
			"name": "Banana",
			"chip": "sgc-1",
			"client": "c1",
			"desc": ""
		},
		{
			"name": "Cherry",
			"chip": "sgc-2",
			"client": "c2",
			"desc": ""
		},
		{
			"name": "Durian",
			"chip": "sgc-3",
			"client": "c3",
			"desc": ""
		}
	];
}

function prepare_jobs() {
	let ret = localStorage.getItem("jobs");

	if (ret)
		return ret;

	return [
		{
			"link": "-",
			"cate": "Document",
			"proj": "-",
			"title": "Prepare weekly meeting",
			"id": "170222039404497375d5e99bd"
		},
		{
			"link": "-",
			"cate": "Meeting",
			"proj": "-",
			"title": "Meeting",
			"id": "17020526178837575716448c2"
		},
		{
			"link": "-",
			"cate": "OOO",
			"proj": "-",
			"title": "Out of the office",
			"id": "1702052632787ac632ca54e30",
		},
		{
			"link": "-",
			"cate": "OOO",
			"proj": "-",
			"title": "Holiday",
			"id": "170210275179270bb2065415e"
		},
		{
			"link": "JIRA-1234",
			"cate": "Task",
			"proj": "Banana",
			"title": "Kernel upstream for banana driver",
			"id": "170196456326777b962c40a58"
		},
		{
			"link": "JIRA-1235",
			"cate": "Feature",
			"proj": "Cherry",
			"title": "AI generated cherry animation on screen",
			"id": "1701964585951ea0ea0b778cd"
		},
		{
			"link": "JIRA-1236",
			"cate": "Bug",
			"proj": "Durian",
			"title": "The color of the durian logo is shifted after suspend/resume",
			"id": "17019645946997351daa70dca"
		},
		{
			"link": "JIRA-1237",
			"cate": "Others",
			"proj": "-",
			"title": "Help Shawn to set up the build code environment",
			"id": "1702220994270933a32905c41"
		},
	];
}

function prepare_weekly_report() {
	let ret = localStorage.getItem("weekly_report");

	if (ret)
		return ret;

	return [
		{
			"job": "170196456326777b962c40a58",
			"rec": [
				[0, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 3],
				[1, 1, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[1, 1, 1, 0, 0, 0, 0, 0]
			]
		},
		{
			"job": "1701964585951ea0ea0b778cd",
			"rec": [
				[0, 0, 0, 0, 1, 1, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[1, 1, 1, 1, 1, 1, 1, 1],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0]
			]
		},
		{
			"job": "17019645946997351daa70dca",
			"rec": [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[1, 1, 1, 1, 1, 1, 1, 1],
				[0, 0, 0, 0, 0, 0, 0, 0]
			]
		},
		{
			"job": "1702220994270933a32905c41",
			"rec": [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 1, 1, 0, 0, 0]
			]
		},
		{
			"job": "170222039404497375d5e99bd",
			"rec": [
				[1, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0]
			]
		},
		{
			"job": "17020526178837575716448c2",
			"rec": [
				[0, 1, 1, 1, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0]
			]
		},
		{
			"job": "1702052632787ac632ca54e30",
			"rec": [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 1, 1, 1]
			]
		}
	];
}

const projects = prepare_projects();
const jobs = prepare_jobs();
const weekly_report = prepare_weekly_report();
