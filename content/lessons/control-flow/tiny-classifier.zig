const std = @import("std");

pub fn main() void {
    var n: i32 = 1;
    while (n <= 4) : (n += 1) {
        // Print o if n is odd, e if n is even. No spaces.
    }
    std.debug.print("\n", .{});
}
