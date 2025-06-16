var assert = require("assert");
// var test = require("node:test");

const layered_text = require("../index.js");

//tools
function cmp_json(value, expect) {
  if (JSON.stringify(value) === JSON.stringify(expect)) return true;
  console.error("value string: " + JSON.stringify(value));
  console.error("the expected: " + JSON.stringify(expect));
  return false;
}

function cmp_normalize(value, expect) {
  return cmp_json(layered_text.normalize(value), expect);
}

function cmp_compact(value, expect) {
  return cmp_json(layered_text.compact(value), expect);
}

function cmp_str(value, expect) {
  if (value === expect) return true;
  console.error("value string: \n" + value + "$");
  console.error("the expected: \n" + expect + "$");
  return false;
}

//////////////////////////////////

describe("layered-text, index", () => {
  it(".normalize()", () => {
    //text
    assert(cmp_normalize(["abc"], ["abc", 0, 0]));
    assert(
      cmp_normalize(
        ["this is a string \nwith line break"],
        ["this is a string \nwith line break", 0, 0]
      )
    );

    assert(cmp_normalize(["abc", "def"], ["abc", 0, 0, "def", 0, 0]));

    assert(
      cmp_normalize(["abc", 0, 0, "def", 0, 0], ["abc", 0, 0, "def", 0, 0])
    );

    //property
    assert(cmp_normalize(["abc", { id: 1 }], ["abc", { id: 1 }, 0]));
    assert(cmp_normalize(["abc", {}], ["abc", 0, 0]));
    assert(
      cmp_normalize(
        ["abc", { id: 1 }, "def", { id: 2 }],
        ["abc", { id: 1 }, 0, "def", { id: 2 }, 0]
      )
    );

    //subordinate
    assert(cmp_normalize(["abc", ["def"]], ["abc", 0, ["def", 0, 0]]));
    assert(cmp_normalize(["abc", []], ["abc", 0, []]));
    assert(
      cmp_normalize(
        ["abc", { id: 1 }, ["def"]],
        ["abc", { id: 1 }, ["def", 0, 0]]
      )
    );
    assert(
      cmp_normalize(
        ["abc", ["def"], "ghi"],
        ["abc", 0, ["def", 0, 0], "ghi", 0, 0]
      )
    );
    assert(
      cmp_normalize(
        ["abc", ["def"], "ghi", ["jkl"]],
        ["abc", 0, ["def", 0, 0], "ghi", 0, ["jkl", 0, 0]]
      )
    );
    assert(
      cmp_normalize(
        ["abc", {}, [], "def", {}, []],
        ["abc", 0, [], "def", 0, []]
      )
    );

    //accepted abnormal formats
    assert(
      cmp_normalize(
        ["abc", { id: 1, name: "a" }, { id: 2 }],
        ["abc", { id: 2, name: "a" }, 0]
      )
    );
    assert(
      cmp_normalize(
        ["abc", ["def"], ["ghi"]],
        ["abc", 0, ["def", 0, 0, "ghi", 0, 0]]
      )
    );
    assert(cmp_normalize(["abc", {}, []], ["abc", 0, []]));
    assert(cmp_normalize(["abc", 0, 0, 0, 0, 0], ["abc", 0, 0]));
    assert(
      cmp_normalize(
        [["abc", "def"], ["ghi"]],
        ["abc", 0, 0, "def", 0, ["ghi", 0, 0]]
      )
    );
    assert(
      cmp_normalize(
        [[["abc", "def"], ["ghi"]], "jkl"],
        ["abc", 0, 0, "def", 0, ["ghi", 0, 0], "jkl", 0, 0]
      )
    );

    //special
    assert(cmp_normalize([""], ["", 0, 0]));
    assert(cmp_normalize([], []));
    assert(cmp_normalize("abc", ["abc", 0, 0]));
    assert(cmp_normalize("", ["", 0, 0]));
    assert(cmp_normalize(undefined, []));
    assert(cmp_normalize(null, ["null", 0, 0]));
    assert(cmp_normalize(0, ["0", 0, 0]));
    assert(cmp_normalize(1, ["1", 0, 0]));
    assert(cmp_normalize(1.2, ["1.2", 0, 0]));
    assert(cmp_normalize(true, ["true", 0, 0]));
    assert(cmp_normalize(false, ["false", 0, 0]));
    assert(cmp_normalize({ a: 1 }, ['{"a":1}', 0, 0]));
    assert(cmp_normalize([0], []));
    assert(cmp_normalize([1], []));
    assert(cmp_normalize([true], []));
    assert(cmp_normalize([false], []));
    assert(cmp_normalize([null], []));
    assert(cmp_normalize([{ a: 1 }], []));
    assert(cmp_normalize([, , , ,], []));
    assert(cmp_normalize([, , , 1, , , , , ,], []));
    assert(
      cmp_normalize(
        ["abc", { id: 1 }, ["def"], { name: "a" }, "ghi"],
        ["abc", { id: 1, name: "a" }, ["def", 0, 0], "ghi", 0, 0]
      )
    );
    assert(
      cmp_normalize(
        ["abc", { id: 1 }, ["def"], { name: "a" }],
        ["abc", { id: 1, name: "a" }, ["def", 0, 0]]
      )
    );
    assert(cmp_normalize([{ id: 1 }, "abc"], ["abc", { id: 1 }, 0]));

    var lt = layered_text.normalize(["a", { b: 1 }, ["c"]]);
    assert(lt === layered_text.normalize(lt));
  });

  it(".compact()", () => {
    //text
    assert(cmp_compact(["abc"], ["abc"]));
    assert(
      cmp_compact(
        ["this is a string \nwith line break"],
        ["this is a string \nwith line break"]
      )
    );

    assert(cmp_compact(["abc", "def"], ["abc", "def"]));

    assert(cmp_compact(["abc", 0, 0, "def", 0, 0], ["abc", "def"]));

    //property
    assert(cmp_compact(["abc", 0, { id: 1 }], ["abc", { id: 1 }]));
    assert(cmp_compact(["abc", 0, {}], ["abc"]));
    assert(
      cmp_compact(
        ["abc", { id: 1 }, 0, "def", { id: 2 }],
        ["abc", { id: 1 }, "def", { id: 2 }]
      )
    );

    //subordinate
    assert(cmp_compact(["abc", ["def"], 0], ["abc", ["def"]]));
    assert(cmp_compact(["abc", []], ["abc"]));
    assert(
      cmp_compact(["abc", { id: 1 }, 0, ["def"]], ["abc", { id: 1 }, ["def"]])
    );
    assert(cmp_compact(["abc", 0, ["def"], "ghi"], ["abc", ["def"], "ghi"]));
    assert(
      cmp_compact(
        ["abc", ["def"], 0, "ghi", ["jkl"]],
        ["abc", ["def"], "ghi", ["jkl"]]
      )
    );
    assert(cmp_compact(["abc", {}, [], 0, "def", {}, []], ["abc", "def"]));

    //accepted abnormal formats
    assert(
      cmp_compact(
        ["abc", 0, { id: 1, name: "a" }, 0, { id: 2 }],
        ["abc", { id: 2, name: "a" }]
      )
    );
    assert(
      cmp_compact(["abc", 0, ["def"], 0, ["ghi"]], ["abc", ["def", "ghi"]])
    );
    assert(cmp_compact(["abc", {}, 0, []], ["abc"]));
    assert(cmp_compact(["abc", 0, 0, 0, 0, 0], ["abc"]));
    assert(cmp_compact([["abc", "def"], ["ghi"]], ["abc", "def", ["ghi"]]));
    assert(
      cmp_compact(
        [[["abc", "def"], ["ghi"]], "jkl"],
        ["abc", "def", ["ghi"], "jkl"]
      )
    );

    //special
    assert(cmp_compact([""], [""]));
    assert(cmp_compact([], []));
    assert(cmp_compact("abc", ["abc"]));
    assert(cmp_compact("", [""]));
    assert(cmp_compact(undefined, []));
    assert(cmp_compact(null, ["null"]));
    assert(cmp_compact(0, ["0"]));
    assert(cmp_compact(1, ["1"]));
    assert(cmp_compact(1.2, ["1.2"]));
    assert(cmp_compact(true, ["true"]));
    assert(cmp_compact(false, ["false"]));
    assert(cmp_compact({ a: 1 }, ['{"a":1}']));
    assert(cmp_compact([0], []));
    assert(cmp_compact([1], []));
    assert(cmp_compact([true], []));
    assert(cmp_compact([false], []));
    assert(cmp_compact([null], []));
    assert(cmp_compact([{ a: 1 }], []));
    assert(cmp_compact([, , , ,], []));
    assert(cmp_compact([, , , 1, , , , , ,], []));
    assert(
      cmp_compact(
        ["abc", { id: 1 }, ["def"], { name: "a" }, "ghi"],
        ["abc", { id: 1, name: "a" }, ["def"], "ghi"]
      )
    );
    assert(
      cmp_compact(
        ["abc", { id: 1 }, ["def"], { name: "a" }],
        ["abc", { id: 1, name: "a" }, ["def"]]
      )
    );
    assert(cmp_compact([{ id: 1 }, "abc"], ["abc", { id: 1 }]));

    var lt = layered_text.compact(["a", { b: 1 }, ["c"]]);
    assert(lt === layered_text.compact(lt));
  });

  it("entry", () => {
    var lt = layered_text.normalize(["a", { b: 1 }, ["c"]]);

    //.format() for object
    assert(cmp_json(layered_text.parse(["abc"]), ["abc"]));
    //parse string then .format() for string
    assert(cmp_json(layered_text.parse('["abc"]'), ["abc"]));

    //.format/compact/normalize/parse()
    assert(cmp_json(layered_text.format("abc"), ["abc"]));
    assert(cmp_json(layered_text.format('["abc"]'), ['["abc"]']));
    assert(cmp_json(layered_text.compact('["abc"]'), ['["abc"]']));
    assert(cmp_json(layered_text.normalize('["abc"]'), ['["abc"]', 0, 0]));
    assert(cmp_json(layered_text.parse('["abc"]'), ["abc"]));

    assert(cmp_json(lt[layered_text.INDEX_N_TEXT], "a"));
    assert(cmp_json(lt[layered_text.INDEX_N_PROP], { b: 1 }));
    assert(cmp_json(lt[layered_text.INDEX_N_SUB], ["c", 0, 0]));

    assert(layered_text.INDEX_N_TEXT === 0);
    assert(layered_text.INDEX_N_PROPERTY === layered_text.INDEX_N_PROP);
    assert(layered_text.INDEX_N_SUBORDINATE === layered_text.INDEX_N_SUB);
  });

  it(".duplicate()", () => {
    var a = ["aaa", 0, ["bbb", 0, 0]];
    var a2 = layered_text.normalize(a);
    var a3 = layered_text.normalize(a2);
    var a4 = layered_text.normalize(a2, true);
    var a5 = layered_text.duplicate(a2, layered_text.MODE_NORMALIZE);

    var b = ["ccc", ["ddd"]];
    var b2 = layered_text.compact(b);
    var b3 = layered_text.compact(b2);
    var b4 = layered_text.compact(b2, true);
    var b5 = layered_text.duplicate(b2); //default layered_text.MODE_COMPACT

    assert(a !== a2 && a[2] !== a2[2]);
    assert(a2 === a3 && a2[2] === a3[2]);

    assert(cmp_json(a2, a4));
    assert(cmp_json(a2[2], a4[2]));
    assert(cmp_json(a2[2], ["bbb", 0, 0]));
    assert(a2 !== a4 && a2[2] !== a4[2]);
    assert(cmp_json(a2, a5));
    assert(cmp_json(a2[2], a5[2]));
    assert(cmp_json(a2[2], ["bbb", 0, 0]));
    assert(a2 !== a5 && a2[2] !== a5[2]);

    assert(b !== b2 && b[1] !== b2[1]);
    assert(b2 === b3 && b2[1] === b3[1]);

    assert(cmp_json(b2, b4));
    assert(cmp_json(b2[1], b4[1]));
    assert(cmp_json(b2[1], ["ddd"]));
    assert(b2 !== b4 && b2[1] !== b4[1]);
    assert(cmp_json(b2, b5));
    assert(cmp_json(b2[1], b5[1]));
    assert(cmp_json(b2[1], ["ddd"]));
    assert(b2 !== b5 && b2[1] !== b5[1]);
  });

  it(".isNormalized()", () => {
    var lt = ["aaa", 0, 0, "bbb", 0, ["ccc", 0, 0]];

    lt.mode = layered_text.MODE_NORMALIZE;
    lt[5].mode = layered_text.MODE_NORMALIZE;

    assert(layered_text.isNormalized(lt));
    assert(layered_text.isNormalized(lt[5]));
    assert(!layered_text.isNormalized(["aaa", 0, 0]));
    assert(!layered_text.isNormalized(null));
    assert(!layered_text.isNormalized(""));
    assert(!layered_text.isNormalized(0));
  });

  it(".isEmptyProp()", () => {
    assert(layered_text.isEmptyProp(0));
    assert(layered_text.isEmptyProp(null));
    assert(layered_text.isEmptyProp({}));
    assert(layered_text.isEmptyProp({ a: undefined }));
    assert(layered_text.isEmptyProp([]));
    assert(layered_text.isEmptyProp(true));
    assert(layered_text.isEmptyProp(false));
    assert(layered_text.isEmptyProp(123));
    assert(layered_text.isEmptyProp("abc"));
    assert(layered_text.isEmptyProp(["abc"]));
    assert(!layered_text.isEmptyProp({ a: 0 }));
    assert(!layered_text.isEmptyProp({ a: null }));
  });

  it(".isEmptySub()", () => {
    assert(layered_text.isEmptySub(0));
    assert(layered_text.isEmptySub(null));
    assert(layered_text.isEmptySub({}));
    assert(layered_text.isEmptySub({ a: undefined }));
    assert(layered_text.isEmptySub([]));
    assert(layered_text.isEmptySub(true));
    assert(layered_text.isEmptySub(false));
    assert(layered_text.isEmptySub(123));
    assert(layered_text.isEmptySub("abc"));

    assert(layered_text.isEmptySub({ a: 123 }));
    assert(layered_text.isEmptySub({ a: "abc" }));

    assert(!layered_text.isEmptySub([0]));
    assert(!layered_text.isEmptySub([,])); //length=1
    assert(!layered_text.isEmptySub([, ,]));
  });

  it(".stringify()", () => {
    assert(
      cmp_str(layered_text.stringify(["abc", 0, 0], "\t"), '[\n\t"abc"\n]')
    );

    let lt = ["abc", { id: 1 }, 0];
    assert(
      cmp_str(layered_text.stringify(lt, "\t"), '[\n\t"abc",\n\t{"id": 1}\n]')
    );
    assert(
      cmp_str(layered_text.stringify(lt, 2), '[\n  "abc",\n  {"id": 1}\n]')
    );
    assert(cmp_str(layered_text.stringify(lt), '["abc",{"id":1}]'));

    lt = [
      "abc",
      { id: 1 },
      ["def", { id: 2, attr: ["a", "b"] }, "def2", { id: 3, attr: ["c", "d"] }],
    ];
    let expect = `[
\t"abc",
\t{"id": 1},
\t[
\t\t"def",
\t\t{"id": 2,"attr": ["a","b"]},
\t\t"def2",
\t\t{"id": 3,"attr": ["c","d"]}
\t]
]`;
    let expect2 = `[
\t"abc",
\t{"id":1},
\t[
\t\t"def",
\t\t{"id":2,"attr":["a","b"]},
\t\t"def2",
\t\t{"id":3,"attr":["c","d"]}
\t]
]`;
    assert(cmp_str(layered_text.stringify(lt, "\t"), expect));
    assert(
      cmp_str(
        layered_text.stringify(lt, "\t", { removePropertySpace: true }),
        expect2
      )
    );
  });
});
