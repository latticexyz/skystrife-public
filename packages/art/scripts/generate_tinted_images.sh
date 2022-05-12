#!/bin/bash
set -e

# Description:
# Go through all images in sprites/greyscale and generate tinted versions of them in sprites/tinted_images.
# Will clear and recreate output folders before running.
# WARNING: This script does not support mixing images and folders at the same level.

# Usage: ./generate_tinted_images.sh

declare -a colors
colors[0]="white,255,255,255"
colors[1]="red,230,25,75"
colors[2]="green,60,180,75"
colors[3]="blue,67,99,216"
colors[4]="yellow,255,225,25"

rm -rf ../sprites/tinted_images
mkdir -p ../sprites/tinted_images

find ../sprites/greyscale -type f -name "*.png" -exec dirname {} \; | sort -u | while read -r folder; do
  echo "Tinting images in $folder"

  for COLOR_INDEX in "${!colors[@]}"; do
    # split color tuple into array
    IFS=',' read -r -a COLOR <<< "${colors[$COLOR_INDEX]}"
    COLOR_NAME=${COLOR[0]}
    COLOR_R=${COLOR[1]}
    COLOR_G=${COLOR[2]}
    COLOR_B=${COLOR[3]}

    echo "Tinting with color $COLOR_NAME"
    
    OUT_PATH=${folder#../sprites/greyscale/}
    OUT_PATH="../sprites/tinted_images/$COLOR_NAME/$OUT_PATH"
    mkdir -p $OUT_PATH

    find "$folder" -type f -name "*.png" -exec basename {} \; | sort | while read -r file; do
        FILE_TO_TINT="$folder/$file"
        NEW_OUTPUT_FILE="$OUT_PATH/$file"

        # echo "Tinting $FILE_TO_TINT to $NEW_OUTPUT_FILE with color $COLOR_NAME"
        # create a temporary directory for the input file first
        # aseprite likes to be helpful and import the entire animations as different frames if they are in the same folder
        # this is not helpful
        TMP_DIR=$(mktemp -d)
        cp "$FILE_TO_TINT" "$TMP_DIR"
        FILE_TO_TINT="$TMP_DIR/$file"

        /Applications/Aseprite.app/Contents/MacOS/aseprite -b --script-param filepath="$FILE_TO_TINT" --script-param outpath="$NEW_OUTPUT_FILE" --script-param color="$COLOR_R,$COLOR_G,$COLOR_B" --script ../aseprite/tint_image.lua
    done
  done

  echo "Done tinting images in $folder"
done

exit 0
