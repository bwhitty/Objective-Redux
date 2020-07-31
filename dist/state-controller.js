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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateController = void 0;
var action_1 = require("./action");
var controller_1 = require("./controller");
/**
 * Creates and manages a slice of Redux state.
 *
 * @template State The interface to which the slice of state will adhere.
 *
 * @example JavaScript
 * ```javascript
 * class SwitchStateController extends StateController {
 *   constructor(register) {
 *     super({ isOn: false }, register);
 *   }
 *
 *   public static getName() {
 *     return 'switch';
 *   }
 *
 *   action = this.registerAction(
 *     (state, payload) => ({
 *       ...state,
 *       ...payload,
 *     })
 *   ).withAddressableName('MY_ACTION');
 * }
 *
 * const register = new ReduxRegister();
 * const controller = SwitchStateController.getInstance(register);
 * controller.action({ isOn: true });
 * const slice = controller.getStateSlice();
 * ```
 * @example TypeScript
 * ```typescript
 * interface SwitchState {
 *   isOn: boolean;
 * }
 *
 * class SwitchStateController extends StateController<SwitchState> {
 *   constructor(register: ReduxRegister) {
 *     super({ isOn: false }, register);
 *   }
 *
 *   public static getName(): string {
 *     return 'switch';
 *   }
 *
 *   const readonly action = this.registerAction<SwitchState>(
 *     (state, payload) => ({
 *       ...state,
 *       ...payload,
 *     })
 *   ).withAddressableName('MY_ACTION');
 * }
 *
 * const register = new ReduxRegister();
 * const controller = SwitchStateController.getInstance(register);
 * controller.action({ isOn: true });
 * const slice = controller.getStateSlice();
 * ```
 */
var StateController = /** @class */ (function (_super) {
    __extends(StateController, _super);
    /**
     * Registers the controller, sets up the reducer, and sets the initial state.
     *
     * WARNING: While the constructor can be called directly, state controllers are meant to be initialized with the
     * [[getInstance]] method. Creating instances directly can lead to having more than one instance at a time, which may
     * have adverse affects on the application.
     *
     * @param initialState The initial value of the state slice in Redux.
     * @param register The redux register instance to which the component is being connected.
     * @returns The ReduxRegister instance to which the controller will be connected.
     */
    // eslint-disable-next-line max-params
    function StateController(initialState, register) {
        var _this = _super.call(this, register) || this;
        _this.initialState = initialState;
        _this.reducerMap = {};
        return _this;
    }
    /**
     * Creates groupings of state slices in the store by moving them into an object of the namespace.
     *
     * @returns Null if the state should be on the root level of the store, or a string representing the structure of the
     * object that the slice belongs in.
     *
     * @example
     * ```typescript
     * class MyFirstController extends StateController {
     *   // ...
     *
     *   static getName() {
     *     return 'MY_FIRST_CONTROLLER';
     *   }
     *
     *   static getNamespace() {
     *     return 'MY_NAMESPACE';
     *   }
     *
     *   // ...
     * }
     *
     * class MySecondController extends StateController {
     *   // ...
     *
     *   static getName() {
     *     return 'MY_SECOND_CONTROLLER';
     *   }
     *
     *   static getNamespace() {
     *     return 'MY_NAMESPACE';
     *   }
     *
     *   // ...
     * }
     *
     * // Creates a state of the form:
     * //
     * // {
     * //   MY_NAMESPACE: {
     * //     MY_FIRST_CONTROLLER: {
     * //       // ...
     * //     },
     * //     MY_SECOND_CONTROLLER: {
     * //       // ...
     * //     },
     * //   },
     * // }
     * ```
     */
    StateController.getNamespace = function () {
        return null;
    };
    /**
     * Specified the name of the reducer/slice in the Redux store. Defaults to the value of getName.
     *
     * @returns The name of the controller in the store. Defaults to the value of getName.
     *
     * @example
     * ```typescript
     * class MyFirstController extends StateController {
     *   // ...
     *
     *   static getName() {
     *     return 'MY_FIRST_CONTROLLER';
     *   }
     *
     *   // ...
     * }
     *
     * class MySecondController extends StateController {
     *   // ...
     *
     *   static getName() {
     *     return 'MY_SECOND_CONTROLLER';
     *   }
     *
     *   static getStoreName() {
     *     return 'Second';
     *   }
     *
     *   // ...
     * }
     *
     * // Creates a state of the form:
     * //
     * // {
     * //   MY_FIRST_CONTROLLER: {
     * //     // ...
     * //   },
     * //   Second: {
     * //     // ...
     * //   },
     * // }
     * ```
     */
    StateController.getStoreName = function () {
        return this.getName();
    };
    /**
     * Registers a data mutator as part of the slice's reducer and returns the action for calling it.
     *
     * @template Payload The interface to which the payload of the action will adhere. If the type is void, no payload
     * will be accepted.
     *
     * @param fn The mutating function to add to the reducer.
     *
     * The function should be in the form:
     * ```.
     * (state, payload?) => state
     * ```.
     *
     * @returns The action producing function for calling the mutating function.
     *
     * This action producing function also has a `withAddressableName` function that can be called to change the action
     * name. For example: `myAction.withAddressableName('MY_ACTION_NAME');`.
     */
    StateController.prototype.registerAction = function (fn) {
        var _this = this;
        var actionName = this.createActionName();
        this.reducerMap[actionName] = fn;
        var actionFn = action_1.createConnectedAction(actionName, this.register);
        /**
         * Adds a specific name to the saga so that it can be addressed without calling the specific action returned by
         * this builder.
         *
         * @param name The name of the action.
         * @returns The action producing function for calling the mutating function.
         */
        actionFn.withAddressableName = function (name) {
            _this.reducerMap[actionName] = null;
            var addressableActionName = _this.createActionName(name);
            _this.reducerMap[addressableActionName] = fn;
            return action_1.createConnectedAction(addressableActionName, _this.register);
        };
        return actionFn;
    };
    /**
     * The reducer, which handles mutations to the state slice.
     *
     * @param state The current state of the state slice.
     * @param action The action being performed on the state.
     * @returns The new state resulting from the action.
     */
    StateController.prototype.reducer = function (state, action) {
        if (state === void 0) { state = this.initialState; }
        if (action === void 0) { action = null; }
        var reducerFn = this.reducerMap[(action === null || action === void 0 ? void 0 : action.type) || ''];
        if (!reducerFn || !action) {
            return state;
        }
        return reducerFn(state, action.payload);
    };
    /**
     * Gets the current value for this slice of the Redux state.
     *
     * @returns The current slice of the state related to this controller.
     */
    StateController.prototype.getStateSlice = function () {
        var state = this.register.getState();
        var namespace = this.constructor.getNamespace();
        state = namespace ? state[namespace] : state;
        return state[this.constructor.getStoreName()];
    };
    return StateController;
}(controller_1.Controller));
exports.StateController = StateController;
