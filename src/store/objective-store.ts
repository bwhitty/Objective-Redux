// ================================================================================================
//                                          OBJECTIVE REDUX
//                                  Redux made better, objectively.
//
// (c) Copyright 2021 by Jason Mace (https://github.com/jmace01)
//
// This project is provided under the terms of the MIT license. The license details can be found in
// the LICENSE file, found in the project's root directory.
// ================================================================================================

import {
  Store,
  applyMiddleware,
  createStore,
  compose,
  Middleware,
  AnyAction,
  Unsubscribe,
  combineReducers,
} from 'redux';
import { Action } from '../helpers/action';
import { getReduxSagaModule } from '../helpers/get-redux-saga-module';
import { StatelessController } from '../controllers/stateless-controller';
import { LazyLoader } from './lazy-loader';
import { ReducerInjector, defaultReducer } from './reducer-injector';
import { lazyLoadingMiddleware } from './lazy-loading-middleware';
import { preDispatchHookMiddleware } from './pre-dispatch-hook-middleware';

/**
 * @internal
 */
type Reducer<S, A> = (prevState: S, action: A) => S

/**
 * @internal
 */
export type PreDispatchHookFn = (action: AnyAction) => any;

interface ObjectiveStoreOptions {
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
   * An injector object for adding reducers and sagas to the store.
   */
  injector?: ReducerInjector;
  /**
   * A function that will be called before actions are dispatched.
   * The function should take an action and return either null or a promise. If a promise is returned, the action will
   * be dispatched when the promise resolves.
   */
  preDispatchHook?: PreDispatchHookFn;
  /**
   * A function used to compose the Redux middleware.
   */
  composeMiddlewareFn?: any;
}

/**
 * @internal
 */
export interface SagaFn<Payload = void> {
  (action: Action<Payload>): any;
}

/* istanbul ignore next */
// eslint-disable-next-line jsdoc/require-description, jsdoc/require-returns
/**
 * @internal
 */
const defaultPreDispatchHook = (): any => null;

/**
 * The ObjectiveStore handles the connection of controllers, reducers, and sagas to Redux. Each ObjectiveStore has its
 * own Redux store that it manages. The store will also setup the Redux-Saga middleware, if it finds the dependency.
 *
 * Middleware can be applied at construction. Sagas and reducers can be added at any time, as needed.
 */
export class ObjectiveStore {
  private readonly store: Store;

  private readonly sagaMiddleware: any;

  private readonly injector: ReducerInjector;

  private readonly registeredReducers: any = {};

  private readonly registeredSagas: any = {};

  /**
   * Creates an instance of the ObjectiveStore.
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
   * @returns An instance of the ObjectiveStore.
   * @example
   * ```typescript
   * // No need to setup the Redux-Saga middleware-- Objective-Redux will handle it.
   * const objectiveStore = new ObjectiveStore();
   * ```
   * @example
   * ```typescript
   * import { ReducerInjector, ObjectiveStore } from 'objective-redux';
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
   * const objectiveStore = new ObjectiveStore({
   *   reducer,
   *   initialState,
   *   middleware,
   *   injector,
   * });
   * ```
   */
  // eslint-disable-next-line max-statements
  public constructor(config: ObjectiveStoreOptions = {}) {
    const {
      reducer = null,
      initialState = {},
      middleware = [],
      sagaContext = null,
      injector = new ReducerInjector(),
      preDispatchHook = defaultPreDispatchHook,
      composeMiddlewareFn = compose,
    } = config;

    LazyLoader.addObjectiveStore(
      this,
      {
        registerReducerFn: this.addControllerReducer.bind(this),
        unregisterReducerFn: this.removeControllerReducer.bind(this),
        cancelSagasForController: this.cancelSagasForController.bind(this),
      }
    );

    const reduxSaga = getReduxSagaModule();
    const internalMiddleware: any[] = [
      preDispatchHookMiddleware(preDispatchHook),
      lazyLoadingMiddleware(this),
    ];

    this.injector = injector;
    this.injector.setGetObjectiveReduxReducers(this.getReducers.bind(this));

    /* istanbul ignore else */
    if (reduxSaga) {
      const objectiveStore = this;
      this.sagaMiddleware = reduxSaga.default({
        context: {
          ...sagaContext,
          objectiveStore,
        },
      });
      internalMiddleware.push(this.sagaMiddleware);
      this.injector.setSagaRunningFn(this.sagaMiddleware.run);
    }

    this.store = createStore(
      reducer || defaultReducer,
      initialState,
      composeMiddlewareFn(
        ...middleware,
        applyMiddleware(...internalMiddleware)
      )
    );

    this.wrapStore();

    if (reducer) {
      this.replaceReducer(reducer);
    }
  }

