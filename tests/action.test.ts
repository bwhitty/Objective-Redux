// ================================================================================================
//                                          OBJECTIVE REDUX
//                                  Redux made better, objectively.
//
// (c) Copyright 2020 by Jason Mace (https://github.com/jmace01)
//
// This project is provided under the terms of the MIT license. The license details can be found in
// the LICENSE file, found in the project's root directory.
// ================================================================================================

import { createAction } from '../src';
import { createConnectedAction } from '../src/action';

const type = 'MY_ACTION';
const payload = 10;

describe('action', () => {
  describe('createAction', () => {
    it('should return function that creates action', () => {
      const action = createAction<number>(type);
      expect(action(payload)).toEqual({ type, payload });
    });
  });

  describe('createConnectedAction', () => {
    it('should return function that dispatches an action', () => {
      const store: any = {
        dispatch: jest.fn(),
      };
      const register: any = {
        getStore: () => store,
      };
      createConnectedAction<number>(type, register)(payload);
      expect(store.dispatch).toBeCalledWith({ type, payload });
    });
  });
});
