/**
 * Copyright 2016 Google Inc. All Rights Reserved.
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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {assert} from 'chai';
import td from 'testdouble';

import {createMockRaf} from '../helpers/raf';
import {verifyDefaultAdapter} from '../helpers/foundation';
import {setupFoundationTest} from '../helpers/setup';
import MDCToolbarFoundation from '../../../packages/mdc-toolbar/foundation';

const {cssClasses, numbers} = MDCToolbarFoundation;

suite('MDCToolbarFoundation');

test('exports strings', () => {
  assert.isOk('strings' in MDCToolbarFoundation);
});

test('exports cssClasses', () => {
  assert.isOk('cssClasses' in MDCToolbarFoundation);
});

test('exports numbers', () => {
  assert.isOk('numbers' in MDCToolbarFoundation);
});

test('defaultAdapter returns a complete adapter implementation', () => {
  verifyDefaultAdapter(MDCToolbarFoundation, [
    'hasClass', 'addClass', 'removeClass', 'registerScrollHandler',
    'deregisterScrollHandler', 'registerResizeHandler', 'deregisterResizeHandler',
    'getViewportWidth', 'getViewportScrollY', 'getOffsetHeight',
    'getFlexibleRowElementOffsetHeight', 'notifyChange', 'setStyle',
    'setStyleForTitleElement', 'setStyleForFlexibleRowElement',
    'setStyleForFixedAdjustElement',
  ]);
});

const setupTest = () => setupFoundationTest(MDCToolbarFoundation);
const approximate = (value, expected, delta) => {
  return Math.abs(value - expected) < delta;
};

const mockHandler = (foundation, mockAdapter, mockRaf) => {
  let resizeHandler;
  let scrollHandler;
  td.when(mockAdapter.registerScrollHandler(td.matchers.isA(Function))).thenDo((fn) => {
    scrollHandler = fn;
  });
  td.when(mockAdapter.registerResizeHandler(td.matchers.isA(Function))).thenDo((fn) => {
    resizeHandler = fn;
  });
  foundation.init();
  mockRaf.flush();
  td.reset();
  return {resizeHandler, scrollHandler};
};

test('#constructor initialized calculations_', () => {
  const {foundation} = setupTest();
  assert.isDefined(foundation.calculations_);
});

test('#init calls component event registrations', () => {
  const {foundation, mockAdapter} = setupTest();

  foundation.init();
  td.verify(mockAdapter.registerResizeHandler(td.matchers.isA(Function)));
  td.verify(mockAdapter.registerResizeHandler(td.matchers.isA(Function)));
});

test('#destroy calls component event deregistrations', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {resizeHandler, scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.destroy();
  td.verify(mockAdapter.deregisterResizeHandler(resizeHandler));
  td.verify(mockAdapter.deregisterScrollHandler(scrollHandler));
});

test('#init sets correct ratio for scrollable flexible header', () => {
  const {foundation, mockAdapter} = setupTest();

  const rowHeight = numbers.TOOLBAR_ROW_HEIGHT;
  const flexibleRowMaxHeight = rowHeight * 4;
  const toolbarHeight = flexibleRowMaxHeight + rowHeight;
  td.when(mockAdapter.hasClass(cssClasses.TOOLBAR_ROW_FLEXIBLE)).thenReturn(true);
  td.when(mockAdapter.getFlexibleRowElementOffsetHeight()).thenReturn(flexibleRowMaxHeight);
  td.when(mockAdapter.getOffsetHeight()).thenReturn(toolbarHeight);

  setDeviceDesktop(mockAdapter);
  foundation.init();

  assert.equal(foundation.calculations_.toolbarRowHeight, rowHeight);
  assert.equal(foundation.calculations_.toolbarRatio, 5);
  assert.equal(foundation.calculations_.flexibleExpansionRatio, 3);
  assert.equal(foundation.calculations_.maxTranslateYRatio, 0);
  assert.equal(foundation.calculations_.scrollThesholdRatio, 3);
});

test('#init sets correct ratio for fixed flexible header', () => {
  const {foundation, mockAdapter} = setupTest();

  const rowHeight = numbers.TOOLBAR_ROW_HEIGHT;
  const flexibleRowMaxHeight = rowHeight * 4;
  const toolbarHeight = flexibleRowMaxHeight + rowHeight;
  td.when(mockAdapter.hasClass(cssClasses.FIXED)).thenReturn(true);
  td.when(mockAdapter.hasClass(cssClasses.TOOLBAR_ROW_FLEXIBLE)).thenReturn(true);
  td.when(mockAdapter.getFlexibleRowElementOffsetHeight()).thenReturn(flexibleRowMaxHeight);
  td.when(mockAdapter.getOffsetHeight()).thenReturn(toolbarHeight);

  setDeviceDesktop(mockAdapter);
  foundation.init();

  assert.equal(foundation.calculations_.toolbarRowHeight, rowHeight);
  assert.equal(foundation.calculations_.toolbarRatio, 5);
  assert.equal(foundation.calculations_.flexibleExpansionRatio, 3);
  assert.equal(foundation.calculations_.maxTranslateYRatio, 0);
  assert.equal(foundation.calculations_.scrollThesholdRatio, 3);
});

test('#init sets correct ratio and style for fixed last row flexible header', () => {
  const {foundation, mockAdapter} = setupTest();

  const rowHeight = numbers.TOOLBAR_ROW_HEIGHT;
  const flexibleRowMaxHeight = rowHeight * 4;
  const toolbarHeight = flexibleRowMaxHeight + rowHeight;
  td.when(mockAdapter.hasClass(cssClasses.FIXED_LASTROW)).thenReturn(true);
  td.when(mockAdapter.hasClass(cssClasses.TOOLBAR_ROW_FLEXIBLE)).thenReturn(true);
  td.when(mockAdapter.getFlexibleRowElementOffsetHeight()).thenReturn(flexibleRowMaxHeight);
  td.when(mockAdapter.getOffsetHeight()).thenReturn(toolbarHeight);

  setDeviceDesktop(mockAdapter);
  foundation.init();

  assert.equal(foundation.calculations_.toolbarRowHeight, rowHeight);
  assert.equal(foundation.calculations_.toolbarRatio, 5);
  assert.equal(foundation.calculations_.flexibleExpansionRatio, 3);
  assert.equal(foundation.calculations_.maxTranslateYRatio, 1);
  assert.equal(foundation.calculations_.scrollThesholdRatio, 4);
});

test('#updateAdjustElementStyles adjust marginTop for fixed toolbar', () => {
  const {foundation, mockAdapter} = setupTest();

  td.when(mockAdapter.hasClass(cssClasses.FIXED)).thenReturn(true);
  foundation.init();
  foundation.updateAdjustElementStyles();

  td.verify(mockAdapter.setStyleForFixedAdjustElement('marginTop', td.matchers.anything()));
});

test('#updateAdjustElementStyles adjust marginTop for fixed last row only toolbar', () => {
  const {foundation, mockAdapter} = setupTest();

  td.when(mockAdapter.hasClass(cssClasses.FIXED_LASTROW)).thenReturn(true);
  foundation.init();
  foundation.updateAdjustElementStyles();

  td.verify(mockAdapter.setStyleForFixedAdjustElement('marginTop', td.matchers.anything()));
});

test('#updateAdjustElementStyles do not adjust marginTop for non-fixed toolbar', () => {
  const {foundation, mockAdapter} = setupTest();

  foundation.init();
  foundation.updateAdjustElementStyles();

  td.verify(mockAdapter.setStyleForFixedAdjustElement('marginTop', td.matchers.anything()), {times: 0});
});

test('on scroll debounces calls within the same frame', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  scrollHandler();
  scrollHandler();
  scrollHandler();
  assert.equal(mockRaf.pendingFrames.length, 1);
  mockRaf.restore();
});

test('on scroll resets debounce latch when updateToolbarStyles_ frame is run', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  scrollHandler();
  mockRaf.flush();
  scrollHandler();

  assert.equal(mockRaf.pendingFrames.length, 1);
  mockRaf.restore();
});

test('on scroll handles no flexible height case', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  const flexibleExpansionHeight = 0;
  foundation.calculations_.flexibleExpansionHeight = flexibleExpansionHeight;
  td.when(mockAdapter.getViewportScrollY()).thenReturn(1);

  scrollHandler();
  mockRaf.flush();

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0, 0.001))}));
});

const scrollEventMock =
  (foundation, mockAdapter, mockRaf, scrollHandler, {isOutOfTheshold=false, flexExpansionRatio=0} = {}) => {
    const flexibleExpansionHeight = 10;
    const maxTranslateYDistance = 5;
    const scrollTheshold = flexibleExpansionHeight + maxTranslateYDistance;
    foundation.calculations_.scrollTheshold = scrollTheshold;
    foundation.calculations_.flexibleExpansionHeight = flexibleExpansionHeight;
    foundation.calculations_.maxTranslateYDistance = maxTranslateYDistance;

    if (flexExpansionRatio > 0) {
      td.when(mockAdapter.getViewportScrollY()).thenReturn((1 - flexExpansionRatio) * flexibleExpansionHeight);
    } else {
      if (isOutOfTheshold) {
        td.when(mockAdapter.getViewportScrollY()).thenReturn(scrollTheshold + 1);
      } else {
        td.when(mockAdapter.getViewportScrollY()).thenReturn(scrollTheshold - 1);
      }
    }

    foundation.updateToolbarStyles_();
    mockRaf.flush();
  };

test('on scroll will not execute if we scrolled out of theshold the first time', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {isOutOfTheshold: true});

  td.verify(mockAdapter.notifyChange({flexibleExpansionRatio: td.matchers.isA(Number)}));
  mockRaf.restore();
});

test('on scroll will not execute if we scrolled out of theshold the second time', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {isOutOfTheshold: true});
  td.reset();
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {isOutOfTheshold: true});

  td.verify(mockAdapter.notifyChange({flexibleExpansionRatio: td.matchers.isA(Number)}), {times: 0});
  mockRaf.restore();
});

test('on scroll will execute if we have not scrolled out of theshold, keep executedLastChange_ false', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler);

  td.verify(mockAdapter.notifyChange({flexibleExpansionRatio: td.matchers.isA(Number)}));
  assert.equal(foundation.executedLastChange_, false);
  mockRaf.restore();
});

test('on scroll take correct action for scrollable flexible header when flexible space fully expaned', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 1});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 1, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for scrollable flexible header when flexible space shrinked', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for scrollable flexible header when flexible space in transition', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0.5});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0.5, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for fixed flexible header when flexible space fully expaned', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedAllRow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 1});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 1, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for fixed flexible header when flexible space shrinked', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedAllRow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for fixed flexible header when flexible space in transition', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedAllRow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0.5});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0.5, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for fixed last row flexible header when flexible space fully expaned', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedLastrow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 1});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 1, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for fixed last row flexible header when flexible space shrinked', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedLastrow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()));
  td.verify(mockAdapter.addClass(cssClasses.FIXED_AT_LAST_ROW), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for fixed last row flexible header when other rows scrolled out already', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedLastrow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {isOutOfTheshold: true});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()));
  td.verify(mockAdapter.addClass(cssClasses.FIXED_AT_LAST_ROW));
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for fixed last row flexible header when flexible space in transition', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedLastrow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0.5});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0.5, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for non-flexible scrollable header', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for non-flexible fixed header', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.fixedAllRow_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for non-flexible fixed last row only header', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.fixedLastrow_ = true;
 scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.notifyChange({
    flexibleExpansionRatio: td.matchers.argThat((flexExpansionRatio) => approximate(flexExpansionRatio, 0, 0.001))}));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MAX));
  td.verify(mockAdapter.removeClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MIN));
  td.verify(mockAdapter.addClass(cssClasses.FLEXIBLE_MAX), {times: 0});
  td.verify(mockAdapter.setStyle('transform', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForFlexibleRowElement('height', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()), {times: 0});
  mockRaf.restore();
});

test('on scroll take correct action for flexible scrollable header with default behavior', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.useFlexDefaultBehavior_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()), {times: 0});
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()));
  mockRaf.restore();
});

test('on scroll take correct action for flexible fixed last row only header with default behavior', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedLastrow_ = true;
  foundation.useFlexDefaultBehavior_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()));
  mockRaf.restore();
});

test('on scroll take correct action for flexible fixed header with default behavior', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {scrollHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.hasFlexibleRow_ = true;
  foundation.fixedAllRow_ = true;
  foundation.useFlexDefaultBehavior_ = true;
  scrollEventMock(foundation, mockAdapter, mockRaf, scrollHandler, {flexExpansionRatio: 0});

  td.verify(mockAdapter.setStyleForTitleElement('transform', td.matchers.anything()));
  td.verify(mockAdapter.setStyleForTitleElement('fontSize', td.matchers.anything()));
  mockRaf.restore();
});

test('on resize debounces calls within the same frame', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {resizeHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  resizeHandler();
  resizeHandler();
  resizeHandler();
  assert.equal(mockRaf.pendingFrames.length, 1);
  mockRaf.restore();
});

test('on resize resets debounce latch when checkRowHeight_ frame is run', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {resizeHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  resizeHandler();
  // Calling mockRaf twice because on resize also calls updateToolbarStyles_
  mockRaf.flush();
  mockRaf.flush();
  resizeHandler();
  assert.equal(mockRaf.pendingFrames.length, 1);
  mockRaf.restore();
});

const setDeviceDesktop = (mockAdapter, {isDesktop = true} = {}) => {
  const breakpoint = numbers.TOOLBAR_MOBILE_BREAKPOINT;
  td.when(mockAdapter.getViewportWidth()).thenReturn((isDesktop ? 1 : -1) + breakpoint);
};

test('on resize do not call update style if screen width does not go below breakpoint', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {resizeHandler} = mockHandler(foundation, mockAdapter, mockRaf);

  foundation.updateAdjustElementStyles = td.function();
  foundation.updateToolbarStyles_ = td.function();

  setDeviceDesktop(mockAdapter);
  td.reset();

  resizeHandler();
  mockRaf.flush();

  td.verify(foundation.updateAdjustElementStyles(), {times: 0});
  td.verify(foundation.updateToolbarStyles_(), {times: 0});
  mockRaf.restore();
});

test('on resize call update style if screen width go below breakpoint', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();
  const {resizeHandler} = mockHandler(foundation, mockAdapter, mockRaf);
  setDeviceDesktop(mockAdapter, {isDesktop: false});

  foundation.updateAdjustElementStyles = td.function();
  foundation.updateToolbarStyles_ = td.function();

  resizeHandler();
  mockRaf.flush();

  td.verify(foundation.updateAdjustElementStyles());
  td.verify(foundation.updateToolbarStyles_());
  mockRaf.restore();
});
