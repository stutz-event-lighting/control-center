# Deploy

## Build & Copy package to server
```
npm pack
scp control-center-2.0.5.tgz root@85.7.166.131:/control-center/control-center.tgz
```

## Install the package on the server
```
cd /control-center
npm install --global-style ./control-center.tgz
pm2 restart control-center
```
