// based on http://en.wikipedia.org/wiki/Disjoint-set_data_structure


function MakeSet(x){
    x.parent = x;
    x.rank = 0;
    return x;
}

function Union(x, y) {
    var xRoot = Find(x);
    var yRoot = Find(y);
    if (xRoot == yRoot)
        return;

    // x and y are not already in same set. Merge them.
    if (xRoot.rank < yRoot.rank) {
        xRoot.parent = yRoot;
    }
    else if (xRoot.rank > yRoot.rank) {
        yRoot.parent = xRoot;
    }
    else {
        yRoot.parent = xRoot;
        xRoot.rank = xRoot.rank + 1;
    }
}


function Find(x) {
    if (x.parent != x) {
        x.parent = Find(x.parent);
    }
    return x.parent;
}
