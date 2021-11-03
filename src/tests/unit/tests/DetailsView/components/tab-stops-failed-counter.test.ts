// Copyright (c) Microsoft Corporation. All rights reserved.

import { TabStopsFailedCounter } from 'DetailsView/tab-stops-failed-counter';
import { TabStopsRequirementResult } from 'DetailsView/tab-stops-requirement-result';

// Licensed under the MIT License.
describe('TabStopsFailedCounter', () => {
    let results = [] as TabStopsRequirementResult[];

    beforeEach(() => {
        results = [
            { instances: [{ id: 'test-id-1', description: 'test desc 1' }] },
        ] as TabStopsRequirementResult[];
    });

    test('getTotalFailed returns zero when there are no instances', () => {
        results = [];
        expect(TabStopsFailedCounter.getTotalFailed(results)).toBe(0);
    });

    test('getTotalFailed returns one result when a single failed instance is passed', () => {
        results = [
            { instances: [{ id: 'test-id-1', description: 'test desc 1' }] },
        ] as TabStopsRequirementResult[];
        expect(TabStopsFailedCounter.getTotalFailed(results)).toBe(1);
    });

    test('getTotalFailed counts all instances from all requirements', () => {
        results = [
            { id: 'test-req-id-1', instances: [{ id: 'test-id-1', description: 'test desc 1' }] },
            {
                id: 'test-req-id-2',
                instances: [
                    { id: 'test-id-2', description: 'test desc 2' },
                    { id: 'test-id-3', description: 'test desc 3' },
                ],
            },
        ] as TabStopsRequirementResult[];
        expect(TabStopsFailedCounter.getTotalFailed(results)).toBe(3);
    });

    test('getFailedByRequirementId returns zero when requirementId does not exist', () => {
        results = [
            { id: 'test-req-id-1', instances: [{ id: 'test-id-1', description: 'test desc 1' }] },
        ] as TabStopsRequirementResult[];
        expect(TabStopsFailedCounter.getFailedByRequirementId(results, 'non-existent-id')).toBe(0);
    });

    test('getFailedByRequirementId returns correct number of instances for requirement', () => {
        results = [
            { id: 'test-req-id-1', instances: [{ id: 'test-id-1', description: 'test desc 1' }] },
            {
                id: 'test-req-id-2',
                instances: [
                    { id: 'test-id-2', description: 'test desc 2' },
                    { id: 'test-id-3', description: 'test desc 3' },
                ],
            },
        ] as TabStopsRequirementResult[];
        expect(TabStopsFailedCounter.getFailedByRequirementId(results, 'test-req-id-2')).toBe(2);
    });
});
