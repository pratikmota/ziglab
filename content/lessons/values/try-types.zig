const std = @import("std");

pub fn main() void {
    const count: i32 = 7;
    const ratio: f64 = 1.5;
    var ready: bool = false;
    ready = true;
    std.debug.print("count={d} ratio={d} ready={}\n", .{ count, ratio, ready });
}
