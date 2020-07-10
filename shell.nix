with import <nixpkgs> {};
mkShell {
  buildInputs = [
    nodejs-10_x
    docker-compose
  ];
  shellHook = ''
    export PATH="$PWD/node_modules/.bin/:$PATH"
  '';
}
