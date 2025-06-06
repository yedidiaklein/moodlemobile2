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

import { CoreBlockHandlerData } from '@features/block/services/block-delegate';
import { CoreBlockBaseHandler } from '@features/block/classes/base-block-handler';
import { makeSingleton } from '@singletons';
import { AddonBlog } from '@addons/blog/services/blog';

/**
 * Block handler.
 */
@Injectable({ providedIn: 'root' })
export class AddonBlockBlogMenuHandlerService extends CoreBlockBaseHandler {

    name = 'AddonBlockBlogMenu';
    blockName = 'blog_menu';

    /**
     * @inheritdoc
     */
    async isEnabled(): Promise<boolean> {
        return await AddonBlog.isPluginEnabled();
    }

    /**
     * @inheritdoc
     */
    async getDisplayData(): Promise<CoreBlockHandlerData> {
        const { AddonBlockBlogMenuComponent } = await import('../components/blogmenu/blogmenu');

        return {
            title: 'addon.block_blogmenu.pluginname',
            class: 'addon-block-blog-menu',
            component: AddonBlockBlogMenuComponent,
        };
    }

}

export const AddonBlockBlogMenuHandler = makeSingleton(AddonBlockBlogMenuHandlerService);
