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

//.format() for object
cmp_json(layered_text(["abc"]), ["abc"]) &&
//parse string then .format() for string
cmp_json(layered_text('["abc"]'), ["abc"]) &&

//.format/compact/normalize/parse()
cmp_json(layered_text.format('["abc"]'), ['["abc"]']) &&
cmp_json(layered_text.compact('["abc"]'), ['["abc"]']) &&
cmp_json(layered_text.normalize('["abc"]'), ['["abc"]', 0, 0]) &&
cmp_json(layered_text.parse('["abc"]'), ["abc"])

```

# Document
```text
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

```
