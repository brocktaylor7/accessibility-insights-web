// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { VisualizationScanResultData } from 'common/types/store-data/visualization-scan-result-data';
import {
    AdhocTabStopsTestView,
    AdhocTabStopsTestViewDeps,
    AdhocTabStopsTestViewProps,
} from 'DetailsView/components/adhoc-tab-stops-test-view';
import { shallow } from 'enzyme';
import * as React from 'react';

describe('AdhocTabStopsTestView', () => {
    const visualizationScanResultDataStub = {} as VisualizationScanResultData;

    const props = {
        visualizationScanResultData: visualizationScanResultDataStub,
        deps: {} as AdhocTabStopsTestViewDeps,
    } as AdhocTabStopsTestViewProps;

    it('renders with content', () => {
        const rendered = shallow(<AdhocTabStopsTestView {...props} />);
        expect(rendered.getElement()).toMatchSnapshot();
    });
});
