import { cpApiBaseUrl, cpLogin } from "./utils.ts";

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
            "show-as-ranges": false,
            "use-object-dictionary": true,
            "details-level": "full",
            "limit": 500
        })
    });
    return response.json();
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

} catch (error) {
    console.error('Error fetching package', error);
}
