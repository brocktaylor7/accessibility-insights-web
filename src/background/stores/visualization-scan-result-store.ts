// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { StoreNames } from 'common/stores/store-names';
import { VisualizationScanResultData } from 'common/types/store-data/visualization-scan-result-data';
import { TabStopEvent } from 'common/types/tab-stop-event';
import { ScanCompletedPayload } from 'injected/analyzers/analyzer';
import { DecoratedAxeNodeResult, HtmlElementAxeResults } from 'injected/scanner-utils';
import { forOwn, map } from 'lodash';
import { DictionaryStringTo } from 'types/common-types';
import { TabStopRequirementIds } from 'types/tab-stop-requirement-info';
import {
    AddTabbedElementPayload,
    AddTabStopInstancePayload,
    RemoveTabStopInstancePayload,
    ToggleTabStopRequirementExpandPayload,
    UpdateTabStopInstancePayload,
    UpdateTabStopRequirementStatusPayload,
} from '../actions/action-payloads';
import { TabActions } from '../actions/tab-actions';
import { VisualizationScanResultActions } from '../actions/visualization-scan-result-actions';
import { BaseStoreImpl } from './base-store-impl';
export class VisualizationScanResultStore extends BaseStoreImpl<VisualizationScanResultData> {
    private visualizationScanResultsActions: VisualizationScanResultActions;
    private tabActions: TabActions;
    private generateUID: () => string;

    constructor(
        visualizationScanResultActions: VisualizationScanResultActions,
        tabActions: TabActions,
        generateUID: () => string,
    ) {
        super(StoreNames.VisualizationScanResultStore);

        this.visualizationScanResultsActions = visualizationScanResultActions;
        this.tabActions = tabActions;
        this.generateUID = generateUID;
    }

    private getTestId = max => {
        const randNum = Math.floor(Math.random() * max);
        return 'test-id-' + randNum;
    };

    private getTestDesc = max => {
        const randNum = Math.floor(Math.random() * max);
        return 'test desc ' + randNum;
    };

    public getDefaultState(): VisualizationScanResultData {
        const requirements = {};
        for (const id of TabStopRequirementIds) {
            requirements[id] = {
                // TODO: REVERT
                // status: 'unknown',
                // instances: [],
                status: 'fail',
                instances: [
                    { description: this.getTestDesc(9), id: this.getTestId(1000) },
                    { description: this.getTestDesc(9), id: this.getTestId(1000) },
                ],
                isExpanded: false,
            };
        }
        const state: Partial<VisualizationScanResultData> = {
            tabStops: {
                tabbedElements: null,
                requirements,
            },
        };

        const keys = ['issues', 'landmarks', 'headings', 'color', 'needsReview'];

        keys.forEach(key => {
            state[key] = {
                fullAxeResultsMap: null,
                scanResult: null,
                fullIdToRuleResultMap: null,
            };
        });

        return state as VisualizationScanResultData;
    }

    protected addActionListeners(): void {
        this.visualizationScanResultsActions.scanCompleted.addListener(this.onScanCompleted);
        this.visualizationScanResultsActions.getCurrentState.addListener(this.onGetCurrentState);
        this.visualizationScanResultsActions.disableIssues.addListener(this.onIssuesDisabled);
        this.visualizationScanResultsActions.addTabbedElement.addListener(this.onAddTabbedElement);
        this.visualizationScanResultsActions.disableTabStop.addListener(this.onTabStopsDisabled);
        this.visualizationScanResultsActions.updateTabStopsRequirementStatus.addListener(
            this.onUpdateTabStopRequirementStatus,
        );
        this.visualizationScanResultsActions.addTabStopInstance.addListener(
            this.onAddTabStopInstance,
        );
        this.visualizationScanResultsActions.updateTabStopInstance.addListener(
            this.onUpdateTabStopInstance,
        );
        this.visualizationScanResultsActions.removeTabStopInstance.addListener(
            this.onRemoveTabStopInstance,
        );
        this.visualizationScanResultsActions.toggleTabStopRequirementExpandCollapse.addListener(
            this.onToggleTabStopRequirementExpandCollapse,
        );
        this.tabActions.existingTabUpdated.addListener(this.onExistingTabUpdated);
    }

