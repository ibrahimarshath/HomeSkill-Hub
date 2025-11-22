@echo off
rem Start the API server from the repository root on Windows
pushd "%~dp0"
node "server\index.cjs"
popd
