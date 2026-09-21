const std = @import("std");

fn triple(comptime n: i32) i32 {
    return n;
}

pub fn main() void {
    std.debug.print("{d}\n", .{triple(5)});
}
