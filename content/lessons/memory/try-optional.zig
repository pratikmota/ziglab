const std = @import("std");

pub fn main() void {
    const maybe: ?i32 = null;
    const n = maybe orelse 4;
    std.debug.print("{d}\n", .{n});
}
