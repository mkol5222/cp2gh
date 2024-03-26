import { cpApiBaseUrl, cpLogin } from "./utils.ts";

const showPackages = async (cpSession) => {
    const apiUrl = `${cpApiBaseUrl()}show-packages`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-chkp-sid': cpSession.sid
        },
        body: JSON.stringify({
            limit: 500,
            "details-level" : "full"
        })
    });
    return response.json();

}

function processInstallationTargets(installationTargets) {
    if (installationTargets === 'all') return 'all';

    const targets = installationTargets.map((target) => {
        const simpleTarget = target.name;
        return simpleTarget;
    });
    return targets;

}

function processAccessLayers(accessLayers) {
    const layers = accessLayers.map((layer) => {
        const simpleLayer = layer.uid;
        return simpleLayer;
    });
    return layers;
}

function processShowPackages(showPackagesResponse) {
    const packages = showPackagesResponse.packages;
    const simplePackages = packages.map((pkg) => {
        const simplePackage = {
            name: pkg.name,
            uid: pkg.uid,
            access: processAccessLayers(pkg["access-layers"]),
            hasAccessLayer: pkg.access,
            domain: pkg.domain.name,
            installationTargets: processInstallationTargets(pkg['installation-targets'])
        };
        return simplePackage;
    });
    return simplePackages;
}

async function listPackages(cpSession) {
    const showPackagesResponse = await showPackages(cpSession);
    //console.log('showPackagesResponse', JSON.stringify(showPackagesResponse, null, 2));
    return processShowPackages(showPackagesResponse);
}

try {
    console.log('Logging in to Check Point...');
    const cpSession = await cpLogin();
    
    console.log('Fetching list of packages...');
    const packages = await listPackages(cpSession);

    console.log('Packages:', JSON.stringify(packages, null, 2));

} catch (error) {
    console.error('error', error);
}

