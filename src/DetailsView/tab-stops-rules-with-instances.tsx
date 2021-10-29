// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import {
    CollapsibleComponentCardsDeps,
    CollapsibleComponentCardsProps,
} from 'common/components/cards/collapsible-component-cards';
import { NamedFC } from 'common/react/named-fc';
import { DetailsViewActionMessageCreator } from 'DetailsView/actions/details-view-action-message-creator';
import { TabStopsFailedCounter } from 'DetailsView/tab-stops-failed-counter';
import { TabStopsMinimalRuleHeader } from 'DetailsView/tab-stops-minimal-rule-header';
import { TabStopsRequirementInstancesCollapsibleContent } from 'DetailsView/tab-stops-requirement-instances-collapsible-content';
import { TabStopsRequirementResult } from 'DetailsView/tab-stops-requirement-result';
import * as React from 'react';
import { InstanceOutcomeType } from 'reports/components/instance-outcome-type';
import { outcomeTypeSemantics } from 'reports/components/outcome-type';

import * as styles from './tab-stops-rules-with-instances.scss';

export const resultsGroupAutomationId = 'tab-stops-results-group';

export type TabStopsRulesWithInstancesDeps = CollapsibleComponentCardsDeps & {
    collapsibleControl: (props: CollapsibleComponentCardsProps) => JSX.Element;
    detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
};

export type TabStopsRulesWithInstancesProps = {
    deps: TabStopsRulesWithInstancesDeps;
    results: TabStopsRequirementResult[];
    outcomeType: InstanceOutcomeType;
    headingLevel: number;
};

export const TabStopsRulesWithInstances = NamedFC<TabStopsRulesWithInstancesProps>(
    'TabStopsRulesWithInstances',
    ({ results, deps, headingLevel }) => {
        const getCollapsibleComponentProps = (
            result: TabStopsRequirementResult,
            idx: number,
            buttonAriaLabel: string,
        ) => {
            return {
                id: result.id,
                key: `summary-details-${idx + 1}`,
                header: <TabStopsMinimalRuleHeader key={result.id} requirement={result} />,
                content: (
                    <TabStopsRequirementInstancesCollapsibleContent
                        key={`${result.id}-rule-group`}
                        requirement={result}
                    />
                ),
                containerAutomationId: resultsGroupAutomationId,
                containerClassName: styles.collapsibleRuleDetailsGroup,
                buttonAriaLabel: buttonAriaLabel,
                headingLevel,
                deps: deps,
                onExpandToggle: (event: React.MouseEvent<HTMLDivElement>) => {
                    deps.detailsViewActionMessageCreator.toggleTabStopRequirementExpand(
                        result.id,
                        event,
                    );
                },
                isExpanded: result.isExpanded,
            };
        };

        return (
            <div className={styles.ruleDetailsGroup}>
                {results.map((requirement, idx) => {
                    const { pastTense } = outcomeTypeSemantics.fail;
                    const count = TabStopsFailedCounter.getFailedByRequirementId(
                        results,
                        requirement.id,
                    );
                    const buttonAriaLabel = `${requirement.id} ${count} ${pastTense} ${requirement.description}`;
                    const CollapsibleComponent = deps.collapsibleControl(
                        getCollapsibleComponentProps(requirement, idx, buttonAriaLabel),
                    );
                    return CollapsibleComponent;
                })}
            </div>
        );
    },
);
