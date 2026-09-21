const std = @import("std");

pub fn main() void {
    defer std.debug.print("done\n", .{});
    std.debug.print("work\n", .{});
}
