// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface TabStopsRequirementResultInstance {
    id: string;
    description: string;
}
export interface TabStopsRequirementResult {
    id: string;
    description: string;
    name: string;
    instances: TabStopsRequirementResultInstance[];
    isExpanded: boolean;
}
