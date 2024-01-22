
async function savePolicyToGithub(policy) {

  const body = {
    "query": "mutation savePolicyToGithub($policy: JSON) {\n  savePolicyToGithub(policy: $policy)\n}",
    "variables": {
      "policy": policy
    },
    "operationName": "savePolicyToGithub",
    "extensions": {}
  }
  const response = await fetch("/graphql", {
    "headers": {
      "content-type": "application/json",
      "authorization": `Basic Z3VydToxMjM0NTY=`
    },
    "body": JSON.stringify(body),
    "method": "POST",
  });

  const result = await response.json();
  return result;
}

export { savePolicyToGithub }
