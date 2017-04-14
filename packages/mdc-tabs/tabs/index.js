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

import MDCComponent from '@material/base/component';

import {MDCTab} from '../tab';
import {strings} from './constants';
import MDCTabsFoundation from './foundation';

export {MDCTabsFoundation};

export class MDCTabs extends MDCComponent {
  static attachTo(root) {
    return new MDCTabs(root);
  }

  get tabs() {
    return this.tabs_;
  }

  get activeTab() {
    if (this.activeTabIndex < 0) {
      return null;
    }

    return this.tabs[this.activeTabIndex];
  }

  set activeTab(activeTab) {
    this.setActiveTab_(activeTab, false);
  }

  get activeTabIndex() {
    return this.foundation_.getActiveTabIndex();
  }

  set activeTabIndex(activeTabIndex) {
    this.setActiveTabIndex_(activeTabIndex, false);
  }

  get computedWidth() {
    return this.foundation_.getComputedWidth();
  }

  get computedLeft() {
    return this.computedLeft_;
  }

  initialize(tabFactory = (el) => new MDCTab(el)) {
    this.indicator_ = this.root_.querySelector(strings.INDICATOR_SELECTOR);
    this.tabs_ = this.gatherTabs_(tabFactory);
    this.tabSelectedHandler_ = ({detail}) => {
      const {tab} = detail;
      this.setActiveTab_(tab, true);
    };
  }

  getDefaultFoundation() {
    return new MDCTabsFoundation({
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      bindOnMDCTabSelectedEvent: () => this.root_.addEventListener('MDCTab:selected', this.tabSelectedHandler_, true),
      unbindOnMDCTabSelectedEvent: () =>
        this.root_.removeEventListener('MDCTab:selected', this.tabSelectedHandler_, true),
      registerResizeHandler: (handler) => window.addEventListener('resize', handler),
      deregisterResizeHandler: (handler) => window.removeEventListener('resize', handler),
      getOffsetWidth: () => this.root_.offsetWidth,
      setStyleForIndicator: (propertyName, value) => this.indicator_.style.setProperty(propertyName, value),
      getOffsetWidthForIndicator: () => this.indicator_.offsetWidth,
      notifyChange: (evtData) => this.emit('MDCTabs:change', evtData),
      getNumberOfTabs: () => this.tabs.length,
      getActiveTab: () => this.activeTab,
      isTabActiveAtIndex: (index) => this.tabs[index].isActive,
      setTabActiveAtIndex: (index, isActive) => this.tabs[index].isActive = isActive,
      isDefaultPreventedOnClickForTabAtIndex: (index) => this.tabs[index].preventDefaultOnClick,
      setPreventDefaultOnClickForTabAtIndex: (index, preventDefaultOnClick) => {
        this.tabs[index].preventDefaultOnClick = preventDefaultOnClick;
      },
      measureTabAtIndex: (index) => this.measureSelf_(this.tabs[index]),
      getComputedWidthForTabAtIndex: (index) => this.tabs[index].computedWidth_,
      getComputedLeftForTabAtIndex: (index) => this.tabs[index].computedLeft_,
    });
  }

  initialSyncWithDOM() {
    this.syncActiveTab_();
  }

  gatherTabs_(tabFactory) {
    const tabElements = [].slice.call(this.root_.querySelectorAll(strings.TAB_SELECTOR));
    return tabElements.map((el) => tabFactory(el));
  }

  setActiveTab_(activeTab, notifyChange) {
    const indexOfTab = this.tabs.indexOf(activeTab);
    if (indexOfTab < 0) {
      throw new Error('Invalid tab component give as activeTab: Tab not found within this component\'s tab list');
    }
    this.setActiveTabIndex_(indexOfTab, notifyChange);
  }

  setActiveTabIndex_(activeTabIndex, notifyChange) {
    this.foundation_.switchToTabAtIndex(activeTabIndex, notifyChange);
  }

  syncActiveTab_() {
    let activeTabIndex = this.tabs.findIndex((t) => t.isActive);
    if (activeTabIndex < 0) {
      activeTabIndex = 0;
    }
    this.activeTabIndex = activeTabIndex;
  }

  measureSelf_(tab) {
    tab.computedWidth_ = tab.root_.offsetWidth;
    tab.computedLeft_ = tab.root_.offsetLeft;
  }
}
