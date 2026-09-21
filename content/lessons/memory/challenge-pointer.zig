const std = @import("std");

pub fn main() void {
    var n: i32 = 11;
    const p: *i32 = &n;
    _ = p;
    std.debug.print("{d}\n", .{n});
}
