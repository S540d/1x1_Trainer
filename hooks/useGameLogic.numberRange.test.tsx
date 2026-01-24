/**
 * Tests for Number Range Invariant in useGameLogic
 *
 * Critical Requirement: ALL numbers (operands AND results) must be within the configured numberRange
 * This test suite validates that for ADDITION, SUBTRACTION, MULTIPLICATION, and DIVISION:
 * - All operands (num1, num2) are within [1, maxNumber]
 * - All results (sum, difference, product, quotient) are within [1, maxNumber]
 *
 * This prevents problems like:
 * - Range 1-20 showing "80 ÷ 10 = ?" (quotient 80 > 20)
 * - Range 1-20 showing "8 × 9 = 72" (product 72 > 20)
 */

import { renderHook, act } from '@testing-library/react';
import { useGameLogic, generateNumberSequenceForState } from './useGameLogic';
import { Operation, GameMode, AnswerMode, DifficultyMode, NumberRange } from '../types/game';

describe('Number Range Invariant Tests', () => {
  describe('generateQuestion - ALL numbers within range', () => {
    const testCases = [
      { range: NumberRange.RANGE_10, maxNumber: 10 },
      { range: NumberRange.RANGE_20, maxNumber: 20 },
      { range: NumberRange.RANGE_50, maxNumber: 50 },
      { range: NumberRange.RANGE_100, maxNumber: 100 },
    ];

    testCases.forEach(({ range, maxNumber }) => {
      describe(`NumberRange ${maxNumber}`, () => {
        it(`ADDITION: all numbers (num1, num2, sum) ≤ ${maxNumber}`, () => {
          const { result } = renderHook(() =>
            useGameLogic({
              initialOperation: Operation.ADDITION,
              initialOperations: new Set([Operation.ADDITION]),
              initialTotalSolvedTasks: 0,
              onTotalSolvedTasksChange: jest.fn(),
              onMotivationShow: jest.fn(),
              numberRange: range,
            })
          );

          // Test 100 iterations to ensure statistical validity
          for (let i = 0; i < 100; i++) {
            act(() => {
              result.current.generateQuestion();
            });

            const { num1, num2, operation } = result.current.gameState;
            expect(operation).toBe(Operation.ADDITION);

            // Operands must be within range
            expect(num1).toBeGreaterThanOrEqual(1);
            expect(num1).toBeLessThanOrEqual(maxNumber);
            expect(num2).toBeGreaterThanOrEqual(1);
            expect(num2).toBeLessThanOrEqual(maxNumber);

            // Result (sum) must be within range
            const sum = num1 + num2;
            expect(sum).toBeGreaterThanOrEqual(1);
            expect(sum).toBeLessThanOrEqual(maxNumber);
          }
        });

        it(`SUBTRACTION: all numbers (num1, num2, difference) ≤ ${maxNumber}`, () => {
          const { result } = renderHook(() =>
            useGameLogic({
              initialOperation: Operation.SUBTRACTION,
              initialOperations: new Set([Operation.SUBTRACTION]),
              initialTotalSolvedTasks: 0,
              onTotalSolvedTasksChange: jest.fn(),
              onMotivationShow: jest.fn(),
              numberRange: range,
            })
          );

          for (let i = 0; i < 100; i++) {
            act(() => {
              result.current.generateQuestion();
            });

            const { num1, num2, operation } = result.current.gameState;
            expect(operation).toBe(Operation.SUBTRACTION);

            // Operands must be within range
            expect(num1).toBeGreaterThanOrEqual(1);
            expect(num1).toBeLessThanOrEqual(maxNumber);
            expect(num2).toBeGreaterThanOrEqual(1);
            expect(num2).toBeLessThanOrEqual(maxNumber);

            // Minuend must be >= subtrahend (no negative results)
            expect(num1).toBeGreaterThanOrEqual(num2);

            // Result (difference) must be within range
            const difference = num1 - num2;
            expect(difference).toBeGreaterThanOrEqual(0);
            expect(difference).toBeLessThanOrEqual(maxNumber);
          }
        });

        it(`MULTIPLICATION: all numbers (num1, num2, product) ≤ ${maxNumber}`, () => {
          const { result } = renderHook(() =>
            useGameLogic({
              initialOperation: Operation.MULTIPLICATION,
              initialOperations: new Set([Operation.MULTIPLICATION]),
              initialTotalSolvedTasks: 0,
              onTotalSolvedTasksChange: jest.fn(),
              onMotivationShow: jest.fn(),
              numberRange: range,
            })
          );

          for (let i = 0; i < 100; i++) {
            act(() => {
              result.current.generateQuestion();
            });

            const { num1, num2, operation } = result.current.gameState;
            expect(operation).toBe(Operation.MULTIPLICATION);

            // Operands must be within range (and ≤ 10 for pedagogy)
            expect(num1).toBeGreaterThanOrEqual(1);
            expect(num1).toBeLessThanOrEqual(Math.min(10, maxNumber));
            expect(num2).toBeGreaterThanOrEqual(1);
            expect(num2).toBeLessThanOrEqual(Math.min(10, maxNumber));

            // Result (product) must be within range
            const product = num1 * num2;
            expect(product).toBeGreaterThanOrEqual(1);
            expect(product).toBeLessThanOrEqual(maxNumber);
          }
        });

        it(`DIVISION: all numbers (num1, num2, quotient) ≤ ${maxNumber}`, () => {
          const { result } = renderHook(() =>
            useGameLogic({
              initialOperation: Operation.DIVISION,
              initialOperations: new Set([Operation.DIVISION]),
              initialTotalSolvedTasks: 0,
              onTotalSolvedTasksChange: jest.fn(),
              onMotivationShow: jest.fn(),
              numberRange: range,
            })
          );

          for (let i = 0; i < 100; i++) {
            act(() => {
              result.current.generateQuestion();
            });

            const { num1, num2, operation } = result.current.gameState;
            expect(operation).toBe(Operation.DIVISION);

            // Divisor must be within range (and ≤ 10 for pedagogy)
            expect(num2).toBeGreaterThanOrEqual(1);
            expect(num2).toBeLessThanOrEqual(Math.min(10, maxNumber));

            // Dividend must be within range
            expect(num1).toBeGreaterThanOrEqual(1);
            expect(num1).toBeLessThanOrEqual(maxNumber);

            // Result must be evenly divisible (no remainder)
            expect(num1 % num2).toBe(0);

            // Result (quotient) must be within range
            const quotient = num1 / num2;
            expect(quotient).toBeGreaterThanOrEqual(1);
            expect(quotient).toBeLessThanOrEqual(Math.min(10, maxNumber));
          }
        });
      });
    });
  });

  describe('generateNumberSequenceForState - Correct answer in sequence', () => {
    describe('ADDITION - sequence around correct answer', () => {
      it('should center sequence around sum (93-90=3 should show 1-10, not 89-98)', () => {
        const num1 = 5;
        const num2 = 3;
        const questionPart = 2; // asking for result
        const operation = Operation.ADDITION;
        const correctAnswer = num1 + num2; // 8

        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

        // Sequence should be around correct answer (8): 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
        expect(sequence).toContain(correctAnswer);
        expect(sequence).toHaveLength(10);

        // Sequence should be centered around correct answer
        const minExpected = correctAnswer - 4;
        const maxExpected = correctAnswer + 5;

        // All values should be in range [max(1, correctAnswer-4), correctAnswer+5]
        sequence.forEach(val => {
          expect(val).toBeGreaterThanOrEqual(Math.max(1, minExpected));
          expect(val).toBeLessThanOrEqual(maxExpected);
        });
      });

      it('should handle small sums (1+1=2) correctly', () => {
        const num1 = 1;
        const num2 = 1;
        const questionPart = 2;
        const operation = Operation.ADDITION;
        const correctAnswer = 2;

        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

        expect(sequence).toContain(correctAnswer);
        expect(sequence).toHaveLength(10);
        expect(sequence.every(val => val > 0)).toBe(true);
      });

      it('should handle large sums (10+10=20) correctly', () => {
        const num1 = 10;
        const num2 = 10;
        const questionPart = 2;
        const operation = Operation.ADDITION;
        const correctAnswer = 20;

        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

        expect(sequence).toContain(correctAnswer);
        expect(sequence).toHaveLength(10);

        // Should be 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
        const expected = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        expect(sequence).toEqual(expected);
      });
    });

    describe('SUBTRACTION - sequence around correct answer', () => {
      it('should center sequence around difference (93-90=3 should show around 3, not 89-98)', () => {
        const num1 = 93;
        const num2 = 90;
        const questionPart = 2; // asking for result
        const operation = Operation.SUBTRACTION;
        const correctAnswer = num1 - num2; // 3

        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

        // Sequence should be around correct answer (3): should NOT be 89-98!
        expect(sequence).toContain(correctAnswer);
        expect(sequence).toHaveLength(10);

        // Correct answer (3) should be in the sequence
        expect(sequence).toContain(3);

        // Sequence should NOT contain values like 89-98 (which would be around num1)
        expect(sequence).not.toContain(89);
        expect(sequence).not.toContain(98);
      });

      it('should handle small differences (5-4=1) correctly', () => {
        const num1 = 5;
        const num2 = 4;
        const questionPart = 2;
        const operation = Operation.SUBTRACTION;
        const correctAnswer = 1;

        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

        expect(sequence).toContain(correctAnswer);
        expect(sequence).toHaveLength(10);
        expect(sequence.every(val => val > 0)).toBe(true);
      });

      it('should handle zero difference (5-5=0) correctly', () => {
        const num1 = 5;
        const num2 = 5;
        const questionPart = 2;
        const operation = Operation.SUBTRACTION;
        const correctAnswer = 0;

        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

        // Correct answer is 0, sequence should be around 0 but all positive
        expect(sequence).toHaveLength(10);
        expect(sequence.every(val => val > 0)).toBe(true);
      });
    });

    describe('MULTIPLICATION - sequence remains correct', () => {
      it('should generate multiples of num1 for result question', () => {
        const num1 = 5;
        const num2 = 3;
        const questionPart = 2;
        const operation = Operation.MULTIPLICATION;

        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

        expect(sequence).toHaveLength(10);
        expect(sequence).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
        expect(sequence).toContain(num1 * num2); // 15
      });
    });

    describe('DIVISION - sequence remains correct', () => {
      it('should generate simple sequence 1-10 for quotient question', () => {
        const num1 = 20;
        const num2 = 4;
        const questionPart = 2; // asking for quotient
        const operation = Operation.DIVISION;

        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

        expect(sequence).toHaveLength(10);
        expect(sequence).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(sequence).toContain(num1 / num2); // 5
      });
    });
  });

  describe('Answer validation across all game modes', () => {
    const operations = [
      Operation.ADDITION,
      Operation.SUBTRACTION,
      Operation.MULTIPLICATION,
      Operation.DIVISION,
    ];

    operations.forEach(operation => {
      it(`should validate answers correctly for ${operation} in NORMAL mode`, () => {
        const { result } = renderHook(() =>
          useGameLogic({
            initialOperation: operation,
            initialOperations: new Set([operation]),
            initialTotalSolvedTasks: 0,
            onTotalSolvedTasksChange: jest.fn(),
            onMotivationShow: jest.fn(),
            numberRange: NumberRange.RANGE_20,
          })
        );

        act(() => {
          result.current.generateQuestion();
        });

        const correctAnswer = result.current.getCorrectAnswer();
        const { num1, num2, questionPart } = result.current.gameState;

        // Verify questionPart is 2 (NORMAL mode asks for result)
        expect(questionPart).toBe(2);

        // Calculate expected answer
        let expectedAnswer: number;
        switch (operation) {
          case Operation.ADDITION:
            expectedAnswer = num1 + num2;
            break;
          case Operation.SUBTRACTION:
            expectedAnswer = num1 - num2;
            break;
          case Operation.MULTIPLICATION:
            expectedAnswer = num1 * num2;
            break;
          case Operation.DIVISION:
            expectedAnswer = num1 / num2;
            break;
          default:
            expectedAnswer = 0;
        }

        expect(correctAnswer).toBe(expectedAnswer);

        // Test correct answer (enter each digit)
        const answerString = correctAnswer.toString();
        for (const digit of answerString) {
          act(() => {
            result.current.handleNumberClick(parseInt(digit));
          });
        }

        act(() => {
          result.current.checkAnswer();
        });

        expect(result.current.gameState.lastAnswerCorrect).toBe(true);

        // Test wrong answer
        act(() => {
          result.current.generateQuestion();
        });

        const wrongAnswer = result.current.getCorrectAnswer() + 1;
        const wrongAnswerString = wrongAnswer.toString();
        for (const digit of wrongAnswerString) {
          act(() => {
            result.current.handleNumberClick(parseInt(digit));
          });
        }

        act(() => {
          result.current.checkAnswer();
        });

        expect(result.current.gameState.lastAnswerCorrect).toBe(false);
      });
    });
  });
});
