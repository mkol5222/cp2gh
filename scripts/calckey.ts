

function calculateBasicAuthHeader(username, password) {
  // Combine the username and password with a colon
  const credentials = `${username}:${password}`;

  // Encode the credentials using base64
  const encodedCredentials = btoa(credentials);

  // Create the Authorization header by prefixing with 'Basic '
  const authHeader = `Basic ${encodedCredentials}`;

  return authHeader;
}

// Example usage
const username = "guru";
const password = "123456";

const authHeader = calculateBasicAuthHeader(username, password);

// Now you can use `authHeader` in your HTTP request
console.log(authHeader);