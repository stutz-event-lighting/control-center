{
    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/54c1e44240d8a527a8f4892608c4bce5440c3ecb";
        flake-parts.url = "github:hercules-ci/flake-parts";
    };
    outputs = inputs: inputs.flake-parts.lib.mkFlake {
        inherit inputs;
    } {
        systems = [ "x86_64-linux" ];
        perSystem = { pkgs, ... }:{
            devShells.default = pkgs.mkShell {
                buildInputs = [
                    pkgs.nodejs-10_x
                    pkgs.docker-compose
                ];
                shellHook = ''
                    export PATH="$PWD/node_modules/.bin/:$PATH"
                '';
            };
        };
    };
}
