// ================================================================================================
//                                          OBJECTIVE REDUX
//                                  Redux made better, objectively.
//
// (c) Copyright 2020 by Jason Mace (https://github.com/jmace01)
//
// This project is provided under the terms of the MIT license. The license details can be found in
// the LICENSE file, found in the project's root directory.
// ================================================================================================
import React from 'react';
import { connect } from 'react-redux';
import { createAction, getActionNameForController } from 'objective-redux';

const action = createAction(getActionNameForController('switchSagas', 'update-switch'));

function ReactReduxComponent(props) {
  const { isOn, count, dispatch } = props;

  const sendToggleAction = () => {
    dispatch(action());
  };

  return (
    <>
      <p>
        <button onClick={sendToggleAction}>Click me</button>
      </p>
      <p>
        Switch is
        {' '}
        {isOn ? 'On' : 'Off'}
        <br />
        Turned on
        {' '}
        {count}
        {' '}
        times
      </p>
    </>
  );
}

export default connect(
  (state, ownProps) => ({
    ...ownProps,
    ...state.switch,
  })
)(ReactReduxComponent);
