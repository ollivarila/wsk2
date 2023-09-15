import {exec} from 'child_process';
import esbuild from 'esbuild';
import fs from 'fs';

const outdir = process.argv[2] || 'dist';

// Put all external dependencies here (name: version) just like in package.json
const external = {
  sharp: '^0.31.3',
};

async function main() {
  createBuildDir();
  await Promise.all([buildProject(), createPackageJson(), copySchemas()]); // Parallel
  await installExternalDeps(); // Depends on package.json being created
  await createZip(); // Depends on all above
}

async function createBuildDir() {
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, {recursive: true});
  }
  fs.mkdirSync(outdir);
}

async function buildProject() {
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    minify: true,
    bundle: true,
    external: Object.keys(external),
    outdir,
    platform: 'node',
  });
  console.log('Built project');
}

async function copySchemas() {
  const cmd = `copyfiles --error src/api/schemas/*.graphql ${outdir}`;
  await execPromise(cmd);
  console.log('Copied schemas');
}

async function createPackageJson() {
  const packageJson = {
    name: 'express-api-starter-ts',
    version: '1.2.0',
    description: ' A basic starter for an express.js API with Typescript',
    main: 'index.js',
    scripts: {
      start: 'node index.js',
    },
    repository: {
      type: 'git',
      url: 'https://github.com/w3cj/express-api-starter.git',
    },
    license: 'MIT',
    dependencies: {
      ...external,
    },
  };
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(`${outdir}/package.json`);
    file.write(JSON.stringify(packageJson, null, 2), (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

async function installExternalDeps() {
  console.log('Installing external dependencies');
  process.chdir(outdir);
  const cmd = 'npm install --omit=dev';
  await execPromise(cmd);
  console.log('  Done');
}

async function createZip() {
  const cmd = `zip -r ../${outdir}.zip .`;
  await execPromise(cmd);
  console.log('Created zip file');
}

async function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}
main();
