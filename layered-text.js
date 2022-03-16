
// layered-text @ npm, layered text tool.

/*
Definition of Layered-Text v0.0.4

* Definition 

	layered-text ::= [ ] | [ text (, property)? (, subordinate)? (, text (, property)? (, subordinate)? )* ]

		A JSON Array (refer to JSON, https://www.json.org/ );
		Started with \[;

		text
			A JSON String (refer to JSON);
			Started with \";

		property
			A JSON Object (refer to JSON);
			Started with \{;

		subordinate ::= layered-text

	normalized-layered-text ::= [ ] | [ text, property, subordinate (, text, property, subordinate)* ]

* Examples

	//text
	["abc"]
	["this is a string \nwith line break"]
	["abc", "def"] //2 items

	//property 
	["abc", {"id": 1}] //1 items with property
	["abc", {}] := ["abc"] //empty property
	["abc", {"id": 1}, "def", {"id": 2}] //2 items with properties

	//subordinate
	["abc", ["def"]] //1 item and sub
	["abc", []] := ["abc"] //empty sub
	["abc", {"id": 1}, ["def"]] //1 item and property and sub
	["abc", ["def"], "ghi"] //2 items
	["abc", ["def"], "ghi", ["jkl"]] //2 items

* Normalizing process
	* transfer layered-text to normalized-layered-text , a fixed 3-items-group array;
		["abc", "def"] := ["abc", {}, [], "def", {}, []]

	* accepted abnormal formats;

		* multiple properties will be combined to a single property ; the later items will cover the former items;
			["abc", {"id": 1, "name": "a"}, {"id": 2}] := ["abc", {"id": 2, "name": "a"}]

		* multiple subordinates will be concatenated to a single subordinate;
			["abc", ["def"], ["ghi"]] := ["abc", ["def", "ghi"]]

		* empty property / subordinate can be 0/null/undefined;
			["abc", {}, []] := ["abc", 0, 0] := ["abc"]

		* if the 1st item of layered-text is another layered-text , the 1st item will be flattened to the main.
			[["abc", "def"], ["ghi"]] := ["abc", "def", ["ghi"]]
			[[["abc", "def"], ["ghi"]], "jkl"] := ["abc", "def", ["ghi"], "jkl"]

* Compacting process

	* empty property {} and empty subordinate [], will be removed;
		["abc", {}, []] := ["abc"]
		["abc", {"id": 1}, []] := ["abc", {"id": 1}]
		["abc", {}, ["def"]] := ["abc", ["def"]]

*/

function _isEmpty(obj) {
	for (var i in obj) { if (typeof obj[i] !== "undefined") return false; }
	return true;
}
function _isNotEmpty(obj) {
	for (var i in obj) { if (typeof obj[i] !== "undefined") return true; }
	return false;
}

var MODE_COMPACT = 0;
var MODE_NORMALIZE = 1;

var NORMALIZE_GROUP_COUNT = 3;

