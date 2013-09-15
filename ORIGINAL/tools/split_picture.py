#!/usr/bin/python
from PIL import Image
import sys
import os.path as path

def split_file(file_in, width, height):
    '''Split big picture to smaller ones'''
    print >> sys.stderr, "Splitting '%s' to %s x %s" % (file_in, width, height)
    img = Image.open(file_in)
    img = img.convert("RGBA")
    twidth = img.size[0]-1
    theight = img.size[1]-1
    file_out = file_in[:-4]
    index = 0

    for y in range(0, theight, height):
        for x in range(0, twidth, width):
            img.crop((x, y, x+width, y+height)).save("%s_%s.png" % (file_out, index))
            index += 1
    


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print >> sys.stderr, "not enough arguments"
        print >> sys.stderr, sys.argv[0], "<file_in.bmp> "
        sys.exit()
    file_in = sys.argv[1]
    if path.isfile(file_in):
        split_file(file_in, 64, 128)


