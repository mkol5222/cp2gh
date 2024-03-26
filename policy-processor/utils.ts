
import { loadSync as loadEnv } from "https://deno.land/std/dotenv/mod.ts";
const configData = await loadEnv({
  export: true,
  allowEmptyValues: true,
});
// console.log("CONFIG DATA", configData);

const loadConfig = () => {
    return configData;
}

const config = loadConfig();

const cpApiBaseUrl = () => {
    const cpServer = config.CPSERVER;
    const cpTenant = config.CPTENANT;

    // https://cp-demo-klaud-online-ugloupti.maas.checkpoint.com/0120a8a9-4d46-4d3f-8bdc-ecf66e539ee5/web_api/
    return `https://${cpServer}/${cpTenant}/web_api/`;
}

const cpLogin = async () => {
    const apiUrl = `${cpApiBaseUrl()}login`;
    const payload = {
        "api-key": config.CPAPIKEY
    }
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return response.json();
}

export { loadConfig, cpApiBaseUrl, cpLogin};
