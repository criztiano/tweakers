#!/bin/sh
# The timeline demo's sample video (demo/media/timeline-sample.mp4, not in git).
# Twenty-four seconds of slow colour with its own clock burned in, so a scrub
# can be read off the picture: a bar sweeps the bottom edge once, and one cell
# lights per second along the top. Short keyframe spacing keeps seeks instant.
set -e
cd "$(dirname "$0")/.."
out=demo/media/timeline-sample.mp4
mkdir -p demo/media
seconds=24
cells=""
i=0
while [ $i -lt $seconds ]; do
  cells="$cells,drawbox=x=$((40 + i * 50)):y=36:w=42:h=10:color=white@0.85:t=fill:enable='gte(t,$i)'"
  i=$((i + 1))
done
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "gradients=s=1280x720:r=30:d=$seconds:speed=0.015:n=4:c0=0x2b2f6b:c1=0xeb644d:c2=0x1b6f5f:c3=0xf2cf43" \
  -f lavfi -i "color=c=white@0.9:s=6x44:r=30:d=$seconds" \
  -filter_complex "[0][1]overlay=x='(W-w)*t/$seconds':y=H-84$cells,format=yuv420p" \
  -c:v libx264 -preset medium -crf 26 -g 6 -movflags +faststart -an "$out"
echo "$out"
