"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallPrompt = InstallPrompt;
var react_1 = require("react");
function InstallPrompt() {
    var _a = (0, react_1.useState)(false), isIOS = _a[0], setIsIOS = _a[1];
    var _b = (0, react_1.useState)(false), isStandalone = _b[0], setIsStandalone = _b[1];
    (0, react_1.useEffect)(function () {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !window.MSStream);
        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    }, []);
    if (isStandalone) {
        return null;
    }
    return (<div className="mb-8 p-4 border rounded-lg bg-blue-50">
			<h3 className="text-lg font-semibold mb-2">Install App</h3>
			<button type="button" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2">
				Add to Home Screen
			</button>
			{isIOS && (<p className="text-sm text-gray-600">
					To install this app on your iOS device, tap the share button
					<span role="img" aria-label="share icon">
						{" "}
						⎋{" "}
					</span>
					and then "Add to Home Screen"
					<span role="img" aria-label="plus icon">
						{" "}
						➕{" "}
					</span>
					.
				</p>)}
		</div>);
}
