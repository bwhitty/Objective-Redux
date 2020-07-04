"use strict";
// ================================================================================================
//                                          OBJECTIVE REDUX
//                                  Redux made better, objectively.
//
// (c) Copyright 2020 by Jason Mace (https://github.com/jmace01)
//
// This project is provided under the terms of the MIT license. The license details can be found in
// the LICENSE file, found in the project's root directory.
// ================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnectedAction = exports.createAction = exports.getActionNameForController = void 0;
/**
 * Gets an action name that can be used to fire a controller's action without using the controller.
 *
 * This can be used along with [[createAction]] to create an action.
 *
 * @param controllerName The name of the controller the action should target.
 * @param actionName The name of the registered action the action should target.
 * @returns The generated action name.
 *
 * @example
 * ```typescript
 * const action = createAction(getActionNameForController('myControllerName', 'myActionName'));
 * ```
 */
function getActionNameForController(controllerName, actionName) {
    return `OBJECTIVE-REDUX-ACTION/${controllerName.replace('/', '-')}/${actionName}`;
}
exports.getActionNameForController = getActionNameForController;
/**
 * Returns a function that generates a Redux action of the form { type, payload }.
 *
 * @param type The name of the action being sent.
 * @returns The action generating function.
 */
function createAction(type) {
    return (payload) => ({
        type,
        payload,
    });
}
exports.createAction = createAction;
/**
 * Returns a function that generates a Redux action of the form { type, payload }.
 *
 * @param type The name of the action being sent.
 * @param register The ReduxRegister instance to which to connect.
 * @returns The action generating function.
 * @internal
 */
function createConnectedAction(type, register) {
    return (payload) => register.dispatch({
        type,
        payload,
    });
}
exports.createConnectedAction = createConnectedAction;
