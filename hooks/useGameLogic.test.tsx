/**
 * Tests for useGameLogic Hook
 * Specifically testing generateNumberSequenceForState for ADDITION and MULTIPLICATION operations
 */

import { generateNumberSequenceForState } from './useGameLogic';
import { Operation } from '../types/game';

describe('useGameLogic - generateNumberSequenceForState', () => {
  describe('ADDITION operation', () => {
    it('should generate sequence base+1 through base+10 for addition', () => {
      const num1 = 5;
      const num2 = 3;
      const questionPart = 2; // asking for result
      const operation = Operation.ADDITION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

      // For questionPart=2, base is num1 (5)
      // Sequence should be 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
      const expected = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      
      expect(sequence).toEqual(expected);
      expect(sequence).toHaveLength(10);
      expect(sequence[0]).toBe(6); // base + 1
      expect(sequence[9]).toBe(15); // base + 10
    });

    it('should include correct answer (base+num2) in sequence when num2 is between 1-10', () => {
      const num1 = 7;
      const num2 = 4;
      const questionPart = 2;
      const operation = Operation.ADDITION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

      // Correct answer is 7 + 4 = 11
      // Base is num1 (7), sequence is 8 through 17
      // So 11 should be in the sequence
      const correctAnswer = num1 + num2;
      
      expect(sequence).toContain(correctAnswer);
      expect(correctAnswer).toBe(11);
    });

    it('should verify all values in addition sequence are consecutive increments', () => {
      const num1 = 3;
      const num2 = 6;
      const questionPart = 2;
      const operation = Operation.ADDITION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);
      
      // Check that each element is exactly 1 more than the previous
      for (let i = 1; i < sequence.length; i++) {
        expect(sequence[i]).toBe(sequence[i - 1] + 1);
      }
    });

    it('should handle base=1 correctly for addition (sequence 2-11)', () => {
      const num1 = 1;
      const num2 = 5;
      const questionPart = 2;
      const operation = Operation.ADDITION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

      // For base=1, sequence should be 2, 3, 4, ..., 11
      expect(sequence).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('should handle base=10 correctly for addition (sequence 11-20)', () => {
      const num1 = 10;
      const num2 = 7;
      const questionPart = 2;
      const operation = Operation.ADDITION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

      // For base=10, sequence should be 11, 12, 13, ..., 20
      expect(sequence).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    });

    it('should always include correct answer for any valid num2 between 1-10', () => {
      const num1 = 6;
      const questionPart = 2;
      const operation = Operation.ADDITION;

      // Test all possible num2 values from 1 to 10
      for (let num2 = 1; num2 <= 10; num2++) {
        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);
        const correctAnswer = num1 + num2;
        
        expect(sequence).toContain(correctAnswer);
      }
    });
  });

  describe('MULTIPLICATION operation', () => {
    it('should generate sequence base×1 through base×10 for multiplication', () => {
      const num1 = 5;
      const num2 = 3;
      const questionPart = 2;
      const operation = Operation.MULTIPLICATION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

      // For questionPart=2, base is num1 (5)
      // Sequence should be 5, 10, 15, 20, 25, 30, 35, 40, 45, 50
      const expected = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
      
      expect(sequence).toEqual(expected);
      expect(sequence).toHaveLength(10);
      expect(sequence[0]).toBe(5); // base × 1
      expect(sequence[9]).toBe(50); // base × 10
    });

    it('should include correct answer (base×num2) in sequence when num2 is between 1-10', () => {
      const num1 = 7;
      const num2 = 4;
      const questionPart = 2;
      const operation = Operation.MULTIPLICATION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

      // Correct answer is 7 × 4 = 28
      const correctAnswer = num1 * num2;
      
      expect(sequence).toContain(correctAnswer);
      expect(correctAnswer).toBe(28);
    });

    it('should verify multiplication sequence has proper increments', () => {
      const num1 = 6;
      const num2 = 3;
      const questionPart = 2;
      const operation = Operation.MULTIPLICATION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);
      
      // Check that each element is base more than the previous (multiplication table pattern)
      for (let i = 1; i < sequence.length; i++) {
        expect(sequence[i]).toBe(sequence[i - 1] + num1);
      }
    });

    it('should handle base=1 correctly for multiplication (sequence 1-10)', () => {
      const num1 = 1;
      const num2 = 5;
      const questionPart = 2;
      const operation = Operation.MULTIPLICATION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

      // For base=1, sequence should be 1, 2, 3, ..., 10
      expect(sequence).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle base=10 correctly for multiplication (sequence 10-100)', () => {
      const num1 = 10;
      const num2 = 7;
      const questionPart = 2;
      const operation = Operation.MULTIPLICATION;

      const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);

      // For base=10, sequence should be 10, 20, 30, ..., 100
      expect(sequence).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    });

    it('should always include correct answer for any valid num2 between 1-10', () => {
      const num1 = 8;
      const questionPart = 2;
      const operation = Operation.MULTIPLICATION;

      // Test all possible num2 values from 1 to 10
      for (let num2 = 1; num2 <= 10; num2++) {
        const sequence = generateNumberSequenceForState(num1, num2, questionPart, operation);
        const correctAnswer = num1 * num2;
        
        expect(sequence).toContain(correctAnswer);
      }
    });
  });

  describe('Operation comparison', () => {
    it('should generate different patterns for ADDITION vs MULTIPLICATION with same base', () => {
      const num1 = 5;
      const num2 = 3;
      const questionPart = 2;

      const addSequence = generateNumberSequenceForState(num1, num2, questionPart, Operation.ADDITION);
      const multSequence = generateNumberSequenceForState(num1, num2, questionPart, Operation.MULTIPLICATION);

      // Sequences should be different
      expect(addSequence).not.toEqual(multSequence);

      // For addition: differences between consecutive elements should be 1
      for (let i = 1; i < addSequence.length; i++) {
        expect(addSequence[i] - addSequence[i - 1]).toBe(1);
      }

      // For multiplication: differences between consecutive elements should be base (num1)
      for (let i = 1; i < multSequence.length; i++) {
        expect(multSequence[i] - multSequence[i - 1]).toBe(num1);
      }
    });

    it('should have addition sequence start higher than base, multiplication equal to base', () => {
      const num1 = 5;
      const num2 = 3;
      const questionPart = 2;

      const addSequence = generateNumberSequenceForState(num1, num2, questionPart, Operation.ADDITION);
      const multSequence = generateNumberSequenceForState(num1, num2, questionPart, Operation.MULTIPLICATION);

      // Addition sequence starts at base+1
      expect(addSequence[0]).toBe(num1 + 1); // 6
      
      // Multiplication sequence starts at base×1
      expect(multSequence[0]).toBe(num1 * 1); // 5
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle all bases from 1 to 10 for addition', () => {
      const questionPart = 2;
      const operation = Operation.ADDITION;

      for (let base = 1; base <= 10; base++) {
        const sequence = generateNumberSequenceForState(base, 5, questionPart, operation);
        
        expect(sequence).toHaveLength(10);
        expect(sequence[0]).toBe(base + 1);
        expect(sequence[9]).toBe(base + 10);
        
        // Verify consecutive increments
        for (let i = 1; i < sequence.length; i++) {
          expect(sequence[i]).toBe(sequence[i - 1] + 1);
        }
      }
    });

    it('should handle all bases from 1 to 10 for multiplication', () => {
      const questionPart = 2;
      const operation = Operation.MULTIPLICATION;

      for (let base = 1; base <= 10; base++) {
        const sequence = generateNumberSequenceForState(base, 5, questionPart, operation);
        
        expect(sequence).toHaveLength(10);
        expect(sequence[0]).toBe(base * 1);
        expect(sequence[9]).toBe(base * 10);
        
        // Verify increments of base
        for (let i = 1; i < sequence.length; i++) {
          expect(sequence[i]).toBe(sequence[i - 1] + base);
        }
      }
    });
  });
});
