const std = @import("std");

pub fn main() void {
    var nums = [_]i32{ 0, 0, 0 };
    nums[0] = 10;
    nums[1] = 20;
    nums[2] = 30;
    std.debug.print("{d}\n", .{nums[1]});
}
