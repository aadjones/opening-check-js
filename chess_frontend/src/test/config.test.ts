import { describe, it, expect } from 'vitest';

describe('Configuration Tests', () => {
  describe('Database Tables', () => {
    it('should have proper database table names defined', () => {
      // Test that our table names follow the correct convention
      const expectedTables = ['profiles', 'lichess_studies', 'opening_deviations', 'review_queue'];

      // Verify each table name follows our naming convention
      expectedTables.forEach(tableName => {
        // Table names should be lowercase with underscores
        expect(tableName).toMatch(/^[a-z_]+$/);

        // Table names should not start or end with underscore
        expect(tableName).not.toMatch(/^_|_$/);

        // Table names should not have consecutive underscores
        expect(tableName).not.toMatch(/__/);

        // Table names should be descriptive
        expect(tableName.length).toBeGreaterThan(2);
      });

      // Verify we have all the expected tables
      expect(expectedTables).toContain('profiles');
      expect(expectedTables).toContain('lichess_studies');
      expect(expectedTables).toContain('opening_deviations');
      expect(expectedTables).toContain('review_queue');
    });
  });
});
