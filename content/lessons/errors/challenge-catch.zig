const std = @import("std");

fn parse(n: i32) error{Range}!i32 {
    if (n < 0 or n > 9) return error.Range;
    return n;
}

pub fn main() void {
    const n = parse(3);
    std.debug.print("{d}\n", .{n});
}
