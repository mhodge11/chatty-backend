"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const setupServer_1 = require("./setupServer");
const setupDatabase_1 = __importDefault(require("./setupDatabase"));
class Application {
    init() {
        (0, setupDatabase_1.default)();
        const app = (0, express_1.default)();
        const server = new setupServer_1.ChattyServer(app);
        server.start();
    }
    loadConfig() {
        // Load config here
    }
}
const app = new Application();
app.init();
//# sourceMappingURL=app.js.map