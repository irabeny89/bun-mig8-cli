import { describe, expect, test } from "bun:test";
import { rename, getAscendingSortNumber } from "../src/utils";

describe("utils", () => {
    describe("rename", () => {
        test("should replace spaces with hyphens", () => {
            expect(rename("hello world")).toBe("hello-world");
        });

        test("should trim whitespace", () => {
            expect(rename("  hello world  ")).toBe("hello-world");
        });

        test("should handle multiple spaces", () => {
            expect(rename("hello   world")).toBe("hello-world");
        });
    });

    describe("getAscendingSortNumber", () => {
        test("should sort files by timestamp", () => {
            const file1 = "123-test.sql";
            const file2 = "456-test.sql";
            expect(getAscendingSortNumber(file1, file2)).toBeLessThan(0);
            expect(getAscendingSortNumber(file2, file1)).toBeGreaterThan(0);
        });

        test("should return 0 for same timestamp", () => {
            const file1 = "123-test.sql";
            const file2 = "123-test.sql";
            expect(getAscendingSortNumber(file1, file2)).toBe(0);
        });
    });
});
