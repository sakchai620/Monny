
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
