// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
export interface TabStopsRequirementResult {
    id: string;
    description: string;
    name: string;
    instances; //Should we have a type for the instances?
    isExpanded: boolean;
}
