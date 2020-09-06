import { Middleware, AnyAction, Unsubscribe } from 'redux';
import { Action } from './action';
import { ReducerInjector } from '.';
/**
 * @internal
 */
declare type Reducer<S, A> = (prevState: S, action: A) => S;
/**
 * @internal
 */
export declare type PreDispatchHookFn = (action: AnyAction) => any;
interface RegisterOptions {
    /**
     * The initial reducer for the store.
     */
    reducer?: Reducer<any, AnyAction>;
    /**
     * The initial state to which the store should be initialized.
     */
    initialState?: any;
    /**
     * Middleware that should be applied to the store. This should not include saga middleware.
     */
    middleware?: Middleware<any>[];
    /**
     * The context that should be given to sagas.
     */
    sagaContext?: any;
    /**
     * An injector object for adding reducers and sagas to the register.
     */
    injector?: ReducerInjector;
    /**
     * A function that will be called before actions are dispatched.
     * The function should take an action and return either null or a promise. If a promise is returned, the action will
     * be dispatched when the promise resolves.
     */
    preDispatchHook?: PreDispatchHookFn;
}
/**
 * @internal
 */
export interface SagaFn<Payload> {
    (action?: Action<Payload>): any;
}
/**
 * The ReduxRegister handles the connection of controllers, reducers, and sagas to Redux. Each ReduxRegister has its
 * own Redux store that it manages. The register will also setup the Redux-Saga middleware, if it finds the dependency.
 *
 * Middleware can be applied at construction. Sagas and reducers can be added at any time, as needed.
 */
export declare class ReduxRegister {
    private readonly store;
    private readonly sagaMiddleware;
    private readonly injector;
    private readonly registeredReducers;
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
     * @param config.preDispatchHook A function that takes an action and returns a promise.
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
    constructor(config?: RegisterOptions);
    /**
     * Monkey-patch the redux store so that the register can properly bind the store.
     *
     * @returns The original store methods.
     */
    private wrapStore;
    private getReducers;
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
    dispatch(action: AnyAction): AnyAction;
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
    subscribe(listener: () => void): Unsubscribe;
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
    getState(): any;
    private addControllerReducer;
    /**
     * Replaced the existing reducer with a new one.
     *
     * Note that, by design, this will not affect reducers generated by controllers. Controller reducers are
     * handled separately, which allows other injection mechanisms to use the register without trampling
     * the registers own lazy loading.
     *
     * @param nextReducer The new reducer that will replace the existing reducer.
     */
    replaceReducer(nextReducer: Reducer<any, AnyAction>): void;
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
    registerSaga(sagaFn: SagaFn<void>): void;
}
export {};
//# sourceMappingURL=redux-register.d.ts.map