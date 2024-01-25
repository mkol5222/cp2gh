
// if rulebase has section, each section is object "type": "access-section",
// with nested rulebase array
// we need to flatten the rulebase to a single array of rules

function flattenRulebase(rulebase) {
  let rules = [];
  for (const item of rulebase) {
    if (item.type === "access-section") {
      // add nested rulebase
      rules = rules.concat(item.rulebase);
    } else {
      // assume type access-rule, add single rule
      rules.push(item);
    }
  }
  return rules;
}

export { flattenRulebase };
