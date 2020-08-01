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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReduxRegister = void 0;
var redux_1 = require("redux");
var lazy_loader_1 = require("./lazy-loader");
var get_redux_saga_module_1 = require("./get-redux-saga-module");
var reducer_injector_1 = require("./reducer-injector");
var _1 = require(".");
/**
 * The ReduxRegister handles the connection of controllers, reducers, and sagas to Redux. Each ReduxRegister has its
 * own Redux store that it manages. The register will also setup the Redux-Saga middleware, if it finds the dependency.
 *
 * Middleware can be applied at construction. Sagas and reducers can be added at any time, as needed.
 */
var ReduxRegister = /** @class */ (function () {
    /**
     * Creates an instance of the ReduxRegister.
     *
     * In setting up the instance, the class will create a ReduxStore. If Redux-Saga is available, tbe middleware will be
     * setup automatically as well.
     *
     * @param config The optional configuration for the controller.
     * @param config.reducer The initial reducer for the store.
     * @param config.initialState The initial state of the reducers.
     * @param config.middleware Middle to be added to the Redux store. This should not include the saga middleware.
     * @param config.sagaContext The context to be used when creating the Saga middleware.
     * @param config.injector An instance of the ReducerInjector class.
     * @returns An instance of the ReduxRegister.
     * @example
     * ```typescript
     * // No need to setup the Redux-Saga middleware-- Objective-Redux will handle it.
     * const register = new ReduxRegister();
     * ```
     * @example
     * ```typescript
     * import { ReducerInjector, ReduxRegister } from 'objective-redux';
     * import { createInjectorsEnhancer } from 'redux-injectors';
     * import { initialState, initialReducers } from './elsewhere';
     *
     * const injector = new ReducerInjector(initialReducers);
     *
     * const createReducer = injector.getReducerCreationFn();
     * const runSaga = injector.getRunSagaFn();
     *
     * const middleware = [
     *   createInjectorsEnhancer({ createReducer, runSaga }),
     * ];
     *
     * const register = new ReduxRegister({
     *   reducer,
     *   initialState,
     *   middleware,
     *   injector,
     * });
     * ```
     */
    // eslint-disable-next-line max-statements
    function ReduxRegister(config) {
        if (config === void 0) { config = {}; }
        this.registeredReducers = {};
        var _a = config.reducer, reducer = _a === void 0 ? null : _a, _b = config.initialState, initialState = _b === void 0 ? {} : _b, _c = config.middleware, middleware = _c === void 0 ? [] : _c, _d = config.sagaContext, sagaContext = _d === void 0 ? null : _d, _e = config.injector, injector = _e === void 0 ? new _1.ReducerInjector() : _e;
        lazy_loader_1.LazyLoader.addRegister(this, this.addControllerReducer.bind(this));
        var reduxSaga = get_redux_saga_module_1.getReduxSagaModule();
        var internalMiddleware = [];
        /* istanbul ignore else */
        if (reduxSaga) {
            var register = this;
            this.sagaMiddleware = reduxSaga.default({
                context: __assign(__assign({}, sagaContext), { register: register }),
            });
            internalMiddleware[0] = redux_1.applyMiddleware(this.sagaMiddleware);
        }
        this.injector = injector;
        this.injector.setGetObjectiveReduxReducers(this.getReducers.bind(this));
        this.injector.setSagaRunningFn(this.sagaMiddleware.run);
        this.store = redux_1.createStore(reducer || reducer_injector_1.defaultReducer, initialState, redux_1.compose.apply(void 0, __spreadArrays(middleware, internalMiddleware)));
        this.storeFns = this.wrapStore();
        if (reducer) {
            this.replaceReducer(reducer);
        }
    }
    /**
     * Monkey-patch the redux store so that the register can properly bind the store.
     *
     * @returns The original store methods.
     */
    ReduxRegister.prototype.wrapStore = function () {
        // Prevent the dispatch method from being re-bound
        var internalDispatch = this.dispatch.bind(this);
        this.dispatch = function (action) { return internalDispatch(action); };
        var store = this.store;
        var dispatch = store.dispatch, subscribe = store.subscribe, replaceReducer = store.replaceReducer, getState = store.getState, otherFns = __rest(store, ["dispatch", "subscribe", "replaceReducer", "getState"]);
        // Keep the original store functions for use later
        var storeFns = {
            dispatch: dispatch.bind(this.store),
            subscribe: subscribe.bind(this.store),
            replaceReducer: replaceReducer.bind(this.store),
            getState: getState.bind(this.store),
        };
        Object.assign(this, otherFns);
        // Map the store functions to register functions
        store.dispatch = this.dispatch.bind(this);
        store.subscribe = this.subscribe.bind(this);
        store.replaceReducer = this.replaceReducer.bind(this);
        store.getState = this.getState.bind(this);
        return storeFns;
    };
    ReduxRegister.prototype.getReducers = function () {
        var _this = this;
        var reducerMap = {};
        Object.keys(this.registeredReducers).forEach(function (key) {
            var reducer = _this.registeredReducers[key];
            if (typeof reducer == 'object') {
                reducer = redux_1.combineReducers(reducer);
            }
            reducerMap[key] = reducer;
        });
        return reducerMap;
    };
    /**
     * Dispatches a Redux action to the store without using a Controller.
     *
     * @param action The action that is to be dispatched via the store.
     * @returns The action that was sent.
     * @example
     * ```typescript
     * const register = new ReduxRegister();
     * register.dispatch(myAction());
     * ```
     */
    ReduxRegister.prototype.dispatch = function (action) {
        var controller = lazy_loader_1.LazyLoader.getControllerForAction(action);
        if (controller) {
            controller.getInstance(this);
        }
        return this.storeFns.dispatch(action);
    };
    /**
     * Subscribes to the Redux store events.
     *
     * @param listener The callback that will be fired.
     * @returns An unsubscribe function that can be called to stop listening.
     * @example
     * ```
     * const register = new ReduxRegister();
     * const unsubscribeFn = register.subscribe(myCallback);
     * ```
     */
    ReduxRegister.prototype.subscribe = function (listener) {
        return this.storeFns.subscribe(listener);
    };
    /**
     * Gets the state object from the Redux store.
     *
     * @returns The state object from Redux.
     * @example
     * ```
     * const register = new ReduxRegister();
     * const state = register.getState();
     * ```
     */
    ReduxRegister.prototype.getState = function () {
        return this.storeFns.getState();
    };
    ReduxRegister.prototype.addControllerReducer = function (controller) {
        var name = controller.constructor.getStoreName();
        var namespace = controller.constructor.getNamespace();
        var placement = this.registeredReducers;
        if (namespace) {
            /* istanbul ignore else */
            if (placement[namespace] == null) {
                placement[namespace] = {};
            }
            placement = placement[namespace];
        }
        placement[name] = controller.reducer.bind(controller);
        this.storeFns.replaceReducer(this.injector.getReducerCreationFn()());
    };
    /**
     * Replaced the existing reducer with a new one.
     *
     * Note that, by design, this will not affect reducers generated by controllers. Controller reducers are
     * handled separately, which allows other injection mechanisms to use the register without trampling
     * the registers own lazy loading.
     *
     * @param nextReducer The new reducer that will replace the existing reducer.
     */
    ReduxRegister.prototype.replaceReducer = function (nextReducer) {
        this.storeFns.replaceReducer(nextReducer);
    };
    /**
     * Adds and and begins running a saga as part in the context of the store that the register manages.
     *
     * @param sagaFn The saga to add to the register.
     * @example
     * ```typescript
     * function* sagaFn() {
     *   yield console.log('Hello, world!');
     * }
     *
     * const register = new ReduxRegister();
     * register.registerSaga(sagaFn);
     * ```
     */
    ReduxRegister.prototype.registerSaga = function (sagaFn) {
        this.sagaMiddleware.run(sagaFn);
    };
    return ReduxRegister;
}());
exports.ReduxRegister = ReduxRegister;
