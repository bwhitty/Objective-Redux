import { AnyAction } from 'redux';
import { Controller, ModelConstructor } from './controller';
import { ObjectiveStore } from './objective-store';
/**
 * @internal
 */
declare type RegisterReducerFn = (controller: any) => void;
/**
 * @internal
 */
export declare class LazyLoader {
    private static readonly loadableControllers;
    private static readonly reducerFns;
    private static readonly controllers;
    static registerController(controller: typeof Controller): void;
    static getControllerForAction(action: AnyAction): typeof Controller | null;
    static addObjectiveStore(objectiveStore: ObjectiveStore, registerReducerFn: RegisterReducerFn): void;
    static getController<T extends Controller>(objectiveStore: ObjectiveStore, ControllerClass: ModelConstructor<T> & typeof Controller): T;
}
export {};
//# sourceMappingURL=lazy-loader.d.ts.map