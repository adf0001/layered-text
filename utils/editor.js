// editor utils

const {
  MODE_NORMALIZE,
  MODE_COMPACT,
  NORMALIZE_GROUP_COUNT,
  INDEX_N_SUBORDINATE,
  INDEX_N_PROPERTY,
  format,
  normalize,
  _isEmpty,
} = require("../index.js");

var setNormalizedFlag = function (normalizedLayeredText) {
  if (normalizedLayeredText.mode === MODE_NORMALIZE) return;

  var i,
    imax = normalizedLayeredText.length,
    li;
  for (i = INDEX_N_SUBORDINATE; i < imax; i += NORMALIZE_GROUP_COUNT) {
    li = normalizedLayeredText[i];
    if (!li) continue;
    if (li instanceof Array) setNormalizedFlag(li);
    else throw "layered-text is not normalized, not an array.";
  }
  normalizedLayeredText.mode = MODE_NORMALIZE;
};

//operation

/*
add items at the raw index, where should originally be a text, or at the end.

@param	layeredText: Array
@param	index:
        -1: end
        0-N: insert at, the original item at the index should be a text.
@param	...
        text, property, subordinate, ...
*/
var addByIndex = function (layeredText, index, text, property, sub) {
  //index
  if (index < 0 || index >= layeredText.length) index = layeredText.length;
  else if (typeof layeredText[index] !== "string") {
    throw "layered-text fail, adding index is not string, " + index;
  }

  //data
  var data = Array.prototype.slice.call(arguments, 2);
  if (!data.length) return;

  data = format(data, "mode" in layeredText ? layeredText.mode : MODE_COMPACT);
  if (!data.length) return;

  data.unshift(index, 0);

  //add
  layeredText.splice.apply(layeredText, data);

  return layeredText;
};

/*
add items at the index,
  for compact layered-text, at index where should originally be a text, or at the end.
  for normalized layered-text, at sequence index of the items, that is index*NORMALIZE_GROUP_COUNT.
*/
var add = function (layeredText, indexOrGroupIndex, text, property, sub) {
  if (layeredText.mode !== MODE_NORMALIZE)
    return addByIndex.apply(this, arguments);

  var arg = Array.prototype.slice.call(arguments, 0);
  arg[1] *= NORMALIZE_GROUP_COUNT;
  return addByIndex.apply(this, arg);
};

/*
remove item, or remove property or subordinate
	index: 0-N
	removeProperty: name array/text/object/true
	removeSubordinate: boolean
*/
var removeByIndex = function (
  layeredText,
  index,
  removeProperty,
  removeSubordinate
) {
  //index
  if (typeof layeredText[index] !== "string") {
    throw "layered-text fail, removing index is not string, " + index;
  }

  //removeProperty
  if (typeof removeProperty === "string") {
    removeProperty = [removeProperty];
  } else if (removeProperty === true) {
    removeProperty = "*"; //remove all properties flag
  } else if (removeProperty && !(removeProperty instanceof Array)) {
    removeProperty = Object.keys(removeProperty);
  }
  if (removeProperty && !removeProperty.length) removeProperty = null;

  var j,
    jmax = removeProperty && removeProperty.length;

  //end
  var i,
    imax = layeredText.length,
    li;

  for (i = index + 1; i < imax; i++) {
    li = layeredText[i];
    if (typeof li === "string") break;

    if (!li) continue;

    //sub
    if (li instanceof Array) {
      if (removeSubordinate) layeredText[i] = 0;
      continue;
    }

    //property
    if (!removeProperty) continue;

    //remove all properties
    if (removeProperty === "*") {
      layeredText[i] = 0;
      continue;
    }

    //remove properties by key set
    for (j = 0; j < jmax; j++) {
      if (removeProperty[j] in li) delete li[removeProperty[j]];
    }
    if (_isEmpty(li)) layeredText[i] = 0;
  }

  if (!removeProperty && !removeSubordinate)
    layeredText.splice(index, i - index);

  return layeredText;
};

var remove = function (
  layeredText,
  indexOrGroupIndex,
  removeProperty,
  removeSubordinate
) {
  if (layeredText.mode !== MODE_NORMALIZE)
    return removeByIndex.apply(this, arguments);

  var arg = Array.prototype.slice.call(arguments, 0);
  arg[1] *= NORMALIZE_GROUP_COUNT;
  return removeByIndex.apply(this, arg);
};

/*
update text, property or subordinate
	index: 0-N
	text: if the `text` is an array, the whole item will be replaced
	property: set `false` to remove all properties
	sub: set `false` to remove all subs
*/
var updateByIndex = function (layeredText, index, text, property, sub) {
  //index
  if (typeof layeredText[index] !== "string") {
    throw "layered-text fail, updating index is not string, " + index;
  }

  if (text && text instanceof Array) {
    //replace all
    removeByIndex(layeredText, index);
    return addByIndex.apply(this, arguments);
  }

  //get end
  var i,
    imax = layeredText.length;

  for (i = index + 1; i < imax; i++) {
    if (typeof layeredText[i] === "string") break;
  }

  var a = layeredText.splice(index, i - index);
  //text
  if (typeof text === "string") a[0] = text;

  //property and sub
  if (property === false || sub === false) {
    a = normalize(a);
  }
  property === false ? (a[INDEX_N_PROPERTY] = 0) : a.push(property);
  sub === false ? (a[INDEX_N_SUBORDINATE] = 0) : a.push(sub);

  a.unshift(layeredText, index);
  return addByIndex.apply(this, a);
};

var update = function (layeredText, indexOrGroupIndex, text, property, sub) {
  if (layeredText.mode !== MODE_NORMALIZE)
    return updateByIndex.apply(this, arguments);

  var arg = Array.prototype.slice.call(arguments, 0);
  arg[1] *= NORMALIZE_GROUP_COUNT;
  return updateByIndex.apply(this, arg);
};

//module

exports.setNormalizedFlag = setNormalizedFlag;

exports.addByIndex = addByIndex;
exports.add = add;
exports.removeByIndex = removeByIndex;
exports.remove = remove;
exports.updateByIndex = updateByIndex;
exports.update = update;
