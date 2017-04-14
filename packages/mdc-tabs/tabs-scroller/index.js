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

import MDCTabsScrollerFoundation from './foundation';

export {MDCTabsScrollerFoundation};

export class MDCTabsScroller extends MDCComponent {
  static attachTo(root) {
    return new MDCTabsScroller(root);
  }

  get scrollFrame() {
    return this.root_.querySelector(MDCTabsScrollerFoundation.strings.FRAME_SELECTOR);
  }

  get tabs() {
    return this.root_.querySelector(MDCTabsScrollerFoundation.strings.TABS_SELECTOR);
  }

  get shiftLeftTarget() {
    return this.root_.querySelector(MDCTabsScrollerFoundation.strings.INDICATOR_LEFT_SELECTOR);
  }

  get shiftRightTarget() {
    return this.root_.querySelector(MDCTabsScrollerFoundation.strings.INDICATOR_RIGHT_SELECTOR);
  }

  get listOfTabNodes() {
    const tabNodesArray =
      Array.prototype.slice.call(this.root_.querySelectorAll(MDCTabsScrollerFoundation.strings.TAB_SELECTOR));

    return tabNodesArray;
  }

  initialize() {
    this.isRTL = false;
    this.currentTranslateOffset_ = 0;
    this.computedFrameWidth_ = 0;
    requestAnimationFrame(() => this.layout());
  }

  getDefaultFoundation() {
    return new MDCTabsScrollerFoundation({
      isRTL: () =>
        getComputedStyle(this.root_).getPropertyValue('direction') === 'rtl',
      registerLeftIndicatorInteractionHandler: (handler) =>
        this.shiftLeftTarget.addEventListener('click', handler),
      deregisterLeftIndicatorInteractionHandler: (handler) =>
        this.shiftLeftTarget.removeEventListener('click', handler),
      registerRightIndicatorInteractionHandler: (handler) =>
        this.shiftRightTarget.addEventListener('click', handler),
      deregisterRightIndicatorInteractionHandler: (handler) =>
        this.shiftRightTarget.removeEventListener('click', handler),
      registerWindowResizeHandler: (handler) =>
        window.addEventListener('resize', handler),
      deregisterWindowResizeHandler: (handler) =>
        window.removeEventListener('resize', handler),
      triggerNewLayout: () => requestAnimationFrame(() => this.layout()),
      scrollLeft: (isRTL) => this.scrollLeft(isRTL),
      scrollRight: (isRTL) => this.scrollRight(isRTL),
    });
  }

  layout() {
    this.computedFrameWidth_ = this.scrollFrame.offsetWidth;

    const isOverflowing = this.tabs.offsetWidth > this.computedFrameWidth_;

    if (isOverflowing) {
      this.tabs.classList.add(MDCTabsScrollerFoundation.cssClasses.VISIBLE);
    } else {
      this.tabs.classList.remove(MDCTabsScrollerFoundation.cssClasses.VISIBLE);
      this.currentTranslateOffset_ = 0;
      this.shiftFrame_();
    }

    this.updateIndicatorEnabledStates_();
  }

  scrollLeft(isRTL) {
    let scrollTarget;
    let tabWidthAccumulator = 0;

    this.isRTL = isRTL;

    for (let i = this.listOfTabNodes.length - 1, tab; tab = this.listOfTabNodes[i]; i--) {
      const tabOffsetX = this.isRTL ?
        this.getRTLNormalizedOffsetLeftForTab_(tab) : tab.offsetLeft;

      if (tabOffsetX >= this.currentTranslateOffset_) {
        continue;
      }

      tabWidthAccumulator += tab.offsetWidth;

      if (tabWidthAccumulator > this.scrollFrame.offsetWidth) {
        scrollTarget = this.isRTL ?
          this.listOfTabNodes[this.listOfTabNodes.indexOf(tab) + 1] :
          this.listOfTabNodes[this.listOfTabNodes.indexOf(tab) - 1];
        break;
      }
    }

    if (!scrollTarget) {
      scrollTarget = this.listOfTabNodes[0];
    }

    this.scrollToTab(scrollTarget);
  }

  scrollRight(isRTL) {
    let scrollTarget;
    const tabsOffset = this.computedFrameWidth_ + this.currentTranslateOffset_;

    this.isRTL = isRTL;

    for (const tab of this.listOfTabNodes) {
      const tabOffsetX = this.isRTL ?
        this.getRTLNormalizedOffsetLeftForTab_(tab) : tab.offsetLeft;

      if (tabOffsetX + tab.offsetWidth >= tabsOffset) {
        scrollTarget = tab;
        break;
      }
    }

    if (!scrollTarget) {
      return;
    }

    this.scrollToTab(scrollTarget);
  }

  scrollToTab(tab) {
    this.currentTranslateOffset_ = this.isRTL ?
      this.tabs.offsetWidth - (tab.offsetLeft + tab.offsetWidth) :
      tab.offsetLeft;
    requestAnimationFrame(() => this.shiftFrame_());
  }

  getRTLNormalizedOffsetLeftForTab_(tab) {
    return this.tabs.offsetWidth - (tab.offsetLeft + tab.offsetWidth);
  }

  shiftFrame_() {
    const shiftAmount = this.isRTL ?
      this.currentTranslateOffset_ : -this.currentTranslateOffset_;

    this.tabs.style.transform =
      this.tabs.style.webkitTransform = `translateX(${shiftAmount}px)`;

    this.updateIndicatorEnabledStates_();
  }

  updateIndicatorEnabledStates_() {
    if (this.currentTranslateOffset_ === 0) {
      this.shiftLeftTarget.classList.add(MDCTabsScrollerFoundation.cssClasses.INDICATOR_DISABLED);
    } else {
      this.shiftLeftTarget.classList.remove(MDCTabsScrollerFoundation.cssClasses.INDICATOR_DISABLED);
    }

    if (this.currentTranslateOffset_ + this.scrollFrame.offsetWidth > this.tabs.offsetWidth) {
      this.shiftRightTarget.classList.add(MDCTabsScrollerFoundation.cssClasses.INDICATOR_DISABLED);
    } else {
      this.shiftRightTarget.classList.remove(MDCTabsScrollerFoundation.cssClasses.INDICATOR_DISABLED);
    }
  }
}
