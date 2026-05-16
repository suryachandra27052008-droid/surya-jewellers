/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Creating Site via Netlify API...");
  // Create a truly unique site name for this pass
  const siteName = "surya-jewel-store-" + Date.now();
  const cmd = `npx netlify-cli api createSite --data "{\\"body\\": {\\"name\\": \\"${siteName}\\"}}"`;
  const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  
  let jsonStr = result;
  if (result.includes('{')) {
    jsonStr = result.substring(result.indexOf('{'), result.lastIndexOf('}') + 1);
  }
  
  const site = JSON.parse(jsonStr);
  console.log("Site ID:", site.id);
  console.log("Site URL:", site.ssl_url);
  
  if (!site.id) throw new Error("Could not find site ID");
  
  fs.mkdirSync('.netlify', { recursive: true });
  fs.writeFileSync('.netlify/state.json', JSON.stringify({ siteId: site.id }, null, 2));
  
  // Directly link using the CLI to ensure consistency beyond state.json
  console.log("Running netlify link...");
  execSync(`npx netlify-cli link --id ${site.id}`, { stdio: 'inherit' });
  
  console.log("Successfully linked!");
} catch (e) {
  console.error("Error creating site:", e.message);
  if (e.stdout) console.log("STDOUT:", e.stdout.toString().slice(0, 500));
  if (e.stderr) console.log("STDERR:", e.stderr.toString().slice(0, 500));
}
