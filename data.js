const jobs = [
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
	}
];

const logs = [
	{
		"job": "170196456326777b962c40a58",
		"rec": [
			[ 1, 1, 1, 0.5, 0.5, 1, 1, 1 ],
			[ 1, 1, 1, 1, 1, 1, 1, 3 ],
			[ 0.5, 0.5, 0.5, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0, 0, 0, 0, 0 ],
			[ 1, 1, 1, 0, 0, 0, 0, 0 ]
		]
	},
	{
		"job": "1701964585951ea0ea0b778cd",
		"rec": [
			[ 0, 0, 0, 0.5, 0.5, 0, 0, 0 ],
			[ 0, 0, 0, 0, 0, 0, 0, 0 ],
			[ 0.5, 0.5, 0.5, 1, 1, 1, 1, 1 ],
			[ 0, 0, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0, 0, 0, 0, 0 ]
		]
	},
	{
		"job": "17019645946997351daa70dca",
		"rec": [
			[ 0, 0, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0, 0, 0, 0, 0 ],
			[ 1, 1, 1, 1, 1, 1, 1, 1 ],
			[ 0, 0, 0, 1, 1, 1, 1, 4 ]
		]
	}
];