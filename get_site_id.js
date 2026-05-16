/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('npx netlify-cli api listSites --data "{}"', { 
    encoding: 'utf8', 
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  fs.writeFileSync('raw_output.txt', result, 'utf8');
  const sites = JSON.parse(result);
  const surya = sites.filter(s => s.name && s.name.includes('surya'));
  const output = surya.map(s => `${s.id}|${s.name}|${s.ssl_url}`).join('\n');
  fs.writeFileSync('site_ids.txt', output, 'utf8');
} catch(e) {
  fs.writeFileSync('error_output.txt', `Error: ${e.message}\nStdout: ${e.stdout ? e.stdout.toString().substring(0,1000) : 'none'}\nStderr: ${e.stderr ? e.stderr.toString().substring(0,1000) : 'none'}`, 'utf8');
}
