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
import { CoreCronHandler } from '@services/cron';
import { makeSingleton } from '@singletons';
import { AddonModAssignSync } from '../assign-sync';
import { ADDON_MOD_ASSIGN_SYNC_CRON_NAME } from '../../constants';

/**
 * Synchronization cron handler.
 */
@Injectable({ providedIn: 'root' })
export class AddonModAssignSyncCronHandlerService implements CoreCronHandler {

    name = ADDON_MOD_ASSIGN_SYNC_CRON_NAME;

    /**
     * @inheritdoc
     */
    execute(siteId?: string, force?: boolean): Promise<void> {
        return AddonModAssignSync.syncAllAssignments(siteId, force);
    }

    /**
     * @inheritdoc
     */
    getInterval(): number {
        return AddonModAssignSync.syncInterval;
    }

}
export const AddonModAssignSyncCronHandler = makeSingleton(AddonModAssignSyncCronHandlerService);
