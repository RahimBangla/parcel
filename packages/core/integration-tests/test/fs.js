import assert from 'assert';
import path from 'path';
import {
  assertBundles,
  bundle,
  removeDistDirectory,
  run,
  outputFS,
  distDir,
} from '@parcel/test-utils';

describe('fs', function() {
  beforeEach(async () => {
    await removeDistDirectory();
  });

  describe('browser environment', function() {
    it('should inline a file as a string', async function() {
      let b = await bundle(path.join(__dirname, '/integration/fs/index.js'));
      let output = await run(b);
      assert.equal(output, 'hello');
    });

    it('should inline a file as a buffer', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-buffer/index.js'),
      );
      let output = await run(b);
      assert(output.constructor.name.includes('Buffer'));
      assert.equal(output.length, 5);
    });

    it('should inline a file with fs require alias', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-alias/index.js'),
      );
      let output = await run(b);
      assert.equal(output, 'hello');
    });

    it('should inline a file with fs require inline', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-inline/index.js'),
      );
      let output = await run(b);
      assert.equal(output, 'hello');
    });

    it('should inline a file with fs require assignment', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-assign/index.js'),
      );
      let output = await run(b);
      assert.equal(output, 'hello');
    });

    it('should inline a file with fs require assignment alias', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-assign-alias/index.js'),
      );
      let output = await run(b);
      assert.equal(output, 'hello');
    });

    it('should inline a file with fs require destructure', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-destructure/index.js'),
      );
      let output = await run(b);
      assert.equal(output, 'hello');
    });

    it('should inline a file with fs require destructure assignment', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-destructure-assign/index.js'),
      );
      let output = await run(b);
      assert.equal(output, 'hello');
    });

    it('should inline a file with fs ES6 import', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-import/index.js'),
      );
      let output = await run(b);
      assert.equal(output.default, 'hello');
    });

    it('should inline a file with fs ES6 import and path.join', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-import-path-join/index.js'),
      );
      let output = await run(b);
      assert.equal(output.default, 'hello');
    });

    it('should not evaluate fs calls when package.browser.fs is false', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/resolve-entries/ignore-fs.js'),
      );

      assertBundles(b, [
        {
          name: 'ignore-fs.js',
          // empty.js is generated by require('fs'), it gets mocked with an empty module
          assets: ['_empty.js', 'ignore-fs.js', 'index.js'],
        },
      ]);

      let output = await run(b);

      assert.equal(typeof output.test, 'function');
      assert.equal(output.test(), 'test-pkg-ignore-fs-ok');
    });

    // TODO: check if the logger has warned the user
    it('should ignore fs calls when the filename is not evaluable', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-file-non-evaluable/index.js'),
      );
      let thrown = false;

      try {
        await run(b);
      } catch (e) {
        assert(e.message.includes('.readFileSync is not a function'));

        thrown = true;
      }

      assert.equal(thrown, true);
    });

    it('should ignore fs calls when the filename is not evaluable after preset-env', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/fs-file-non-evaluable-template-env/index.js',
        ),
      );
      let thrown = false;

      try {
        await run(b);
      } catch (e) {
        assert(e.message.includes('.readFileSync is not a function'));

        thrown = true;
      }

      assert.equal(thrown, true);
    });

    it('should ignore fs calls when the options are not evaluable', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-options-non-evaluable/index.js'),
      );
      let thrown = false;

      try {
        await run(b);
      } catch (e) {
        assert(e.message.includes('.readFileSync is not a function'));

        thrown = true;
      }

      assert.equal(thrown, true);
    });
  });

  describe('node environment', function() {
    it('should not inline a file in a node environment', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/fs-node/index.js'),
      );

      assertBundles(b, [
        {
          name: 'index.js',
          assets: ['index.js'],
        },
      ]);

      let contents = await outputFS.readFile(
        path.join(distDir, 'index.js'),
        'utf8',
      );
      assert(contents.includes("require('fs')"));
      assert(contents.includes('readFileSync'));

      await outputFS.writeFile(path.join(distDir, 'test.txt'), 'hey');
      let output = await run(b);
      assert.equal(output, 'hey');
    });
  });

  describe.skip('electron environment', function() {
    it('should not inline a file in an Electron environment', async function() {
      let b = await bundle(path.join(__dirname, '/integration/fs/index.js'), {
        target: 'electron',
      });

      assertBundles(b, [
        {
          name: 'index.js',
          assets: ['index.js'],
        },
      ]);

      let contents = await outputFS.readFile(
        path.join(distDir, 'index.js'),
        'utf8',
      );
      assert(contents.includes("require('fs')"));
      assert(contents.includes('readFileSync'));

      await outputFS.writeFile(path.join(distDir, 'test.txt'), 'hey');
      let output = await run(b);
      assert.equal(output, 'hey');
    });
  });
});
