const std = @import("std");

fn add(a: i32, b: i32) i32 {
    _ = b;
    return a;
}

pub fn main() void {
    std.debug.print("{d}\n", .{add(2, 3)});
}
