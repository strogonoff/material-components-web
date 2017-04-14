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
import {createMockRaf} from '../helpers/raf';
import {supportsCssVariables} from '../../../packages/mdc-ripple/util';
import {MDCTabsScroller} from '../../../packages/mdc-tabs/tabs-scroller';

function getFixture() {
  return bel`
    <div>
      <div id="tabs-scroller" class="mdc-tabs-scroller">
        <div class="mdc-tabs-scroller__indicator mdc-tabs-scroller__indicator--left">
          <a class="mdc-tabs-scroller__indicator__inner material-icons" href="#" aria-label="scroll back button">
            keyboard-arrow-left
          </a>
        </div>
        <div class="mdc-tabs-scroller__scroll-frame">
          <nav id="scrollable-tabs" class="mdc-tabs mdc-tabs-scroller__scroll-frame__tabs">
            <a class="mdc-tab mdc-tab--active" href="#one">Item One</a>
            <a class="mdc-tab" href="#two">Item Two</a>
            <a class="mdc-tab" href="#three">Item Three</a>
            <a class="mdc-tab" href="#four">Item Four</a>
            <a class="mdc-tab" href="#five">Item Five</a>
            <a class="mdc-tab" href="#six">Item Six</a>
            <a class="mdc-tab" href="#seven">Item Seven</a>
            <a class="mdc-tab" href="#eight">Item Eight</a>
            <a class="mdc-tab" href="#nine">Item Nine</a>
            <span class="mdc-tabs__indicator"></span>
          </nav>
        </div>
        <div class="mdc-tabs-scroller__indicator mdc-tabs-scroller__indicator--right">
          <a class="mdc-tabs-scroller__indicator__inner material-icons" href="#" aria-label="scroll forward button">
            keyboard-arrow-right
          </a>
        </div>
      </div>
    </div>`;
}

function setupTest() {
  const fixture = getFixture();
  const root = fixture.querySelector('.mdc-tabs-scroller');
  const tabs = fixture.querySelector('.mdc-tabs-scroller__scroll-frame__tabs');
  const leftIndicator =
    fixture.querySelector('.mdc-tabs-scroller__indicator--left');
  const rightIndicator =
    fixture.querySelector('.mdc-tabs-scroller__indicator--right');
  const scrollFrame =
    fixture.querySelector('.mdc-tabs-scroller__scroll-frame');

  const component = new MDCTabsScroller(root);

  return {fixture, root, leftIndicator, rightIndicator, scrollFrame, tabs, component};
}

suite('MDCTabsScroller');

test('attachTo returns a component instance', () => {
  const {root} = setupTest();

  assert.isTrue(MDCTabsScroller.attachTo(root) instanceof MDCTabsScroller);
});

test('adapter#isRTL returns true if in RTL context', () => {
  const {component} = setupTest();

  assert.isFalse(component.getDefaultFoundation().adapter_.isRTL());
});

test('adapter#registerLeftIndicatorInteractionHandler', () => {
  const {component, leftIndicator} = setupTest();
  const handler = td.func('eventHandler');

  component.getDefaultFoundation().adapter_.registerLeftIndicatorInteractionHandler(handler);
  domEvents.emit(leftIndicator, 'click');

  td.verify(handler(td.matchers.anything()));
});

test('adapter#registerRightIndicatorInteractionHandler', () => {
  const {component, rightIndicator} = setupTest();
  const handler = td.func('eventHandler');

  component.getDefaultFoundation().adapter_.registerRightIndicatorInteractionHandler(handler);
  domEvents.emit(rightIndicator, 'click');

  td.verify(handler(td.matchers.anything()));
});

test('adapter#registerResizeHandler adds resize listener to the component', () => {
  const {component} = setupTest();
  const handler = td.func('resizeHandler');

  component.getDefaultFoundation().adapter_.registerWindowResizeHandler(handler);
  domEvents.emit(window, 'resize');

  td.verify(handler(td.matchers.anything()));
});

test('adapter#deregisterResizeHandler removes resize listener from component', () => {
  const {component} = setupTest();
  const handler = td.func('resizeHandler');

  window.addEventListener('resize', handler);
  component.getDefaultFoundation().adapter_.deregisterWindowResizeHandler(handler);
  domEvents.emit(window, 'resize');

  td.verify(handler(td.matchers.anything()), {times: 0});
});


test('adapter#triggerNewLayout lays out the scrollable tabs', () => {
  const {component} = setupTest();

  component.getDefaultFoundation().adapter_.triggerNewLayout();
});

if (supportsCssVariables(window)) {
  test('adapter#scrollLeft decreases translateX of tab group', () => {
    const {component} = setupTest();
    const rtlContext = false;
    const raf = createMockRaf();
    raf.flush();

    component.tabs.style.transform = component.tabs.style.webkitTransform = 'translateX(50px)';
    component.getDefaultFoundation().adapter_.scrollLeft(rtlContext);
    raf.flush();

    assert.isTrue(component.tabs.style.webkitTransform === 'translateX(0px)');
    raf.restore();
  });

  test('adapter#scrollRight increases translateX of tab group', () => {
    const {component} = setupTest();
    const rtlContext = false;
    const raf = createMockRaf();

    raf.flush();

    component.getDefaultFoundation().adapter_.scrollRight(rtlContext);
    raf.flush();

    assert.isTrue(component.tabs.style.webkitTransform === 'translateX(0px)');
    raf.restore();
  });
}
