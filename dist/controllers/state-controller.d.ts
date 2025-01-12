import { Action, ActionExtendFn } from '../helpers/action';
import { Controller } from './controller';
/**
 * @internal
 */
export interface ReducerFn<State, Payload> {
    (state: State, action: Payload): State;
}
/**
 * @internal
 */
interface ReducerMap<State, Payload> {
    [actionName: string]: ReducerFn<State, Payload> | null;
}
/**
 * Creates and manages a slice of Redux state.
 *
 * @template State The interface to which the slice of state will adhere.
 *
 * @example JavaScript
 * ```javascript
 * class SwitchStateController extends StateController {
 *   constructor() {
 *     super({ isOn: false });
 *   }
 *
 *   public static getName() {
 *     return 'switch';
 *   }
 *
 *   action = this.createReducingAction(
 *     (state, payload) => ({
 *       ...state,
 *       ...payload,
 *     })
 *   ).withAddressableName('MY_ACTION');
 * }
 *
 * const objectiveStore = new ObjectiveStore();
 * const controller = SwitchStateController.getInstance(objectiveStore);
 * controller.action({ isOn: true });
 * const slice = controller.getStateSlice();
 * ```
 */
export declare abstract class StateController<State> extends Controller {
    /**
     * The initial value of the state slice.
     */
    protected readonly initialState: State;
    /**
     * A map of the reducer action names to the data mutation functions.
     */
    protected readonly reducerMap: ReducerMap<State, any>;
    /**
     * Registers the controller, sets up the reducer, and sets the initial state.
     *
     * WARNING: While the constructor can be called directly, controllers are meant to be initialized with the
     * [[getInstance]] method. Creating instances directly can lead to having more than one instance at a time, which may
     * have adverse affects on the application.
     *
     * @param initialState The initial value of the state slice in Redux.
     * @returns An instance of the controller.
     */
    protected constructor(initialState: State);
    /**
     * Registers a data mutator as part of the slice's reducer and returns the action for calling it.
     *
     * @template Payload The interface to which the payload of the action will adhere. If the type is void, no payload
     * will be accepted. Defaults to void when the template is not provided and the payload type is not specified.
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
    protected createReducingAction<Payload = void>(fn: ReducerFn<State, Payload>): ActionExtendFn<Payload>;
    /**
     * The reducer, which handles mutations to the state slice.
     *
     * @param state The current state of the state slice.
     * @param action The action being performed on the state.
     * @returns The new state resulting from the action.
     */
    reducer(state?: State, action?: Action<any> | null): State;
    /**
     * Gets the current value for this slice of the Redux state.
     *
     * @returns The current slice of the state related to this controller.
     */
    getStateSlice(): State;
    /**
     * Fires an action that resets the state back to the controller's initial state.
     *
     * @example
     * ```typescript
     * MyController.getInstance(objectiveStore).reset();
     * ```
     */
    readonly reset: ActionExtendFn<void>;
}
export {};
//# sourceMappingURL=state-controller.d.ts.map