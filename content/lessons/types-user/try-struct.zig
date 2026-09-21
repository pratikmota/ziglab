const std = @import("std");

const Point = struct {
    x: i32,
    y: i32,
};

pub fn main() void {
    const p = Point{ .x = 3, .y = 8 };
    std.debug.print("{d}\n", .{p.x});
}
