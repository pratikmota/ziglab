const std = @import("std");

const Size = enum { small, large };

const Box = struct {
    size: Size,
    w: i32,
};

pub fn main() void {
    const box = Box{ .size = .large, .w = 8 };
    _ = box;
}
