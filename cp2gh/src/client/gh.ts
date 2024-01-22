
async function savePolicyToGithub(policy) {

  const body = {
    "query": "mutation savePolicyToGithub($policy: JSON) {\n  savePolicyToGithub(policy: $policy)\n}",
    "variables": {
      "policy": policy
    },
    "operationName": "savePolicyToGithub",
    "extensions": {}
  }
  const response = await fetch("http://localhost:3003/graphql", {
    "headers": {
      "content-type": "application/json",
    },
    "body": JSON.stringify(body),
    "method": "POST",
  });
}

export { savePolicyToGithub }
