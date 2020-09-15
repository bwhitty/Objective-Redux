// ================================================================================================
//                                          OBJECTIVE REDUX
//                                  Redux made better, objectively.
//
// (c) Copyright 2020 by Jason Mace (https://github.com/jmace01)
//
// This project is provided under the terms of the MIT license. The license details can be found in
// the LICENSE file, found in the project's root directory.
// ================================================================================================

import { ObjectiveStore, SagaFn } from './objective-store';
import { createConnectedAction, ActionFn } from './action';
import { Controller } from './controller';
import { EffectBuilder } from './effect-type';

/**
 * @internal
 */
interface SagaConfig {
  name: string|null;
  effectBuilder: EffectBuilder|null;
  sagaFn: SagaFn<any>;
}

/**
 * Builder that is returned by the [[StatelessController]] to create and store a saga.
 *
 * @template Payload The payload that the action and the saga will use.
 */
export class SagaBuilder<Payload> {
  private readonly registerFn: (config: SagaConfig) => ActionFn<Payload>;

  private name: string|null;

  private effectBuilder: EffectBuilder|null;

  // eslint-disable-next-line jsdoc/require-description, jsdoc/require-param
  /**
   * @internal
   */
  public constructor(registerFn: (config: SagaConfig) => ActionFn<Payload>) {
    this.registerFn = registerFn;
    this.name = null;
    this.effectBuilder = null;
  }

  /**
   * Adds a specific name to the saga so that it can be addressed without calling the specific action returned by this
   * builder.
   *
   * @param name The name/type of the action.
   * @returns An instance of the SagaBuilder.
   */
  public withAddressableName(name: string): SagaBuilder<Payload> {
    this.name = name;
    return this;
  }

  /**
   * Adds a simple watcher to the saga.
   *
   * @param effectBuilder The builder function for the saga watcher. This can be generating using one of the configure
   * functions, such as configureTakeLatest or configureDebounce.
   * @returns An instance of the SagaBuilder.
   */
  public withEffect(effectBuilder: EffectBuilder): SagaBuilder<Payload> {
    this.effectBuilder = effectBuilder;
    return this;
  }

  /**
   * Completes the builder and adds the saga to the objectiveStore.
   *
   * @param sagaFn The saga function to add to the ObjectiveStore.
   * @returns An action for calling the saga.
   */
  public register(sagaFn: SagaFn<Payload>): ActionFn<Payload> {
    return this.registerFn({
      name: this.name,
      effectBuilder: this.effectBuilder,
      sagaFn,
    });
  }
}

/**
 * Create and manage sagas that are associated with an objectiveStore.
 *
 * @example
 * ```typescript
 * class SwitchStateSagas extends StatelessController {
 *  getName() {
 *    return 'switch-sagas';
 *  }
 *
 *  toggleSwitch = this.createSaga()
 *    .withEffect(configureTakeLatest())
 *    .register(
 *      function* () {
 *        const controller = yield getControllerFromSagaContext(SwitchStateController);
 *        yield controller.toggleSwitchValue();
 *        yield controller.incrementCount();
 *      }
 *    );
 * }
 *
 * const instance = SwitchStateSagas.getInstance(objectiveStore);
 * instance.toggleSwitch();
 * ```
 */
export abstract class StatelessController extends Controller {
  /**
   * ObjectiveStores and starts the sagas.
   *
   * _WARNING: While the constructor can be called directly, state controllers are meant to be initialized with the
   * [[getInstance]] method. Creating instances directly can lead to having more than one instance at a time, which may
   * have adverse affects on the application._.
   *
   * @param objectiveStore The ObjectiveStore instance to which the controller will be connected.
   * @returns An instance of the StatelessController.
   */
  // eslint-disable-next-line no-useless-constructor
  public constructor(objectiveStore: ObjectiveStore) {
    super(objectiveStore);
  }

  /**
   * Creates an instance of a [[SagaBuilder]] that will be registered when the builder finishes.
   *
   * @template Payload the payload the action and the saga will take.
   * @returns A builder that registers the saga.
   */
  protected createSaga<Payload>(): SagaBuilder<Payload> {
    return new SagaBuilder<Payload>(this.buildSaga.bind(this));
  }

  private buildSaga<Payload>(config: SagaConfig): ActionFn<Payload> {
    const name = this.createActionName(config.name);

    let { sagaFn } = config;

    if (config.effectBuilder !== null) {
      sagaFn = config.effectBuilder({
        name,
        sagaFn,
      });
    }

    this.objectiveStore.registerSaga(sagaFn);
    return createConnectedAction(name, this.objectiveStore);
  }
}
