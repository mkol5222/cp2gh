
import mockupData from '../../data/aks-policy.json';
import { Cidr, IpAddress, IpRange } from 'cidr-calc';

// console.log('mockupData', mockupData);

// if rulebase has section, each section is object "type": "access-section",
// with nested rulebase array
// we need to flatten the rulebase to a single array of rules

function flattenRulebase(rulebase) {
  let rules = [];
  for (const item of rulebase) {
    if (item.type === 'access-section') {
      // add nested rulebase
      rules = rules.concat(item.rulebase);
    } else {
      // assume type access-rule, add single rule
      rules.push(item);
    }
  }
  return rules;
}

function objectsById(arrayOfObjects) {
  const dictionaryOfObjects = arrayOfObjects.reduce((acc, obj) => {
    acc[obj.uid] = obj;
    return acc;
  }, {});
  return dictionaryOfObjects;
}

Object.defineProperty(Array.prototype, 'flat', {
  value: function (depth = 1) {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten);
    }, []);
  }
});

function processRulebase(rulebase, objectsDictionary) {
  console.log('processRulebase');
  console.log('rulebase', JSON.stringify(rulebase, null, 2));
  console.log('objectsDictionary', JSON.stringify(objectsDictionary, null, 2));

  const namespacesByUid = objectsById(objectsDictionary.filter((obj) => (obj.type === 'group' && obj.name.startsWith('ns_'))));

  const aksByUid = objectsById(objectsDictionary.filter((obj) => (obj.type === 'group' && obj.name.startsWith('AKS_'))));

  // flatten rulebase
  let rules = flattenRulebase(rulebase);

  // only enabled rules
  rules = rules.filter((rule) => rule.enabled);

  // add source and destination objects
  // for (const rule of rules) {
  //   const sourceNS = rule['source-ranges']?.others?.map((uid) => namespacesByUid[uid]?.name).filter(item => (typeof item == 'string'));
  //   const destIP = rule['destination-ranges']?.ipv4.map((ip) => new IpRange(new IpAddress.of(ip.start), new IpAddress.of(ip.end)).toCidrs().map(cidr => cidr.toString()) );

  //   const tcpServices = rule['service-ranges']?.tcp?.map((port) => port.start === port.end ? `tcp/${port.start}` : `tcp/${port.start}-${port.end}`);
  //   const udpServices = rule['service-ranges']?.udp?.map((port) => port.start === port.end ? `udp/${port.start}` : `udp/${port.start}-${port.end}`);

  //   const installOn = rule['install-on'].map((uid) => aksByUid[uid]?.name).filter(item => (typeof item == 'string'));
  //   // JSON.stringify(rule['source-ranges']),
  //   // JSON.stringify(rule['destination-ranges']),
  //   // JSON.stringify(rule['service-ranges'])
  //   console.log('rule', JSON.stringify(sourceNS),  JSON.stringify(destIP), tcpServices, udpServices  , JSON.stringify(installOn));
  // }

  let simpleRules = rules.map((rule) => {
    const sourceNS = rule['source-ranges']?.others?.map((uid) => namespacesByUid[uid]?.name).filter(item => (typeof item == 'string'));
    const destIP = rule['destination-ranges']?.ipv4.map((ip) => new IpRange(new IpAddress.of(ip.start), new IpAddress.of(ip.end)).toCidrs().map(cidr => cidr.toString()))?.flat();

    const tcpServices = rule['service-ranges']?.tcp?.map((port) => port.start === port.end ? `tcp/${port.start}` : `tcp/${port.start}-${port.end}`);
    const udpServices = rule['service-ranges']?.udp?.map((port) => port.start === port.end ? `udp/${port.start}` : `udp/${port.start}-${port.end}`);

    const installOn = rule['install-on'].map((uid) => aksByUid[uid]?.name).filter(item => (typeof item == 'string'));

    const simpleRule = {
      name: rule.name,
      source: sourceNS,
      destination: destIP,
      services: tcpServices.concat(udpServices),
      installOn: installOn,
    };
    return simpleRule;
  });

  simpleRules = simpleRules.filter((rule) => (rule.source.length > 0 && rule.installOn.length > 0));

  console.log(JSON.stringify(simpleRules, null, 2));


  // group by namespace and installOn
  const rulesByNS = simpleRules.reduce((acc, rule) => {

    for (const ns of rule.source) {
      for (const installOn of rule.installOn) {
        const key = `${ns}-${installOn}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(rule);
      }
    }
    return acc;
  }, {});

  console.log(JSON.stringify(rulesByNS, null, 2));

  //return simpleRules;
  return rulesByNS;
}

export { flattenRulebase, mockupData, processRulebase };
