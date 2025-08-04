"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnvVar = void 0;
var checkEnvVar = function (varName) {
    if (!varName) {
        throw new Error("No variable name provided.");
    }
    if (!process.env[varName]) {
        throw new Error("process.env.".concat(varName, " does not exist."));
    }
    return process.env[varName];
};
exports.checkEnvVar = checkEnvVar;
