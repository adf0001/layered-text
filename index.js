// layered-text @ npm, layered text tool.

/*
Definition of Layered-Text v0.0.5

* Definition 

	layered-text ::= [ ] | [ text (, property)? (, subordinate)? (, text (, property)? (, subordinate)? )* ]

		A JSON Array (refer to JSON, https://www.json.org/ );
		Started with \[;

		text
			A JSON String (refer to JSON);
			Started with \";
      The principle is to show the text first;

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

		* properties can be after the text and before the next text or the end; or before the first text;
			["abc", {"id": 1}, ["def"], {name: "a"}, "ghi"] := ["abc", {"id": 1, name: "a"}, ["def"], "ghi"]
			["abc", {"id": 1}, ["def"], {name: "a"}] := ["abc", {"id": 1, name: "a"}, ["def"]]
      [{"id": 1}, "abc"] := ["abc", {"id": 1}]

		* empty property / subordinate can be 0/null/undefined;
			["abc", {}, []] := ["abc", 0, 0] := ["abc"]

		* the first subordinate before the first text will be flattened.
			[["abc", "def"], ["ghi"]] := ["abc", "def", ["ghi"]]
			[[["abc", "def"], ["ghi"]], "jkl"] := ["abc", "def", ["ghi"], "jkl"]

		* the subordinate without text is empty;
			[{id:1}] := []
			[0,1,null,true] := []

* Compacting process

	* empty property {} and empty subordinate [], will be removed;
		["abc", {}, []] := ["abc"]
		["abc", {"id": 1}, []] := ["abc", {"id": 1}]
		["abc", {}, ["def"]] := ["abc", ["def"]]

*/

function _isEmpty(obj) {
  for (var i in obj) {
    if (typeof obj[i] !== "undefined") return false;
  }
  return true;
}
function _isNotEmpty(obj) {
  for (var i in obj) {
    if (typeof obj[i] !== "undefined") return true;
  }
  return false;
}

var MODE_COMPACT = 0;
var MODE_NORMALIZE = 1;

var NORMALIZE_GROUP_COUNT = 3;

//normalized index
var INDEX_N_TEXT = 0;
var INDEX_N_PROPERTY = 1;
var INDEX_N_SUBORDINATE = 2;

function _pushText(dest, mode, text, prop, sub) {
  if (mode === MODE_NORMALIZE) {
    dest.push(
      text,
      prop && _isNotEmpty(prop) ? prop : 0,
      sub ? _duplicate(sub, mode) : 0
    );
  } else {
    //MODE_COMPACT
    dest.push(text);
    if (prop && _isNotEmpty(prop)) dest.push(prop);
    if (sub && _isNotEmpty(sub)) dest.push(_duplicate(sub, mode));
  }
}

/*
Returns a new layered-text object
@param	layeredText: Array
@param	mode: 0-compact, 1-normalize
*/
function _duplicate(layeredText, mode) {
  let text = null,
    sub = 0,
    prop = 0;
  let i,
    imax = layeredText.length;
  let li, liType; //list item & the typeof

  let dest = [];
  dest.mode = mode;

  for (i = 0; i < imax; i++) {
    li = layeredText[i];
    liType = typeof li;

    if (liType === "string") {
      //push previous
      if (text !== null) {
        _pushText(dest, mode, text, prop, sub);
        prop = sub = 0; //prepare next
      }
      text = li;
    } else if (!li) {
      //ignore empty
    } else if (li instanceof Array) {
      if (text === null) {
        //flatten subordinates before the first text
        layeredText = layeredText
          .slice(0, i)
          .concat(li, layeredText.slice(i + 1));
        imax = layeredText.length;
        i--;
        continue;
      }
      //subordinate
      sub = sub ? sub.concat(li) : li.concat();
    } else if (liType === "object") {
      //property
      prop = { ...prop, ...li };
    } else {
      //other will be ignored
    }
  }

  //push last
  if (text !== null) _pushText(dest, mode, text, prop, sub);

  return dest;
}

// return a new one, or the same if mode is unchanged.
/*
@param	layeredText: Array
@param	mode: 0-compact, 1-normalize
@param	duplicate: boolean,
  if false, return a new one when the mode is different, return the same if mode is unchanged.
  if true, return a new one.
*/
var format = function (layeredText, mode = MODE_COMPACT, duplicate = false) {
  //check mode
  if (layeredText?.mode === mode && !duplicate) return layeredText;

  //param layeredText
  if (!(layeredText instanceof Array)) {
    var ts = typeof layeredText;
    if (ts === "string") {
      layeredText = [layeredText];
    } else if (ts === "undefined") {
      layeredText = [];
    } else {
      //console.warn("layered-text warning, transfered input to string, ", layeredText);
      layeredText = [JSON.stringify(layeredText)];
    }
  }

  //param mode
  mode = parseInt(mode) || MODE_COMPACT;
  if (mode !== MODE_NORMALIZE) mode = MODE_COMPACT;

  return _duplicate(layeredText, mode);
};

//shortcuts

var normalize = function (layeredText, duplicate = false) {
  return format(layeredText, MODE_NORMALIZE, duplicate);
};
var compact = function (layeredText, duplicate = false) {
  return format(layeredText, MODE_COMPACT, duplicate);
};

var duplicate = function (layeredText, mode = MODE_COMPACT) {
  return format(layeredText, mode, true);
};

var parse = function (str, mode = MODE_COMPACT) {
  return format(typeof str === "string" ? JSON.parse(str) : str, mode);
};

// tools

var isNormalized = function (layeredText) {
  return (
    layeredText &&
    layeredText instanceof Array &&
    layeredText.mode === MODE_NORMALIZE
  );
};

var isEmptyProp = function (property) {
  return (
    !property ||
    typeof property !== "object" ||
    property instanceof Array || //do not accept array
    _isEmpty(property)
  );
};

var isEmptySub = function (subordinate) {
  return (
    !subordinate || !(subordinate instanceof Array) || !(subordinate.length > 0)
  );
};

var stringify = function (layeredText, space, options) {
  if (layeredText?.mode !== MODE_COMPACT) layeredText = compact(layeredText);

  let s = JSON.stringify(layeredText, null, space);
  if (!space) return s;

  let removePropertySpace = options?.removePropertySpace || false;

  return s.replace(
    /(\n(\s+))(\{(?:\n\2\s.*)*\n\2\})/g,
    function (match, p1, p2, p3) {
      // console.log("matched");
      return (
        p1 +
        (removePropertySpace
          ? JSON.stringify(JSON.parse(p3))
          : p3.replace(/\n\s+/g, ""))
      );
    }
  );
};

//module

exports.MODE_NORMALIZE = MODE_NORMALIZE;
exports.MODE_COMPACT = MODE_COMPACT;

exports.NORMALIZE_GROUP_COUNT = NORMALIZE_GROUP_COUNT;

exports.INDEX_N_TEXT = INDEX_N_TEXT;
exports.INDEX_N_PROPERTY = INDEX_N_PROPERTY;
exports.INDEX_N_PROP = INDEX_N_PROPERTY;
exports.INDEX_N_SUBORDINATE = INDEX_N_SUBORDINATE;
exports.INDEX_N_SUB = INDEX_N_SUBORDINATE;

exports.format = format;
exports.parse = parse;

exports.normalize = normalize;
exports.compact = compact;

exports.duplicate = duplicate;

exports.isNormalized = isNormalized;

exports.isEmptyProp = isEmptyProp;
exports.isEmptySub = isEmptySub;

exports._isEmpty = _isEmpty;
// exports._isNotEmpty = _isNotEmpty;

exports.stringify = stringify;
