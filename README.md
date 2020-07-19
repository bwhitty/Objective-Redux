# Objective Redux
### Redux made better, objectively.

<a href="https://www.npmjs.com/package/objective-redux"><img src="https://img.shields.io/npm/v/objective-redux" alt="NPM Version" /></a>
<a href="https://github.com/Objective-Redux/Objective-Redux/actions"><img src="https://github.com/Objective-Redux/Objective-Redux/workflows/Build/badge.svg" alt="build status" /></a>
<a href="https://bundlephobia.com/result?p=objective-redux"><img src="https://badgen.net/bundlephobia/minzip/objective-redux" alt="bundle size" /></a>
<a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>

Object-oriented, light-weight, and TypeScript compatible.

<br />

<br />

# Meet your new Redux API

## Install

```
npm install --save redux redux-saga objective-redux
```

## Setup (for React)
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { RegisterProvider, ReduxRegister } from 'objective-redux';
import App from './app';

export const register = new ReduxRegister();

ReactDOM.render(
  <RegisterProvider register={register}>
    <App />
  </RegisterProvider>,
  document.getElementById('root')
);
```

## Example Slice
```javascript
import { StateController } from 'objective-redux';

const initialState = { isOn: false };

export class SwitchStateController extends StateController {
  constructor(register) {
    super(initialState, register);
  }

  static getName() {
    return 'switch';
  }

  setSwitch = this.registerAction(
    (state, isOn) => ({ isOn })
  );
}
```
```javascript
SwitchOneController.getInstance(register).setSwitch(true);
```

<br />

<br />

# Start using it now

You can read the full documentation, along with examples, here:

https://objective-redux.github.io/Objective-Redux/

<br />

<br />

# Why use Objective-Redux?

<br />

## Keep your bundle small

### Lots of features, one tiny package

Objective-Redux replaces many of the packages you're already using.

For example, instead of React-Redux + Redux-Injectors + Redux-Toolkit

<a href="https://bundlephobia.com/result?p=react-redux"><img src="https://badgen.net/bundlephobia/min/react-redux" alt="react-redux bundle size" /></a>
+
<a href="https://bundlephobia.com/result?p=redux-injectors"><img src="https://badgen.net/bundlephobia/min/redux-injectors" alt="redux-injectors bundle size" /></a>
+
<a href="https://bundlephobia.com/result?p=redux-toolkit"><img src="https://badgen.net/bundlephobia/min/redux-toolkit" alt="redux-toolkit bundle size" /></a>

you can simply use Objective-Redux

<a href="https://bundlephobia.com/result?p=objective-redux"><img src="https://badgen.net/bundlephobia/min/objective-redux" alt="objective-redux bundle size" /></a>

_Bundle sizes vary based on how much of the package is unused and how effectively your bundler can remove the unused portions._

<br />

## Drop the boilerplate code

### Actions are a thing of the past&mdash; among other things

Object-Redux largely removes the need for action names, actions, switch-statement-reducers, selectors, and dispatching. You just need to write the mutating functions. Objective-Redux can take it from there.

```typescript
  // Define your mutation and forget about the rest.
  myAction = this.registerAction(
    (state, payload) => ({
      ...state,
      value: payload.value,
    })
  );
```

<br />

## Easy Debugging

### No more global searches for action names

Using Objective-Redux, your editor knows exactly where to find everything. That means you get intellisense, jump to definition, and more. Plus, your actions and reducer will never get out-of-sync.

<p style="text-align: center;">
  <img src="./statics/debugging.png" alt="Debugging in VS Code" style="height: 500px;" />
</p>

<br />

## Code splitting and lazy loading

### Get the pieces of state you need, when you need them

Stop wiring-up your reducers and sagas manually. And, for that matter, stop using large middleware package to help. Objective-Redux will take care of it for you, and it will do it on demand, dynamically, at runtime. Your store no longer needs to know about what's in it, leaving you free to move parts around as needed.

See the <a href="https://objective-redux.github.io/Objective-Redux/code-splitting.html">Code Splitting</a> topic in the documentation for more.

<img src="./statics/lazy.png" alt="Lazy load reducers and controller when you need them" style="height: 200px;" />

<br />

## Organize your state

### One slice, one object

Each controller class represents a slice, giving an intuitive way for developers to look at and conceptualize the state.

A slice of state never needs to know about what other slices are doing or how they're organized.

<img src="./statics/organize.png" alt="organize reducing function into a single class that represents a slice" style="height: 200px;" />

<br />

## Compatible with React-Redux

### Migrate over time
You can use Objective-Redux and React-Redux together. The ReduxRegister is a decorated store object and can be used to `dispatch`, `subscribe`, `getState`, and even `replaceReducer`&mdash;all without disrupting Objective-Redux controllers. Simply pass the ReduxRegister to the React-Redux provider and use it normally.

See the <a href="https://objective-redux.github.io/Objective-Redux/use-with-react-redux.html">Use with React-Redux</a> topic in the documentation for more.

<br />

## Multiple ways to connect

### Inject properties or use hooks

You can connect your components to Objective-Redux to inject props from the store. Or, skip the connection process and use React hooks, instead.