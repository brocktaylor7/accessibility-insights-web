// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { EventResponseFactory } from 'common/browser-adapters/event-response-factory';
import { TimeoutError } from 'common/promises/promise-factory';
import { TimeSimulatingPromiseFactory } from 'tests/unit/common/time-simulating-promise-factory';

describe(EventResponseFactory, () => {
    let timeSimulatingPromiseFactory: TimeSimulatingPromiseFactory;
    let testSubject: EventResponseFactory;

    beforeEach(() => {
        timeSimulatingPromiseFactory = new TimeSimulatingPromiseFactory();
    });

    describe('applyFireAndForgetDelay', () => {
        it('applies a 30 second delay for service workers', async () => {
            testSubject = new EventResponseFactory(timeSimulatingPromiseFactory, true);

            const result = testSubject.applyFireAndForgetDelay('original');

            await expect(result).resolves.toBe('original');
            expect(timeSimulatingPromiseFactory.elapsedTime).toBe(30000);
        });

        it('does not apply any delay outside of service workers', async () => {
            testSubject = new EventResponseFactory(timeSimulatingPromiseFactory, false);

            const result = testSubject.applyFireAndForgetDelay('original');

            await expect(result).resolves.toBe('original');
            expect(timeSimulatingPromiseFactory.elapsedTime).toBe(0);
        });
    });

    describe('applyEventTimeout', () => {
        it.each([true, false])(
            'applies a 60 second timeout when isServiceWorker=%p',
            async isServiceWorker => {
                testSubject = new EventResponseFactory(
                    timeSimulatingPromiseFactory,
                    isServiceWorker,
                );

                const slowPromise = timeSimulatingPromiseFactory.externalResolutionPromise();
                const result = testSubject.applyEventTimeout(slowPromise.promise, 'error context');

                await expect(result).rejects.toBeInstanceOf(TimeoutError);
                expect(timeSimulatingPromiseFactory.elapsedTime).toBe(60000);

                slowPromise.resolveHook(null); // clean up floating promise
            },
        );
    });

    describe('mergeInterpreterResponses', () => {
        beforeEach(() => {
            testSubject = new EventResponseFactory(timeSimulatingPromiseFactory, true);
        });

        it('returns messageHandled false if no interpreter handled the message', () => {
            const output = testSubject.mergeInterpreterResponses([
                { messageHandled: false },
                { messageHandled: false },
                { messageHandled: false },
            ]);

            expect(output).toStrictEqual({ messageHandled: false });
        });

        it('delegates to mergeResponses behavior if some interpreters handle the message', () => {
            const mixedResponses = [
                { messageHandled: true },
                { messageHandled: false },
                { messageHandled: true, result: Promise.resolve() },
            ];
            const handledResults = [undefined, mixedResponses[2].result];

            const mergeResponsesResult = Promise.resolve();
            testSubject.mergeResponses = jest.fn(() => mergeResponsesResult);

            const mergeInterpreterResponsesOutput =
                testSubject.mergeInterpreterResponses(mixedResponses);

            expect(mergeInterpreterResponsesOutput.messageHandled).toBe(true);
            expect(testSubject.mergeResponses).toHaveBeenCalledWith(handledResults);
            expect(mergeInterpreterResponsesOutput.result).toBe(mergeResponsesResult);
        });
    });

    describe('mergeResponses', () => {
        beforeEach(() => {
            testSubject = new EventResponseFactory(timeSimulatingPromiseFactory, true);
        });

        it('returns void if all inputs are void', async () => {
            expect(testSubject.mergeResponses([undefined, undefined, undefined])).toBe(undefined);
        });

        it('returns input without wrapping for a single async response', async () => {
            const input = Promise.resolve();
            expect(testSubject.mergeResponses([input])).toBe(input);
        });

        it('awaits all input promises concurrently if all inputs are async and successful', async () => {
            const inputs = [
                timeSimulatingPromiseFactory.delay(undefined, 2),
                timeSimulatingPromiseFactory.delay(undefined, 5),
                timeSimulatingPromiseFactory.delay(undefined, 3),
            ];

            await testSubject.mergeResponses(inputs);

            expect(timeSimulatingPromiseFactory.elapsedTime).toBe(5);
        });

        it('awaits all input promises and rejects without wrapping if a single input rejects', async () => {
            const error = new Error('only-error');
            const inputs = [
                timeSimulatingPromiseFactory.delay(undefined, 1),
                Promise.reject(error),
                timeSimulatingPromiseFactory.delay(undefined, 2),
            ];

            await expect(testSubject.mergeResponses(inputs)).rejects.toThrowError(error);
            expect(timeSimulatingPromiseFactory.elapsedTime).toBe(2);
        });

        it('awaits all input promises and aggregates errors if all inputs are async', async () => {
            const errors = [new Error('1'), new Error('2')];
            const inputs = [
                timeSimulatingPromiseFactory.delay(undefined, 1),
                Promise.reject(errors[0]),
                timeSimulatingPromiseFactory.delay(undefined, 2),
                Promise.reject(errors[1]),
            ];

            try {
                await testSubject.mergeResponses(inputs);
                fail('should have thrown');
            } catch (e) {
                expect(e).toBeInstanceOf(AggregateError);
                expect(e.errors).toEqual(errors);
            }

            expect(timeSimulatingPromiseFactory.elapsedTime).toBe(2);
        });

        it('injects one fire and forget delay among the async promises for mixed input types', async () => {
            const asyncInputs = [
                timeSimulatingPromiseFactory.delay(undefined, 1),
                timeSimulatingPromiseFactory.delay(undefined, 2),
            ];
            const inputs = [undefined, ...asyncInputs, undefined];

            await testSubject.mergeResponses(inputs);

            expect(timeSimulatingPromiseFactory.elapsedTime).toBe(30000);
        });
    });
});