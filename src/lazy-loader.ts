// ================================================================================================
//                                          OBJECTIVE REDUX
//                                  Redux made better, objectively.
//
// (c) Copyright 2020 by Jason Mace (https://github.com/jmace01)
//
// This project is provided under the terms of the MIT license. The license details can be found in
// the LICENSE file, found in the project's root directory.
// ================================================================================================

import { AnyAction } from 'redux';
import { Controller, ModelConstructor } from './controller';
import { ObjectiveStore } from './objective-store';

/**
 * @internal
 */
interface ControllerMap {
  [key: string]: typeof Controller;
}

/**
 * @internal
 */
interface NamespacedControllerMap {
  [key: string]: ControllerMap;
}

/**
 * @internal
 */
interface ControllerInstanceMap<T extends Controller> {
  [key: string]: T;
}

/**
 * @internal
 */
interface NamespacedControllerInstanceMap<T extends Controller> {
  [key: string]: ControllerInstanceMap<T>;
}

/**
 * @interface
 */
type ObjectiveStoreToLoadedControllers<T extends Controller> =
  WeakMap<ObjectiveStore, NamespacedControllerInstanceMap<T>>;

/**
 * @internal
 */
type RegisterReducerFn = (controller: any) => void;

/**
 * @internal
 */
type RegisterReducerFnMap = WeakMap<ObjectiveStore, RegisterReducerFn>;

/**
 * @internal
 */
export class LazyLoader {
  private static readonly loadableControllers: NamespacedControllerMap = {};

  private static readonly reducerFns: RegisterReducerFnMap = new WeakMap();

  private static readonly controllers: ObjectiveStoreToLoadedControllers<any> = new WeakMap();

  public static registerController(controller: typeof Controller): void {
    const namespace = controller.getNamespace() || '';
    /* istanbul ignore else */
    if (this.loadableControllers[namespace] == null) {
      this.loadableControllers[namespace] = {};
    }
    this.loadableControllers[namespace][controller.getName()] = controller;
  }

  public static getControllerForAction(action: AnyAction): typeof Controller|null {
    let controller = null;
    const type = action?.type || '';

    const match = type.match('^OBJECTIVE-REDUX-ACTION/(.*?)::([^/]*)/.*$');
    if (match && LazyLoader.loadableControllers[match[1]]) {
      controller = LazyLoader.loadableControllers[match[1]][match[2]];
    }

    return controller;
  }

  public static addObjectiveStore(objectiveStore: ObjectiveStore, registerReducerFn: RegisterReducerFn): void {
    this.reducerFns.set(objectiveStore, registerReducerFn);
    this.controllers.set(objectiveStore, {});
  }

  // eslint-disable-next-line max-statements
  public static getController<T extends Controller>(
    objectiveStore: ObjectiveStore,
    ControllerClass: ModelConstructor<T> & typeof Controller
  ): T {
    const name = ControllerClass.getName();
    const namespace = ControllerClass.getNamespace() || '';
    const controllerMap: ControllerInstanceMap<any> = this.controllers.get(objectiveStore) as any;

    if (controllerMap[namespace] == null) {
      controllerMap[namespace] = {};
    }

    const existing = controllerMap[namespace][name];

    if (existing) {
      return existing;
    }

    const instance: any = new ControllerClass(objectiveStore);
    controllerMap[namespace][name] = instance;

    if (instance.reducer) {
      (this.reducerFns.get(objectiveStore) as any)(instance);
    }

    return instance;
  }
}