/*
layeredText: Array
mode: 0: compact, 1: normalize
duplicate: boolean/"sub"
*/
function _format(layeredText, mode, duplicate) {
	if (layeredText.mode === mode) return layeredText;

	var i, imax, j = 1, k, text, prop = 0, sub = 0, li, ts;

	if (duplicate && duplicate !== "sub") layeredText = layeredText.concat();

	//check the 1st item
	while (true) {
		imax = layeredText.length;
		if (imax === 0) {
			layeredText.mode = mode;
			return layeredText;
		}

		text = layeredText[0];
		ts = typeof text;
		if (ts === "string") {
			break;
		}
		else if (ts === "undefined") {
			layeredText.shift();
			continue;
		}
		else if (text instanceof Array) {
			//flatten the 1st array item
			layeredText.shift();
			if (text.length > 0) { layeredText.unshift.apply(layeredText, text); }
			continue;
		}
		else {
			//console.warn("layered-text warning, format the 1st to string, ", text);
			text = layeredText[0] = JSON.stringify(text);
			break;
		}
	}

	//transfer
	for (i = 1; i < imax; i++) {
		li = layeredText[i];
		ts = typeof li;
		if (ts === "string") {
			//push previous
			if (mode === MODE_NORMALIZE) {
				layeredText.splice(
					j, (i - j),
					(prop && _isNotEmpty(prop)) ? prop : 0,
					(sub && sub.length) ? _format(sub, mode, duplicate && "sub") : 0
				);
				j += NORMALIZE_GROUP_COUNT;
			}
			else {	//MODE_COMPACT
				/*
				if (i !== j) layeredText.splice(j, (i - j));
				if (prop && _isNotEmpty(prop)) {
					layeredText.splice(j++, 0, prop);
				}
				if (sub && sub.length) {
					layeredText.splice(j++, 0, _format(sub, mode, duplicate && "sub"));
				}
				j++;
				*/

				//call splice() only one time
				if (prop && _isNotEmpty(prop)) {
					if (sub && sub.length) {
						layeredText.splice(j, (i - j), prop, _format(sub, mode, duplicate && "sub"));
						j += 2;
					}
					else {
						layeredText.splice(j, (i - j), prop);
						j++;
					}
				}
				else if (sub && sub.length) {
					layeredText.splice(j, (i - j), _format(sub, mode, duplicate && "sub"));
					j++;
				}
				else if (i !== j) {
					layeredText.splice(j, (i - j));
				}

				j++;
			}
			i = j - 1;
			imax = layeredText.length;

			text = li;
			prop = sub = 0;
		}
		else if (!li) {
			continue;
		}
		else if (li instanceof Array) {
			//sub
			if (sub) {
				if (li.length) sub.push.apply(sub, li);
			}
			else sub = duplicate ? li.concat() : li;
		}
		else if (ts === "object") {
			//property
			if (li) {
				if (!prop) {
					if (duplicate) {
						prop = {};	//duplicate
					}
					else {
						prop = li;	//use original
						continue;
					}
				}
				for (k in li) {
					if (typeof li[k] === "undefined") {
						if (k in prop) delete prop[k];
					}
					else prop[k] = li[k];
				}
			}
		}
	}

	//push last
	if (mode === MODE_NORMALIZE) {
		layeredText.splice(
			j, (i - j),
			(prop && _isNotEmpty(prop)) ? prop : 0,
			(sub && sub.length) ? _format(sub, mode, duplicate && "sub") : 0
		);
	}
	else {	//MODE_COMPACT
		if (prop && _isNotEmpty(prop)) {
			if (sub && sub.length) {
				layeredText.splice(j, (i - j), prop, _format(sub, mode, duplicate && "sub"));
			}
			else {
				layeredText.splice(j, (i - j), prop);
			}
		}
		else if (sub && sub.length) {
			layeredText.splice(j, (i - j), _format(sub, mode, duplicate && "sub"));
		}
		else if (i !== j) {
			layeredText.splice(j, (i - j));
		}
	}

	layeredText.mode = mode;

	return layeredText;
}

var format = function (layeredText, mode, duplicate) {
	//param layeredText
	var ts = typeof layeredText;
	if (ts === "string") {
		layeredText = [layeredText];
	}
	else if (ts === "undefined") {
		layeredText = [];
	}
	else if (layeredText instanceof Array) {
		if (duplicate) layeredText = layeredText.concat();
	}
	else {
		//console.warn("layered-text warning, transfered input to string, ", layeredText);
		layeredText = [JSON.stringify(layeredText)];
	}

	//param mode
	mode = parseInt(mode) || MODE_COMPACT;
	if (mode !== MODE_NORMALIZE) mode = MODE_COMPACT;

	//call
	return _format(layeredText, mode, duplicate && "sub");
}

//shortcuts
var normalize = function (layeredText, duplicate) { return format(layeredText, MODE_NORMALIZE, duplicate); }
var compact = function (layeredText, duplicate) { return format(layeredText, MODE_COMPACT, duplicate); }

var parse = function (str, mode, duplicate) {
	return format((typeof str === "string") ? JSON.parse(str) : str, mode, duplicate);
}

var setNormalizedFlag = function (normalizedLayeredText) {
	if (normalizedLayeredText.mode === MODE_NORMALIZE) return;

	var i, imax = normalizedLayeredText.length, li;
	for (i = 2; i < imax; i += NORMALIZE_GROUP_COUNT) {
		li = normalizedLayeredText[i];
		if (!li) continue;
		if (li instanceof Array) setNormalizedFlag(li);
		else throw "layered-text is not normalized, not an array.";
	}
	normalizedLayeredText.mode = MODE_NORMALIZE;
}

//operation

