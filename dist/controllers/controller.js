"use strict";
// ================================================================================================
//                                          OBJECTIVE REDUX
//                                  Redux made better, objectively.
//
// (c) Copyright 2021 by Jason Mace (https://github.com/jmace01)
//
// This project is provided under the terms of the MIT license. The license details can be found in
// the LICENSE file, found in the project's root directory.
// ================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
var lazy_loader_1 = require("../store/lazy-loader");
var action_1 = require("../helpers/action");
/**
 * @internal
 */
var Controller = /** @class */ (function () {
    function Controller() {
        this.count = 0;
        this.objectiveStore = null;
    }
    /**
     * Gets the unique name of the controller. By default, the name of the class.
     *
     * The name of the controller should be globally unique for all Objective Redux controllers in the application.
     *
     * @returns The name of the state slice.
     */
    Controller.getName = function () {
        return this.name;
    };
    /**
     * Creates groupings of controllers and state slices. This helps prevent naming collisions, because names only need
     * to be unique within a namespace.
     *
     * In addition, for StateControllers, the slice of state in the store is also saved into an object of the namespace
     * name.
     *
     * Note that falsy values like null and '' will evaluate to the same empty namespace.
     *
     * @returns Null if the state is not namespaced.
     *
     * @example
     * ```typescript
     * // For StateControllers, the namespace also groups slices in the store.
     *
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
    Controller.getNamespace = function () {
        return null;
    };
    /**
     * Sets the objective store for the controller.
     *
     * @param objectiveStore The objective store the controller should use.
     *
     * @internal
     */
    Controller.prototype.setObjectiveStore = function (objectiveStore) {
        // This should only be called once by the lazy-loader. We don't want to allow the ObjectiveStore to be changed.
        /* istanbul ignore else */
        if (this.objectiveStore === null) {
            this.objectiveStore = objectiveStore;
        }
    };
    /**
     * Generates a unique, default action name.
     *
     * @param name The name of the action or null to generate a unique, default action name.
     * @returns An action name.
     */
    Controller.prototype.createActionName = function (name) {
        if (name === void 0) { name = null; }
        var actionName = name || "" + this.count++;
        var controllerName = this.constructor.getName();
        var controllerNamespace = this.constructor.getNamespace() || '';
        return (0, action_1.getActionNameForController)(controllerName, actionName, controllerNamespace);
    };
    /**
     * Gets an instance of the class, creating one if it does not yet exist.
     *
     * This should be used as the method of instantiating controllers.
     *
     * @template T The controller type. Will be inferred from the class instance and does not need to be provided.
     * @param this Implicit "this" for internal use. When calling, this parameter should be ignored/skipped.
     * @param objectiveStore An instance of the ObjectiveStore from which to get the controller.
     * @returns An instance of the controller.
     *
     * @example
     * ```typescript
     * const instance = MyController.getInstance(objectiveStore);
     * ```
     */
    Controller.getInstance = function (objectiveStore) {
        return lazy_loader_1.LazyLoader.getController(objectiveStore, this);
    };
    /**
     * Removes the instance of the controller from the store. This will unregister reducers any stop saga associated with
     * the controller.
     *
     * @param this Implicit "this" for internal use. When calling, this parameter should be ignored/skipped.
     * @param objectiveStore An instance of the ObjectiveStore from which to get the controller.
     *
     * @example
     * ```typescript
     * MyController.removeInstance(objectiveStore);
     * ```
     */
    Controller.removeInstance = function (objectiveStore) {
        lazy_loader_1.LazyLoader.removeController(objectiveStore, this);
    };
    /**
     * Allows the controller to be lazy loaded by actions triggered outside of Objective Redux.
     *
     * In order for calls to be routed to the controller without using the controller directly, and thus to lazy-load
     * without using the controller directly, this needs to be used in conjunction with the method
     * [[withAddressableName]].
     *
     * @param this Implicit "this" parameter, which does not need to be supplied.
     * @example
     * ```typescript
     * class MyController extends StateController<MySliceType> {
     *   public static getName() {
     *     return 'MY_CONTROLLER';
     *   }
     *
     *   action = this.createReducingAction(
     *     (state, payload) => ({
     *       ...state,
     *       ...payload,
     *     })
     *   ).withAddressableName('MY_ACTION'); // <-- also required
     * }
     *
     * MyController.initializeOnExternalAction();
     *
     * export MyController;
     *
     * // ... elsewhere ...
     *
     * // By firing this action, the controller will now be instantiated (if it hasn't been).
     * const myAction = createAction(getActionNameForController('MY_CONTROLLER', 'MY_ACTION'));
     * objectiveStore.dispatch(myAction);
     * ```
     */
    Controller.initializeOnExternalAction = function () {
        lazy_loader_1.LazyLoader.registerController(this);
    };
    return Controller;
}());
exports.Controller = Controller;
