"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    // We do these in GitHub Actions checks so we don't do them here.
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
};
