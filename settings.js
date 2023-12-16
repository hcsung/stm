function add_button()
{
	return $("<div>").addClass("icon add");
}

function no_special_char(event, exceptions = [])
{
	var hit = 0;
	var key = event.which || event.charCode;
	var regex = new RegExp("[a-zA-Z0-9]");

	key = String.fromCharCode(key);

	if ($.inArray(key, exceptions) >= 0)
		return true;

	if (regex.test(key))
		return true;

	event.preventDefault();
	return false;
}

function render_settings_cli()
{
	let tb = $("#settings-cli").children("table");
	let th = tb.find("th");
	let tr = $("<tr>");

	th.each(function(i) {
		let td = $("<td>");
		let id = $(this).attr("id");
		let obj = $("<input>");

		obj.attr("type", "text");
		obj.attr("name", id);

		switch(id) {
		case "cli-code":
			obj.attr("maxlength", "5");
			obj.on("keypress", no_special_char);
			break;
		case "cli-name":
			obj.attr("maxlength", "14");
			obj.on("keypress", function(e) {
				no_special_char(e, [" "]);
			});
			break;
		case "cli-desc":
			obj.attr("maxlength", "80");
			break;
		default:
			obj = add_button();
		}
		td.append(obj);
		tr.append(td);
	});
	tb.append(tr);
}

render_settings_cli();