#!/usr/bin/python3
"""Use local own-release fixtures only during the isolated CI installation."""
import os
import pathlib
import sys

args = sys.argv[1:]
urls = [a for a in args if a.startswith("https://")]
url = urls[-1] if urls else ""
own = "https://github.com/nxabc/3x-ui/releases/download/v3.11.0/"
raw = "https://raw.githubusercontent.com/nxabc/3x-ui/v3.11.0/"
if not (url.startswith(own) or url.startswith(raw)):
    os.execv("/usr/bin/curl", ["curl", *args])
name = url.rsplit("/", 1)[-1]
source = pathlib.Path(os.environ["PERSONAL_FIXTURE_ROOT"]) / name
if not source.is_file():
    sys.exit("Missing own-release test fixture: " + name)
output = None
fmt = None
for i, arg in enumerate(args[:-1]):
    if arg == "-o" or (arg.startswith("-") and not arg.startswith("--") and arg.endswith("o")):
        output = args[i + 1]
    if arg == "-w":
        fmt = args[i + 1]
head = any(a.startswith("-") and not a.startswith("--") and "I" in a for a in args)
if output and output != "/dev/null":
    pathlib.Path(output).write_bytes(source.read_bytes())
elif not output and not head:
    sys.stdout.buffer.write(source.read_bytes())
if fmt:
    sys.stdout.write(fmt.replace("%{http_code}", "200"))
