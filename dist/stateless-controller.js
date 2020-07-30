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
exports.StatelessController = exports.SagaBuilder = void 0;
var action_1 = require("./action");
var controller_1 = require("./controller");
/**
 * Builder that is returned by the [[StatelessController]] to create and register a saga.
 *
 * @template Payload The payload that the action and the saga will use.
 */
var SagaBuilder = /** @class */ (function () {
    // eslint-disable-next-line jsdoc/require-description, jsdoc/require-param
    /**
     * @internal
     */
    function SagaBuilder(registerFn) {
        this.registerFn = registerFn;
        this.name = null;
        this.takeBuilder = null;
    }
    /**
     * Adds a specific name to the saga so that it can be addressed without calling the specific action returned by this
     * builder.
     *
     * @param name The name/type of the action.
     * @returns An instance of the SagaBuilder.
     */
    SagaBuilder.prototype.withAddressableName = function (name) {
        this.name = name;
        return this;
    };
    /**
     * Adds a simple watcher to the saga.
     *
     * @param takeBuilder The builder function for the saga watcher. This can be generating using one of the configure
     * functions, such as configureTakeLatest or configureDebounce.
     * @returns An instance of the SagaBuilder.
     */
    SagaBuilder.prototype.withTake = function (takeBuilder) {
        this.takeBuilder = takeBuilder;
        return this;
    };
    /**
     * Completes the builder and adds the saga to the register.
     *
     * @param sagaFn The saga function to add to the ReduxRegister.
     * @returns An action for calling the saga.
     */
    SagaBuilder.prototype.register = function (sagaFn) {
        return this.registerFn({
            name: this.name,
            takeBuilder: this.takeBuilder,
            sagaFn: sagaFn,
        });
    };
    return SagaBuilder;
}());
exports.SagaBuilder = SagaBuilder;
/**
 * Create and manage sagas that are associated with a Redux store.
 *
 * @example
 * ```typescript
 * class SwitchStateSagas extends StatelessController {
 *  getName() {
 *    return 'switch-sagas';
 *  }
 *
 *  toggleSwitch = this.createSaga()
 *    .withTake(configureTakeLatest())
 *    .register(
 *      function* () {
 *        const controller = yield getControllerFromSagaContext(SwitchStateController);
 *        yield controller.toggleSwitchValue();
 *        yield controller.incrementCount();
 *      }
 *    );
 * }
 *
 * const instance = SwitchStateSagas.getInstance(register);
 * instance.toggleSwitch();
 * ```
 */
var StatelessController = /** @class */ (function (_super) {
    __extends(StatelessController, _super);
    /**
     * Registers and starts the sagas.
     *
     * _WARNING: While the constructor can be called directly, state controllers are meant to be initialized with the
     * [[getInstance]] method. Creating instances directly can lead to having more than one instance at a time, which may
     * have adverse affects on the application._.
     *
     * @param register Rhe ReduxRegister instance to which the controller will be connected.
     * @returns An instance of the StatelessController.
     */
    // eslint-disable-next-line no-useless-constructor
    function StatelessController(register) {
        return _super.call(this, register) || this;
    }
    /**
     * Creates an instance of a [[SagaBuilder]] that will be registered when the builder finishes.
     *
     * @template Payload the payload the action and the saga will take.
     * @returns A builder that registers the saga.
     */
    StatelessController.prototype.createSaga = function () {
        return new SagaBuilder(this.buildSaga.bind(this));
    };
    StatelessController.prototype.buildSaga = function (config) {
        var name = this.createActionName(config.name);
        var sagaFn = config.sagaFn;
        if (config.takeBuilder !== null) {
            sagaFn = config.takeBuilder({
                name: name,
                sagaFn: sagaFn,
            });
        }
        this.register.registerSaga(sagaFn);
        return action_1.createConnectedAction(name, this.register);
    };
    return StatelessController;
}(controller_1.Controller));
exports.StatelessController = StatelessController;
