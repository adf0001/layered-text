var assert = require("assert");
// var test = require("node:test");

const layered_text = require("../index.js");
const editor = require("../utils/editor.js");

//tools
function cmp_json(value, expect) {
  if (JSON.stringify(value) === JSON.stringify(expect)) return true;
  console.error("value string: " + JSON.stringify(value));
  console.error("the expected: " + JSON.stringify(expect));
  return false;
}

//////////////////////////////////

describe("layered-text, editor", () => {
  it(".add()", () => {
    //add
    assert(
      cmp_json(editor.add(["abc", "def"], 0, "ghi"), ["ghi", "abc", "def"])
    );
    assert(
      cmp_json(editor.add(["abc", "def"], 1, "ghi"), ["abc", "ghi", "def"])
    );
    assert(
      cmp_json(editor.add(["abc", "def"], 2, "ghi"), ["abc", "def", "ghi"])
    );
    assert(
      cmp_json(editor.add(["abc", "def"], 3, "ghi"), ["abc", "def", "ghi"])
    );
    assert(
      cmp_json(editor.add(["abc", "def"], -1, "ghi"), ["abc", "def", "ghi"])
    );

    //add normalized
    assert(
      cmp_json(editor.add(layered_text.normalize(["abc", "def"]), 1, "ghi"), [
        "abc",
        0,
        0,
        "ghi",
        0,
        0,
        "def",
        0,
        0,
      ])
    );
    assert(
      cmp_json(
        editor.addByIndex(
          layered_text.normalize(["abc", "def"]),
          1 * layered_text.NORMALIZE_GROUP_COUNT,
          "ghi"
        ),
        ["abc", 0, 0, "ghi", 0, 0, "def", 0, 0]
      )
    );

    //add with property and sub
    assert(
      cmp_json(
        editor.add(
          ["abc", 0, "def", 0],
          2,
          ["ghi", ["a"], { b: 1 }],
          { b: 2 },
          ["b"]
        ),
        ["abc", 0, "ghi", { b: 2 }, ["a", "b"], "def", 0]
      )
    );
    assert(
      cmp_json(
        editor.add(
          ["abc", 0, "def", 0],
          -1,
          ["ghi", ["a"], { b: 1 }],
          { b: 2 },
          ["b"]
        ),
        ["abc", 0, "def", 0, "ghi", { b: 2 }, ["a", "b"]]
      )
    );
  });

  it(".remove()", () => {
    //remove
    assert(cmp_json(editor.remove(["abc", "def", "ghi"], 0), ["def", "ghi"]));
    assert(cmp_json(editor.remove(["abc", "def", "ghi"], 1), ["abc", "ghi"]));
    assert(cmp_json(editor.remove(["abc", "def", "ghi"], 2), ["abc", "def"]));
    assert(
      cmp_json(editor.remove(["abc", 0, "def", 0, 0, "ghi", 0], 2), [
        "abc",
        0,
        "ghi",
        0,
      ])
    );

    //remove normalized
    assert(
      cmp_json(
        editor.remove(layered_text.normalize(["abc", "def", "ghi"]), 1),
        ["abc", 0, 0, "ghi", 0, 0]
      )
    );
    assert(
      cmp_json(
        editor.removeByIndex(
          layered_text.normalize(["abc", "def", "ghi"]),
          1 * layered_text.NORMALIZE_GROUP_COUNT
        ),
        ["abc", 0, 0, "ghi", 0, 0]
      )
    );

    //remove property
    assert(
      cmp_json(editor.remove(["abc", 0, "def", { b: 1, c: 2 }], 2, "b"), [
        "abc",
        0,
        "def",
        { c: 2 },
      ])
    );
    assert(
      cmp_json(editor.remove(["abc", 0, "def", { b: 1 }], 2, "b"), [
        "abc",
        0,
        "def",
        0,
      ])
    );
    assert(
      cmp_json(
        editor.remove(["abc", 0, "def", { b: 1, c: 2 }], 2, ["b", "c"]),
        ["abc", 0, "def", 0]
      )
    );
    assert(
      cmp_json(
        editor.remove(["abc", 0, "def", { b: 1, c: 2 }], 2, {
          b: null,
          c: null,
        }),
        ["abc", 0, "def", 0]
      )
    );
    assert(
      cmp_json(editor.remove(["abc", 0, "def", { b: 1, c: 2 }], 2, true), [
        "abc",
        0,
        "def",
        0,
      ])
    );

    //remove sub
    assert(
      cmp_json(editor.remove(["abc", 0, "def", { b: 1 }, ["ccc"]], 2, "b"), [
        "abc",
        0,
        "def",
        0,
        ["ccc"],
      ])
    );
    assert(
      cmp_json(
        editor.remove(["abc", 0, "def", { b: 1 }, ["ccc"]], 2, "b", true),
        ["abc", 0, "def", 0, 0]
      )
    );
    assert(
      cmp_json(
        editor.remove(["abc", 0, "def", { b: 1 }, ["ccc"]], 2, true, true),
        ["abc", 0, "def", 0, 0]
      )
    );
  });

  it(".update()", () => {
    var a = ["aaa", {}, [], "bb", 0, []];
    a = layered_text.normalize(a);
    a = editor.update(a, 0, null, { c: 1 });
    a = editor.update(a, 0, null, { d: 1 }, ["dd"]);

    //update
    assert(cmp_json(editor.update(["abc", "def"], 0, "aaa"), ["aaa", "def"]));
    assert(cmp_json(editor.update(["abc", "def"], 1, "aaa"), ["abc", "aaa"]));
    assert(
      cmp_json(editor.update(["abc", "def"], 0, "aaa", { b: 1 }), [
        "aaa",
        { b: 1 },
        "def",
      ])
    );
    assert(
      cmp_json(editor.update(["abc", { a: 1 }, "def"], 0, "aaa", { b: 2 }), [
        "aaa",
        { a: 1, b: 2 },
        "def",
      ])
    );
    assert(
      cmp_json(editor.update(["abc", { a: 1 }, "def"], 2, "aaa", { b: 2 }), [
        "abc",
        { a: 1 },
        "aaa",
        { b: 2 },
      ])
    );

    //update without text
    assert(
      cmp_json(
        editor.update(["abc", { a: 1 }, "def"], 0, null, { b: 2 }, ["ccc"]),
        ["abc", { a: 1, b: 2 }, ["ccc"], "def"]
      )
    );
    assert(
      cmp_json(editor.update(["abc", { a: 1 }, "def"], 0, null, ["ccc"]), [
        "abc",
        { a: 1 },
        ["ccc"],
        "def",
      ])
    );
    assert(
      cmp_json(editor.update(["abc", { a: 1 }, "def"], 2, null, ["ccc"]), [
        "abc",
        { a: 1 },
        "def",
        ["ccc"],
      ])
    );
    assert(
      cmp_json(
        editor.update(
          //keep empty sub
          layered_text.normalize(["abc", { a: 1 }, [], "def"]),
          0,
          null,
          { b: 2 }
        ),
        ["abc", { a: 1, b: 2 }, [], "def", 0, 0]
      )
    );

    //update to remove property
    assert(
      cmp_json(
        editor.update(["abc", { a: 1 }, "def"], 0, "aaa", {
          a: undefined,
        }),
        ["aaa", "def"]
      )
    );
    assert(
      cmp_json(
        editor.update(
          layered_text.normalize(["abc", { a: 1 }, "def"]),
          0,
          "aaa",
          { a: undefined }
        ),
        ["aaa", 0, 0, "def", 0, 0]
      )
    );
    assert(
      cmp_json(
        editor.update(
          layered_text.normalize(["abc", { a: 1 }, "def"]),
          1,
          "aaa",
          { a: undefined, b: 2 }
        ),
        ["abc", { a: 1 }, 0, "aaa", { b: 2 }, 0]
      )
    );

    //update to add/append sub
    assert(
      cmp_json(editor.update(["abc", "def"], 0, null, ["ccc"]), [
        "abc",
        ["ccc"],
        "def",
      ])
    );
    assert(
      cmp_json(editor.update(["abc", ["bbb"], "def"], 0, null, ["ccc"]), [
        "abc",
        ["bbb", "ccc"],
        "def",
      ])
    );

    //update normalized with sub
    assert(
      cmp_json(
        editor.update(layered_text.normalize(["aaa", ["b"]]), 0, null, ["c"]),
        ["aaa", 0, ["b", 0, 0, "c", 0, 0]]
      )
    );

    //whole item replacing
    assert(
      cmp_json(
        editor.update(["abc", { a: 1 }, ["ccc"], "def"], 0, ["aaa"], {
          b: 2,
        }),
        ["aaa", { b: 2 }, "def"]
      )
    );

    //remove all property and sub by `false`
    assert(
      cmp_json(
        editor.update(["abc", { a: 1 }, ["ccc"], "def"], 0, null, false),
        ["abc", ["ccc"], "def"]
      )
    );
    assert(
      cmp_json(
        editor.update(["abc", { a: 1 }, ["ccc"], "def"], 0, null, null, false),
        ["abc", { a: 1 }, "def"]
      )
    );
    assert(
      cmp_json(
        editor.update(["abc", { a: 1 }, ["ccc"], "def"], 0, null, false, false),
        ["abc", "def"]
      )
    );
    assert(
      cmp_json(editor.update(["abc", "def"], 0, null, false, false), [
        "abc",
        "def",
      ])
    );
    assert(
      cmp_json(
        editor.update(
          layered_text.normalize(["abc", { a: 1 }, ["ccc"], "def"]),
          0,
          null,
          false,
          false
        ),
        ["abc", 0, 0, "def", 0, 0]
      )
    );
  });

  it(".setNormalizedFlag()", () => {
    var lt = ["aaa", 0, 0, "bbb", 0, ["ccc", 0, 0]];
    editor.setNormalizedFlag(lt);
    assert(lt.mode === layered_text.MODE_NORMALIZE);
    assert(lt[5].mode === layered_text.MODE_NORMALIZE);
  });
});
