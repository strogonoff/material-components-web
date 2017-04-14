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

import MDCTabsFoundation from '../../../packages/mdc-tabs/tabs/foundation';

suite('MDCTabsFoundation');

test('exports cssClasses', () => {
  assert.isOk('cssClasses' in MDCTabsFoundation);
});

test('default adapter returns a complete adapter implementation', () => {
  verifyDefaultAdapter(MDCTabsFoundation, [
    'addClass', 'removeClass', 'bindOnMDCTabSelectedEvent',
    'unbindOnMDCTabSelectedEvent', 'registerResizeHandler',
    'deregisterResizeHandler', 'getOffsetWidth', 'setStyleForIndicator',
    'getOffsetWidthForIndicator', 'notifyChange', 'getActiveTab',
    'getNumberOfTabs', 'isTabActiveAtIndex', 'setTabActiveAtIndex',
    'isDefaultPreventedOnClickForTabAtIndex',
    'setPreventDefaultOnClickForTabAtIndex', 'measureTabAtIndex',
    'getComputedWidthForTabAtIndex', 'getComputedLeftForTabAtIndex',
  ]);
});

function setupTest() {
  const {foundation, mockAdapter} = setupFoundationTest(MDCTabsFoundation);
  const {UPGRADED} = MDCTabsFoundation.cssClasses;
  const {TAB_SELECTOR, INDICATOR_SELECTOR} = MDCTabsFoundation.strings;

  return {foundation, mockAdapter, UPGRADED, TAB_SELECTOR, INDICATOR_SELECTOR};
}

test('#init adds upgraded class to tabs', () => {
  const {foundation, mockAdapter, UPGRADED} = setupTest();

  foundation.init();
  td.verify(mockAdapter.addClass(UPGRADED));
});

test('#init registers listeners', () => {
  const {foundation, mockAdapter} = setupTest();
  const {isA} = td.matchers;

  foundation.init();
  td.verify(mockAdapter.bindOnMDCTabSelectedEvent());
  td.verify(mockAdapter.registerResizeHandler(isA(Function)));
});

test('#destroy removes class from tabs', () => {
  const {foundation, mockAdapter, UPGRADED} = setupTest();

  foundation.destroy();
  td.verify(mockAdapter.removeClass(UPGRADED));
});

test('#destroy deregisters tab event handlers', () => {
  const {foundation, mockAdapter} = setupTest();
  const {isA} = td.matchers;

  foundation.destroy();
  td.verify(mockAdapter.unbindOnMDCTabSelectedEvent());
  td.verify(mockAdapter.deregisterResizeHandler(isA(Function)));
});
