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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {assert} from 'chai';
import bel from 'bel';
import domEvents from 'dom-events';
import td from 'testdouble';
import {MDCTabs} from '../../../packages/mdc-tabs/tabs';

function getFixture() {
  return bel`
    <div>
      <nav id="basic-tabs" class="mdc-tabs">
        <a class="mdc-tab mdc-tab--active" href="#one">Item One</a>
        <a class="mdc-tab" href="#two">Item Two</a>
        <a class="mdc-tab" href="#three">Three</a>
        <span class="mdc-tabs__indicator"></span>
      </nav>
    </div>`;
}

function setupTest() {
  const fixture = getFixture();
  const root = fixture.querySelector('.mdc-tabs');
  const indicator = fixture.querySelector('.mdc-tabs__indicator');
  const component = new MDCTabs(root);
  return {fixture, root, indicator, component};
}

suite('MDCTabs');

test('attachTo returns a component instance', () => {
  assert.isOk(MDCTabs.attachTo(setupTest().root) instanceof MDCTabs);
});

test('adapter#addClass adds a class to the root element', () => {
  const {root, component} = setupTest();
  component.getDefaultFoundation().adapter_.addClass('foo');
  assert.isOk(root.classList.contains('foo'));
});

test('adapter#removeClass removes a class from the root element', () => {
  const {root, component} = setupTest();
  root.classList.add('foo');
  component.getDefaultFoundation().adapter_.removeClass('foo');
  assert.isNotOk(root.classList.contains('foo'));
});

test('adapter#bindOnMDCTabSelectedEvent listens for MDCTab:selected on ' +
     'the component', () => {
  const {component, fixture} = setupTest();

  component.getDefaultFoundation().adapter_.bindOnMDCTabSelectedEvent();
  domEvents.emit(fixture, 'MDCTab:selected');
});

test('adapter#unbindOnMDCTabSelectedEvent removes listener from component', () => {

});

test('adapter#registerResizeHandler adds resize listener to the component', () => {
  const {component} = setupTest();
  const handler = td.func('resizeHandler');

  component.getDefaultFoundation().adapter_.registerResizeHandler(handler);
  domEvents.emit(window, 'resize');

  td.verify(handler(td.matchers.anything()));
});

test('adapter#deregisterResizeHandler removes resize listener from component', () => {
  const {component} = setupTest();
  const handler = td.func('resizeHandler');

  window.addEventListener('resize', handler);
  component.getDefaultFoundation().adapter_.deregisterResizeHandler(handler);
  domEvents.emit(window, 'resize');

  td.verify(handler(td.matchers.anything()), {times: 0});
});

test('adapter#getOffsetWidth returns width of component', () => {
  const {root, component} = setupTest();
  const calculatedWidth =
    component.getDefaultFoundation().adapter_.getOffsetWidth();

  assert.equal(calculatedWidth, root.offsetWidth);
});

test('adapter#setStyleForIndicator sets a given property to the given value', () => {
  const {indicator, component} = setupTest();

  component.getDefaultFoundation().adapter_.setStyleForIndicator('width', '200px');
  assert.equal(indicator.style.width, '200px');
});

test('adapter#getOffsetWidthForIndicator returns the width of the active tab indicator', () => {
  const {indicator, component} = setupTest();
  const calculatedWidth =
    component.getDefaultFoundation().adapter_.getOffsetWidthForIndicator();

  assert.equal(calculatedWidth, indicator.offsetWidth);
});

test('adapter#notifyChange emits MDCTabs:change with event data', () => {
  const {component} = setupTest();

  const handler = td.func('changeHandler');

  component.listen('MDCTabs:change', handler);
  component.getDefaultFoundation().adapter_.notifyChange({});

  td.verify(handler(td.matchers.anything()));
});

test('adapter#getNumberOfTabs returns the number of tabs', () => {
  const {component} = setupTest();

  assert.equal(component.getDefaultFoundation().adapter_.getNumberOfTabs(), 3);
});

test('adapter#getActiveTab returns the active tab', () => {
  const {component} = setupTest();

  assert.equal(component.getDefaultFoundation().adapter_.getActiveTab(), component.activeTab);
});

test('adapter#isTabActiveAtIndex returns true if index equals activeTab index', () => {
  const {component} = setupTest();
  const targetIndex = 1;

  component.tabs[targetIndex].isActive = true;

  assert.isTrue(component.getDefaultFoundation().adapter_.isTabActiveAtIndex(targetIndex));
});

test('adapter#setTabActiveAtIndex sets tab at target index to true or false', () => {
  const {component} = setupTest();
  const targetIndex = 0;

  component.getDefaultFoundation().adapter_.setTabActiveAtIndex(targetIndex, true);

  assert.isTrue(component.tabs[targetIndex].foundation_.isActive());
});

test('adapter#isDefault PreventedOnClickForTabAtIndex returns the value ' +
  ' of preventsDefaultOnClick', () => {
  const {component} = setupTest();
  const targetIndex = 0;

  component.tabs[targetIndex].preventDefaultOnClick = true;

  assert.isTrue(component.getDefaultFoundation().adapter_.isDefaultPreventedOnClickForTabAtIndex(targetIndex));
});

test('adapter#setPreventDefaultOnClickForTabAtIndex sets preventDefault ' +
  ' for tab at index', () => {
  const {component} = setupTest();
  const targetIndex = 0;

  component.getDefaultFoundation().adapter_.setPreventDefaultOnClickForTabAtIndex(targetIndex, true);

  assert.isTrue(component.tabs[targetIndex].preventDefaultOnClick);
});

test('adapter#measureTabAtIndex returns dimenstions for a given tab', () => {
  const {component} = setupTest();
  const targetIndex = 0;

  component.getDefaultFoundation().adapter_.measureTabAtIndex(targetIndex);

  assert.equal(component.tabs[targetIndex].computedWidth_, component.tabs[targetIndex].root_.offsetWidth);
  assert.equal(component.tabs[targetIndex].computedLeft_, component.tabs[targetIndex].root_.offsetLeft);
});

test('adapter#getComputedWidthForTabAtIndex returns width for a given tab', () => {
  const {component} = setupTest();
  const targetIndex = 0;

  component.getDefaultFoundation().adapter_.measureTabAtIndex(targetIndex);

  assert.equal(component.getDefaultFoundation().adapter_.getComputedWidthForTabAtIndex(targetIndex),
    component.tabs[targetIndex].root_.offsetWidth);
});

test('adapter#getComputedLeftForTabAtIndex returns left offset for a given tab', () => {
  const {component} = setupTest();
  const targetIndex = 0;

  component.getDefaultFoundation().adapter_.measureTabAtIndex(targetIndex);

  assert.equal(component.getDefaultFoundation().adapter_.getComputedLeftForTabAtIndex(targetIndex),
    component.tabs[targetIndex].root_.offsetLeft);
});
