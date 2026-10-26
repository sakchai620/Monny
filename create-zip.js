import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Simple python zip script without huge node_modules
const pyScript = `
import os
import zipfile

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        if 'node_modules' in root or '.git' in root or 'dist' in root or 'monny-app.zip' in root:
            continue
        for file in files:
            if file == 'monny-app.zip' or file.endswith('.tar.gz'):
                continue
            filePath = os.path.join(root, file)
            arcName = os.path.relpath(filePath, path)
            ziph.write(filePath, arcName)

zipf = zipfile.ZipFile('public/monny-app.zip', 'w', zipfile.ZIP_DEFLATED)
zipdir('.', zipf)
zipf.close()
print("ZIP created successfully!")
`;

fs.writeFileSync('make_zip.py', pyScript);
try {
  execSync('python3 make_zip.py');
  console.log('Zip created');
} catch (e) {
  console.error(e);
}
