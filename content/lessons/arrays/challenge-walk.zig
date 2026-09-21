const std = @import("std");

pub fn main() void {
    const nums = [_]i32{ 3, 1, 4, 1 };
    const part = nums[1..4];
    var total: i32 = 0;
    for (part) |n| {
        total += 0; // add n, not 0
        _ = n;
    }
    std.debug.print("{d}\n", .{total});
}
