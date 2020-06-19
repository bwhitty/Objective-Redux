<div style="text-align: center; border: 1px solid; border-radius: 10px; margin: 80px; padding: 30px;">
  <h1 style="border-bottom: 1px dotted; margin-bottom: 0; padding-bottom: 8px; width: 300px; margin:auto;">Objective Redux</h1>
  <h2 style="padding: 0; margin-bottom: 0;">Redux made better, objectively.</h2>
  <p style="margin-top: 5px;">Object-oriented, light-weight, and TypeScript compatible.</p>
  <p>
    <a href="https://www.npmjs.com/package/objective-redux"><img src="https://img.shields.io/npm/v/objective-redux" alt="NPM Version" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
    <a href="https://github.com/Objective-Redux/Objective-Redux/actions"><img src="https://github.com/Objective-Redux/Objective-Redux/workflows/Build/badge.svg" alt="build status" /></a>
  </p>
</div>

# Setup

## Installing Packages
In order to use Objective Redux in your project, you'll need to install it along with Redux. These should be saved as dependencies, since they will need to be run with the final application.
```
npm install --save redux objective-redux
```

If you want to use Redux-Saga, install it as well.
```
npm install --save redux-saga
```

## Connecting to Redux

First, a ReduxRegister needs to be created in order to connect state controllers.

In addition, for Reactjs, the following sets up a provider for components.

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { RegisterProvider, ReduxRegister } from 'objective-redux';
import { register } from './store/register';
import App from './app';

export const register = new ReduxRegister();

ReactDOM.render(
  <RegisterProvider register={register}>
    <App />
  </RegisterProvider>,
  document.getElementById('root')
);
```

<br />

# Creating Slices

In Objective-Redux, a StateController handles the access and mutation of a slice of state. Every time you instantiate a StateController, the reducer associated with that state is added automatically to the `ReduxRegister`.

The `stateName` and the `initialState` are sent to the super constructor. The `stateName` will identify the piece of the state the controller is operating on and the `initialState` determines the starting configuration it.

Actions and their associated mutations are created by using the `registerAction` method. This method takes a function that, in turn, accepts the current state and the action payload as parameters and returns the new state.

Below is an example of a state controller that flips a switch on and off.

```javascript
import { StateController } from 'objective-redux';

const initialState = { isOn: false };

class SwitchStateController extends StateController {
  constructor(register) {                   // The generated reducer is added
    super(initialState, register);          // to the ReduxRegister. No need
  }                                         // to wire it up manually.

  static getName() {                        // Sets the name of the slice.
    return 'switch';
  }

  toggleSwitch = this.registerAction(       // This creates a reducer and
    (state) => ({ isOn: !state.isOn })      // returns the associate action.
  );
}

// For use if non-Objective-Redux code will be calling actions.
// If everything is using Objective-Redux, this isn't needed.
SwitchStateController.lazyLoadOnExternalAction();

export SwitchStateController;
```

Below is an example of how the above class would be used.

```javascript
import React from 'react';
import { SwitchStateController } from './store/switch-state-controller';
import { ComponentConnector } from 'objective-redux';

function AppComponent(props) {
  const { isOn, register } = props;

  const sendToggleAction = () => {
    SwitchStateController.getInstance(register).toggleSwitch();
  }

  return (
    <>
      <p>
        <button onClick={sendToggleAction}>Click me</button>
      </p>
      <p>
        Switch is { isOn ? 'On' : 'Off' }
      </p>
    </>
  );
}

export default ComponentConnector
  .addPropsTo(AppComponent)
  .from(SwitchStateController) // or .from(SwitchStateController, state => ({ isOn: state.isOn }))
  .connect();

```

<br />

# Creating Sagas

Sagas can be created using the `StatelessController`. The `createSagaWithType` is passed a take type for the saga, defining how de-duplication of the events should be handled. Then, the `register` method is called and passed the generator function the saga will execute.

Below is an example of a Saga that will call the `toggleSwitch` method of our previously created `SwitchStateController`.

```javascript
import {
  StatelessController,
  TakeType,
  getRegisterFromContext
} from 'objective-redux';
import { SwitchStateController } from './switch-state-controller';

export class SwitchStateSagas extends StatelessController {
  static getName() {
    return 'Switch-State-Sagas';
  }

  toggleSwitch = this.createSaga()
    .withTake(TakeType.TAKE_LATEST)
    .register(
      function* () {
        const register = yield getRegisterFromContext(payload);
        yield MyController.getInstance(register).toggleSwitchValue(payload);
      }
    );
}
```

To create a more generic Saga, you can use

```javascript
import { StatelessController, getRegisterFromContext } from 'objective-redux';
import { SwitchStateController } from './switch-state-controller';
import {takeLatest} from 'redux-saga/effects';

export class SwitchStateSagas extends StatelessController {
  static getName() {
    return 'Switch-State-Sagas';
  }

  toggleSwitch = this.createSaga()
    .withAddressableName('NAME')
    .register(
      function *() {
        yield takeLatest('NAME', function* ({ type, payload }) {
          const register = yield getRegisterFromContext();
          yield MyController.getInstance(register).myAction(payload);
        });
      }
    );
}
```

<br />

# Code Splitting

If you need to call the action from outside your package, you can give the action a name using the `withAddressableName` method.

```javascript
  // For Reducers
  setSwitch = this.registerAction(
    (state, isOn) => ({ isOn })
  ).withAddressableName('SET_SWITCH_STATE'); // <--

  // For Sagas
  toggleSwitch = this.createSaga()
    .withTake(TakeType.TAKE_LATEST)
    .withAddressableName('SET_SWITCH_STATE') // <--
    .register(
      function *() {
        const register = yield getRegisterFromContext();
        yield MyController.getInstance(register).myAction(payload);
      }
    );
```

Then, your reducer or saga can be called with
```javascript
const myAction = createAction(getActionNameForController('My-Controller', 'SET_SWITCH_STATE'));
register.dispatch(myAction(isOn));
```

<br />

# TypeScript

### Example
Templating is available for projects using TypeScript. For example, if you create an action that will take a string as a parameter, it would look like the below example.

```typescript
class ThemeStateController extends StateController<ThemeState> {
  // ...

  public readonly setTheme = this.registerAction<string>(
    (state: ThemeState, theme: string) => ({
      ...state,
      theme,
    })
  );
}
```
```typescript
ThemeStateController.getInstance(register).setTheme();       // error
ThemeStateController.getInstance(register).setTheme(10);     // error
ThemeStateController.getInstance(register).setTheme({});     // error
ThemeStateController.getInstance(register).setTheme('dark'); // works
```

You can also set the action template type to `<void>` to indicate that no parameter should be taken by the action.

### Note: the `<Template>` parameter is optional... mostly.

The template parameter can be inferred for all actions _except_ those that don't take a parameter.

```typescript
// ACTIONS THAT TAKE A PAYLOAD

// Both will CORRECTLY require action take a string payload parameter, as inferred by the function being passed as an argument. It doesn't matter if you use the <template> parameter.
this.registerAction((a, b: string) => b);         // Good
this.registerAction<string>((a, b: string) => b); // Also good


// ACTIONS THAT DON'T TAKE A PAYLOAD

// Due to limitations in TypeScript, this will INCORRECTLY require that the action take a payload parameter.
this.registerAction(a => a) // Bad

// This will CORRECTLY produce an action that does not allow a payload parameter
// Note the <void>, which tells TypeScript the payload should not be used.
this.registerAction<void>(a => a) // Good
```