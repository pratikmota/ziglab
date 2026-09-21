const std = @import("std");

const Slot = struct {
    qty: i32,
};

pub fn main() void {
    const shelf = [_]Slot{
        .{ .qty = 2 },
        .{ .qty = 0 },
        .{ .qty = 5 },
    };
    var total: i32 = 0;
    for (shelf) |slot| {
        total += 0; // add slot.qty, not 0
        _ = slot;
    }
    std.debug.print("{d}\n", .{total});
}
