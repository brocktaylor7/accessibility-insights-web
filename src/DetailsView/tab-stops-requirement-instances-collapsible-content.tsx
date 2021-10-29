// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import { TabStopsRequirementResult } from 'DetailsView/tab-stops-requirement-result';
import * as React from 'react';

export type TabStopsRequirementInstancesCollapsibleContentProps = {
    requirement: TabStopsRequirementResult;
};
export const TabStopsRequirementInstancesCollapsibleContent =
    NamedFC<TabStopsRequirementInstancesCollapsibleContentProps>(
        'TabStopsRequirementInstancesCollapsibleContent',
        props => {
            return (
                <div>
                    {props.requirement.id} {props.requirement.instances[0].id}
                </div>
            );
        },
    );
