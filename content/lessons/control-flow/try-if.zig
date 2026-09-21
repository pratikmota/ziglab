const std = @import("std");

pub fn main() void {
    const temp: i32 = 18;
    const label = if (temp >= 20) "warm" else "cool";
    std.debug.print("{s}\n", .{label});
}
