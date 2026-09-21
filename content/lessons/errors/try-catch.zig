const std = @import("std");

const Fail = error{ Empty };

fn load(ok: bool) Fail!i32 {
    if (!ok) return error.Empty;
    return 9;
}

pub fn main() void {
    const n = load(false) catch 0;
    std.debug.print("{d}\n", .{n});
}
