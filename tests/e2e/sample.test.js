// ================================================================================================
//                                          OBJECTIVE REDUX
//                                  Redux made better, objectively.
//
// (c) Copyright 2020 by Jason Mace (https://github.com/jmace01)
//
// This project is provided under the terms of the MIT license. The license details can be found in
// the LICENSE file, found in the project's root directory.
// ================================================================================================

describe('My First Test', () => {
  it('Does not do much!', () => {
    cy.visit('http://localhost:3000/');
    cy.contains('button');
  });
});