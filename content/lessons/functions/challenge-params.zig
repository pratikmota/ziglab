const std = @import("std");

fn label(n: i32) []const u8 {
    _ = n;
    return "small";
}

pub fn main() void {
    std.debug.print("{s}\n", .{label(12)});
}