//index: -1: end, 0-N: insert at
var addByIndex = function (layeredText, index, text, property, sub) {
	//index
	if (index < 0 || index >= layeredText.length) index = layeredText.length;
	else if (typeof layeredText[index] !== "string") {
		throw "layered-text fail, adding index is not string, " + index;
	}

	//data
	var data = Array.prototype.slice.call(arguments, 2);
	if (!data.length) return;

	_format(data, layeredText.mode || MODE_COMPACT);
	if (!data.length) return;

	data.unshift(index, 0);

	//add
	layeredText.splice.apply(layeredText, data);

	return layeredText;
}

var add = function (layeredText, indexOrGroupIndex, text, property, sub) {
	if (layeredText.mode !== MODE_NORMALIZE) return addByIndex.apply(this, arguments);

	var arg = Array.prototype.slice.call(arguments, 0);
	arg[1] *= NORMALIZE_GROUP_COUNT;
	return addByIndex.apply(this, arg);
}

/*
remove item, or remove property or subordinate
	index: 0-N
	removeProperty: name array/text/object
	removeSubordinate: boolean
*/
var removeByIndex = function (layeredText, index, removeProperty, removeSubordinate) {
	//index
	if (typeof layeredText[index] !== "string") {
		throw "layered-text fail, removing index is not string, " + index;
	}

	//removeProperty
	if (typeof removeProperty === "string") {
		removeProperty = [removeProperty];
	}
	else if (removeProperty && !(removeProperty instanceof Array)) {
		removeProperty = Object.keys(removeProperty);
	}
	if (removeProperty && !removeProperty.length) removeProperty = null;

	var j, jmax = removeProperty && removeProperty.length;

	//end
	var i, imax = layeredText.length, li;

	for (i = index + 1; i < imax; i++) {
		li = layeredText[i];
		if (typeof li === "string") break;

		if (!li) continue;

		if (li instanceof Array) {
			if (removeSubordinate) layeredText[i] = 0;
		}
		else {
			if (removeProperty) {
				for (j = 0; j < jmax; j++) {
					if (removeProperty[j] in li) delete li[removeProperty[j]];
				}
				if (_isEmpty(li)) layeredText[i] = 0;
			}
		}
	}

	if (!removeProperty && !removeSubordinate) layeredText.splice(index, i - index);

	return layeredText;
}

var remove = function (layeredText, indexOrGroupIndex, removeProperty, removeSubordinate) {
	if (layeredText.mode !== MODE_NORMALIZE) return removeByIndex.apply(this, arguments);

	var arg = Array.prototype.slice.call(arguments, 0);
	arg[1] *= NORMALIZE_GROUP_COUNT;
	return removeByIndex.apply(this, arg);
}

/*
update text, property or subordinate
	index: 0-N
	text: if the `text` is an array, the whole item will be replaced
*/
var updateByIndex = function (layeredText, index, text, property, sub) {
	//index
	if (typeof layeredText[index] !== "string") {
		throw "layered-text fail, updating index is not string, " + index;
	}

	if (text && (text instanceof Array)) {
		//replace all
		removeByIndex(layeredText, index);
		return addByIndex.apply(this, arguments);
	}

	//get end
	var i, imax = layeredText.length;

	for (i = index + 1; i < imax; i++) {
		if (typeof layeredText[i] === "string") break;
	}

	var a = layeredText.splice(index, i - index);
	if (text) a[0] = text;
	if (arguments.length > 3) a.push.apply(a, Array.prototype.slice.call(arguments, 3));

	a.unshift(layeredText, index);

	return addByIndex.apply(this, a);
}

var update = function (layeredText, indexOrGroupIndex, text, property, sub) {
	if (layeredText.mode !== MODE_NORMALIZE) return updateByIndex.apply(this, arguments);

	var arg = Array.prototype.slice.call(arguments, 0);
	arg[1] *= NORMALIZE_GROUP_COUNT;
	return updateByIndex.apply(this, arg);
}

//module

module.exports = exports = parse;

exports.MODE_NORMALIZE = MODE_NORMALIZE;
exports.MODE_COMPACT = MODE_COMPACT;

exports.NORMALIZE_GROUP_COUNT = NORMALIZE_GROUP_COUNT;

exports.format = format;
exports.parse = parse;

exports.normalize = normalize;
exports.compact = compact;

exports.setNormalizedFlag = setNormalizedFlag;

exports.addByIndex = addByIndex;
exports.add = add;
exports.removeByIndex = removeByIndex;
exports.remove = remove;
exports.updateByIndex = updateByIndex;
exports.update = update;
