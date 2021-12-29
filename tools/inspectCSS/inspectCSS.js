const TYPES = {
  1 : "STYLE_RULE (1)",
  2 : "CHARSET_RULE (2)",
  3 : "IMPORT_RULE (3)",
  4 : "MEDIA_RULE (4)",
  5 : "FONT_FACE_RULE (5)",
  6 : "PAGE_RULE (6)",
  7 : "KEYFRAMES_RULE (7)",
  8 : "KEYFRAME_RULE (8)",
  10: "NAMESPACE_RULE (10)",
  11: "COUNTER_STYLE_RULE (11)",
  12: "SUPPORTS_RULE (12)"
};

function inspectCSS (css) {
  const imports = css.ownerRule;
  const rules   = css.cssRules;
  const result  = {rules: getRules(rules)};
  return {
    ...rules,
    toString (...args) {
      return JSON.stringify(result, ...args);
    },
    toHTML () {
      return '';
    }
  }
}

function getRules (rules) {
  const result = [];
  for (let rule of rules) {
    result.push(getProperties(rule));
  }
  return result;
}

function getProperties (rule) {
  return getPropertyNames(rule).reduce((obj, key) => {
    obj[key] = getValue(rule, key);
    return obj
  }, {});
}

function getValue (rule, key) {
  switch (key) {
    case 'type':
      return TYPES[rule[key]];
    case 'parentStyleSheet':
      return "[Circular ~]"
    case 'style':
      return getStyle(rule[key]);
    case `styleMap`:
      return getStyleMap(rule[key]);
    case 'cssRules':
      return getRules(rule[key]);
  }
  return rule[key]
}

function getStyle (styles) {
  const result = {};
  for (let property in styles) {
    if (!Number.isNaN(Number(property))) {
      result[styles[property]] = styles[styles[property]] || styles.getPropertyValue(styles[property]).trim();
    }
  }
  return result;
}

function getStyleMap (styles) {
  const result = {};
  for (let property of styles.keys()) {
    result[property] = getStyleMapEntry(styles.get(property));
  }
  return result;
}

function getStyleMapEntry (entry) {
  if (typeof entry.value !== 'undefined') {
    return entry.value;
  }
  if (typeof entry.length === 'undefined') {
    return entry.toString();
  }
  const result = [];
  for (let n = 0; n < entry.length; n++) {
    result.push(typeof entry[n] === 'object' ? getProperties(entry[n]) : entry[n]);
  }
  return result;
}

function getPropertyNames (obj) {
  const proto = Object.getPrototypeOf(obj);
  return (
    (typeof proto === 'object' && proto !== Object.prototype ? getPropertyNames(proto) : [])
      .concat(Object.getOwnPropertyNames(obj))
      .filter(function (item) {
        return item !== 'constructor' && item[0] !== '_' && item.toUpperCase() !== item
      })
      .filter(function (item, pos, result) {
        return result.indexOf(item) === pos;
      })
      .sort()
  );
}


