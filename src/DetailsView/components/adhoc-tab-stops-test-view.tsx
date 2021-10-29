// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ResultSectionDeps } from 'common/components/cards/result-section';
import { NamedFC } from 'common/react/named-fc';
import { VisualizationScanResultData } from 'common/types/store-data/visualization-scan-result-data';

import { RequirementInstructions } from 'DetailsView/components/requirement-instructions';
import { TabStopsFailedInstanceSection } from 'DetailsView/components/tab-stops-failed-instance-section';

import * as React from 'react';

export type AdhocTabStopsTestViewDeps = ResultSectionDeps;

export interface AdhocTabStopsTestViewProps {
    deps: AdhocTabStopsTestViewDeps;
    visualizationScanResultData: VisualizationScanResultData;
}

const howToTest: JSX.Element = (
    <ol>
        <li>
            Locate the visual helper on the target page, it will highlight element in focus with an
            empty circle.
        </li>
        <li>
            Use your keyboard to move input focus through all the interactive elements in the page:
            <ol>
                <li>Use Tab and Shift+Tab to navigate between standalone controls. </li>
                <li>
                    Use the arrow keys to navigate between the focusable elements within a composite
                    control.
                </li>
            </ol>
        </li>
    </ol>
);

export const AdhocTabStopsTestView = NamedFC<AdhocTabStopsTestViewProps>(
    'AdhocTabStopsTestView',
    props => {
        return (
            <>
                <RequirementInstructions howToTest={howToTest} />
                <TabStopsFailedInstanceSection {...props} />
            </>
        );
    },
);
