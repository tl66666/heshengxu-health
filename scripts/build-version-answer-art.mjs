import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');const require=createRequire(import.meta.url);
const sharp=require(process.argv[2]?resolve(process.argv[2],'sharp'):'sharp');
const source=readFileSync(resolve(root,'assets/illustrations/version-answer/entry-scene.png'));
const output=await sharp(source).resize({width:420}).png({palette:true,colours:128,compressionLevel:9}).toBuffer();
writeFileSync(resolve(root,'apps/mini/src/features/version-answer/art.ts'),`// Derived from the user-selected illustration. Original retained.\nexport const versionEntryScene = ${JSON.stringify('data:image/png;base64,'+output.toString('base64'))};\n`);
console.log(`Version answer scene: ${output.length} bytes; original retained.`);
