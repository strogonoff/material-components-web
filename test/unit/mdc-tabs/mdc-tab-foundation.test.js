/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and * limitations under the License.
 */

import {assert} from 'chai';
import td from 'testdouble';

import {setupFoundationTest} from '../helpers/setup';
import {verifyDefaultAdapter} from '../helpers/foundation';

import {cssClasses} from '../../../packages/mdc-tabs/tab/constants';
import MDCTabFoundation from '../../../packages/mdc-tabs/tab/foundation';

suite('MDCTabFoundation');

test('exports cssClasses', () => {
  assert.isOk('cssClasses' in MDCTabFoundation);
});

test('default adapter returns a complete adapter implementation', () => {
  verifyDefaultAdapter(MDCTabFoundation, [
    'addClass', 'removeClass', 'registerInteractionHandler',
    'deregisterInteractionHandler', 'getOffsetWidth', 'getOffsetLeft',
    'notifySelected',
  ]);
});

function setupTest() {
  const {foundation, mockAdapter} = setupFoundationTest(MDCTabFoundation);

  return {foundation, mockAdapter};
}

test('#init registers tab interaction handlers', () => {
  const {foundation, mockAdapter} = setupTest();
  const {isA} = td.matchers;

  foundation.init();
  td.verify(mockAdapter.registerInteractionHandler('click', isA(Function)));
  td.verify(mockAdapter.registerInteractionHandler('keydown', isA(Function)));
});

test('#destroy deregisters tab interaction handlers', () => {
  const {foundation, mockAdapter} = setupTest();
  const {isA} = td.matchers;

  foundation.destroy();
  td.verify(mockAdapter.deregisterInteractionHandler('click', isA(Function)));
  td.verify(mockAdapter.deregisterInteractionHandler('keydown', isA(Function)));
});

test('#setActive adds active class when isActive is true', () => {
  const {foundation, mockAdapter} = setupTest();

  foundation.setActive(true);
  td.verify(mockAdapter.addClass(cssClasses.ACTIVE));
});

test('#setActive removes active class when isActive is false', () => {
  const {foundation, mockAdapter} = setupTest();

  foundation.setActive(false);
  td.verify(mockAdapter.removeClass(cssClasses.ACTIVE));
});

test('#setPreventDefaultOnClick sets preventDefaultOnClick_' +
 'to true the value of preventDefaultOnClick param', () => {
   const {foundation} = setupTest();

   foundation.setPreventDefaultOnClick(false);

   assert.isFalse(foundation.preventDefaultOnClick_);
});

test('#measureSelf sets computedWidth_ and computedLeft_ for tab', () => {
  const {foundation, mockAdapter} = setupTest();

  td.when(mockAdapter.getOffsetWidth()).thenReturn(200);
  td.when(mockAdapter.getOffsetLeft()).thenReturn(100);

  foundation.measureSelf();

  assert.equal(foundation.computedWidth_, 200);
  assert.equal(foundation.computedLeft_, 100);
});