  /**
   * Monkey-patch the redux store so that the objective store can properly bind the Redux store.
   *
   * @returns The original store methods.
   */
  private wrapStore(): void {
    [
      'dispatch',
      'subscribe',
      'replaceReducer',
      'getState',
    ].forEach(fn => {
      const internalFn = (this as any)[fn].bind(this);
      (this as any)[fn] = (...params: any): any => internalFn(...params);
    });

    /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/unbound-method */
    const {
      dispatch,
      subscribe,
      replaceReducer,
      getState,
      ...otherFns
    } = this.store;
    /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/unbound-method */

    Object.assign(this, otherFns);
  }

  private getReducers(): any {
    const reducerMap: any = {};
    Object.keys(this.registeredReducers).forEach(
      key => {
        let reducer = this.registeredReducers[key];
        if (typeof reducer == 'object') {
          reducer = combineReducers(reducer);
        }
        reducerMap[key] = reducer;
      }
    );
    return reducerMap;
  }

  /**
   * Dispatches a Redux action to the store without using a Controller.
   *
   * @param action The action that is to be dispatched via the store.
   * @returns The action that was sent.
   * @example
   * ```typescript
   * const objectiveStore = new ObjectiveStore();
   * objectiveStore.dispatch(myAction());
   * ```
   */
  public dispatch(action: AnyAction): AnyAction {
    return this.store.dispatch(action);
  }

  /**
   * Subscribes to the Redux store events.
   *
   * @param listener The callback that will be fired.
   * @returns An unsubscribe function that can be called to stop listening.
   * @example
   * ```
   * const objectiveStore = new ObjectiveStore();
   * const unsubscribeFn = objectiveStore.subscribe(myCallback);
   * ```
   */
  public subscribe(listener: () => void): Unsubscribe {
    return this.store.subscribe(listener);
  }

  /**
   * Gets the state object from the Redux store.
   *
   * @returns The state object from Redux.
   * @example
   * ```
   * const objectiveStore = new ObjectiveStore();
   * const state = objectiveStore.getState();
   * ```
   */
  public getState(): any {
    return this.store.getState();
  }

  private addControllerReducer(controller: any): void {
    this.useControllerReducer(controller);
  }

  private removeControllerReducer(controller: any): void {
    this.useControllerReducer(controller, true);
  }

  // eslint-disable-next-line max-statements
  private useControllerReducer(controller: any, remove: boolean = false): void {
    const name = controller.constructor.getName();
    const namespace = controller.constructor.getNamespace();
    let placement = this.registeredReducers;

    if (namespace) {
      /* istanbul ignore else */
      if (placement[namespace] == null) {
        placement[namespace] = {};
      }
      placement = placement[namespace];
    }

    if (remove) {
      if (namespace) {
        delete this.registeredReducers[namespace];
      } else {
        delete placement[name];
      }
    } else {
      placement[name] = controller.reducer.bind(controller);
    }

    this.store.replaceReducer(this.injector.getReducerCreationFn()());
  }

  private cancelSagasForController(statelessController: StatelessController): void {
    const name = (statelessController as any).constructor.getName();
    const namespace = (statelessController as any).constructor.getNamespace() || '';
    const placement = this.registeredSagas[namespace] || {};
    (placement[name] || []).forEach((task: any) => {
      task.cancel();
    });
    delete placement[name];
  }

  /**
   * Replaced the existing reducer with a new one.
   *
   * THIS METHOD SHOULD NOT BE USED DIRECTLY. Use the ReducerInjector class, instead.
   *
   * @param nextReducer The new reducer that will replace the existing reducer.
   */
  public replaceReducer(nextReducer: Reducer<any, AnyAction>): void {
    this.store.replaceReducer(nextReducer);
  }

  /**
   * Adds and and begins running a saga as part in the context of the store that the store manages.
   *
   * Note: This method should not be called manually for StatelessControllers! The controller will handle this call on
   * its own when the controller is first initialized.
   *
   * @param sagaFn The saga to add to the store.
   * @param statelessController The StatelessController from which the saga is originating, or null if it does not come
   * from a StatelessController.
   * @example
   * ```typescript
   * function* sagaFn() {
   *   yield console.log('Hello, world!');
   * }
   *
   * const objectiveStore = new ObjectiveStore();
   * objectiveStore.registerSaga(sagaFn);
   * ```
   */
  // eslint-disable-next-line max-statements
  public registerSaga(sagaFn: SagaFn<void>, statelessController: StatelessController|null = null): void {
    const task = this.sagaMiddleware.run(sagaFn);

    if (!statelessController) {
      return;
    }

    const name = (statelessController as any).constructor.getName();
    const namespace = (statelessController as any).constructor.getNamespace() || '';
    let placement = this.registeredSagas;

    /* istanbul ignore else */
    if (placement[namespace] == null) {
      placement[namespace] = {};
    }
    placement = placement[namespace];

    /* istanbul ignore else */
    if (placement[name] == null) {
      placement[name] = [];
    }

    placement[name].push(task);
  }
}
