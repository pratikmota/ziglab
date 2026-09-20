/** Keep in sync with content/playground/hello.zig */
export const PLAYGROUND_HELLO_SOURCE = `const std = @import("std");

pub fn main() void {
    std.debug.print("Hello, ZigLab\\n", .{});
}
`;

export const PLAYGROUND_HELLO_STDOUT = "Hello, ZigLab\n";
