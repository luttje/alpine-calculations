# Contributing

Thanks for wanting to help out! This document explains how to work on the plugin and how to release a new version.

## Getting started

You need [Node.js](https://nodejs.org/) 22 or newer.

```bash
npm ci
npm test
```

The plugin itself lives in `src/index.js`. Tests are in `tests/` and run with Jest in a jsdom environment.

## Making changes

1. Make your change in `src/index.js` and add or update tests for it.
2. Run `npm test` and make sure everything passes.
3. Run `npm run build` and commit the updated files in `dist/` together with your change. The bundle in `dist/` is what CDN users load, so it must always match `src/`.

Keep these security rules in mind:

- Source values come from users, so they must only ever reach expressions as numbers or booleans.
- Source identifiers and expressions are written by developers and are evaluated as code. Never loosen the identifier validation in `isValidSourceId` without adding tests to `tests/security.test.js`.
- Write results with `textContent` or `.value`, never with `innerHTML`.

## Releasing a new version

The README tells CDN users to load a pinned version together with an `integrity` hash. The browser refuses to run the script if the hash doesn't match the file, so the version and the hash in the README must be updated with every release, **before** publishing.

1. Bump the version, without creating a git tag yet:

   ```bash
   npm version <new-version> --no-git-tag-version
   ```

2. Build the bundle and run the tests:

   ```bash
   npm run build
   npm test
   ```

3. Calculate the integrity hash of the bundle you just built:

   ```bash
   node -e "console.log('sha384-'+require('crypto').createHash('sha384').update(require('fs').readFileSync('dist/alpine-calculations.js')).digest('base64'))"
   ```

4. Update `README.md`:

   - Replace the value of the `integrity` attribute in the CDN `<script>` example with the hash from step 3.
   - Replace the old version number in both jsDelivr URLs (the CDN `<script>` example and the FilamentPHP example).

5. Commit everything (including `dist/`), then publish and tag:

   ```bash
   npm publish
   git tag v<new-version>
   git push --follow-tags
   ```

   Don't rebuild between step 3 and publishing. The build output can differ between Node.js versions, which would change the hash.

6. Check that the published file matches the hash in the README. This should print the same hash as step 3, without the `sha384-` prefix:

   ```bash
   curl -sL https://cdn.jsdelivr.net/npm/alpine-calculations@<new-version>/dist/alpine-calculations.js | openssl dgst -sha384 -binary | openssl base64 -A
   ```

   If it doesn't match, fix the hash in the README right away, because the CDN example is broken for anyone who copies it.

### Updating Alpine.js in the example

`examples/repeater.html` loads a pinned Alpine.js version with its own `integrity` hash. When you change that version, recalculate the hash from the new file:

```bash
curl -sL https://unpkg.com/alpinejs@<version>/dist/cdn.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Put `sha384-` in front of the output and open the example in a browser to confirm Alpine still loads.
