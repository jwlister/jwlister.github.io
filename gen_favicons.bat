@echo off
setlocal enabledelayedexpansion
set "input_name=favicon_original.png"
set "filter=lanczos"
for %%s in (512 256 180 167 152 128 64 48 32 16) do (
    set "output_name=favicon-%%sx%%s.png"
    ffmpeg -i %input_name% -vf scale=%%s:%%s:flags=!filter! !output_name!
)
endlocal
