"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathRegex = new RegExp("^m(\\/[0-9]+')+$");
exports.replaceDerive = (val) => val.replace("'", '');
