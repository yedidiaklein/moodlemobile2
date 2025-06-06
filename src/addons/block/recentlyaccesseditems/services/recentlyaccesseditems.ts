// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Injectable } from '@angular/core';
import { CoreSites } from '@services/sites';
import { CoreDom } from '@singletons/dom';
import { CoreCourseModuleHelper } from '@features/course/services/course-module-helper';
import { CoreSiteWSPreSets } from '@classes/sites/authenticated-site';
import { makeSingleton } from '@singletons';
import { CoreCourseModuleDelegate } from '@features/course/services/module-delegate';

/**
 * Service that provides some features regarding recently accessed items.
 */
@Injectable( { providedIn: 'root' })
export class AddonBlockRecentlyAccessedItemsProvider {

    protected static readonly ROOT_CACHE_KEY = 'AddonBlockRecentlyAccessedItems:';

    /**
     * Get cache key for get last accessed items value WS call.
     *
     * @returns Cache key.
     */
    protected getRecentItemsCacheKey(): string {
        return `${AddonBlockRecentlyAccessedItemsProvider.ROOT_CACHE_KEY}:recentitems`;
    }

    /**
     * Get last accessed items from WS.
     *
     * @param siteId Site ID. If not defined, use current site.
     * @returns Promise resolved when the info is retrieved.
     */
    protected async getRecentItemsWS(siteId?: string): Promise<AddonBlockRecentlyaccesseditemsGetRecentItemsWSResponse[]> {
        const site = await CoreSites.getSite(siteId);

        const preSets: CoreSiteWSPreSets = {
            cacheKey: this.getRecentItemsCacheKey(),
        };

        return await site.read('block_recentlyaccesseditems_get_recent_items', undefined, preSets);
    }

    /**
     * Get last accessed items.
     *
     * @param siteId Site ID. If not defined, use current site.
     * @returns Promise resolved when the info is retrieved with some calculated data.
     */
    async getRecentItems(siteId?: string): Promise<AddonBlockRecentlyAccessedItemsItemCalculatedData[]> {
        const site = await CoreSites.getSite(siteId);

        const items = await this.getRecentItemsWS(site.getId());

        const cmIds: number[] = [];

        const itemsToDisplay = await Promise.all(items.map(async (item: AddonBlockRecentlyAccessedItemsItemCalculatedData) => {
            const iconImgEl = this.getItemIconElement(item);

            item.iconUrl = await CoreCourseModuleDelegate.getModuleIconSrc(item.modname, iconImgEl?.src);
            item.iconTitle = iconImgEl?.title;
            cmIds.push(item.cmid);

            return item;
        }));

        // Check if the viewed module should be updated for each activity.
        const lastViewedMap = await CoreCourseModuleHelper.getCertainModulesViewed(cmIds, site.getId());

        itemsToDisplay.forEach((recentItem) => {
            const timeAccess = recentItem.timeaccess * 1000;
            const lastViewed = lastViewedMap[recentItem.cmid];

            if (lastViewed && lastViewed.timeaccess >= timeAccess) {
                return; // No need to update.
            }

            // Update access.
            CoreCourseModuleHelper.storeModuleViewed(recentItem.courseid, recentItem.cmid, {
                timeaccess: recentItem.timeaccess * 1000,
                sectionId: lastViewed && lastViewed.sectionId,
                siteId: site.getId(),
            });
        });

        return itemsToDisplay;
    }

    /**
     * Given a recently accessed item, return the icon img element if found in the item's icon HTML.
     *
     * @param item Item to use.
     * @returns Icon img element if found.
     */
    protected getItemIconElement(item: AddonBlockRecentlyaccesseditemsGetRecentItemsWSResponse): HTMLImageElement | undefined {
        if (!item.icon) {
            return;
        }

        const element: Element | undefined = CoreDom.toDom(item.icon)[0];
        if (!element) {
            return;
        }

        if (element.tagName === 'IMG') {
            return element as HTMLImageElement;
        }

        return element.querySelector('img') || undefined;
    }

    /**
     * Invalidates get last accessed items WS call.
     *
     * @param siteId Site ID to invalidate. If not defined, use current site.
     */
    async invalidateRecentItems(siteId?: string): Promise<void> {
        const site = await CoreSites.getSite(siteId);

        await site.invalidateWsCacheForKey(this.getRecentItemsCacheKey());
    }

}
export const AddonBlockRecentlyAccessedItems = makeSingleton(AddonBlockRecentlyAccessedItemsProvider);

/**
 * Data returned by block_recentlyaccesseditems_get_recent_items WS.
 *
 * The most recently accessed activities/resources by the logged user.
 */
type AddonBlockRecentlyaccesseditemsGetRecentItemsWSResponse = {
    id: number; // Id.
    courseid: number; // Courseid.
    cmid: number; // Cmid.
    userid: number; // Userid.
    modname: string; // Modname.
    name: string; // Name.
    coursename: string; // Coursename.
    timeaccess: number; // Timeaccess.
    viewurl: string; // Viewurl.
    courseviewurl: string; // Courseviewurl.
    icon: string; // Icon.
    purpose?: string; // Purpose. @since 4.0
    branded?: boolean; // Branded. @since 4.4
};

/**
 * Calculated data for recently accessed item.
 */
export type AddonBlockRecentlyAccessedItemsItemCalculatedData = AddonBlockRecentlyaccesseditemsGetRecentItemsWSResponse & {
    iconUrl: string; // Icon URL. Calculated by the app.
    iconTitle?: string | null; // Icon title.
};
