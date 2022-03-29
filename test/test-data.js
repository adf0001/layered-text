
//global variable, for html page, refer tpsvr @ npm.
layered_text = require("../layered-text.js");

cmp_json = function (value, expect) {
	if (JSON.stringify(value) === JSON.stringify(expect)) return true;
	console.error("value string: " + JSON.stringify(value));
	console.error("the expected: " + JSON.stringify(expect));
	return false;
};

module.exports = {

	".normalize()": function (done) {
		var cmp_normalize = function (value, expect) {
			var s0 = JSON.stringify(value);

			//duplicate
			if (!cmp_json(layered_text.normalize(value, true), expect)) return false;

			layered_text.normalize(layered_text.compact(layered_text.normalize(value, true)));
			layered_text.normalize(layered_text.normalize(layered_text.compact(value, true)));
			if (!cmp_json(layered_text.normalize(layered_text.normalize(layered_text.normalize(value, true))), expect)) return false;
			layered_text.normalize(layered_text.compact(layered_text.compact(value, true)));

			if (s0 !== JSON.stringify(value)) {
				console.error("source string : " + s0);
				console.error("source changed: " + JSON.stringify(value));
				return false;
			}

			//not duplicate
			var v0 = value;
			value = layered_text.normalize(value);
			if (!cmp_json(value, expect)) return false;
			if ((v0 instanceof Array) && v0 !== value) return false;

			if ((v0 instanceof Array) && s0 === JSON.stringify(value)) {
				console.log("normalize string unchanged: " + s0);
			}

			return true;
		}

		done(!(
			/*
			*/
			//text
			cmp_normalize(["abc"], ["abc", 0, 0]) &&
			cmp_normalize(["this is a string \nwith line break"], ["this is a string \nwith line break", 0, 0]) &&

			cmp_normalize(["abc", "def"], ["abc", 0, 0, "def", 0, 0]) &&

			cmp_normalize(["abc", 0, 0, "def", 0, 0],
				["abc", 0, 0, "def", 0, 0]) &&

			//property 
			cmp_normalize(["abc", { "id": 1 }], ["abc", { "id": 1 }, 0]) &&
			cmp_normalize(["abc", {}], ["abc", 0, 0]) &&
			cmp_normalize(["abc", { "id": 1 }, "def", { "id": 2 }],
				["abc", { "id": 1 }, 0, "def", { "id": 2 }, 0]) &&

			//subordinate
			cmp_normalize(["abc", ["def"]],
				["abc", 0, ["def", 0, 0]]) &&
			cmp_normalize(["abc", []],
				["abc", 0, []]) &&
			cmp_normalize(["abc", { "id": 1 }, ["def"]],
				["abc", { "id": 1 }, ["def", 0, 0]]) &&
			cmp_normalize(["abc", ["def"], "ghi"],
				["abc", 0, ["def", 0, 0], "ghi", 0, 0]) &&
			cmp_normalize(["abc", ["def"], "ghi", ["jkl"]],
				["abc", 0, ["def", 0, 0], "ghi", 0, ["jkl", 0, 0]]) &&
			cmp_normalize(["abc", {}, [], "def", {}, []],
				["abc", 0, [], "def", 0, []]) &&

			//accepted abnormal formats
			cmp_normalize(["abc", { "id": 1, "name": "a" }, { "id": 2 }],
				["abc", { "id": 2, "name": "a" }, 0]) &&
			cmp_normalize(["abc", ["def"], ["ghi"]],
				["abc", 0, ["def", 0, 0, "ghi", 0, 0]]) &&
			cmp_normalize(["abc", {}, []],
				["abc", 0, []]) &&
			cmp_normalize(["abc", 0, 0, 0, 0, 0],
				["abc", 0, 0]) &&
			cmp_normalize([["abc", "def"], ["ghi"]],
				["abc", 0, 0, "def", 0, ["ghi", 0, 0]]) &&
			cmp_normalize([[["abc", "def"], ["ghi"]], "jkl"],
				["abc", 0, 0, "def", 0, ["ghi", 0, 0], "jkl", 0, 0]) &&

			//special
			cmp_normalize([""], ["", 0, 0]) &&
			cmp_normalize([], []) &&
			cmp_normalize("abc", ["abc", 0, 0]) &&
			cmp_normalize("", ["", 0, 0]) &&
			cmp_normalize(undefined, []) &&
			cmp_normalize(null, ["null", 0, 0]) &&
			cmp_normalize(0, ["0", 0, 0]) &&
			cmp_normalize(1, ["1", 0, 0]) &&
			cmp_normalize(1.2, ["1.2", 0, 0]) &&
			cmp_normalize(true, ["true", 0, 0]) &&
			cmp_normalize(false, ["false", 0, 0]) &&
			cmp_normalize({ a: 1 }, ['{"a":1}', 0, 0]) &&
			cmp_normalize([0], ["0", 0, 0]) &&
			cmp_normalize([1], ["1", 0, 0]) &&
			cmp_normalize([true], ["true", 0, 0]) &&
			cmp_normalize([false], ["false", 0, 0]) &&
			cmp_normalize([null], ["null", 0, 0]) &&
			cmp_normalize([{ a: 1 }], ['{"a":1}', 0, 0]) &&
			cmp_normalize([, , , ,], []) &&
			cmp_normalize([, , , 1, , , , , ,], ["1", 0, 0]) &&
			/*
			*/

			true
		));
	},

	".compact()": function (done) {
		var cmp_compact = function (value, expect) {
			var s0 = JSON.stringify(value);

			//duplicate
			if (!cmp_json(layered_text.compact(value, true), expect)) return false;
			if (!cmp_json(layered_text.compact(layered_text.compact(layered_text.normalize(value, true))), expect)) return false;
			if (!cmp_json(layered_text.compact(layered_text.normalize(layered_text.compact(value, true))), expect)) return false;
			if (!cmp_json(layered_text.compact(layered_text.normalize(layered_text.normalize(value, true))), expect)) return false;
			if (!cmp_json(layered_text.compact(layered_text.compact(layered_text.compact(value, true))), expect)) return false;

			if (s0 !== JSON.stringify(value)) {
				console.error("source string : " + s0);
				console.error("source changed: " + JSON.stringify(value));
				return false;
			}

			//not duplicate
			var v0 = value;
			value = layered_text.compact(value);
			if (!cmp_json(value, expect)) return false;
			if ((v0 instanceof Array) && v0 !== value) return false;

			if ((v0 instanceof Array) && s0 === JSON.stringify(value)) {
				console.log("compact string unchanged: " + s0);
			}

			return true;
		}

		done(!(
			/*
			*/
			//text
			cmp_compact(["abc"], ["abc"]) &&
			cmp_compact(["this is a string \nwith line break"], ["this is a string \nwith line break"]) &&

			cmp_compact(["abc", "def"], ["abc", "def"]) &&

			cmp_compact(["abc", 0, 0, "def", 0, 0],
				["abc", "def"]) &&

			//property 
			cmp_compact(["abc", 0, { "id": 1 }], ["abc", { "id": 1 }]) &&
			cmp_compact(["abc", 0, {}], ["abc"]) &&
			cmp_compact(["abc", { "id": 1 }, 0, "def", { "id": 2 }],
				["abc", { "id": 1 }, "def", { "id": 2 }]) &&

			//subordinate
			cmp_compact(["abc", ["def"], 0],
				["abc", ["def"]]) &&
			cmp_compact(["abc", []],
				["abc"]) &&
			cmp_compact(["abc", { "id": 1 }, 0, ["def"]],
				["abc", { "id": 1 }, ["def"]]) &&
			cmp_compact(["abc", 0, ["def"], "ghi"],
				["abc", ["def"], "ghi"]) &&
			cmp_compact(["abc", ["def"], 0, "ghi", ["jkl"]],
				["abc", ["def"], "ghi", ["jkl"]]) &&
			cmp_compact(["abc", {}, [], 0, "def", {}, []],
				["abc", "def"]) &&

			//accepted abnormal formats
			cmp_compact(["abc", 0, { "id": 1, "name": "a" }, 0, { "id": 2 }],
				["abc", { "id": 2, "name": "a" }]) &&
			cmp_compact(["abc", 0, ["def"], 0, ["ghi"]],
				["abc", ["def", "ghi"]]) &&
			cmp_compact(["abc", {}, 0, []],
				["abc"]) &&
			cmp_compact(["abc", 0, 0, 0, 0, 0],
				["abc"]) &&
			cmp_compact([["abc", "def"], ["ghi"]],
				["abc", "def", ["ghi"]]) &&
			cmp_compact([[["abc", "def"], ["ghi"]], "jkl"],
				["abc", "def", ["ghi",], "jkl"]) &&

			//special
			cmp_compact([""], [""]) &&
			cmp_compact([], []) &&
			cmp_compact("abc", ["abc"]) &&
			cmp_compact("", [""]) &&
			cmp_compact(undefined, []) &&
			cmp_compact(null, ["null"]) &&
			cmp_compact(0, ["0"]) &&
			cmp_compact(1, ["1"]) &&
			cmp_compact(1.2, ["1.2"]) &&
			cmp_compact(true, ["true"]) &&
			cmp_compact(false, ["false"]) &&
			cmp_compact({ a: 1 }, ['{"a":1}']) &&
			cmp_compact([0], ["0"]) &&
			cmp_compact([1], ["1"]) &&
			cmp_compact([true], ["true"]) &&
			cmp_compact([false], ["false"]) &&
			cmp_compact([null], ["null"]) &&
			cmp_compact([{ a: 1 }], ['{"a":1}']) &&
			cmp_compact([, , , ,], []) &&
			cmp_compact([, , , 1, , , , , ,], ["1"]) &&
			/*
			*/

			true
		));
	},

	"entry": function (done) {

		var lt = layered_text.normalize(["a", { b: 1 }, ["c"]]);

		done(!(
			/*
			*/
			//.format() for object
			cmp_json(layered_text(["abc"]), ["abc"]) &&
			//parse string then .format() for string
			cmp_json(layered_text('["abc"]'), ["abc"]) &&

			//.format/compact/normalize/parse()
			cmp_json(layered_text.format('["abc"]'), ['["abc"]']) &&
			cmp_json(layered_text.compact('["abc"]'), ['["abc"]']) &&
			cmp_json(layered_text.normalize('["abc"]'), ['["abc"]', 0, 0]) &&
			cmp_json(layered_text.parse('["abc"]'), ["abc"]) &&

			cmp_json(lt[layered_text.INDEX_N_TEXT], "a") &&
			cmp_json(lt[layered_text.INDEX_N_PROP], { b: 1 }) &&
			cmp_json(lt[layered_text.INDEX_N_SUB], ["c", 0, 0]) &&

			layered_text.INDEX_N_TEXT === 0 &&
			layered_text.INDEX_N_PROPERTY === layered_text.INDEX_N_PROP &&
			layered_text.INDEX_N_SUBORDINATE === layered_text.INDEX_N_SUB &&

			true
		));
	},

	".add()": function (done) {

		done(!(
			//add
			cmp_json(layered_text.add(["abc", "def"], 0, "ghi"), ["ghi", "abc", "def"]) &&
			cmp_json(layered_text.add(["abc", "def"], 1, "ghi"), ["abc", "ghi", "def"]) &&
			cmp_json(layered_text.add(["abc", "def"], 2, "ghi"), ["abc", "def", "ghi"]) &&
			cmp_json(layered_text.add(["abc", "def"], 3, "ghi"), ["abc", "def", "ghi"]) &&
			cmp_json(layered_text.add(["abc", "def"], -1, "ghi"), ["abc", "def", "ghi"]) &&

			//add normalized
			cmp_json(layered_text.add(layered_text.normalize(["abc", "def"]), 1, "ghi"),
				["abc", 0, 0, "ghi", 0, 0, "def", 0, 0]) &&
			cmp_json(layered_text.addByIndex(layered_text.normalize(["abc", "def"]), 1 * layered_text.NORMALIZE_GROUP_COUNT, "ghi"),
				["abc", 0, 0, "ghi", 0, 0, "def", 0, 0]) &&

			//add with property and sub
			cmp_json(layered_text.add(["abc", 0, "def", 0], 2, ["ghi", ["a"], { b: 1 }], { b: 2 }, ["b"]),
				["abc", 0, "ghi", { b: 2 }, ["a", "b"], "def", 0]) &&
			cmp_json(layered_text.add(["abc", 0, "def", 0], -1, ["ghi", ["a"], { b: 1 }], { b: 2 }, ["b"]),
				["abc", 0, "def", 0, "ghi", { b: 2 }, ["a", "b"]]) &&

			true
		));
	},

	".remove()": function (done) {

		done(!(
			//remove
			cmp_json(layered_text.remove(["abc", "def", "ghi"], 0), ["def", "ghi"]) &&
			cmp_json(layered_text.remove(["abc", "def", "ghi"], 1), ["abc", "ghi"]) &&
			cmp_json(layered_text.remove(["abc", "def", "ghi"], 2), ["abc", "def"]) &&

			cmp_json(layered_text.remove(["abc", 0, "def", 0, 0, "ghi", 0], 2),
				["abc", 0, "ghi", 0]) &&

			//remove normalized
			cmp_json(layered_text.remove(layered_text.normalize(["abc", "def", "ghi"]), 1),
				["abc", 0, 0, "ghi", 0, 0]) &&
			cmp_json(layered_text.removeByIndex(layered_text.normalize(["abc", "def", "ghi"]), 1 * layered_text.NORMALIZE_GROUP_COUNT),
				["abc", 0, 0, "ghi", 0, 0]) &&

			//remove property
			cmp_json(layered_text.remove(["abc", 0, "def", { b: 1, c: 2 }], 2, "b"),
				["abc", 0, "def", { c: 2 }]) &&
			cmp_json(layered_text.remove(["abc", 0, "def", { b: 1 }], 2, "b"),
				["abc", 0, "def", 0]) &&
			cmp_json(layered_text.remove(["abc", 0, "def", { b: 1, c: 2 }], 2, ["b", "c"]),
				["abc", 0, "def", 0]) &&
			cmp_json(layered_text.remove(["abc", 0, "def", { b: 1, c: 2 }], 2, { b: null, c: null }),
				["abc", 0, "def", 0]) &&
			cmp_json(layered_text.remove(["abc", 0, "def", { b: 1, c: 2 }], 2, true),
				["abc", 0, "def", 0]) &&

			//remove sub
			cmp_json(layered_text.remove(["abc", 0, "def", { b: 1 }, ["ccc"]], 2, "b"),
				["abc", 0, "def", 0, ["ccc"]]) &&
			cmp_json(layered_text.remove(["abc", 0, "def", { b: 1 }, ["ccc"]], 2, "b", true),
				["abc", 0, "def", 0, 0]) &&

			cmp_json(layered_text.remove(["abc", 0, "def", { b: 1 }, ["ccc"]], 2, true, true),
				["abc", 0, "def", 0, 0]) &&

			true
		));
	},

	".update()": function (done) {
		var a = ["aaa", {}, [], "bb", 0, []];
		var a2 = a[2];
		a = layered_text.normalize(a);
		a = layered_text.update(a, 0, null, { c: 1 });
		a = layered_text.update(a, 0, null, { d: 1 }, ["dd"]);

		done(!(
			a2 === a[2] &&	//check original empty sub unchange

			//update
			cmp_json(layered_text.update(["abc", "def"], 0, "aaa"), ["aaa", "def"]) &&
			cmp_json(layered_text.update(["abc", "def"], 1, "aaa"), ["abc", "aaa"]) &&
			cmp_json(layered_text.update(["abc", "def"], 0, "aaa", { b: 1 }),
				["aaa", { b: 1 }, "def"]) &&
			cmp_json(layered_text.update(["abc", { a: 1 }, "def"], 0, "aaa", { b: 2 }),
				["aaa", { a: 1, b: 2 }, "def"]) &&
			cmp_json(layered_text.update(["abc", { a: 1 }, "def"], 2, "aaa", { b: 2 }),
				["abc", { a: 1 }, "aaa", { b: 2 }]) &&

			//update without text
			cmp_json(layered_text.update(["abc", { a: 1 }, "def"], 0, null, { b: 2 }, ["ccc"]),
				["abc", { a: 1, b: 2 }, ["ccc"], "def"]) &&
			cmp_json(layered_text.update(["abc", { a: 1 }, "def"], 0, null, ["ccc"]),
				["abc", { a: 1 }, ["ccc"], "def"]) &&
			cmp_json(layered_text.update(["abc", { a: 1 }, "def"], 2, null, ["ccc"]),
				["abc", { a: 1 }, "def", ["ccc"]]) &&

			cmp_json(layered_text.update(	//keep empty sub
				layered_text.normalize(["abc", { a: 1 }, [], "def"]), 0, null, { b: 2 }),
				["abc", { a: 1, b: 2 }, [], "def", 0, 0]) &&

			//update to remove property
			cmp_json(layered_text.update(["abc", { a: 1 }, "def"], 0, "aaa", { a: undefined }),
				["aaa", "def"]) &&
			cmp_json(layered_text.update(layered_text.normalize(["abc", { a: 1 }, "def"]), 0, "aaa", { a: undefined }),
				["aaa", 0, 0, "def", 0, 0]) &&
			cmp_json(layered_text.update(layered_text.normalize(["abc", { a: 1 }, "def"]), 1, "aaa", { a: undefined, b: 2 }),
				["abc", { a: 1 }, 0, "aaa", { b: 2 }, 0]) &&

			//update to add/append sub
			cmp_json(layered_text.update(["abc", "def"], 0, null, ["ccc"]),
				["abc", ["ccc"], "def"]) &&
			cmp_json(layered_text.update(["abc", ["bbb"], "def"], 0, null, ["ccc"]),
				["abc", ["bbb", "ccc"], "def"]) &&

			//update normalized with sub
			cmp_json(layered_text.update(layered_text.normalize(["aaa", ["b"]]), 0, null, ["c"]),
				["aaa", 0, ["b", 0, 0, "c", 0, 0]]) &&


			//whole item replacing
			cmp_json(layered_text.update(["abc", { a: 1 }, ["ccc"], "def"], 0, ["aaa"], { b: 2 }),
				["aaa", { b: 2 }, "def"]) &&

			//remove all property and sub by `false`
			cmp_json(layered_text.update(["abc", { a: 1 }, ["ccc"], "def"], 0, null, false),
				["abc", ["ccc"], "def"]) &&
			cmp_json(layered_text.update(["abc", { a: 1 }, ["ccc"], "def"], 0, null, null, false),
				["abc", { a: 1 }, "def"]) &&
			cmp_json(layered_text.update(["abc", { a: 1 }, ["ccc"], "def"], 0, null, false, false),
				["abc", "def"]) &&
			cmp_json(layered_text.update(["abc", "def"], 0, null, false, false),
				["abc", "def"]) &&
			cmp_json(layered_text.update(layered_text.normalize(["abc", { a: 1 }, ["ccc"], "def"]), 0, null, false, false),
				["abc", 0, 0, "def", 0, 0]) &&


			true
		));
	},

	".setNormalizedFlag()": function (done) {
		var lt = ["aaa", 0, 0, "bbb", 0, ["ccc", 0, 0]];

		//.setNormalizedFlag(normalizedLayeredText)
		layered_text.setNormalizedFlag(lt);

		done(!(
			lt.mode === layered_text.MODE_NORMALIZE &&
			lt[5].mode === layered_text.MODE_NORMALIZE &&

			true
		));
	},

	".isNormalized()": function (done) {
		var lt = ["aaa", 0, 0, "bbb", 0, ["ccc", 0, 0]];

		layered_text.setNormalizedFlag(lt);

		done(!(
			//.isNormalized(layeredText)
			layered_text.isNormalized(lt) &&
			layered_text.isNormalized(lt[5]) &&
			!layered_text.isNormalized(["aaa", 0, 0]) &&
			!layered_text.isNormalized(null) &&
			!layered_text.isNormalized("") &&
			!layered_text.isNormalized(0) &&
			!layered_text.isNormalized() &&

			true
		));
	},

	".isEmptyProp()": function (done) {
		done(!(
			//.isEmptyPart(propertyOrSubordinate)
			layered_text.isEmptyProp(0) &&
			layered_text.isEmptyProp(null) &&
			layered_text.isEmptyProp({}) &&
			layered_text.isEmptyProp({ a: undefined }) &&
			layered_text.isEmptyProp([]) &&
			layered_text.isEmptyProp(true) &&
			layered_text.isEmptyProp(false) &&
			layered_text.isEmptyProp(123) &&
			layered_text.isEmptyProp("abc") &&
			layered_text.isEmptyProp(["abc"]) &&

			!layered_text.isEmptyProp({ a: 0 }) &&
			!layered_text.isEmptyProp({ a: null }) &&

			true
		));
	},

	".isEmptySub()": function (done) {
		done(!(
			//.isEmptyPart(propertyOrSubordinate)
			layered_text.isEmptySub(0) &&
			layered_text.isEmptySub(null) &&
			layered_text.isEmptySub({}) &&
			layered_text.isEmptySub({ a: undefined }) &&
			layered_text.isEmptySub([]) &&
			layered_text.isEmptySub(true) &&
			layered_text.isEmptySub(false) &&
			layered_text.isEmptySub(123) &&
			layered_text.isEmptySub("abc") &&

			layered_text.isEmptySub({ a: 123 }) &&
			layered_text.isEmptySub({ a: "abc" }) &&

			!layered_text.isEmptySub([0]) &&
			!layered_text.isEmptySub([,]) &&	//length=1
			!layered_text.isEmptySub([, ,]) &&

			true
		));
	},

	"duplicate": function (done) {
		var a = ["aaa", 0, ["bbb", 0, 0]];
		var a2 = layered_text.normalize(a);
		var a3 = layered_text.normalize(a2);
		var a4 = layered_text.normalize(a2, true);

		var b = ["ccc", ["ddd"]];
		var b2 = layered_text.compact(b);
		var b3 = layered_text.compact(b2);
		var b4 = layered_text.compact(b2, true);


		done(!(
			a === a2 && a[2] === a2[2] &&
			a2 === a3 && a2[2] === a3[2] &&

			cmp_json(a2, a4) && cmp_json(a2[2], a4[2]) && cmp_json(a2[2], ["bbb", 0, 0]) &&
			a2 !== a4 && a2[2] !== a4[2] &&

			b === b2 && b[1] === b2[1] &&
			b2 === b3 && b2[1] === b3[1] &&

			cmp_json(b2, b4) && cmp_json(b2[1], b4[1]) && cmp_json(b2[1], ["ddd"]) &&
			b2 !== b4 && b2[1] !== b4[1] &&

			true
		));
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('layered_text', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
