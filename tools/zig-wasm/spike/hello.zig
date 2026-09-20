const std = @import("std");

pub fn main() void {
    // Goes to stderr on 0.16; the spike accepts stdout or stderr.
    std.debug.print("Hello, ZigLab\n", .{});
}
