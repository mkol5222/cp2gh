import { resolve } from "dns";

async function getSmartConsoleContext() {
  return new Promise((resolve, reject) => {

    try {

      // callback
      function onContext(context) {
        console.log('onContext called', context, resolve);
        resolve(context);
      }
      window.onContext = onContext;

      //if (!smxProxy) reject('smxProxy not found');
      smxProxy.sendRequest("get-context", null, "onContext");
    } catch (err) {
      console.log(err);
      reject(err);
    } // try

  }); // promise
};


// async function scFetchHostObjects() {



//   return new Promise((resolve, reject) => {

//     try {
//       function onFetchHosts(resp) {
//         console.log('onFetchHosts response', resp);
//         const hosts = resp?.response?.objects;
//         if (hosts) resolve(hosts);
//         else resolve([]);
//       }

//       window.onFetchHosts = onFetchHosts;

//       smxProxy.sendRequest("run-readonly-command",
//         { "command": "show hosts", "parameters": { "details-level": "full" } },
//         "onFetchHosts");
//     } catch (err) {
//       console.log(err);
//       reject(err);
//     }

//   });

// }

// POST https://{{cpserver}}/{{cptenant}}/web_api/show-access-rulebase
// Content-Type: application/json
// X-chkp-sid: {{login.response.body.sid}}

// {
//     "name": "NSG Network",
//     "show-as-ranges": false,
//     "use-object-dictionary": true,
//     "details-level": "full"
// }

async function showAccessRulebase(uid: string) {

  return new Promise((resolve, reject) => {

    try {
      function onShowAcccessRulebase(resp) {
        console.log('onShowAcccessRulebase response', resp);
        resolve(resp);
      }

      window.onShowAcccessRulebase = onShowAcccessRulebase;

      smxProxy.sendRequest("run-readonly-command",
        {
          "command": "show access-rulebase", "parameters": {
            "details-level": "full",
            //"name": `${policyPackage} Network`,
            "uid": uid,
            "show-as-ranges": false,
            "use-object-dictionary": true,
          }
        },
        "onShowAcccessRulebase");
    } catch (err) {
      console.log(err);
      reject(err);
    }

  });
}

export { getSmartConsoleContext, showAccessRulebase }
