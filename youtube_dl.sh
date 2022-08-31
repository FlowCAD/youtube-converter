#!/bin/sh
inputvalue="$1"
echo " --- Starting download video $inputvalue --- "
youtube-dl --extract-audio --audio-quality 320 --audio-format mp3 $inputvalue