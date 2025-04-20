# layered-text
layered text tool

# Install
```
npm install layered-text
```

# Usage
```javascript

var layered_text = require("layered-text");

function cmp_json(value, expect) {
	return JSON.stringify(value) === JSON.stringify(expect);
}

//.format/compact/normalize/parse()
cmp_json(layered_text.format("abc"), ["abc"]);
cmp_json(layered_text.compact(["abc",{},[]]), ["abc"]);
cmp_json(layered_text.normalize(["abc"]), ["abc", 0, 0]);
cmp_json(layered_text.parse('["abc"]'), ["abc"]);

```

# Document
```text
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

```
