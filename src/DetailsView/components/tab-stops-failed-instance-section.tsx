// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { css } from '@uifabric/utilities';
import { CollapsibleComponentCardsDeps } from 'common/components/cards/collapsible-component-cards';
import { ResultSectionTitle } from 'common/components/cards/result-section-title';
import { VisualizationScanResultData } from 'common/types/store-data/visualization-scan-result-data';
import { AdhocTabStopsTestViewDeps } from 'DetailsView/components/adhoc-tab-stops-test-view';
import { requirements } from 'DetailsView/components/tab-stops/requirements';
import { TabStopsFailedCounter } from 'DetailsView/tab-stops-failed-counter';
import { TabStopsRequirementResult } from 'DetailsView/tab-stops-requirement-result';
import {
    TabStopsRulesWithInstances,
    TabStopsRulesWithInstancesDeps,
} from 'DetailsView/tab-stops-rules-with-instances';
import * as React from 'react';
import * as styles from './tab-stops-failed-instance-section.scss';

export type TabStopsFailedInstanceSectionDeps = AdhocTabStopsTestViewDeps &
    CollapsibleComponentCardsDeps &
    TabStopsRulesWithInstancesDeps;

export interface TabStopsFailedInstanceSectionProps {
    deps: TabStopsFailedInstanceSectionDeps;
    visualizationScanResultData: VisualizationScanResultData;
}

export const tabStopsFailedInstanceSectionAutomationId = 'tab-stops-failure-instance-section';

export class TabStopsFailedInstanceSection extends React.Component<TabStopsFailedInstanceSectionProps> {
    private getTabStopRequirementsResults = (): TabStopsRequirementResult[] => {
        const result = [];
        const storeData = this.props.visualizationScanResultData;
        for (const [requirementId, data] of Object.entries(storeData.tabStops.requirements)) {
            if (data.status === 'fail') {
                result.push({
                    id: requirementId,
                    name: requirements[requirementId].name,
                    description: requirements[requirementId].description,
                    instances: data.instances,
                    isExpanded: data.isExpanded,
                });
            }
        }
        return result;
    };

    public render(): JSX.Element {
        const results = this.getTabStopRequirementsResults();
        return (
            <div
                className={css(null, styles.tabStopsFailureInstanceSection)}
                data-automation-id={tabStopsFailedInstanceSectionAutomationId}
            >
                <h2>
                    <ResultSectionTitle
                        title="Failed instances"
                        badgeCount={TabStopsFailedCounter.getTotalFailed(results)}
                        outcomeType="fail"
                        titleSize="title"
                    />
                </h2>
                <TabStopsRulesWithInstances
                    results={results}
                    headingLevel={3}
                    outcomeType="fail"
                    {...this.props}
                />
            </div>
        );
    }
}
