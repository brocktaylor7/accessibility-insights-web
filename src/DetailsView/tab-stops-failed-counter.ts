// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { TabStopsRequirementResult } from 'DetailsView/tab-stops-requirement-result';

const getFailedByRequirementId = (results: TabStopsRequirementResult[], requirementId: string) => {
    return (
        results.filter(requirement => {
            return requirement.id === requirementId;
        })[0].instances.length ?? 0
    );
};

const getTotalFailed = (results: TabStopsRequirementResult[]) => {
    let count = 0;
    results.forEach(requirement => {
        count += requirement.instances.length;
    });
    return count;
};

export const TabStopsFailedCounter = {
    getFailedByRequirementId,
    getTotalFailed,
};
