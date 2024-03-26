import { cpApiBaseUrl, cpLogin } from "./utils.ts";
import { stringify } from "https://deno.land/std@0.207.0/yaml/mod.ts";
import { Cidr, IpAddress, IpRange } from 'npm:cidr-calc';

const fetchPackage = async (cpSession, packageUid) => {
    const apiUrl = `${cpApiBaseUrl()}show-package`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-chkp-sid': cpSession.sid
        },
        body: JSON.stringify({
            "uid": packageUid
        })
    });
    return response.json();
}

// fetch access rulebase

const fetchAccessRulebase = async (cpSession, rulebaseUid) => {
    const apiUrl = `${cpApiBaseUrl()}show-access-rulebase`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-chkp-sid': cpSession.sid
        },
        body: JSON.stringify({
            "uid": rulebaseUid,
            "show-as-ranges": true,
            "use-object-dictionary": true,
            "details-level": "full",
            "limit": 500
        })
    });
    return response.json();
}

function processInstallationTargets(packageData) {
    const installationTargets = packageData['installation-targets'];
    if (installationTargets === 'all') return ['all'];

    const targets = installationTargets.map((target) => {
        const simpleTarget = target.name;
        return simpleTarget;
    });
    return targets;
}

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

function processAddressRange(addressRange) {
    // new IpRange(new IpAddress.of(ip.start), new IpAddress.of(ip.end)).toCidrs().map(cidr => cidr.toString()))?.flat();
    // const ipv4 = addressRange.ipv4.map((ip) => `${ip.start}-${ip.end}`);
    const ipv4 = addressRange.ipv4.map((ip) => new IpRange(new IpAddress.of(ip.start), new IpAddress.of(ip.end)).toCidrs().map(cidr => cidr.toString()))?.flat();
    const ipv6 = addressRange.ipv6.map((ip) => `${ip.start}-${ip.end}`);
    return { ipv4, ipv6 };
}

function processRulebase(rules, objects, targets) {
    //console.log('processRulebase');
    //console.log('rules', JSON.stringify(rules, null, 2));
    //console.log('objects', JSON.stringify(objects, null, 2));
    //console.log('targets', JSON.stringify(targets, null, 2));

    const objDict = objectsById(objects);
    // console.log('objDict', objDict);

    const output = [];
    for (const rule of rules) {
        const action = objDict[rule.action]?.name;
        console.log('action', action);

        const src = rule["source-ranges"]; //rule.source;
        const srcOthers = src?.others?.map((uid) => objDict[uid]).map((obj) => `${obj.type}/${obj.name}`);
        const dst = rule["destination-ranges"];  //rule.destination;
        const dstOthers = dst?.others?.map((uid) => objDict[uid]).map((obj) => `${obj.type}/${obj.name}`);
        const svc = rule["service-ranges"]; //rule.service;
        const svcOthers = svc?.others?.map((uid) => objDict[uid]).map((obj) => `${obj.type}/${obj.name}`);
        console.log( { src: processAddressRange(src), dst: processAddressRange(dst), svc, action});

        console.log( { srcOthers, dstOthers, svcOthers});

        const targets = rule["install-on"].map((uid) => objDict[uid]);
        console.log('target', targets.map((target) => `${target.type}/${target.name}`));

        const ns = srcOthers[0];

        const ruleNo = rule['rule-number'];
        const ruleName = rule['name'];

        console.log('ns', ns);
        if (ns) {
        const {  namespace } = /^group\/(?<namespace>.+)$/.exec(
            ns,
          )?.groups;
        action === 'Accept' && output.push({ ruleNo, ruleName, namespace, cidrs: processAddressRange(dst).ipv4, 
            ports: {
                tcp: svc.tcp,
                udp: svc.udp
            }})
        }
    }
    console.log(JSON.stringify(output, null, 2));

    const result = Object.groupBy(output, (rule ) => `${rule.namespace}`);

    const result1 = {}
    for (const [key, value] of Object.entries(result)) {
        result1[key] = {}
        result1[key].egress = value.map((item) => {
            return {
                ruleNo: item.ruleNo, 
                ruleName: item.ruleName,
                cidrs: item.cidrs,
                ports: item.ports
            }
        });
    }
    console.log(stringify(result1));
}

try {
    const cpSession = await cpLogin();
    const packageUid = Deno.args[0];
    const packageData = await fetchPackage(cpSession, packageUid);
    console.log('packageData', JSON.stringify(packageData, null, 2));

    // fetch access rulebase
    const accessRulebaseId = packageData['access-layers'][0].uid;
    console.log('accessRulebaseId', accessRulebaseId);
    const accessRulebaseData = await fetchAccessRulebase(cpSession, accessRulebaseId);
    console.log('accessRulebaseData', JSON.stringify(accessRulebaseData, null, 2));

    console.log('installationTargets', processInstallationTargets(packageData));

    const rulebase = flattenRulebase( accessRulebaseData.rulebase);
    console.log('rulebase', JSON.stringify(rulebase, null, 2))

    processRulebase(rulebase, accessRulebaseData["objects-dictionary"], processInstallationTargets(packageData));
} catch (error) {
    console.error('Error fetching package', error);
}
