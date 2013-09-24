#!/usr/bin/python
from PIL import Image
import sys
import os.path as path
import glob
import re
import json

TRIM = False

#TRANSPARENT_COLOR = (106, 86, 64, 255)
SHADOW_COLOR = (31,22,13, 255) #(39,27,17, 255)

trimmed = {}

def convert(file_in, file_out):
    '''Convert from bmp to png
    and color1 to transparent, color2 to shadow,
    also trims the image'''
    print >> sys.stderr, "Converting '%s' to '%s'" % (file_in, file_out)
    img = Image.open(file_in)
    img = img.convert("RGBA")
    pixdata = img.load()
    #if pixdata[0, 0] != TRANSPARENT_COLOR:
    #    print >> sys.stderr, "top left isn't transparent - are you sure you want to do this?  ",  pixdata[0,0]
    #    sys.exit()
    TRANSPARENT_COLOR = pixdata[0,0]
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            if pixdata[x, y] == TRANSPARENT_COLOR:
                pixdata[x, y] = (255, 255, 255, 0)
            if pixdata[x, y] == SHADOW_COLOR:
                pixdata[x, y] = (25,25,15, 160)

    if not TRIM:
        img.save(file_out)
        return

    # if TRIM
    top = 0
    left = 0
    right = img.size[0]-1
    bottom = img.size[1]-1
    found = False
    for y in range(0, bottom):
        for x in range(left, right):
            if pixdata[x, y][3] != 0:
                found = True
                break
        if found:
            break
        top += 1

    found = False
    for y in range(img.size[1]-1, top, -1):
        for x in range(left, right):
            if pixdata[x, y][3] != 0:
                found = True
                break
        if found:
            break
        bottom -= 1

    found = False
    for x in range(0, right):
        for y in range(top, bottom):
            if pixdata[x, y][3] != 0:
                found = True
                break
        if found:
            break
        left += 1

    found = False
    for x in range(img.size[0]-1, left, -1):
        for y in range(top, bottom):
            if pixdata[x, y][3] != 0:
                found = True
                break
        if found:
            break
        right -= 1

    trimmed[path.basename(file_out)] = {
        "orig_w": img.size[0]-1,
        "orig_h": img.size[1]-1,
        "top":top,
        "left": left,
        "bottom": bottom,
        "right": right
    }

    img.crop((left, top, right, bottom)).save(file_out)
    


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print >> sys.stderr, "not enough arguments"
        print >> sys.stderr, sys.argv[0], "<file_in.bmp>  [file_out.png]"
        sys.exit()
    file_in = sys.argv[1]
    if path.isfile(file_in):
        if file_in[-4:].lower() != '.bmp':
            print >> sys.stderr, "expected .bmp input"
            sys.exit()
        if len(sys.argv) > 2:
            file_out =  sys.argv[2]
        else:
            file_out = file_in[:-4]+'.png'
        convert(file_in, file_out)
    elif path.isdir(file_in):
        rem_unicode = re.compile('[^\x00-\x7F]')
        dirname = file_in
        for file_in in glob.glob(path.join(dirname, '*.bmp')):
            if file_in[-4:].lower() == '.bmp':
                file_out = file_in[:-4]+'.png'
                file_out = rem_unicode.sub('', file_out).replace(' ','_')
                convert(file_in, file_out)

    print json.dumps(trimmed, indent=4)


