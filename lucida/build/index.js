var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Lucida {
    constructor(options) {
        this.modules = options.modules;
        this.hostnames = Object.values(this.modules)
            .map((e) => e.hostnames)
            .flat();
        if (options.logins)
            this.logins = options.logins;
    }
    login(ignoreFailures = false) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.logins)
                throw new Error('No logins specified');
            for (const i in this.modules) {
                const credentials = this.logins[i];
                const module = this.modules[i];
                if (module && 'login' in module) {
                    try {
                        yield ((_a = module.login) === null || _a === void 0 ? void 0 : _a.call(module, credentials === null || credentials === void 0 ? void 0 : credentials.username, credentials === null || credentials === void 0 ? void 0 : credentials.password));
                    }
                    catch (error) {
                        console.error(error);
                        if (!ignoreFailures) {
                            throw new Error(`Failed to login to ${i}`);
                        }
                        else {
                            yield ((_b = module.disconnect) === null || _b === void 0 ? void 0 : _b.call(module));
                            console.error(`ignoreFailures is on, removing ${i} module...`);
                            delete this.modules[i];
                        }
                    }
                }
            }
        });
    }
    search(query, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all(Object.values(this.modules).map((e) => e.search(query, limit)));
            const moduleNames = Object.keys(this.modules);
            return Object.fromEntries(results.map((e, i) => [moduleNames[i], e]));
        });
    }
    checkAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all(Object.values(this.modules).map((e) => __awaiter(this, void 0, void 0, function* () {
                if (e.getAccountInfo)
                    return yield e.getAccountInfo();
                else
                    return { valid: false };
            })));
            const moduleNames = Object.keys(this.modules);
            return Object.fromEntries(results.map((e, i) => [moduleNames[i], e]));
        });
    }
    getTypeFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlObj = new URL(url);
            for (const i in this.modules) {
                const matches = this.modules[i].hostnames.includes(urlObj.hostname);
                if (!matches)
                    continue;
                return yield this.modules[i].getTypeFromUrl(url);
            }
            throw new Error(`Couldn't find module for hostname ${urlObj.hostname}`);
        });
    }
    getByUrl(url, limit) {
        const urlObj = new URL(url);
        for (const i in this.modules) {
            const matches = this.modules[i].hostnames.includes(urlObj.hostname);
            if (!matches)
                continue;
            return this.modules[i].getByUrl(url, limit);
        }
        throw new Error(`Couldn't find module for hostname ${urlObj.hostname}`);
    }
    disconnect() {
        return Promise.all(Object.values(this.modules).map((e) => {
            var _a;
            return (_a = e.disconnect) === null || _a === void 0 ? void 0 : _a.call(e);
        }));
    }
    isrcLookup(isrc) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all(Object.values(this.modules).map((e) => __awaiter(this, void 0, void 0, function* () {
                if (e.isrcLookup)
                    return yield e.isrcLookup(isrc);
            })));
            const moduleNames = Object.keys(this.modules);
            return Object.fromEntries(results.map((e, i) => [moduleNames[i], e]));
        });
    }
}
export default Lucida;
//# sourceMappingURL=index.js.map