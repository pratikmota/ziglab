const std = @import("std");

pub fn main() void {
    var n: i32 = 0;
    while (n < 3) : (n += 1) {}
    std.debug.print("{d}\n", .{n});
}
