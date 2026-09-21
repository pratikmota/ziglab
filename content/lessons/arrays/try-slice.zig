const std = @import("std");

pub fn main() void {
    const nums = [_]i32{ 8, 1, 2, 3 };
    const rest = nums[1..];
    std.debug.print("{d}\n", .{rest[0]});
}