    private onTabStopsDisabled = (): void => {
        this.state.tabStops.tabbedElements = null;
        this.emitChanged();
    };

    private onAddTabbedElement = (payload: AddTabbedElementPayload): void => {
        if (!this.state.tabStops.tabbedElements) {
            this.state.tabStops.tabbedElements = [];
        }

        let tabbedElementsWithoutTabOrder: TabStopEvent[] = map(
            this.state.tabStops.tabbedElements,
            element => {
                return {
                    timestamp: element.timestamp,
                    target: element.target,
                    html: element.html,
                };
            },
        );

        tabbedElementsWithoutTabOrder = tabbedElementsWithoutTabOrder.concat(
            payload.tabbedElements,
        );
        tabbedElementsWithoutTabOrder.sort((left, right) => left.timestamp - right.timestamp);

        this.state.tabStops.tabbedElements = map(
            tabbedElementsWithoutTabOrder,
            (element, index) => {
                return {
                    timestamp: element.timestamp,
                    target: element.target,
                    html: element.html,
                    tabOrder: index + 1,
                };
            },
        );

        this.emitChanged();
    };

    private onUpdateTabStopRequirementStatus = (
        payload: UpdateTabStopRequirementStatusPayload,
    ): void => {
        const { requirementId, status } = payload;
        this.state.tabStops.requirements[requirementId].status = status;
        this.emitChanged();
    };

    private onAddTabStopInstance = (payload: AddTabStopInstancePayload): void => {
        const { requirementId, description } = payload;
        this.state.tabStops.requirements[requirementId].instances.push({
            description,
            id: this.generateUID(),
        });
        this.emitChanged();
    };

    private onUpdateTabStopInstance = (payload: UpdateTabStopInstancePayload): void => {
        const { requirementId, id, description } = payload;
        this.state.tabStops.requirements[requirementId].instances.find(
            instance => instance.id === id,
        ).description = description;
        this.emitChanged();
    };

    private onRemoveTabStopInstance = (payload: RemoveTabStopInstancePayload): void => {
        const { requirementId, id } = payload;
        const newInstances = this.state.tabStops.requirements[requirementId].instances.filter(
            instance => instance.id !== id,
        );
        this.state.tabStops.requirements[requirementId].instances = newInstances;
        this.emitChanged();
    };

    private onToggleTabStopRequirementExpandCollapse = (
        payload: ToggleTabStopRequirementExpandPayload,
    ): void => {
        const { requirementId } = payload;
        console.log(requirementId);
        const requirement = this.state.tabStops.requirements[requirementId];
        requirement.isExpanded = !requirement.isExpanded;
        console.log(requirement);
        this.emitChanged();
    };

    private onScanCompleted = (payload: ScanCompletedPayload<any>): void => {
        const selectorMap = payload.selectorMap;
        const result = payload.scanResult;
        const selectedRows = this.getRowToRuleResultMap(selectorMap);

        this.state[payload.key].fullIdToRuleResultMap = selectedRows;
        this.state[payload.key].fullAxeResultsMap = selectorMap;
        this.state[payload.key].scanResult = result;

        this.emitChanged();
    };

    private onIssuesDisabled = (): void => {
        this.state.issues.scanResult = null;
        this.emitChanged();
    };

    private onExistingTabUpdated = (): void => {
        this.state = this.getDefaultState();
        this.emitChanged();
    };

    private getRowToRuleResultMap(
        selectorMap: DictionaryStringTo<HtmlElementAxeResults>,
    ): DictionaryStringTo<DecoratedAxeNodeResult> {
        const selectedRows: DictionaryStringTo<DecoratedAxeNodeResult> = {};

        forOwn(selectorMap, (selector: HtmlElementAxeResults) => {
            const ruleResults = selector.ruleResults;

            forOwn(ruleResults, (rule: DecoratedAxeNodeResult) => {
                selectedRows[rule.id] = rule;
            });
        });

        return selectedRows;
    }
}
