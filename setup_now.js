require("dotenv").config();
const crypto = require("crypto");
const { execSync } = require("child_process");
const inquirer = require("inquirer");

function addEnvVar(key, value) {
  try {
    execSync(`npx now env add "${key}" production`, {
      input: value,
    });
  } catch {
    console.error(
      `Could not add "${key}". If it already exists, that's fine. If you want to update an existing environment variable, run "npx now env rm ${key} production"`
    );
  }
}

inquirer
  .prompt([
    {
      type: "input",
      name: "url",
      message: "What is your app's production url?",
      validate: (value) => {
        const valid = /^https:\/\//.test(value);

        return (
          valid ||
          "Invalid url. This should be the production url copied from running 'npx now'"
        );
      },
    },
  ])
  .then(({ url }) => {
    addEnvVar("AUTH0_DOMAIN", process.env.AUTH0_DOMAIN);
    addEnvVar("AUTH0_CLIENT_ID", process.env.AUTH0_CLIENT_ID);
    addEnvVar("AUTH0_CLIENT_SECRET", process.env.AUTH0_CLIENT_SECRET);
    addEnvVar("REDIRECT_URI", `${url}/api/callback`);
    addEnvVar("POST_LOGOUT_REDIRECT_URI", url);
    // This generates a random value for SESSION_COOKIE_SECRET
    // The importance of this is explained here:
    //   https://martinfowler.com/articles/session-secret.html
    addEnvVar("SESSION_COOKIE_SECRET", crypto.randomBytes(32).toString("hex"));

    console.log("Configured all environment variables. Redeploying...");

    execSync("npx now --prod", {
      stdio: "inherit",
    });
  });
