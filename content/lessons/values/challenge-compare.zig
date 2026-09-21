const std = @import("std");

pub fn main() void {
    const n: i32 = 12;
    const at_least_ten: bool = n < 10;
    std.debug.print("{}\n", .{at_least_ten});
}
