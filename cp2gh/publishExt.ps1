
quasar build
remove-Item -Path  ..\..\scext-container\web\cp2gh\* -Recurse
Copy-Item -Path .\dist\spa\* -Dest ..\..\scext-container\web\cp2gh\ -Recurse
