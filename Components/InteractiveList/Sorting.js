const mergeSort = (array, type) => {
    const len = array.length;
    if (len <= 1) return array;

    const mid = Math.floor(len/2);
    const left = mergeSort(array.slice(0, mid), type);
    const right = mergeSort(array.slice(mid, len), type);
    return merge(left, right, type);
}

const merge = (arr1, arr2, type) => {
    let merged = [], index1 = 0, index2 = 0;
    while (index1 < arr1.length && index2 < arr2.length) {
        let condition;
        if (type === 'newest') condition = arr1[index1].time_stamp >= arr2[index2].time_stamp;
        if (type === 'oldest') condition = arr1[index1].time_stamp <= arr2[index2].time_stamp;
        if (condition) {
            merged.push(arr1[index1]);
            index1++;
        }
        else {
            merged.push(arr2[index2]);
            index2++;
        }
    }
    if (index1 < arr1.length) {
        merged = merged.concat(arr1.slice(index1));
    }
    if (index2 < arr2.length) {
        merged = merged.concat(arr2.slice(index2));
    }
    return merged;
}

module.exports = {
    merge,
    mergeSort
}