#!/usr/bin/env sh
# Copy zigeditor toolchain/publish/{ver}/ into public/wasm/{ver}/.
# Does not commit binaries. Run from the ZigLab repo: pnpm wasm:publish
set -eu

here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo=$(CDPATH= cd -- "$here/.." && pwd)
versionFile="$repo/../zigeditor/toolchain/VERSION"

zigVersion=
while IFS= read -r raw || [ -n "$raw" ]; do
  line=$(printf "%s" "$raw" | tr -d "\r")
  case "$line" in
    ""|\#*) continue ;;
  esac
  key=${line%%=*}
  val=${line#*=}
  if [ "$key" = "zigVersion" ]; then
    zigVersion=$val
  fi
done < "$versionFile"

if [ -z "$zigVersion" ]; then
  echo "zigeditor toolchain/VERSION is missing zigVersion" >&2
  exit 1
fi

src="$repo/../zigeditor/toolchain/publish/$zigVersion"
out="$repo/public/wasm/$zigVersion"

if [ ! -f "$src/zig.wasm" ] || [ ! -f "$src/std.tar.gz" ] || [ ! -f "$src/compiler_rt.a" ]; then
  echo "Missing $src. In the zigeditor repo: cd toolchain && zig build --release=small && sh publish-public.sh" >&2
  exit 1
fi

mkdir -p "$out"
cp "$src/zig.wasm" "$src/std.tar.gz" "$src/compiler_rt.a" "$out/"
if [ -f "$src/LICENSE" ]; then
  cp "$src/LICENSE" "$out/"
fi
if [ -f "$src/NOTICE" ]; then
  cp "$src/NOTICE" "$out/"
fi

echo "Published $src -> $out"
