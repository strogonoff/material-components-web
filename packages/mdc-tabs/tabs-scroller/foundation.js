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


import MDCFoundation from '@material/base/foundation';

import {cssClasses, strings} from './constants';

export default class MDCTabsScrollerFoundation extends MDCFoundation {
  static get cssClasses() {
    return cssClasses;
  }

  static get strings() {
    return strings;
  }

  static get defaultAdapter() {
    return {
      isRTL: () => /* boolean */ false,
      registerLeftIndicatorInteractionHandler: (/* handler: EventListener */) => {},
      deregisterLeftIndicatorInteractionHandler: (/* handler: EventListener */) => {},
      registerRightIndicatorInteractionHandler: (/* handler: EventListener */) => {},
      deregisterRightIndicatorInteractionHandler: (/* handler: EventListener */) => {},
      registerWindowResizeHandler: (/* handler: EventListener */) => {},
      deregisterWindowResizeHandler: () => {},
      triggerNewLayout: () => {},
      scrollLeft: () => {},
      scrollRight: () => {},
    };
  }

  constructor(adapter) {
    super(Object.assign(MDCTabsScrollerFoundation.defaultAdapter, adapter));

    this.rightIndicatorClickHandler = () => this.scrollRight(this.adapter_.isRTL());
    this.leftIndicatorClickHandler = () => this.scrollLeft(this.adapter_.isRTL());
  }

  init() {
    this.adapter_.registerLeftIndicatorInteractionHandler(this.leftIndicatorClickHandler);
    this.adapter_.registerRightIndicatorInteractionHandler(this.rightIndicatorClickHandler);
    this.adapter_.registerWindowResizeHandler(this.adapter_.triggerNewLayout);
  }

  destroy() {
    this.adapter_.deregisterLeftIndicatorInteractionHandler(this.leftIndicatorClickHandler);
    this.adapter_.deregisterRightIndicatorInteractionHandler(this.rightIndicatorClickHandler);
    this.adapter_.deregisterWindowResizeHandler(this.adapter_.triggerNewLayout);
  }

  scrollRight(isRTL) {
    this.adapter_.scrollRight(isRTL);
  }

  scrollLeft(isRTL) {
    this.adapter_.scrollLeft(isRTL);
  }
}
