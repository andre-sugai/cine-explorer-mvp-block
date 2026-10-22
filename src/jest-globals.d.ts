import type { Global } from '@jest/types';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  const it: Global.GlobalAdditions['it'];
  const test: Global.GlobalAdditions['test'];
  const fit: Global.GlobalAdditions['fit'];
  const xit: Global.GlobalAdditions['xit'];
  const xtest: Global.GlobalAdditions['xtest'];
  const describe: Global.GlobalAdditions['describe'];
  const xdescribe: Global.GlobalAdditions['xdescribe'];
  const fdescribe: Global.GlobalAdditions['fdescribe'];
  const beforeAll: Global.GlobalAdditions['beforeAll'];
  const beforeEach: Global.GlobalAdditions['beforeEach'];
  const afterEach: Global.GlobalAdditions['afterEach'];
  const afterAll: Global.GlobalAdditions['afterAll'];

  const expect: {
    <T = any>(actual: T): jest.JestMatchers<void, T>;
    anything(): any;
    any(classType: any): any;
    arrayContaining(arr: readonly any[]): any;
    assertions( num: number): void;
    closeTo(num: number, numDigits?: number): any;
    hasAssertions(): void;
     objectContaining(obj: Record<string, any>): any;
    stringContaining(str: string): any;
    stringMatching(str: string | RegExp): any;
    not: {
      arrayContaining(arr: readonly any[]): any;
      closeTo(num: number, numDigits?: number): any;
      objectContaining(obj: Record<string, any>): any;
      stringContaining(str: string): any;
      stringMatching(str: string | RegExp): any;
    };
    extend(matchers: Record<string, any>): void;
  };

  namespace jest {
    interface Matchers<R = void, T = any>
      extends TestingLibraryMatchers<any, R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toStrictEqual(expected: any): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeDefined(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeNaN(): R;
      toContain(item: any): R;
      toContainEqual(item: any): R;
      toHaveLength(number: number): R;
      toHaveProperty(keyPath: string | string[], value?: any): R;
      toBeGreaterThan(number: number | bigint): R;
      toBeGreaterThanOrEqual(number: number | bigint): R;
      toBeLessThan(number: number | bigint): R;
      toBeLessThanOrEqual(number: number | bigint): R;
      toBeCloseTo(number: number, numDigits?: number): R;
      toMatch(expected: string | RegExp): R;
      toMatchObject(expected: Record<string, any> | Record<string, any>[]): R;
      toThrow(error?: string | RegExp | Error | any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(number: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      toHaveBeenNthCalledWith(nthCall: number, ...args: any[]): R;
      toHaveReturned(): R;
      toHaveReturnedTimes(number: number): R;
      toHaveReturnedWith(value?: any): R;
      [key: string]: any;
    }

    type JestMatchers<R, T> = Matchers<R, T> & {
      not: Matchers<R, T>;
      resolves: Matchers<Promise<void>, T> & { not: Matchers<Promise<void>, T> };
      rejects: Matchers<Promise<void>, T> & { not: Matchers<Promise<void>, T> };
    };

    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mock: {
        calls: Y[];
        instances: T[];
        invocationCallOrder: number[];
        results: { type: 'return' | 'throw' | 'incomplete'; value: any }[];
        lastCall?: Y;
      };
      mockClear(): this;
      mockReset(): this;
      mockRestore(): void;
      mockImplementation(fn?: (...args: Y) => T): this;
      mockImplementationOnce(fn: (...args: Y) => T): this;
      mockName(name: string): this;
      getMockName(): string;
      mockReturnThis(): this;
      mockReturnValue(value: T): this;
      mockReturnValueOnce(value: T): this;
      mockResolvedValue(value: Awaited<T>): this;
      mockResolvedValueOnce(value: Awaited<T>): this;
      mockRejectedValue(value: any): this;
      mockRejectedValueOnce(value: any): this;
    }

    type SpyInstance<T = any, Y extends any[] = any> = Mock<T, Y>;

    function fn<T = any, Y extends any[] = any>(
      implementation?: (...args: Y) => T
    ): Mock<T, Y>;
    function spyOn<T extends object, M extends keyof T>(
      object: T,
      method: M,
      accessType?: 'get' | 'set'
    ): SpyInstance;
    function mock(
      moduleName: string,
      factory?: () => any,
      options?: { virtual?: boolean }
    ): typeof jest;
    function unmock(moduleName: string): typeof jest;
    function requireActual<T = Record<string, any>>(moduleName: string): T;
    function clearAllMocks(): typeof jest;
    function resetAllMocks(): typeof jest;
    function restoreAllMocks(): typeof jest;
    function useFakeTimers(config?: any): typeof jest;
    function useRealTimers(): typeof jest;
    function advanceTimersByTime(msToRun: number): void;
    function runAllTimers(): void;
    function runOnlyPendingTimers(): void;
  }
}
