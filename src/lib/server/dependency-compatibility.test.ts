import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('scoped security dependency overrides', () => {
  it('isolates the fixed CLI ZIP copy without changing the Excel uploader library', () => {
    const output = execFileSync(process.execPath, ['-e', `
      const assert = require('node:assert/strict');
      const { createRequire } = require('node:module');
      const cli = createRequire(require.resolve('@sanity/cli'));
      const runtime = createRequire(cli.resolve('@sanity/runtime-cli'));
      assert.equal(require('adm-zip/package.json').version, '0.5.18');
      assert.equal(runtime('adm-zip/package.json').version, '0.6.1');
      const Zip = runtime('adm-zip');
      const zip = new Zip();
      zip.addFile('sanity-test/document.json', Buffer.from(JSON.stringify({ _id: 'offline-test' })));
      const read = new Zip(zip.toBuffer());
      assert.equal(JSON.parse(read.readAsText('sanity-test/document.json'))._id, 'offline-test');
      process.stdout.write('PASS');
    `], { encoding: 'utf8' });
    expect(output).toBe('PASS');
  });

  it.each(['commonjs', 'module'])('keeps CLI TypeID generation compatible in %s', format => {
    const prelude = format === 'module'
      ? `import { createRequire } from 'node:module'; import assert from 'node:assert/strict';
         const require = createRequire(import.meta.url);`
      : `const assert = require('node:assert/strict'); const { createRequire } = require('node:module');`;
    const load = format === 'module'
      ? `const { pathToFileURL } = await import('node:url');
         const { dirname, join } = await import('node:path');
         const t = await import(pathToFileURL(join(dirname(cli.resolve('typeid-js')), 'index.mjs')).href);`
      : `const t = cli('typeid-js');`;
    const output = execFileSync(process.execPath, [`--input-type=${format}`, '-e', `
      ${prelude}
      const cli = createRequire(require.resolve('@sanity/cli'));
      const typeidRequire = createRequire(cli.resolve('typeid-js'));
      assert.equal(typeidRequire('uuid/package.json').version, '11.1.1');
      ${load}
      const ids = Array.from({ length: 1000 }, () => t.typeid('test').toString());
      assert.equal(new Set(ids).size, ids.length);
      assert.deepEqual([...ids].sort(), ids);
      const parsed = t.TypeID.fromString(ids[0]);
      assert.equal(parsed.getType(), 'test');
      assert.equal(t.TypeID.fromUUID('test', parsed.toUUID()).toString(), ids[0]);
      const unboxed = t.fromString(ids[0]);
      assert.equal(t.getType(unboxed), 'test');
      assert.equal(t.toUUID(unboxed), parsed.toUUID());
      assert.equal(t.fromUUID(parsed.toUUID(), 'test'), ids[0]);
      process.stdout.write('PASS');
    `], { encoding: 'utf8' });
    expect(output).toBe('PASS');
  });
});
